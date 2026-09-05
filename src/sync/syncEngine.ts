import { db } from '../db/db';
import { notesRepository } from '../db/notesRepository';
import { useAuthStore } from '../store/useAuthStore';
import { useSyncStore } from '../store/useSyncStore';
import { useNotesStore } from '../store/useNotesStore';
import type { Note } from '../types';

let syncInProgress = false;
let syncTimeout: any = null;

export const syncEngine = {
  async triggerSync(delay = 500) {
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      this.sync();
    }, delay);
  },

  // When user logs in, enqueue existing local notes so they are pushed to server
  async enqueueAllLocalData() {
    const allNotes = await db.notes.toArray();
    const allFolders = await db.folders.toArray();
    const allTags = await db.tags.toArray();

    for (const n of allNotes) {
      const exists = await db.outbox.where({ entityType: 'note', entityId: n.id }).first();
      if (!exists) {
        await db.outbox.add({
          entityType: 'note',
          entityId: n.id,
          action: 'update',
          payload: n,
          createdAt: Date.now()
        });
      }
    }

    for (const f of allFolders) {
      const exists = await db.outbox.where({ entityType: 'folder', entityId: f.id }).first();
      if (!exists) {
        await db.outbox.add({
          entityType: 'folder',
          entityId: f.id,
          action: 'update',
          payload: f,
          createdAt: Date.now()
        });
      }
    }

    for (const t of allTags) {
      const exists = await db.outbox.where({ entityType: 'tag', entityId: t.id }).first();
      if (!exists) {
        await db.outbox.add({
          entityType: 'tag',
          entityId: t.id,
          action: 'update',
          payload: t,
          createdAt: Date.now()
        });
      }
    }
  },

  async sync() {
    const { token, serverUrl } = useAuthStore.getState();
    const { setStatus, setLastSyncedAt, setError } = useSyncStore.getState();

    if (!token) {
      setStatus('offline');
      return;
    }

    if (!navigator.onLine) {
      setStatus('offline');
      return;
    }

    if (syncInProgress) return;
    syncInProgress = true;
    setStatus('syncing');
    setError(null);

    try {
      // 1. PUSH local outbox changes to server
      const outboxItems = await db.outbox.orderBy('id').toArray();
      if (outboxItems.length > 0) {
        const notesToPush: any[] = [];
        const foldersToPush: any[] = [];
        const tagsToPush: any[] = [];

        for (const item of outboxItems) {
          if (item.entityType === 'note') {
            if (item.action === 'delete') {
              notesToPush.push({ id: item.entityId, deleted: true });
            } else {
              notesToPush.push(item.payload);
            }
          } else if (item.entityType === 'folder') {
            if (item.action === 'delete') {
              foldersToPush.push({ id: item.entityId, deleted: true });
            } else {
              foldersToPush.push(item.payload);
            }
          } else if (item.entityType === 'tag') {
            if (item.action === 'delete') {
              tagsToPush.push({ id: item.entityId, deleted: true });
            } else {
              tagsToPush.push(item.payload);
            }
          }
        }

        const pushRes = await fetch(`${serverUrl}/api/sync/push`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            notes: notesToPush,
            folders: foldersToPush,
            tags: tagsToPush
          })
        });

        if (!pushRes.ok) {
          throw new Error(`Push failed with status ${pushRes.status}`);
        }

        const itemIds = outboxItems.map(i => i.id!).filter(Boolean);
        await db.outbox.bulkDelete(itemIds);
      }

      // 2. PULL remote changes from server
      const lastSyncMeta = await db.syncMeta.get('lastSyncTimestamp');
      const lastSyncTime = lastSyncMeta ? Number(lastSyncMeta.value) : 0;

      const pullRes = await fetch(`${serverUrl}/api/sync/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ lastSyncTime })
      });

      if (!pullRes.ok) {
        throw new Error(`Pull failed with status ${pullRes.status}`);
      }

      const pullData = await pullRes.json();
      const { serverTime, notes = [], folders = [], tags = [] } = pullData;

      let hasChanges = false;

      // Apply folders
      for (const remoteFolder of folders) {
        hasChanges = true;
        if (remoteFolder.deletedAt) {
          await notesRepository.deleteFolder(remoteFolder.id, true);
        } else {
          await notesRepository.saveFolder(remoteFolder, true);
        }
      }

      // Apply tags
      for (const remoteTag of tags) {
        hasChanges = true;
        if (remoteTag.deletedAt) {
          await notesRepository.deleteTag(remoteTag.name, true);
        } else {
          await notesRepository.saveTag(remoteTag, true);
        }
      }

      // Apply notes with conflict resolution
      for (const remoteNote of notes) {
        hasChanges = true;
        if (remoteNote.deletedAt) {
          await notesRepository.deleteNote(remoteNote.id, true);
        } else {
          const localNote = await db.notes.get(remoteNote.id);
          if (!localNote) {
            await notesRepository.saveNote(remoteNote, true);
          } else {
            const isLocalNewer = localNote.updatedAt > remoteNote.updatedAt;
            const isContentDifferent = JSON.stringify(localNote.content) !== JSON.stringify(remoteNote.content);

            if (isLocalNewer && isContentDifferent) {
              const conflictCopy: Note = {
                ...localNote,
                id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `conflict_${Date.now()}`,
                title: `[Конфлікт] ${localNote.title}`,
                updatedAt: Date.now(),
                synced: false
              };
              await notesRepository.saveNote(conflictCopy, false);
              await notesRepository.saveNote(remoteNote, true);
            } else {
              await notesRepository.saveNote(remoteNote, true);
            }
          }
        }
      }

      await db.syncMeta.put({ key: 'lastSyncTimestamp', value: serverTime });

      setStatus('synced');
      setLastSyncedAt(Date.now());

      if (hasChanges) {
        await useNotesStore.getState().fetchNotes();
        await useNotesStore.getState().fetchFolders();
        await useNotesStore.getState().fetchTags();
      }
    } catch (err: any) {
      console.error('Sync failed:', err);
      setStatus('error');
      setError(err.message || 'Помилка синхронізації');
    } finally {
      syncInProgress = false;
    }
  },

  initAutoSync() {
    window.addEventListener('online', () => this.triggerSync(100));
    setInterval(() => {
      this.sync();
    }, 15000);
  }
};