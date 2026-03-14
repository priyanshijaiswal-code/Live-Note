"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Bell, Users, FileText, Star, CheckCheck,
  UserPlus, Edit3, Clock, Zap
} from "lucide-react";

interface Notification {
  id: string;
  type: "collab" | "edit" | "star" | "system" | "mention";
  title: string;
  body: string;
  time: string;
  read: boolean;
  avatar?: string;
}

// Sample notifications — in a real app these come from the server
const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "collab",
    title: "New collaborator joined",
    body: "Alice joined your note \"Project Alpha\" and is editing now.",
    time: "2 min ago",
    read: false,
  },
  {
    id: "2",
    type: "edit",
    title: "Your note was edited",
    body: "Bob made changes to \"Meeting Notes\" — 3 paragraphs updated.",
    time: "15 min ago",
    read: false,
  },
  {
    id: "3",
    type: "star",
    title: "Note favorited",
    body: "Carol starred your shared note \"Q1 Planning\".",
    time: "1 hr ago",
    read: true,
  },
  {
    id: "4",
    type: "mention",
    title: "You were mentioned",
    body: "Dave mentioned you in \"Design Review\" — \"@you can you check this?\"",
    time: "3 hrs ago",
    read: true,
  },
  {
    id: "5",
    type: "system",
    title: "Auto-save enabled",
    body: "Your notes are now auto-saved every 1.5 seconds.",
    time: "Today",
    read: true,
  },
  {
    id: "6",
    type: "system",
    title: "Welcome to Live Notes!",
    body: "Start by creating your first note. Use Ctrl+K for quick actions.",
    time: "Yesterday",
    read: true,
  },
];

const TYPE_CONFIG = {
  collab: { icon: <Users size={14} />, color: "text-cyan-400", bg: "bg-cyan-500/15" },
  edit: { icon: <Edit3 size={14} />, color: "text-blue-400", bg: "bg-blue-500/15" },
  star: { icon: <Star size={14} />, color: "text-yellow-400", bg: "bg-yellow-500/15" },
  system: { icon: <Zap size={14} />, color: "text-purple-400", bg: "bg-purple-500/15" },
  mention: { icon: <UserPlus size={14} />, color: "text-pink-400", bg: "bg-pink-500/15" },
};

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  const unread = SAMPLE_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Invisible backdrop */}
          <div className="fixed inset-0 z-40" onClick={onClose} />

          {/* Panel */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full right-0 mt-2 w-80 bg-[#16161a] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-50 overflow-hidden"
            style={{ maxHeight: "70vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/8">
              <div className="flex items-center gap-2">
                <Bell size={15} className="text-gray-400" />
                <span className="text-sm font-semibold text-white">Notifications</span>
                {unread > 0 && (
                  <span className="text-[10px] font-bold bg-pink-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                    {unread}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-purple-400 transition px-1.5 py-1 rounded-md hover:bg-white/5"
                  title="Mark all as read"
                >
                  <CheckCheck size={12} /> Mark all read
                </button>
                <button onClick={onClose} className="p-1 rounded-md text-gray-600 hover:text-white hover:bg-white/10 transition">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 120px)" }}>
              {/* Unread section */}
              {unread > 0 && (
                <div>
                  <p className="text-[10px] text-gray-600 uppercase font-semibold tracking-wider px-4 pt-3 pb-1">New</p>
                  {SAMPLE_NOTIFICATIONS.filter(n => !n.read).map(n => (
                    <NotificationItem key={n.id} notification={n} />
                  ))}
                </div>
              )}

              {/* Read section */}
              <div>
                <p className="text-[10px] text-gray-600 uppercase font-semibold tracking-wider px-4 pt-3 pb-1">Earlier</p>
                {SAMPLE_NOTIFICATIONS.filter(n => n.read).map(n => (
                  <NotificationItem key={n.id} notification={n} />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] text-gray-600">
                <Clock size={10} className="inline mr-1 mb-0.5" />
                Updated just now
              </span>
              <button className="text-[11px] text-purple-400 hover:text-purple-300 transition font-medium">
                View all →
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function NotificationItem({ notification: n }: { notification: Notification }) {
  const config = TYPE_CONFIG[n.type];
  return (
    <div className={`flex items-start gap-3 px-4 py-3 hover:bg-white/4 transition cursor-pointer border-b border-white/[0.03] ${!n.read ? "bg-white/[0.02]" : ""}`}>
      {/* Icon */}
      <div className={`shrink-0 w-8 h-8 rounded-xl ${config.bg} flex items-center justify-center mt-0.5 ${config.color}`}>
        {config.icon}
      </div>
      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-xs font-semibold leading-snug ${n.read ? "text-gray-300" : "text-white"}`}>
            {n.title}
          </p>
          {!n.read && <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-pink-500 mt-1" />}
        </div>
        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
        <p className="text-[10px] text-gray-600 mt-1">{n.time}</p>
      </div>
    </div>
  );
}
