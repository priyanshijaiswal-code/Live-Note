"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, Search, Bell, PanelRight, ChevronDown, LogOut, FileText, X, Clock } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { motion, AnimatePresence } from "framer-motion";
import NotificationsPanel from "./NotificationsPanel";

export default function Navbar() {
  const router = useRouter();
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const toggleRightPanel = useAppStore((state) => state.toggleRightPanel);
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);
  const notes = useAppStore((state) => state.notes);
  const setActiveNoteId = useAppStore((state) => state.setActiveNoteId);
  const settings = useAppStore((state) => state.settings);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches] = useState(["Project Alpha", "Meeting Notes", "Q1 Planning"]);

  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Ctrl+F or Ctrl+/ focuses search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const handleLogout = () => { logout(); router.push("/auth"); };

  // Search suggestions: match notes by title/content + recent searches
  const noteSuggestions = searchQuery.trim()
    ? notes.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const filteredRecents = !searchQuery.trim()
    ? recentSearches
    : recentSearches.filter(r => r.toLowerCase().includes(searchQuery.toLowerCase()));

  const showDropdown = searchFocused && (noteSuggestions.length > 0 || filteredRecents.length > 0 || searchQuery.trim());

  const isLight = settings.theme === "light";
  const navBg = isLight ? "bg-white/80 border-gray-200/60 backdrop-blur-md" : "bg-[#18181b]/80 border-white/5 backdrop-blur-md";
  const inputBg = isLight ? "bg-gray-100 border-gray-200 text-gray-900 placeholder:text-gray-400" : "bg-[#18181b]/80 border-[#27272a] text-white placeholder:text-gray-500";
  const dropdownBg = isLight ? "bg-white border-gray-200" : "bg-[#18181b] border-white/10";

  return (
    <header className={`h-14 flex items-center justify-between px-4 shrink-0 z-20 sticky top-0 border-b ${navBg}`}>
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSidebar}
          className={`p-1.5 rounded-md transition ${isLight ? "text-gray-500 hover:text-gray-900 hover:bg-gray-100" : "text-gray-400 hover:text-white hover:bg-white/10"}`}
        >
          <Menu size={20} />
        </button>

        {/* Search bar with suggestions */}
        <div className="relative hidden sm:block ml-2" ref={undefined}>
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            placeholder="Search notes... (Ctrl+F)"
            className={`pl-8 pr-8 py-1.5 w-64 rounded-full text-xs border focus:outline-none focus:ring-1 focus:ring-purple-500/40 focus:border-purple-500/30 focus:w-76 transition-all duration-200 ${inputBg}`}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition">
              <X size={12} />
            </button>
          )}

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
                className={`absolute top-full left-0 mt-2 w-72 border rounded-xl shadow-xl z-50 overflow-hidden ${dropdownBg}`}
              >
                {/* Note matches */}
                {noteSuggestions.length > 0 && (
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider px-3 pt-2.5 pb-1">Notes</p>
                    {noteSuggestions.map((note) => (
                      <button
                        key={note._id}
                        onMouseDown={() => { setActiveNoteId(note._id); setSearchQuery(""); setSearchFocused(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition ${isLight ? "hover:bg-gray-50 text-gray-700" : "hover:bg-white/6 text-gray-200"}`}
                      >
                        <FileText size={13} className="text-purple-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{note.title || "Untitled"}</p>
                          {note.content && (
                            <p className="text-[10px] text-gray-500 truncate mt-0.5">
                              {note.content.replace(/<[^>]+>/g, "").slice(0, 60)}…
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Recent searches */}
                {filteredRecents.length > 0 && (
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider px-3 pt-2.5 pb-1">Recent</p>
                    {filteredRecents.map((r) => (
                      <button
                        key={r}
                        onMouseDown={() => { setSearchQuery(r); setSearchFocused(true); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition ${isLight ? "hover:bg-gray-50 text-gray-500" : "hover:bg-white/6 text-gray-400"}`}
                      >
                        <Clock size={12} className="shrink-0" />
                        <span className="text-xs">{r}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* No results */}
                {searchQuery.trim() && noteSuggestions.length === 0 && filteredRecents.length === 0 && (
                  <div className="px-4 py-4 text-center">
                    <p className="text-xs text-gray-500">No notes match "{searchQuery}"</p>
                    <p className="text-[11px] text-gray-600 mt-1">Try a different keyword</p>
                  </div>
                )}

                <div className={`px-3 py-2 border-t text-[10px] flex items-center justify-between ${isLight ? "border-gray-100 text-gray-400" : "border-white/5 text-gray-600"}`}>
                  <span>Press <kbd className="bg-white/10 px-1 rounded font-mono">Enter</kbd> to search all</span>
                  <span><kbd className="bg-white/10 px-1 rounded font-mono">Esc</kbd> to close</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Workspace switcher */}
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg cursor-pointer border transition ${isLight ? "bg-gray-50 border-gray-200 hover:bg-gray-100" : "bg-white/5 border-[#27272a] hover:bg-white/10"}`}>
          <div className="w-4 h-4 rounded bg-gradient-to-tr from-cyan-500 to-blue-500" />
          <span className={`text-xs font-medium ${isLight ? "text-gray-700" : ""}`}>Personal</span>
          <ChevronDown size={12} className="text-gray-500" />
        </div>

        {/* Notifications bell */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            className={`relative p-1.5 rounded-lg transition ${isLight ? "text-gray-500 hover:text-gray-800 hover:bg-gray-100" : "text-gray-400 hover:text-white hover:bg-white/10"} ${showNotifications ? (isLight ? "bg-gray-100 text-gray-800" : "bg-white/10 text-white") : ""}`}
          >
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_6px_rgba(236,72,153,0.8)]" />
          </button>
          <NotificationsPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
        </div>

        {/* Right panel toggle */}
        <button
          onClick={toggleRightPanel}
          className={`p-1.5 rounded-lg transition ${isLight ? "text-gray-500 hover:text-gray-800 hover:bg-gray-100" : "text-gray-400 hover:text-white hover:bg-white/10"}`}
          title="Toggle AI Panel"
        >
          <PanelRight size={18} />
        </button>

        {/* User avatar + dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition ${isLight ? "hover:bg-gray-100" : "hover:bg-white/10"}`}
          >
            <div
              style={{ backgroundColor: settings.accentColor }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md"
            >
              {initials}
            </div>
            <span className={`text-xs hidden sm:inline max-w-[90px] truncate ${isLight ? "text-gray-700" : "text-gray-300"}`}>{user?.name || "User"}</span>
            <ChevronDown size={12} className="text-gray-500" />
          </button>

          {/* User dropdown */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                className={`absolute right-0 mt-2 w-52 border rounded-xl shadow-2xl py-1 z-50 overflow-hidden ${dropdownBg}`}
              >
                <div className={`px-4 py-3 border-b ${isLight ? "border-gray-100" : "border-white/10"}`}>
                  <p className={`text-sm font-semibold truncate ${isLight ? "text-gray-900" : "text-white"}`}>{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
