"use client";

import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Sparkles, MessageSquare, X, Send, Loader2, User, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
}

interface Comment {
  _id: string;
  note_id: string;
  user_id: {
    _id: string;
    name: string;
    avatar: string;
  };
  comment: string;
  createdAt: string;
}

type Tab = 'ai' | 'comments';

export default function RightPanel() {
  const isRightPanelOpen = useAppStore((state) => state.isRightPanelOpen);
  const toggleRightPanel = useAppStore((state) => state.toggleRightPanel);
  const activeNoteId = useAppStore((state) => state.activeNoteId);
  const user = useAppStore((state) => state.user);
  
  const [activeTab, setActiveTab] = useState<Tab>('ai');
  
  // AI Assistant State
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'intro',
    role: 'ai',
    content: "Hello! I'm your AI assistant. I can summarize this note, extract action items, or answer questions. Let's make this note amazing! ✨"
  }]);
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Comments State
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch comments when tab is switched to comments or note changes
  useEffect(() => {
    if (activeTab === 'comments' && activeNoteId && user?.token) {
      fetchComments();
    }
  }, [activeTab, activeNoteId, user?.token]);

  // Scroll to bottom helper
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, comments, activeTab]);

  const fetchComments = async () => {
    setIsCommentsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/comments/${activeNoteId}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setComments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCommentsLoading(false);
    }
  };

  const handleAISubmit = async (endpoint: string, bodyData: any, userPrompt?: string) => {
    if (!user?.token) return;
    
    if (userPrompt) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userPrompt }]);
    }
    
    setIsAiLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/ai/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: data.result || data.message }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: "Sorry, I ran into an error connecting to the server." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSendAiMessage = () => {
    if (!aiInput.trim() || isAiLoading) return;
    handleAISubmit('chat', { message: aiInput }, aiInput);
    setAiInput("");
  };

  const handlePostComment = async () => {
    if (!commentInput.trim() || !activeNoteId || !user?.token || isCommentsLoading) return;
    
    setIsCommentsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ noteId: activeNoteId, text: commentInput })
      });
      const newComment = await res.json();
      setComments(prev => [...prev, newComment]);
      setCommentInput("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsCommentsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user?.token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        setComments(prev => prev.filter(c => c._id !== commentId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AnimatePresence initial={false}>
      {isRightPanelOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "anticipate" }}
          className="h-full flex-shrink-0 glass-panel border-l border-[#27272a] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-20 overflow-hidden"
        >
          <div className="flex flex-col h-full w-[320px]">
            
            {/* Header Tabs */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
              <div className="flex space-x-6">
                <button 
                  onClick={() => setActiveTab('ai')}
                  className={`text-sm font-semibold flex items-center space-x-1.5 transition-all duration-200 ${activeTab === 'ai' ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <Sparkles size={16} className={activeTab === 'ai' ? 'text-purple-400' : 'text-gray-500'} />
                  <span>AI</span>
                </button>
                <button 
                  onClick={() => setActiveTab('comments')}
                  className={`text-sm font-semibold flex items-center space-x-1.5 transition-all duration-200 ${activeTab === 'comments' ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <MessageSquare size={16} className={activeTab === 'comments' ? 'text-purple-400' : 'text-gray-500'} />
                  <span>Comments</span>
                  {comments.length > 0 && (
                    <span className="bg-purple-500/20 text-purple-400 text-[10px] px-1.5 rounded-full border border-purple-500/30">
                        {comments.length}
                    </span>
                  )}
                </button>
              </div>
              <button 
                onClick={toggleRightPanel}
                className="text-gray-400 hover:text-white transition p-1 hover:bg-white/10 rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" ref={scrollRef}>
              
              <AnimatePresence mode="wait">
                {activeTab === 'ai' ? (
                  <motion.div 
                    key="ai"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-4 flex flex-col h-full"
                  >
                    <div className="flex-1 flex flex-col justify-end space-y-3">
                      {messages.map((msg) => (
                        <div key={msg.id} className={`p-3 rounded-xl text-sm ${msg.role === 'ai' ? 'bg-purple-900/20 border border-purple-500/30 text-purple-200' : 'bg-white/10 text-gray-200 self-end ml-8'}`}>
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                      ))}
                      
                      {isAiLoading && (
                        <div className="p-3 rounded-xl bg-purple-900/10 border border-purple-500/20 text-sm self-start flex items-center space-x-2">
                          <Loader2 size={14} className="text-purple-400 animate-spin" />
                          <span className="text-purple-300">AI is thinking...</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5 shrink-0">
                      <button 
                        onClick={() => handleAISubmit('summarize', { noteId: activeNoteId })}
                        disabled={isAiLoading || !activeNoteId}
                        className="bg-white/5 hover:bg-purple-500/20 text-[10px] uppercase font-bold tracking-wider py-2 px-3 rounded-lg border border-white/5 hover:border-purple-500/50 transition disabled:opacity-50"
                      >
                        Summarize
                      </button>
                      <button 
                        onClick={() => handleAISubmit('action-items', { noteId: activeNoteId })}
                        disabled={isAiLoading || !activeNoteId}
                        className="bg-white/5 hover:bg-pink-500/20 text-[10px] uppercase font-bold tracking-wider py-2 px-3 rounded-lg border border-white/5 hover:border-pink-500/50 transition disabled:opacity-50"
                      >
                        Actions
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="comments"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4 flex flex-col h-full"
                  >
                    {!activeNoteId ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                            <MessageSquare size={40} className="text-gray-700" />
                            <p className="text-sm text-gray-500 italic">Select a note to view and add comments.</p>
                        </div>
                    ) : isCommentsLoading && comments.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 size={24} className="text-purple-500 animate-spin" />
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-600">
                                <MessageSquare size={20} />
                            </div>
                            <p className="text-sm text-gray-500">No comments yet. Start the conversation!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {comments.map((c) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={c._id} 
                                    className="group relative bg-white/5 rounded-xl p-3 border border-white/5 hover:border-white/10 transition"
                                >
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px] font-bold text-purple-400 border border-purple-500/30 overflow-hidden">
                                            {c.user_id.avatar ? <img src={c.user_id.avatar} alt="" className="w-full h-full object-cover" /> : <User size={12} />}
                                        </div>
                                        <span className="text-[11px] font-semibold text-gray-300">{c.user_id.name}</span>
                                        <span className="text-[9px] text-gray-600 ml-auto">
                                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 items-start leading-relaxed">{c.comment}</p>
                                    
                                    {user?.id === c.user_id._id && (
                                        <button 
                                            onClick={() => handleDeleteComment(c._id)}
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition p-1 text-red-400/50 hover:text-red-400"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
            </div>

            {/* Bottom Input */}
            <div className="p-4 border-t border-white/10 shrink-0 bg-black/20 backdrop-blur-md">
              <div className="relative">
                <input 
                  type="text" 
                  value={activeTab === 'ai' ? aiInput : commentInput}
                  onChange={(e) => activeTab === 'ai' ? setAiInput(e.target.value) : setCommentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        activeTab === 'ai' ? handleSendAiMessage() : handlePostComment();
                    }
                  }}
                  placeholder={activeTab === 'ai' ? "Ask AI anything..." : "Write a comment..."} 
                  disabled={activeTab === 'ai' ? isAiLoading : isCommentsLoading}
                  className="w-full bg-black/40 border border-[#27272a] rounded-xl py-2 pl-3 pr-10 text-sm focus:outline-none focus:border-purple-500 transition shadow-inner disabled:opacity-50 placeholder:text-gray-600"
                />
                <button 
                  onClick={activeTab === 'ai' ? handleSendAiMessage : handlePostComment}
                  disabled={activeTab === 'ai' ? (isAiLoading || !aiInput.trim()) : (isCommentsLoading || !commentInput.trim() || !activeNoteId)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg transition shadow-[0_0_10px_rgba(176,38,255,0.4)] disabled:opacity-50 disabled:shadow-none"
                >
                    {(isAiLoading || isCommentsLoading) ? <Loader2 size={14} className="text-white animate-spin" /> : <Send size={14} className="text-white" />}
                </button>
              </div>
            </div>

          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
