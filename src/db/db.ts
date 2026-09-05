import Dexie, { type Table } from 'dexie';
import type { Note, Folder, Tag } from '../types';

export interface OutboxItem {
  id?: number;
  entityType: 'note' | 'folder' | 'tag';
  entityId: string;
  action: 'create' | 'update' | 'delete';
  payload: any;
  createdAt: number;
}

export interface SyncMeta {
  key: string;
  value: any;
}

export class NullnotesDatabase extends Dexie {
  notes!: Table<Note, string>;
  folders!: Table<Folder, string>;
  tags!: Table<Tag, string>;
  outbox!: Table<OutboxItem, number>;
  syncMeta!: Table<SyncMeta, string>;

  constructor() {
    super('NullnotesDB');
    this.version(2).stores({
      notes: 'id, title, folderId, *tags, isPinned, isArchived, isFavorite, createdAt, updatedAt, synced',
      folders: 'id, name, parentId, createdAt, updatedAt',
      tags: 'id, name',
      outbox: '++id, entityType, entityId, action, createdAt',
      syncMeta: 'key'
    });
  }
}

export const db = new NullnotesDatabase();