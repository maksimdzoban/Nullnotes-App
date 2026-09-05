import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db, initDatabase } from './db.js';
import { authMiddleware, generateToken, type AuthUser, type Env } from './auth.js';

const app = new Hono<Env>();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok', time: Date.now() }));

// --- AUTH ROUTES ---
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1)
});

app.post('/api/auth/register', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = RegisterSchema.parse(body);

    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email.toLowerCase()]
    });

    if (existing.rows.length > 0) {
      return c.json({ error: 'Користувач з таким email вже існує' }, 400);
    }

    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    const now = Date.now();

    await db.execute({
      sql: 'INSERT INTO users (id, email, password_hash, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [id, email.toLowerCase(), passwordHash, name, now, now]
    });

    const user: AuthUser = { id, email: email.toLowerCase(), name };
    const token = generateToken(user);

    return c.json({ user, token });
  } catch (err: any) {
    return c.json({ error: err.message || 'Помилка валідації' }, 400);
  }
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

app.post('/api/auth/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = LoginSchema.parse(body);

    const res = await db.execute({
      sql: 'SELECT id, email, name, password_hash FROM users WHERE email = ?',
      args: [email.toLowerCase()]
    });

    if (res.rows.length === 0) {
      return c.json({ error: 'Невірний email або пароль' }, 400);
    }

    const row = res.rows[0];
    const isValid = await bcrypt.compare(password, String(row.password_hash));
    if (!isValid) {
      return c.json({ error: 'Невірний email або пароль' }, 400);
    }

    const user: AuthUser = {
      id: String(row.id),
      email: String(row.email),
      name: String(row.name)
    };
    const token = generateToken(user);

    return c.json({ user, token });
  } catch (err: any) {
    return c.json({ error: err.message || 'Помилка авторизації' }, 400);
  }
});

app.get('/api/auth/me', authMiddleware, async (c) => {
  const user = c.get('user');
  return c.json({ user });
});

// --- SYNC ROUTES ---

// 1. PULL: Отримання всіх оновлень після `lastSyncTime`
app.post('/api/sync/pull', authMiddleware, async (c) => {
  const user = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  const lastSyncTime = Number(body.lastSyncTime) || 0;

  const notesRes = await db.execute({
    sql: 'SELECT * FROM notes WHERE user_id = ? AND server_updated_at > ?',
    args: [user.id, lastSyncTime]
  });

  const foldersRes = await db.execute({
    sql: 'SELECT * FROM folders WHERE user_id = ? AND server_updated_at > ?',
    args: [user.id, lastSyncTime]
  });

  const tagsRes = await db.execute({
    sql: 'SELECT * FROM tags WHERE user_id = ? AND server_updated_at > ?',
    args: [user.id, lastSyncTime]
  });

  const notes = notesRes.rows.map(r => ({
    id: String(r.id),
    title: String(r.title),
    content: JSON.parse(String(r.content || '[]')),
    plainText: String(r.plain_text || ''),
    folderId: r.folder_id ? String(r.folder_id) : null,
    tags: JSON.parse(String(r.tags || '[]')),
    isPinned: Boolean(r.is_pinned),
    isArchived: Boolean(r.is_archived),
    isFavorite: Boolean(r.is_favorite),
    createdAt: Number(r.created_at),
    updatedAt: Number(r.updated_at),
    deletedAt: r.deleted_at ? Number(r.deleted_at) : null,
    serverUpdatedAt: Number(r.server_updated_at)
  }));

  const folders = foldersRes.rows.map(r => ({
    id: String(r.id),
    name: String(r.name),
    parentId: r.parent_id ? String(r.parent_id) : null,
    createdAt: Number(r.created_at),
    updatedAt: Number(r.updated_at),
    deletedAt: r.deleted_at ? Number(r.deleted_at) : null,
    serverUpdatedAt: Number(r.server_updated_at)
  }));

  const tags = tagsRes.rows.map(r => ({
    id: String(r.id),
    name: String(r.name),
    deletedAt: r.deleted_at ? Number(r.deleted_at) : null,
    serverUpdatedAt: Number(r.server_updated_at)
  }));

  return c.json({
    serverTime: Date.now(),
    notes,
    folders,
    tags
  });
});

