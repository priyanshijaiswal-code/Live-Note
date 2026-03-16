"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore, Note } from "@/store/useAppStore";
import {
  Search, Star, Hash, Settings, FileText, Plus,
  ChevronRight, ChevronDown, Trash2, Pencil, Check, X,
  LogOut, User, FolderOpen, Folder
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SettingsModal from "./SettingsModal";

type ContextMenu = { x: number; y: number; note: Note } | null;

export default function Sidebar() {
  const router = useRouter();
  const isSidebarOpen = useAppStore((state) => state.isSidebarOpen);
  const notes = useAppStore((state) => state.notes);
  const setNotes = useAppStore((state) => state.setNotes);
  const activeNoteId = useAppStore((state) => state.activeNoteId);
  const setActiveNoteId = useAppStore((state) => state.setActiveNoteId);
  const fetchNotes = useAppStore((state) => state.fetchNotes);
  const createNote = useAppStore((state) => state.createNote);
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);
  const settings = useAppStore((state) => state.settings);
  const compact = settings.compactSidebar;

  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<ContextMenu>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [notesOpen, setNotesOpen] = useState(true);
  const [favOpen, setFavOpen] = useState(true);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Close context menu on outside click
  useEffect(() => {
    const handler = () => setContextMenu(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("livenotes_favorites");
      if (saved) setFavorites(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const saveFavorites = (newFavs: Set<string>) => {
    localStorage.setItem("livenotes_favorites", JSON.stringify([...newFavs]));
    setFavorites(newFavs);
  };

  const toggleFavorite = (id: string) => {
    const newFavs = new Set(favorites);
    if (newFavs.has(id)) newFavs.delete(id);
    else newFavs.add(id);
    saveFavorites(newFavs);
  };

  // Available tags (derived from note titles + hardcoded)
  const allTags = ["urgent", "draft", "personal", "work", "ideas"];

  // Filtered notes
  const filteredNotes = notes.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const favoriteNotes = filteredNotes.filter((n) => favorites.has(n._id));
  const regularNotes = filteredNotes.filter((n) => !favorites.has(n._id));

  const handleContextMenu = (e: React.MouseEvent, note: Note) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, note });
  };

  const startRename = (note: Note) => {
    setRenamingId(note._id);
    setRenameValue(note.title);
    setContextMenu(null);
    setTimeout(() => renameInputRef.current?.focus(), 50);
  };

  const confirmRename = async () => {
    if (!renamingId || !renameValue.trim() || !user?.token) {
      setRenamingId(null);
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notes/${renamingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ title: renameValue.trim() }),
      });
      if (res.ok) {
        setNotes(notes.map((n) => n._id === renamingId ? { ...n, title: renameValue.trim() } : n));
      }
    } catch {}
    setRenamingId(null);
  };

  const deleteNote = async (note: Note) => {
    setContextMenu(null);
    if (!user?.token) return;
    if (!confirm(`Delete "${note.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notes/${note._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const updated = notes.filter((n) => n._id !== note._id);
        setNotes(updated);
        if (activeNoteId === note._id) setActiveNoteId(updated[0]?._id || null);
      }
    } catch {}
  };

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const NoteItem = ({ note }: { note: Note }) => {
    const isActive = activeNoteId === note._id;
    const isFav = favorites.has(note._id);
    const isRenaming = renamingId === note._id;

    return (
      <div
        onContextMenu={(e) => handleContextMenu(e, note)}
        onClick={() => { if (!isRenaming) setActiveNoteId(note._id); }}
        className={`group relative flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all duration-150 ${
          isActive
            ? "bg-purple-500/20 border border-purple-500/30 shadow-[0_0_10px_rgba(176,38,255,0.1)]"
            : "hover:bg-white/5 border border-transparent"
        }`}
      >
        <FileText size={14} className={isActive ? "text-purple-400 shrink-0" : "text-gray-500 shrink-0"} />

        {isRenaming ? (
          <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <input
              ref={renameInputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") confirmRename(); if (e.key === "Escape") setRenamingId(null); }}
              className="flex-1 bg-white/10 text-white text-xs rounded px-2 py-0.5 outline-none border border-purple-500/50 focus:border-purple-400"
            />
            <button onClick={confirmRename} className="text-green-400 hover:text-green-300 p-0.5"><Check size={12} /></button>
            <button onClick={() => setRenamingId(null)} className="text-gray-400 hover:text-gray-200 p-0.5"><X size={12} /></button>
          </div>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium truncate ${isActive ? "text-purple-200" : "text-gray-300"}`}>
                {note.title || "Untitled Note"}
              </p>
              <p className="text-[10px] text-gray-600 mt-0.5">
                {formatDate(note.updatedAt)}
              </p>
            </div>

            {/* Hover actions */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(note._id); }}
                title={isFav ? "Unfavorite" : "Favorite"}
                className={`p-1 rounded transition ${isFav ? "text-yellow-400" : "text-gray-600 hover:text-yellow-400"}`}
              >
                <Star size={11} fill={isFav ? "currentColor" : "none"} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); startRename(note); }}
                className="p-1 rounded text-gray-600 hover:text-blue-400 transition"
              >
                <Pencil size={11} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteNote(note); }}
                className="p-1 rounded text-gray-600 hover:text-red-400 transition"
              >
                <Trash2 size={11} />
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  const SectionHeader = ({
    title, count, open, onToggle, onAdd
  }: { title: string; count?: number; open: boolean; onToggle: () => void; onAdd?: () => void }) => (
    <div className="flex items-center justify-between px-1 mb-1 group">
      <button onClick={onToggle} className="flex items-center gap-1 text-xs uppercase text-gray-500 font-semibold hover:text-gray-300 transition">
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {title}
        {count !== undefined && (
          <span className="bg-white/10 text-gray-400 py-0.5 px-1.5 rounded text-[10px] ml-1">{count}</span>
        )}
      </button>
      {onAdd && (
        <button onClick={onAdd} className="opacity-0 group-hover:opacity-100 transition p-0.5 rounded text-gray-500 hover:text-purple-400 hover:bg-white/10">
          <Plus size={13} />
        </button>
      )}
    </div>
  );

  return (
    <>
    <AnimatePresence initial={false}>
      {isSidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "anticipate" }}
          className="h-full flex-shrink-0 glass-panel border-r border-[#27272a] overflow-hidden flex flex-col"
        >
          <div className={`flex flex-col h-full overflow-y-auto`} style={{ width: compact ? 220 : 260 }}>
            {/* Header */}
            <div className={`flex items-center justify-between border-b border-white/5 ${compact ? 'p-3 pb-2' : 'p-4 pb-3'}`}>
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center glow-purple shrink-0">
                  <span className="font-bold text-white text-sm">N</span>
                </div>
                <h1 className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                  Live Note
                </h1>
              </div>
            </div>

            {/* Search */}
            <div className={compact ? 'px-2 pt-2 pb-1' : 'px-3 pt-3 pb-2'}>
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search notes..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/8 transition"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* User Card */}
            <div className={compact ? 'px-2 pb-2' : 'px-3 pb-3'}>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/8 transition cursor-pointer border border-white/8">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-200 truncate">{user?.name || "User"}</p>
                  <p className="text-[10px] text-gray-600 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Main Nav */}
            <nav className={`flex-1 overflow-y-auto pb-4 ${compact ? 'px-2 space-y-3' : 'px-3 space-y-5'}`}>

              {/* Quick actions */}
              <div className="space-y-0.5">
                <button
                  onClick={() => createNote()}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-purple-500/10 hover:border-purple-500/20 border border-transparent transition text-xs font-medium group"
                >
                  <Plus size={14} className="group-hover:text-purple-400 transition" />
                  New Note
                </button>
                <button className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 border border-transparent transition text-xs font-medium"
                onClick={() => setSettingsOpen(true)}>
                <div className="flex items-center gap-2"><Settings size={14} /> Settings</div>
              </button>
              </div>

              {/* Folders */}
              <div>
                <SectionHeader
                  title="Folders"
                  open={foldersOpen}
                  onToggle={() => setFoldersOpen(!foldersOpen)}
                />
                <AnimatePresence>
                  {foldersOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-0.5 overflow-hidden"
                    >
                      {[{ name: "Personal", count: 3 }, { name: "Work", count: 5 }, { name: "Archive", count: 1 }].map((f) => (
                        <div key={f.name} className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer transition group">
                          <Folder size={13} className="text-cyan-500/70 group-hover:text-cyan-400" />
                          <span className="text-xs flex-1">{f.name}</span>
                          <span className="text-[10px] text-gray-600">{f.count}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Favorites */}
              <div>
                <SectionHeader
                  title="Favorites"
                  count={favoriteNotes.length}
                  open={favOpen}
                  onToggle={() => setFavOpen(!favOpen)}
                />
                <AnimatePresence>
                  {favOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-0.5 overflow-hidden"
                    >
                      {favoriteNotes.length === 0 ? (
                        <p className="text-[11px] text-gray-600 px-2 italic">Star notes to add favorites</p>
                      ) : (
                        favoriteNotes.map((n) => <NoteItem key={n._id} note={n} />)
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* My Notes */}
              <div>
                <SectionHeader
                  title="My Notes"
                  count={regularNotes.length}
                  open={notesOpen}
                  onToggle={() => setNotesOpen(!notesOpen)}
                  onAdd={createNote}
                />
                <AnimatePresence>
                  {notesOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-0.5 overflow-hidden"
                    >
                      {regularNotes.length === 0 && !search ? (
                        <p className="text-[11px] text-gray-600 px-2 italic">No notes yet. Hit + to create one.</p>
                      ) : regularNotes.length === 0 && search ? (
                        <p className="text-[11px] text-gray-600 px-2 italic">No results for "{search}"</p>
                      ) : (
                        regularNotes.map((n) => <NoteItem key={n._id} note={n} />)
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tags */}
              <div>
                <SectionHeader title="Tags" open={true} onToggle={() => {}} />
                <div className="flex flex-wrap gap-1.5 px-1">
                  {allTags.map((tag) => {
                    const active = selectedTags.has(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => {
                          const s = new Set(selectedTags);
                          if (s.has(tag)) s.delete(tag);
                          else s.add(tag);
                          setSelectedTags(s);
                        }}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
                          active
                            ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                            : "border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20"
                        }`}
                      >
                        <Hash size={9} />
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </nav>

            {/* Footer - Sign Out */}
            <div className="p-3 border-t border-white/5 shrink-0">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition text-xs font-medium"
              >
                <LogOut size={13} />
                Sign Out
              </button>
            </div>
          </div>

          {/* Context Menu */}
          <AnimatePresence>
            {contextMenu && (
              <motion.div
                ref={contextMenuRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                style={{ position: "fixed", top: contextMenu.y, left: contextMenu.x, zIndex: 9999 }}
                className="bg-[#1c1c1f] border border-white/10 rounded-xl shadow-2xl py-1 min-w-[160px] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => startRename(contextMenu.note)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-300 hover:bg-white/8 hover:text-white transition"
                >
                  <Pencil size={13} className="text-blue-400" /> Rename
                </button>
                <button
                  onClick={() => toggleFavorite(contextMenu.note._id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-300 hover:bg-white/8 hover:text-white transition"
                >
                  <Star size={13} className="text-yellow-400" fill={favorites.has(contextMenu.note._id) ? "currentColor" : "none"} />
                  {favorites.has(contextMenu.note._id) ? "Unfavorite" : "Add to Favorites"}
                </button>
                <div className="border-t border-white/10 my-1" />
                <button
                  onClick={() => deleteNote(contextMenu.note)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
                >
                  <Trash2 size={13} /> Delete Note
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>
      )}
    </AnimatePresence>

    {/* Settings Modal — renders above everything via fixed positioning */}
    <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
