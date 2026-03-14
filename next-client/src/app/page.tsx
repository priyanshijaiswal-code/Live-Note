"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import RightPanel from "@/components/layout/RightPanel";
import CollaborativeEditor from "@/components/editor/CollaborativeEditor";
import CommandPalette from "@/components/layout/CommandPalette";
import { useAppStore } from "@/store/useAppStore";

export default function Home() {
  const router = useRouter();
  const activeNoteId = useAppStore(state => state.activeNoteId);
  const notes = useAppStore(state => state.notes);
  const setNotes = useAppStore(state => state.setNotes);
  const user = useAppStore(state => state.user);
  const settings = useAppStore(state => state.settings);
  const isSidebarOpen = useAppStore(state => state.isSidebarOpen);

  // Auth guard
  useEffect(() => {
    if (user === null) router.push("/auth");
  }, [user, router]);

  const activeNote = notes.find(n => n._id === activeNoteId);

  const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeNoteId || !user?.token || !activeNote) return;
    const newTitle = e.target.value;
    setNotes(notes.map(n => n._id === activeNoteId ? { ...n, title: newTitle } : n));
    try {
      await fetch(`http://localhost:5000/api/notes/${activeNoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ title: newTitle })
      });
    } catch (err) { console.error("Failed to update title", err); }
  };

  if (!user) return null;

  const isLight = settings.theme === "light";
  // Sidebar visible only when isSidebarOpen AND not in focusMode
  const showSidebar = isSidebarOpen && !settings.focusMode;
  const showRightPanel = !settings.focusMode;

  return (
    <div className="flex h-full w-full overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* Background orbs — hidden in light mode */}
      {!isLight && (
        <>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[200px] pointer-events-none" />
        </>
      )}

      <CommandPalette />
      {/* Sidebar: controlled by hamburger toggle AND focusMode */}
      {showSidebar && <Sidebar />}

      <main className="flex flex-col flex-1 h-full min-w-0 z-0 relative">
        <Navbar />

        <div className="flex-1 overflow-y-auto w-full relative">
          <div className="max-w-4xl mx-auto py-12 px-8">
            <div className="mb-8">
              <input
                type="text"
                value={activeNote?.title || ""}
                onChange={handleTitleChange}
                placeholder={activeNote ? "Untitled Document" : "Select or create a note..."}
                disabled={!activeNoteId}
                style={{ color: isLight ? "var(--text-primary)" : undefined }}
                className="text-4xl font-bold bg-transparent border-none focus:outline-none w-full text-white placeholder:text-gray-600 focus:placeholder:text-gray-700 transition disabled:opacity-50"
              />
            </div>

            <div
              className="backdrop-blur-md rounded-2xl p-6 shadow-2xl min-h-[500px] cursor-text flex flex-col relative"
              style={{
                background: isLight ? "rgba(255,255,255,0.9)" : "rgba(24,24,27,0.4)",
                border: `1px solid var(--border)`,
              }}
            >
              <CollaborativeEditor />
            </div>
          </div>
        </div>
      </main>

      {/* Focus mode hides right panel */}
      {showRightPanel && <RightPanel />}
    </div>
  );
}
