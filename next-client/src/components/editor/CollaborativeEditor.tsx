"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAppStore } from "@/store/useAppStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, List, ListOrdered,
  Quote, Code, Minus, Link, AlignLeft, AlignCenter, AlignRight,
  Highlighter
} from "lucide-react";

type ToolbarButton = {
  icon: React.ReactNode;
  command: string;
  arg?: string;
  title: string;
};

const TOOLBAR_GROUPS: ToolbarButton[][] = [
  [
    { icon: <Bold size={14} />, command: "bold", title: "Bold (Ctrl+B)" },
    { icon: <Italic size={14} />, command: "italic", title: "Italic (Ctrl+I)" },
    { icon: <Underline size={14} />, command: "underline", title: "Underline (Ctrl+U)" },
    { icon: <Strikethrough size={14} />, command: "strikeThrough", title: "Strikethrough" },
    { icon: <Highlighter size={14} />, command: "hiliteColor", arg: "#4c1d95", title: "Highlight" },
  ],
  [
    { icon: <Heading1 size={14} />, command: "formatBlock", arg: "H1", title: "Heading 1" },
    { icon: <Heading2 size={14} />, command: "formatBlock", arg: "H2", title: "Heading 2" },
  ],
  [
    { icon: <List size={14} />, command: "insertUnorderedList", title: "Bullet List" },
    { icon: <ListOrdered size={14} />, command: "insertOrderedList", title: "Numbered List" },
    { icon: <Quote size={14} />, command: "formatBlock", arg: "BLOCKQUOTE", title: "Quote" },
    { icon: <Code size={14} />, command: "formatBlock", arg: "PRE", title: "Code Block" },
  ],
  [
    { icon: <AlignLeft size={14} />, command: "justifyLeft", title: "Align Left" },
    { icon: <AlignCenter size={14} />, command: "justifyCenter", title: "Align Center" },
    { icon: <AlignRight size={14} />, command: "justifyRight", title: "Align Right" },
  ],
  [
    { icon: <Minus size={14} />, command: "insertHorizontalRule", title: "Divider" },
  ],
];

