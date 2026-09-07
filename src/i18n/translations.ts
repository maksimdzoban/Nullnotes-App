export type Language = 'uk' | 'en';

export interface Translations {
  // Navigation & Sidebar
  newNote: string;
  allNotes: string;
  favorites: string;
  pinned: string;
  archive: string;
  trash: string;
  folders: string;
  createFolder: string;
  folderNamePlaceholder: string;
  noFolders: string;
  deleteFolderConfirm: string;
  tags: string;
  noTags: string;
  deleteTagConfirm: string;
  notesCount: string;

  // Notes List
  searchPlaceholder: string;
  noNotes: string;
  noNotesFound: string;
  createFirstNote: string;
  emptyTrash: string;
  restore: string;
  deletePermanently: string;

  // Editor
  untitled: string;
  emptyNote: string;
  editorPlaceholder: string;
  words: string;
  characters: string;
  lastEdited: string;
  exportMarkdown: string;
  pinNote: string;
  unpinNote: string;
  favoriteNote: string;
  unfavoriteNote: string;
  archiveNote: string;
  unarchiveNote: string;
  deleteNote: string;
  addTagPlaceholder: string;
  imageUpload: string;
  imageUploadingTooBig: string;

  // Settings & Themes
  settings: string;
  generalSettings: string;
  appearance: string;
  theme: string;
  themeDark: string;
  themeLight: string;
  themeOled: string;
  themeSepia: string;
  accentColor: string;
  accentIndigo: string;
  accentEmerald: string;
  accentAmber: string;
  accentRose: string;
  accentSky: string;
  language: string;
  account: string;
  close: string;
  save: string;
  cancel: string;
  clear: string;

  // Updates
  appVersion: string;
  checkForUpdates: string;
  checkingUpdates: string;
  updateAvailable: string;
  latestVersionInstalled: string;
  downloadUpdate: string;
  updateDetails: string;

  // App Empty States
  noNoteSelected: string;
  selectNotePrompt: string;
  backToList: string;

  // AI Assistant
  aiAssistant: string;
  aiSummarize: string;
  aiAutoTags: string;
  aiCustomPrompt: string;
  aiGenerating: string;
  aiSettings: string;
  aiModel: string;
  aiApiKey: string;
  aiApiKeyPlaceholder: string;
  aiKeySavedLocally: string;

  // Sync & Auth
  cloudSync: string;
  syncNow: string;
  syncing: string;
  synced: string;
  syncSynced: string;
  syncError: string;
  syncOffline: string;
  syncLocal: string;
  offline: string;
  localOnly: string;
  login: string;
  register: string;
  logout: string;
  serverUrl: string;
  email: string;
  password: string;
  name: string;
}

