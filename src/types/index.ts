export interface Note {
  id: string;
  title: string;
  content: any[]; // BlockNote blocks array
  plainText?: string; // For fast searching
  folderId: string | null;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
  synced: boolean;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  color?: string;
  icon?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export type ViewFilter = 
  | { type: 'all' }
  | { type: 'favorites' }
  | { type: 'pinned' }
  | { type: 'archived' }
  | { type: 'folder'; folderId: string }
  | { type: 'tag'; tag: string };
