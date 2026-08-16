"use client";

import React, { useState } from 'react';
import { MessagesSquare, ThumbsUp, Reply, Eye, Clock, Plus, Send, MessageSquareText } from 'lucide-react';
import { RDM_FORUM_THREADS } from '@/lib/rdm/rdm-content';

const categoryColors: Record<string, string> = {
  Gastronomía: 'text-rose-300 border-rose-500/40 bg-rose-950/60',
  Historias: 'text-amber-300 border-amber-500/40 bg-amber-950/60',
  Eventos: 'text-purple-300 border-purple-500/40 bg-purple-950/60',
  Turismo: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/60',
  Fotografía: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/60',
  Comunidad: 'text-violet-300 border-violet-500/40 bg-violet-950/60',
};

export default function ForumSection() {
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [threads, setThreads] = useState(RDM_FORUM_THREADS);
  const [showComposer, setShowComposer] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');

  const handlePost = () => {
    if (!newTitle.trim() || !newBody.trim()) return;
    const newThread = {
      id: `t-${Date.now()}`,
      title: newTitle.trim(),
      author: 'Minerx_NodoCero',
      role: 'Habitante digital',
      category: 'Comunidad',
      replies: 0,
      likes: 0,
      time: 'Ahora mismo',
      excerpt: newBody.trim(),
      pinned: false,
    };
    setThreads([newThread, ...threads]);
    setNewTitle('');
    setNewBody('');
    setShowComposer(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <MessagesSquare className="w-6 h-6 text-cyan-400" />
            Foro de la Comunidad RDM
          </h2>
          <p className="text-xs text-[#93a5ad] font-mono">
            Conversaciones soberanas del Nodo Cero · Moderación comunitaria
          </p>
        </div>
        <button
          onClick={() => setShowComposer(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" />
          Nueva discusión
        </button>
      </div>

      {showComposer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setShowComposer(false)}>
          <div className="w-full max-w-md p-6 glass-panel rounded-2xl border border-cyan-500/40 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <MessageSquareText className="w-5 h-5 text-cyan-400" />
              Nueva discusión
            </h3>
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Título de tu hilo..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-white placeholder:text-[#647a84] focus:outline-none"
            />
            <textarea
              value={newBody}
              onChange={e => setNewBody(e.target.value)}
              placeholder="Cuéntale al Real..."
              rows={4}
              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-white placeholder:text-[#647a84] focus:outline-none resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowComposer(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handlePost}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:scale-105 transition-transform"
              >
                <Send className="w-3.5 h-3.5" />
                Publicar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {threads.map(thread => (
          <div key={thread.id} className={`p-5 rounded-2xl glass-panel border transition-all ${thread.pinned ? 'border-amber-500/30' : 'border-white/10'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-slate-950 font-black text-sm border border-white/10 shrink-0">
                {thread.author.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white">{thread.author}</div>
                <div className="text-[10px] font-mono text-[#647a84] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {thread.role} · {thread.time}
                </div>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-md border ${categoryColors[thread.category] ?? 'text-slate-300 border-slate-700 bg-slate-900/60'}`}>
                {thread.category.toUpperCase()}
              </span>
              {thread.pinned && (
                <span className="text-[10px] font-mono text-amber-400 border border-amber-500/40 px-2 py-1 rounded-md">
                  📌 FIJADO
                </span>
              )}
            </div>

            <h4 className="text-base font-bold text-white leading-snug">{thread.title}</h4>
            <p className="text-sm text-slate-300 leading-relaxed font-light mt-1.5">{thread.excerpt}</p>

            <div className="flex items-center gap-4 pt-3 mt-3 border-t border-white/10 text-[11px] font-mono">
              <button
                onClick={() => setLiked({ ...liked, [thread.id]: !liked[thread.id] })}
                className={`flex items-center gap-1.5 transition-all ${liked[thread.id] ? 'text-cyan-400' : 'text-[#93a5ad] hover:text-white'}`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                {thread.likes + (liked[thread.id] ? 1 : 0)}
              </button>
              <span className="flex items-center gap-1.5 text-[#93a5ad]">
                <Reply className="w-3.5 h-3.5" />
                {thread.replies}
              </span>
              <span className="flex items-center gap-1.5 text-[#647a84]">
                <Eye className="w-3.5 h-3.5" />
                Foro comunitario
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
