"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FilePlus, Moon, Sun, FileText, UserPlus, Command } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

interface CommandItem {
  icon: React.ReactNode;
  label: string;
  category: string;
  shortcut?: string;
  action: () => void;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const notes = useAppStore(state => state.notes);
  const setActiveNoteId = useAppStore(state => state.setActiveNoteId);
  const updateSettings = useAppStore(state => state.updateSettings);
  const settings = useAppStore(state => state.settings);
  const createNote = useAppStore(state => state.createNote);

  const close = () => { setIsOpen(false); setQuery(""); setSelectedIndex(0); };

  // Base setup commands
  const baseCommands = useMemo<CommandItem[]>(() => [
    {
      icon: <FilePlus size={15} />,
      label: "Create new note",
      category: "Notes",
      shortcut: "Ctrl+Enter",
      action: async () => { await createNote(); close(); }
    },
    {
      icon: <Moon size={15} />,
      label: "Switch to Dark theme",
      category: "Appearance",
      action: () => { updateSettings({ theme: "dark" }); close(); }
    },
    {
      icon: <Sun size={15} />,
      label: "Switch to Light theme",
      category: "Appearance",
      action: () => { updateSettings({ theme: "light" }); close(); }
    },
    {
      icon: <Moon size={15} className="opacity-60" />,
      label: "Switch to Midnight theme",
      category: "Appearance",
      action: () => { updateSettings({ theme: "midnight" }); close(); }
    },
    {
      icon: <FileText size={15} />,
      label: settings.focusMode ? "Exit Focus Mode" : "Enable Focus Mode",
      category: "Editor",
      shortcut: "Alt+F",
      action: () => { updateSettings({ focusMode: !settings.focusMode }); close(); }
    },
    {
      icon: <UserPlus size={15} />,
      label: "Invite collaborator",
      category: "Team",
      action: () => { close(); alert("Collaboration invite: share the note URL with a teammate. Real-time sync happens automatically!"); }
    },
    {
      icon: <Moon size={15} />,
      label: "Toggle Sidebar",
      category: "Layout",
      shortcut: "Ctrl+/",
      action: () => { useAppStore.getState().toggleSidebar(); close(); }
    },
  ], [settings.focusMode, createNote, updateSettings]);

  const noteCommands = useMemo<CommandItem[]>(() => notes.map(n => ({
    icon: <FileText size={15} className="text-purple-400" />,
    label: n.title || "Untitled Note",
    category: "Open Note",
    action: () => { setActiveNoteId(n._id); close(); }
  })), [notes, setActiveNoteId]);

  const allCommands = useMemo(() => [...baseCommands, ...noteCommands], [baseCommands, noteCommands]);

  const filtered = useMemo(() => query
    ? allCommands.filter(c => 
        c.label.toLowerCase().includes(query.toLowerCase()) || 
        c.category.toLowerCase().includes(query.toLowerCase())
      )
    : allCommands, [query, allCommands]);

  const grouped = useMemo(() => filtered.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {}), [filtered]);

  // Master kbd listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Nav listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
      if (e.key === "Enter") { e.preventDefault(); filtered[selectedIndex]?.action?.(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, filtered, selectedIndex]);

  let globalIndex = 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[18%] left-1/2 -translate-x-1/2 w-[95%] max-w-lg bg-[#18181b]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_60px_rgba(176,38,255,0.25)] z-[100] overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
              <Search className="text-gray-400" size={18} />
              <input
                autoFocus
                type="text"
                placeholder="Type a command or search notes..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-gray-500 text-sm"
              />
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md border border-white/5">
                <span className="text-[10px] text-gray-400 font-medium">ESC</span>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[400px] overflow-y-auto p-2 space-y-4">
              {Object.entries(grouped).length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-gray-500">No commands found for "{query}"</p>
                </div>
              ) : (
                Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <div className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                       {category}
                       <div className="h-px flex-1 bg-white/5" />
                    </div>
                    <div className="space-y-0.5 mt-1">
                      {items.map((cmd) => {
                        const index = globalIndex++;
                        const isSelected = selectedIndex === index;
                        return (
                          <button
                            key={cmd.label + index}
                            onClick={cmd.action}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 text-left ${
                              isSelected 
                                ? "bg-purple-600/20 text-white shadow-sm ring-1 ring-purple-500/30" 
                                : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-lg ${isSelected ? "bg-purple-500 text-white" : "bg-white/5"}`}>
                                {cmd.icon}
                              </div>
                              <span className="text-sm font-medium">{cmd.label}</span>
                            </div>
                            {cmd.shortcut && (
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                                isSelected ? "border-purple-400/30 text-purple-300" : "border-white/10 text-gray-600"
                              }`}>
                                {cmd.shortcut}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-white/5 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 bg-white/5 rounded border border-white/10">
                    <Command size={10} className="text-gray-500" />
                  </div>
                  <span className="text-[10px] text-gray-500">Navigation</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                 <span className="text-[10px] text-gray-500">Press</span>
                 <div className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-[10px] text-gray-400 font-bold">ENTER</div>
                 <span className="text-[10px] text-gray-500">to execute</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