// 2. PUSH: Збереження локальних змін (Batch Outbox)
app.post('/api/sync/push', authMiddleware, async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const { notes = [], folders = [], tags = [] } = body;
  const serverTime = Date.now();

  // Save/Update Notes
  for (const n of notes) {
    if (n.deleted) {
      await db.execute({
        sql: `INSERT INTO notes (id, user_id, title, content, plain_text, folder_id, tags, is_pinned, is_archived, is_favorite, created_at, updated_at, deleted_at, server_updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET deleted_at = ?, server_updated_at = ?`,
        args: [
          n.id, user.id, n.title || '', JSON.stringify(n.content || []), n.plainText || '', n.folderId || null,
          JSON.stringify(n.tags || []), n.isPinned ? 1 : 0, n.isArchived ? 1 : 0, n.isFavorite ? 1 : 0,
          n.createdAt || serverTime, n.updatedAt || serverTime, serverTime, serverTime,
          serverTime, serverTime
        ]
      });
    } else {
      await db.execute({
        sql: `INSERT INTO notes (id, user_id, title, content, plain_text, folder_id, tags, is_pinned, is_archived, is_favorite, created_at, updated_at, deleted_at, server_updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)
              ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                content = excluded.content,
                plain_text = excluded.plain_text,
                folder_id = excluded.folder_id,
                tags = excluded.tags,
                is_pinned = excluded.is_pinned,
                is_archived = excluded.is_archived,
                is_favorite = excluded.is_favorite,
                updated_at = excluded.updated_at,
                deleted_at = NULL,
                server_updated_at = excluded.server_updated_at
              WHERE notes.updated_at <= excluded.updated_at`,
        args: [
          n.id, user.id, n.title || 'Без назви', JSON.stringify(n.content || []), n.plainText || '', n.folderId || null,
          JSON.stringify(n.tags || []), n.isPinned ? 1 : 0, n.isArchived ? 1 : 0, n.isFavorite ? 1 : 0,
          n.createdAt || serverTime, n.updatedAt || serverTime, serverTime
        ]
      });
    }
  }

  // Save/Update Folders
  for (const f of folders) {
    if (f.deleted) {
      await db.execute({
        sql: `INSERT INTO folders (id, user_id, name, parent_id, created_at, updated_at, deleted_at, server_updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET deleted_at = ?, server_updated_at = ?`,
        args: [f.id, user.id, f.name, f.parentId || null, f.createdAt || serverTime, f.updatedAt || serverTime, serverTime, serverTime, serverTime, serverTime]
      });
    } else {
      await db.execute({
        sql: `INSERT INTO folders (id, user_id, name, parent_id, created_at, updated_at, deleted_at, server_updated_at)
              VALUES (?, ?, ?, ?, ?, ?, NULL, ?)
              ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                parent_id = excluded.parent_id,
                updated_at = excluded.updated_at,
                deleted_at = NULL,
                server_updated_at = excluded.server_updated_at
              WHERE folders.updated_at <= excluded.updated_at`,
        args: [f.id, user.id, f.name, f.parentId || null, f.createdAt || serverTime, f.updatedAt || serverTime, serverTime]
      });
    }
  }

  // Save/Update Tags
  for (const t of tags) {
    if (t.deleted) {
      await db.execute({
        sql: `INSERT INTO tags (id, user_id, name, deleted_at, server_updated_at)
              VALUES (?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET deleted_at = ?, server_updated_at = ?`,
        args: [t.id, user.id, t.name, serverTime, serverTime, serverTime, serverTime]
      });
    } else {
      await db.execute({
        sql: `INSERT INTO tags (id, user_id, name, deleted_at, server_updated_at)
              VALUES (?, ?, ?, NULL, ?)
              ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                deleted_at = NULL,
                server_updated_at = excluded.server_updated_at`,
        args: [t.id, user.id, t.name, serverTime]
      });
    }
  }

  return c.json({
    success: true,
    serverTime
  });
});

const port = Number(process.env.PORT) || 3001;

async function start() {
  await initDatabase();
  console.log(`Sync Server is running on http://0.0.0.0:${port}`);
  serve({
    fetch: app.fetch,
    port
  });
}

start();