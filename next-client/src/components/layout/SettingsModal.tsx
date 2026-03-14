"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, Settings } from "@/store/useAppStore";
import {
  X, User, Palette, FileText, Bell, Shield, Keyboard,
  Save, Check, Moon, Sun, Monitor, ChevronRight, Eye, EyeOff,
  Upload, Trash2, Lock, Info
} from "lucide-react";

type Tab = "profile" | "appearance" | "editor" | "notifications" | "privacy" | "shortcuts";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile", icon: <User size={15} /> },
  { id: "appearance", label: "Appearance", icon: <Palette size={15} /> },
  { id: "editor", label: "Editor", icon: <FileText size={15} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={15} /> },
  { id: "privacy", label: "Privacy", icon: <Shield size={15} /> },
  { id: "shortcuts", label: "Shortcuts", icon: <Keyboard size={15} /> },
];

const SHORTCUTS = [
  { key: "Ctrl + K", desc: "Open Command Palette" },
  { key: "Ctrl + B", desc: "Bold text" },
  { key: "Ctrl + I", desc: "Italic text" },
  { key: "Ctrl + U", desc: "Underline text" },
  { key: "Ctrl + Z", desc: "Undo" },
  { key: "Ctrl + Shift + Z", desc: "Redo" },
  { key: "Ctrl + S", desc: "Save note (auto)" },
  { key: "Ctrl + Enter", desc: "Create new note" },
  { key: "Alt + 1", desc: "Heading 1" },
  { key: "Alt + 2", desc: "Heading 2" },
  { key: "Ctrl + /", desc: "Toggle sidebar" },
  { key: "Escape", desc: "Close modals / Cancel" },
];