export const translations: Record<Language, Translations> = {
  uk: {
    // Navigation & Sidebar
    newNote: 'Нова нотатка',
    allNotes: 'Всі нотатки',
    favorites: 'Улюблені',
    pinned: 'Закріплені',
    archive: 'Архів',
    trash: 'Кошик',
    folders: 'Папки',
    createFolder: 'Створити папку',
    folderNamePlaceholder: 'Назва папки...',
    noFolders: 'Немає папок',
    deleteFolderConfirm: 'Видалити папку',
    tags: 'Теги',
    noTags: 'Немає тегів',
    deleteTagConfirm: 'Видалити тег',
    notesCount: 'Нотатки',

    // Notes List
    searchPlaceholder: 'Швидкий пошук...',
    noNotes: 'Нотаток не знайдено',
    noNotesFound: 'Нотаток не знайдено',
    createFirstNote: 'Створіть свою першу нотатку',
    emptyTrash: 'Очистити кошик',
    restore: 'Відновити',
    deletePermanently: 'Видалити назавжди',

    // Editor
    untitled: 'Без назви',
    emptyNote: 'Порожня нотатка...',
    editorPlaceholder: 'Почніть писати або введіть "/" для команд...',
    words: 'слів',
    characters: 'символів',
    lastEdited: 'Змінено',
    exportMarkdown: 'Експорт в Markdown',
    pinNote: 'Закріпити',
    unpinNote: 'Відкріпити',
    favoriteNote: 'В улюблені',
    unfavoriteNote: 'З улюблених',
    archiveNote: 'В архів',
    unarchiveNote: 'Розархівувати',
    deleteNote: 'Видалити',
    addTagPlaceholder: '+ Тег...',
    imageUpload: 'Завантажити зображення',
    imageUploadingTooBig: 'Зображення занадто велике (макс. 10MB)',

    // Settings & Themes
    settings: 'Налаштування',
    generalSettings: 'Загальні налаштування',
    appearance: 'Зовнішній вигляд',
    theme: 'Тема інтерфейсу',
    themeDark: 'Темна (Dark Wave)',
    themeLight: 'Світла (Clean White)',
    themeOled: 'OLED (Глибокий чорний)',
    themeSepia: 'Сепія (Теплий папір)',
    accentColor: 'Акцентний колір',
    accentIndigo: 'Індиго / Фіолетовий',
    accentEmerald: 'Смарагдовий',
    accentAmber: 'Бурштиновий',
    accentRose: 'Рожевий',
    accentSky: 'Блакитний',
    language: 'Мова інтерфейсу',
    account: 'Акаунт',
    close: 'Закрити',
    save: 'Зберегти',
    cancel: 'Скасувати',
    clear: 'Очистити',

    // Updates
    appVersion: 'Версія додатку',
    checkForUpdates: 'Перевірити оновлення',
    checkingUpdates: 'Перевірка...',
    updateAvailable: 'Доступне оновлення',
    latestVersionInstalled: 'Встановлено найновішу версію',
    downloadUpdate: 'Завантажити та оновити',
    updateDetails: 'Список змін',

    // App Empty States
    noNoteSelected: 'Нотатку не вибрано',
    selectNotePrompt: 'Створіть нову нотатку або оберіть існуючу зі списку ліворуч, щоб розпочати редагування.',
    backToList: 'Назад до списку',

    // AI Assistant
    aiAssistant: 'AI Асистент',
    aiSummarize: 'Підсумувати',
    aiAutoTags: 'Згенерувати теги',
    aiCustomPrompt: 'Власний запит до AI...',
    aiGenerating: 'AI генерує відповідь...',
    aiSettings: 'Налаштування AI (BYOK)',
    aiModel: 'AI Модель',
    aiApiKey: 'OpenRouter API Ключ',
    aiApiKeyPlaceholder: 'sk-or-v1-...',
    aiKeySavedLocally: 'Ключ зберігається виключно локально у вашому браузері.',

    // Sync & Auth
    cloudSync: 'Хмарна синхронізація',
    syncNow: 'Синхронізувати',
    syncing: 'Синхронізація...',
    synced: 'Синхронізовано',
    syncSynced: 'Синхронізовано',
    syncError: 'Помилка',
    syncOffline: 'Офлайн',
    syncLocal: 'Локально',
    offline: 'Офлайн',
    localOnly: 'Локально',
    login: 'Увійти',
    register: 'Реєстрація',
    logout: 'Вийти',
    serverUrl: 'Адреса сервера',
    email: 'Email',
    password: 'Пароль',
    name: "Ім'я"
  },
  en: {
    // Navigation & Sidebar
    newNote: 'New Note',
    allNotes: 'All Notes',
    favorites: 'Favorites',
    pinned: 'Pinned',
    archive: 'Archive',
    trash: 'Trash',
    folders: 'Folders',
    createFolder: 'Create Folder',
    folderNamePlaceholder: 'Folder name...',
    noFolders: 'No folders',
    deleteFolderConfirm: 'Delete folder',
    tags: 'Tags',
    noTags: 'No tags',
    deleteTagConfirm: 'Delete tag',
    notesCount: 'Notes',

    // Notes List
    searchPlaceholder: 'Search notes...',
    noNotes: 'No notes found',
    noNotesFound: 'No notes found',
    createFirstNote: 'Create your first note',
    emptyTrash: 'Empty Trash',
    restore: 'Restore',
    deletePermanently: 'Delete Permanently',

    // Editor
    untitled: 'Untitled',
    emptyNote: 'Empty note...',
    editorPlaceholder: 'Start typing or press "/" for commands...',
    words: 'words',
    characters: 'characters',
    lastEdited: 'Edited',
    exportMarkdown: 'Export Markdown',
    pinNote: 'Pin',
    unpinNote: 'Unpin',
    favoriteNote: 'Favorite',
    unfavoriteNote: 'Unfavorite',
    archiveNote: 'Archive',
    unarchiveNote: 'Unarchive',
    deleteNote: 'Delete',
    addTagPlaceholder: '+ Tag...',
    imageUpload: 'Upload Image',
    imageUploadingTooBig: 'Image is too large (max 10MB)',

    // Settings & Themes
    settings: 'Settings',
    generalSettings: 'General Settings',
    appearance: 'Appearance',
    theme: 'Interface Theme',
    themeDark: 'Dark (Dark Wave)',
    themeLight: 'Light (Clean White)',
    themeOled: 'OLED (Pure Black)',
    themeSepia: 'Sepia (Warm Paper)',
    accentColor: 'Accent Color',
    accentIndigo: 'Indigo / Violet',
    accentEmerald: 'Emerald Green',
    accentAmber: 'Amber / Orange',
    accentRose: 'Rose / Pink',
    accentSky: 'Sky Blue',
    language: 'Language',
    account: 'Account',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    clear: 'Clear',

    // Updates
    appVersion: 'App Version',
    checkForUpdates: 'Check for Updates',
    checkingUpdates: 'Checking...',
    updateAvailable: 'Update Available',
    latestVersionInstalled: 'Latest version is installed',
    downloadUpdate: 'Download & Update',
    updateDetails: 'Changelog',

    // App Empty States
    noNoteSelected: 'No note selected',
    selectNotePrompt: 'Create a new note or select one from the list on the left to start editing.',
    backToList: 'Back to notes',

    // AI Assistant
    aiAssistant: 'AI Assistant',
    aiSummarize: 'Summarize',
    aiAutoTags: 'Generate Tags',
    aiCustomPrompt: 'Custom AI prompt...',
    aiGenerating: 'AI is thinking...',
    aiSettings: 'AI Settings (BYOK)',
    aiModel: 'AI Model',
    aiApiKey: 'OpenRouter API Key',
    aiApiKeyPlaceholder: 'sk-or-v1-...',
    aiKeySavedLocally: 'Key is stored exclusively locally in your browser.',

    // Sync & Auth
    cloudSync: 'Cloud Sync',
    syncNow: 'Sync Now',
    syncing: 'Syncing...',
    synced: 'Synced',
    syncSynced: 'Synced',
    syncError: 'Error',
    syncOffline: 'Offline',
    syncLocal: 'Local',
    offline: 'Offline',
    localOnly: 'Local',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    serverUrl: 'Server URL',
    email: 'Email',
    password: 'Password',
    name: 'Name'
  }
};