export default function CollaborativeEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const user = useAppStore((state) => state.user);
  const activeNoteId = useAppStore((state) => state.activeNoteId);
  const notes = useAppStore((state) => state.notes);
  const setNotes = useAppStore((state) => state.setNotes);
  const settings = useAppStore((state) => state.settings);
  const socketRef = useRef<Socket | null>(null);

  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRemoteUpdate = useRef(false);

  // Load active note content when it changes
  useEffect(() => {
    if (activeNoteId && editorRef.current) {
      const activeNote = notes.find(n => n._id === activeNoteId);
      if (activeNote) {
        // Only update if content is actually different to avoid cursor jump
        if (editorRef.current.innerHTML !== activeNote.content) {
          isRemoteUpdate.current = true;
          editorRef.current.innerHTML = activeNote.content || "";
          isRemoteUpdate.current = false;
        }
      }
      if (socketRef.current) {
        const userData = user ? { name: user.name, color: '#10b981' } : { name: 'Demo User', color: '#b026ff' };
        socketRef.current.emit("join-document", activeNoteId, userData);
      }
    }
  }, [activeNoteId]);

  // Socket setup
  useEffect(() => {
    const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");
    socketRef.current = socket;

    socket.on("connect", () => {
      if (activeNoteId) {
        const userData = user ? { name: user.name, color: '#10b981' } : { name: 'Demo User', color: '#b026ff' };
        socket.emit("join-document", activeNoteId, userData);
      }
    });

    socket.on("receive-changes", (newContent: string) => {
      if (editorRef.current && !isRemoteUpdate.current) {
        isRemoteUpdate.current = true;
        const sel = document.getSelection();
        const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
        editorRef.current.innerHTML = newContent;
        // Attempt to restore selection
        if (range) {
          try { sel?.addRange(range); } catch {}
        }
        isRemoteUpdate.current = false;
      }
    });

    socket.on("presence-update", (users: any[]) => setActiveUsers(users));

    socket.on("cursor-update", (data: any) => {
      setTypingUsers(prev => ({ ...prev, [data.socketId]: data.name }));
      if (typingTimeoutRef.current[data.socketId]) clearTimeout(typingTimeoutRef.current[data.socketId]);
      typingTimeoutRef.current[data.socketId] = setTimeout(() => {
        setTypingUsers(prev => { const s = { ...prev }; delete s[data.socketId]; return s; });
      }, 1500);
    });

    return () => { socket.disconnect(); };
  }, []);

  const saveContent = useCallback((html: string) => {
    if (!activeNoteId || !user?.token) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notes/${activeNoteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
          body: JSON.stringify({ content: html }),
        });
      } catch (err) {
        console.error("Failed to save note", err);
      }
    }, 1200);
  }, [activeNoteId, user]);

  // Word count derived from editor content
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const handleInput = () => {
    if (!editorRef.current || isRemoteUpdate.current) return;
    const html = editorRef.current.innerHTML;
    const text = editorRef.current.innerText || "";
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    setCharCount(text.length);

    if (activeNoteId && socketRef.current) {
      socketRef.current.emit("send-changes", activeNoteId, html);
      socketRef.current.emit("cursor-move", activeNoteId, { name: user?.name || "Demo User" });
      const updatedNotes = notes.map(n => n._id === activeNoteId ? { ...n, content: html } : n);
      setNotes(updatedNotes);
    }
    saveContent(html);
  };

  const execFormat = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
    handleInput();
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Active Users Presence Avatars */}
      <div className="absolute top-2 right-4 flex items-center space-x-2 z-10">
        <AnimatePresence>
          {activeUsers.map((u) => (
            <motion.div
              key={u.socketId}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              title={u.name}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-[0_0_10px_rgba(0,0,0,0.5)] border border-white/20"
              style={{ backgroundColor: u.color }}
            >
              {u.name.substring(0, 2).toUpperCase()}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Rich Text Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-white/5 flex-wrap shrink-0">
        {TOOLBAR_GROUPS.map((group, gi) => (
          <div key={gi} className="flex items-center gap-0.5">
            {group.map((btn) => (
              <button
                key={btn.command + (btn.arg || "")}
                title={btn.title}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent focus loss
                  execFormat(btn.command, btn.arg);
                }}
                className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-150 active:scale-90"
              >
                {btn.icon}
              </button>
            ))}
            {gi < TOOLBAR_GROUPS.length - 1 && (
              <div className="w-px h-4 bg-white/10 mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* ContentEditable Editor */}
      <div className="relative flex-1 overflow-y-auto">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          spellCheck={settings.spellCheck}
          data-placeholder="Start typing your futuristic notes here..."
          style={{
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight === "normal" ? "1.5" : settings.lineHeight === "relaxed" ? "1.8" : "2.2",
          }}
          className="w-full h-full min-h-[300px] bg-transparent outline-none text-gray-200 text-base leading-relaxed px-4 py-4
            [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mb-3 [&_h1]:mt-2
            [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mb-2 [&_h2]:mt-2
            [&_blockquote]:border-l-4 [&_blockquote]:border-purple-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-400 [&_blockquote]:my-3
            [&_pre]:bg-[#0d0d0f] [&_pre]:rounded-lg [&_pre]:px-4 [&_pre]:py-3 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:text-cyan-300 [&_pre]:my-3 [&_pre]:border [&_pre]:border-white/10 [&_pre]:overflow-x-auto
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ul]:my-2
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1 [&_ol]:my-2
            [&_li]:text-gray-300
            [&_strong]:font-bold [&_strong]:text-white
            [&_em]:italic [&_em]:text-gray-300
            [&_u]:underline [&_u]:underline-offset-2
            [&_s]:line-through [&_s]:text-gray-500
            [&_a]:text-purple-400 [&_a]:underline [&_a]:hover:text-purple-300
            [&_hr]:border-white/10 [&_hr]:my-4
            empty:before:content-[attr(data-placeholder)] empty:before:text-gray-600 empty:before:pointer-events-none empty:before:select-none"
        />
      </div>

      {/* Word count */}
      {settings.showWordCount && (
        <div className="absolute bottom-2 right-4 text-[10px] text-gray-600 pointer-events-none select-none">
          {wordCount} words · {charCount} chars
        </div>
      )}

      {/* Typing Indicators */}
      <AnimatePresence>
        {Object.values(typingUsers).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 flex items-center space-x-2 text-xs text-purple-400 bg-purple-900/40 px-3 py-1.5 rounded-full border border-purple-500/30 shadow-[0_0_15px_rgba(176,38,255,0.2)] pointer-events-none"
          >
            <span className="flex space-x-1">
              <span className="animate-pulse inline-block">●</span>
              <span className="animate-pulse inline-block" style={{ animationDelay: "0.2s" }}>●</span>
              <span className="animate-pulse inline-block" style={{ animationDelay: "0.4s" }}>●</span>
            </span>
            <span>{Object.values(typingUsers).join(", ")} is typing...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
