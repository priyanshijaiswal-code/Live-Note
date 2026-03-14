import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  token?: string;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  owner: string;
  collaborators: string[];
  updatedAt: string;
}

export type Theme = 'dark' | 'darker' | 'midnight' | 'light';
export type LineHeight = 'normal' | 'relaxed' | 'loose';

export interface Settings {
  theme: Theme;
  accentColor: string;
  fontSize: number;
  reducedMotion: boolean;
  compactSidebar: boolean;
  spellCheck: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  lineHeight: LineHeight;
  showWordCount: boolean;
  focusMode: boolean;
  notifCollaboration: boolean;
  notifComments: boolean;
  notifSounds: boolean;
  notifEmail: boolean;
  profileVisible: boolean;
  showOnlineStatus: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  accentColor: '#b026ff',
  fontSize: 16,
  reducedMotion: false,
  compactSidebar: false,
  spellCheck: true,
  autoSave: true,
  autoSaveInterval: 1500,
  lineHeight: 'relaxed',
  showWordCount: true,
  focusMode: false,
  notifCollaboration: true,
  notifComments: true,
  notifSounds: false,
  notifEmail: false,
  profileVisible: true,
  showOnlineStatus: true,
};

// Persist helpers
const persistUser = (user: User | null) => {
  if (typeof window === 'undefined') return;
  if (user) localStorage.setItem('livenotes_user', JSON.stringify(user));
  else localStorage.removeItem('livenotes_user');
};

const loadPersistedUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('livenotes_user');
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
};

const persistSettings = (settings: Settings) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('livenotes_prefs', JSON.stringify(settings));
};

const loadPersistedSettings = (): Settings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const saved = localStorage.getItem('livenotes_prefs');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
};

interface AppState {
  user: User | null;
  notes: Note[];
  activeNoteId: string | null;
  isSidebarOpen: boolean;
  isRightPanelOpen: boolean;
  settings: Settings;
  setUser: (user: User | null) => void;
  logout: () => void;
  setNotes: (notes: Note[]) => void;
  setActiveNoteId: (id: string | null) => void;
  toggleSidebar: () => void;
  toggleRightPanel: () => void;
  updateSettings: (partial: Partial<Settings>) => void;
  fetchNotes: () => Promise<void>;
  createNote: (title?: string) => Promise<string | null>;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: loadPersistedUser(),
  notes: [],
  activeNoteId: null,
  isSidebarOpen: true,
  isRightPanelOpen: false,
  settings: loadPersistedSettings(),

  setUser: (user) => { persistUser(user); set({ user }); },
  logout: () => { persistUser(null); set({ user: null, notes: [], activeNoteId: null }); },
  setNotes: (notes) => set({ notes }),
  setActiveNoteId: (id) => set({ activeNoteId: id }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),

  updateSettings: (partial) => {
    const next = { ...get().settings, ...partial };
    persistSettings(next);
    set({ settings: next });
  },

  fetchNotes: async () => {
    const { user } = get();
    if (!user?.token) return;
    try {
      const res = await fetch('http://localhost:5000/api/notes', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        set({ notes: data });
        if (data.length > 0 && !get().activeNoteId) set({ activeNoteId: data[0]._id });
      }
    } catch (err) { console.error('Failed to fetch notes', err); }
  },

  createNote: async (title = 'Untitled Note') => {
    const { user, notes } = get();
    if (!user?.token) return null;
    try {
      const res = await fetch('http://localhost:5000/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ title, content: '' })
      });
      if (res.ok) {
        const newNote = await res.json();
        set({ notes: [newNote, ...notes], activeNoteId: newNote._id });
        return newNote._id;
      }
      return null;
    } catch (err) { console.error('Failed to create note', err); return null; }
  }
}));