const ACCENT_COLORS = [
  "#b026ff", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#ec4899",
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saved, setSaved] = useState(false);

  // Profile local state (only committed on Save)
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    updateSettings({ [key]: value });
  };

  const handleSave = () => {
    if (displayName.trim() && user) {
      setUser({ ...user, name: displayName.trim() });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isLight = settings.theme === "light";

  const Toggle = ({ sKey, label, description }: { sKey: keyof Settings; label: string; description?: string }) => {
    const value = settings[sKey] as boolean;
    return (
      <div className={`flex items-center justify-between py-3 border-b ${isLight ? "border-gray-200" : "border-white/5"}`}>
        <div>
          <p className={`text-sm font-medium ${isLight ? "text-gray-800" : "text-gray-200"}`}>{label}</p>
          {description && <p className={`text-xs mt-0.5 ${isLight ? "text-gray-500" : "text-gray-500"}`}>{description}</p>}
        </div>
        <button
          onClick={() => set(sKey, !value as Settings[typeof sKey])}
          style={{ backgroundColor: value ? settings.accentColor : undefined }}
          className={`relative w-10 h-6 rounded-full transition-colors duration-200 shrink-0 ml-4 ${!value ? (isLight ? "bg-gray-200" : "bg-white/10") : ""}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${value ? "translate-x-[16px]" : "translate-x-0"}`} />
        </button>
      </div>
    );
  };

  const modalBg = isLight ? "bg-white border-gray-200" : "bg-[#131316] border-white/10";
  const navBg = isLight ? "bg-gray-50 border-gray-200" : "bg-white/[0.02] border-white/8";
  const tabActive = isLight ? "bg-violet-50 border-violet-200 text-violet-700" : "bg-purple-600/20 text-purple-300 border-purple-500/20";
  const tabInactive = isLight ? "text-gray-500 hover:text-gray-700 hover:bg-gray-100" : "text-gray-400 hover:text-gray-200 hover:bg-white/5";
  const inputCls = isLight
    ? "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-violet-400 focus:ring-violet-300/40"
    : "bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-purple-500/60 focus:ring-purple-500/40";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className={`pointer-events-auto w-full max-w-3xl h-[590px] border rounded-2xl shadow-2xl flex overflow-hidden ${modalBg}`} onClick={(e) => e.stopPropagation()}>

              {/* Sidebar nav */}
              <div className={`w-48 shrink-0 border-r flex flex-col py-4 ${navBg}`}>
                <div className="px-4 mb-4">
                  <h2 className={`text-sm font-bold ${isLight ? "text-gray-900" : "text-white"}`}>Settings</h2>
                  <p className="text-[11px] text-gray-500 mt-0.5">Customize your workspace</p>
                </div>
                <nav className="flex-1 px-2 space-y-0.5">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${activeTab === tab.id ? tabActive : `border-transparent ${tabInactive}`}`}
                    >
                      {tab.icon}
                      {tab.label}
                      {activeTab === tab.id && <ChevronRight size={11} className="ml-auto" />}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content area */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${isLight ? "border-gray-200" : "border-white/8"}`}>
                  <h3 className={`text-sm font-semibold capitalize ${isLight ? "text-gray-900" : "text-white"}`}>{activeTab}</h3>
                  <div className="flex items-center gap-2">
                    <AnimatePresence>
                      {saved && (
                        <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-1 text-xs text-green-600 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/25">
                          <Check size={11} /> Saved!
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <button
                      onClick={handleSave}
                      style={{ backgroundColor: settings.accentColor }}
                      className="flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition hover:opacity-90"
                    >
                      <Save size={12} /> Save Changes
                    </button>
                    <button onClick={onClose} className={`p-1.5 rounded-lg transition ${isLight ? "text-gray-400 hover:text-gray-700 hover:bg-gray-100" : "text-gray-500 hover:text-white hover:bg-white/10"}`}>
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Tab body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">

                  {/* ── PROFILE ── */}
                  {activeTab === "profile" && (
                    <div className="space-y-5">
                      <div className={`flex items-center gap-4 p-4 rounded-xl border ${isLight ? "bg-gray-50 border-gray-200" : "bg-white/[0.03] border-white/8"}`}>
                        <div style={{ backgroundColor: settings.accentColor }}
                          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0">
                          {displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${isLight ? "text-gray-900" : "text-white"}`}>{displayName || "Your Name"}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                          <button className="mt-2 flex items-center gap-1.5 text-xs hover:opacity-80 transition" style={{ color: settings.accentColor }}>
                            <Upload size={11} /> Upload photo
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Display Name</label>
                          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 transition ${inputCls}`} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
                          <input value={user?.email || ""} readOnly className={`w-full border rounded-xl px-4 py-2.5 text-sm cursor-not-allowed opacity-60 ${inputCls}`} />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Lock size={11} /> Change Password</h4>
                        <div className="space-y-3">
                          {[{ val: currentPassword, set: setCurrentPassword, show: showCurrentPwd, toggleShow: () => setShowCurrentPwd(!showCurrentPwd), placeholder: "Current password" },
                            { val: newPassword, set: setNewPassword, show: showNewPwd, toggleShow: () => setShowNewPwd(!showNewPwd), placeholder: "New password" }
                          ].map((f, i) => (
                            <div key={i} className="relative">
                              <input type={f.show ? "text" : "password"} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                                className={`w-full border rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-1 transition ${inputCls}`} />
                              <button onClick={f.toggleShow} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                                {f.show ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl border border-red-400/30 bg-red-500/5">
                        <h4 className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1.5">Danger Zone</h4>
                        <p className="text-xs text-gray-500 mb-3">Permanently delete your account and all notes. This cannot be undone.</p>
                        <button className="flex items-center gap-2 text-xs font-semibold text-red-500 border border-red-400/30 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition">
                          <Trash2 size={11} /> Delete Account
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── APPEARANCE ── */}
                  {activeTab === "appearance" && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Theme</label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { id: "dark", label: "Dark", icon: <Moon size={14} />, preview: "bg-[#09090b]" },
                            { id: "darker", label: "Darker", icon: <Moon size={14} className="opacity-60" />, preview: "bg-[#050507]" },
                            { id: "midnight", label: "Midnight", icon: <Monitor size={14} />, preview: "bg-[#030308]" },
                            { id: "light", label: "Light", icon: <Sun size={14} />, preview: "bg-white" },
                          ].map((t) => (
                            <button
                              key={t.id}
                              onClick={() => set("theme", t.id as Settings["theme"])}
                              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                                settings.theme === t.id
                                  ? "border-2 text-violet-600"
                                  : `${isLight ? "border-gray-200 text-gray-400 hover:border-gray-300" : "border-white/10 text-gray-400 hover:border-white/20"}`
                              }`}
                              style={settings.theme === t.id ? { borderColor: settings.accentColor, color: settings.accentColor } : {}}
                            >
                              <div className={`w-10 h-8 rounded-lg ${t.preview} border ${isLight ? "border-gray-300" : "border-white/20"} flex items-center justify-center`}>{t.icon}</div>
                              <span className="text-[11px] font-medium">{t.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Accent Color</label>
                        <div className="flex items-center gap-3 flex-wrap">
                          {ACCENT_COLORS.map((c) => (
                            <button
                              key={c}
                              onClick={() => set("accentColor", c)}
                              style={{ backgroundColor: c }}
                              className={`w-7 h-7 rounded-full transition-all ${settings.accentColor === c ? "ring-2 ring-offset-2 scale-110" : "hover:scale-105"}`}
                            />
                          ))}
                          <div className="relative">
                            <input
                              type="color"
                              value={settings.accentColor}
                              onChange={(e) => set("accentColor", e.target.value)}
                              className="w-7 h-7 rounded-full cursor-pointer border-none bg-transparent opacity-0 absolute inset-0"
                            />
                            <div
                              className="w-7 h-7 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center"
                              style={{ borderColor: settings.accentColor }}
                            >
                              <span className="text-[8px] text-gray-400">+</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-gray-500">Current: </span>
                          <span className="text-xs font-mono" style={{ color: settings.accentColor }}>{settings.accentColor}</span>
                        </div>
                      </div>

                      <div>
                        <label className={`block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2`}>Font Size: {settings.fontSize}px</label>
                        <input type="range" min={12} max={22} value={settings.fontSize}
                          onChange={(e) => set("fontSize", Number(e.target.value))}
                          style={{ accentColor: settings.accentColor }}
                          className="w-full"
                        />
                        <div className="flex justify-between text-[10px] text-gray-500 mt-1"><span>12px</span><span>22px</span></div>
                      </div>

                      <div>
                        <Toggle sKey="reducedMotion" label="Reduce Motion" description="Minimize animations across the interface" />
                        <Toggle sKey="compactSidebar" label="Compact Sidebar" description="Use smaller spacing in the left panel" />
                      </div>
                    </div>
                  )}

                  {/* ── EDITOR ── */}
                  {activeTab === "editor" && (
                    <div className="space-y-1">
                      <Toggle sKey="autoSave" label="Auto-Save" description="Automatically save changes as you type" />
                      {settings.autoSave && (
                        <div className={`py-3 border-b ${isLight ? "border-gray-200" : "border-white/5"}`}>
                          <label className="text-xs text-gray-400 mb-2 block">Auto-save delay: {settings.autoSaveInterval}ms</label>
                          <input type="range" min={500} max={5000} step={250} value={settings.autoSaveInterval}
                            onChange={(e) => set("autoSaveInterval", Number(e.target.value))}
                            style={{ accentColor: settings.accentColor }}
                            className="w-full"
                          />
                          <div className="flex justify-between text-[10px] text-gray-500 mt-1"><span>Fast (500ms)</span><span>Slow (5s)</span></div>
                        </div>
                      )}
                      <Toggle sKey="spellCheck" label="Spell Check" description="Underline misspelled words in the editor" />
                      <Toggle sKey="showWordCount" label="Show Word Count" description="Display word and character count at the bottom of notes" />
                      <Toggle sKey="focusMode" label="Focus Mode" description="Hide sidebar and panels for distraction-free writing" />
                      <div className={`py-3 border-b ${isLight ? "border-gray-200" : "border-white/5"}`}>
                        <p className={`text-sm font-medium mb-2 ${isLight ? "text-gray-800" : "text-gray-200"}`}>Line Spacing</p>
                        <div className="flex gap-2">
                          {(["normal", "relaxed", "loose"] as const).map((v) => (
                            <button key={v} onClick={() => set("lineHeight", v)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${settings.lineHeight === v ? "" : isLight ? "border-gray-200 text-gray-400 hover:border-gray-300" : "border-white/10 text-gray-400 hover:border-white/20"}`}
                              style={settings.lineHeight === v ? { borderColor: settings.accentColor, color: settings.accentColor, backgroundColor: `${settings.accentColor}18` } : {}}
                            >{v}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── NOTIFICATIONS ── */}
                  {activeTab === "notifications" && (
                    <div className="space-y-1">
                      <Toggle sKey="notifCollaboration" label="Collaboration Alerts" description="Notify when someone joins a note you own" />
                      <Toggle sKey="notifComments" label="New Comments" description="Notify when someone comments on your notes" />
                      <Toggle sKey="notifSounds" label="Sound Effects" description="Play a subtle sound on key actions" />
                      <Toggle sKey="notifEmail" label="Email Digest" description="Receive a weekly summary of activity (coming soon)" />
                    </div>
                  )}

                  {/* ── PRIVACY ── */}
                  {activeTab === "privacy" && (
                    <div className="space-y-1">
                      <Toggle sKey="profileVisible" label="Public Profile" description="Allow others in your workspace to see your profile" />
                      <Toggle sKey="showOnlineStatus" label="Show Online Status" description="Show a green dot when you are active" />
                      <div className="pt-5">
                        <div className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs ${isLight ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-blue-500/5 border-blue-500/15 text-gray-400"}`}>
                          <Info size={13} className="text-blue-400 shrink-0 mt-0.5" />
                          <span>Your data is stored locally and on your own MongoDB instance. LiveNote does not send any of your notes to external servers.</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── SHORTCUTS ── */}
                  {activeTab === "shortcuts" && (
                    <div className="grid grid-cols-2 gap-0.5">
                      {SHORTCUTS.map((s) => (
                        <div key={s.key} className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition ${isLight ? "hover:bg-gray-50" : "hover:bg-white/3"}`}>
                          <span className={`text-xs ${isLight ? "text-gray-600" : "text-gray-400"}`}>{s.desc}</span>
                          <kbd className={`text-[10px] font-mono px-2 py-0.5 rounded-md shrink-0 ml-2 whitespace-nowrap ${isLight ? "bg-gray-100 border border-gray-300 text-gray-700" : "bg-white/8 border border-white/15 text-gray-300"}`}>{s.key}</kbd>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
