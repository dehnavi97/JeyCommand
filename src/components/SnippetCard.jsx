import React from "react";
import { Pin, Heart, Edit, Trash2, Layers, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function SnippetCard({ snippet, onOpen, onPin, onFavorite, onEdit, onDelete, t }) {
  const [copied, setCopied] = useState(false);
  const stepsCount = snippet.steps?.length || 0;

  const copyAll = async (e) => {
    e.stopPropagation();
    const text = (snippet.steps || [])
      .map((s, i) => {
        const header = s.title ? `# ${s.title}` : `# Step ${i + 1}`;
        return `${header}\n${s.code || ""}`;
      })
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div
      data-testid={`snippet-card-${snippet.id}`}
      onClick={() => onOpen(snippet)}
      className="group relative flex flex-col gap-4 p-5 bg-white/50 backdrop-blur-xl border border-white/50 shadow-sm rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:bg-white/75 hover:border-white/90 cursor-pointer animate-fadeInUp"
    >
      {/* Pin glow indicator */}
      {snippet.pinned && (
        <div className="absolute top-3 end-3 text-[#2ECC71] drop-shadow-[0_0_8px_rgba(46,204,113,0.6)]" data-testid={`pin-indicator-${snippet.id}`}>
          <Pin size={14} className="fill-current" />
        </div>
      )}

      <div className="flex items-start justify-between pe-6">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold font-['Cabinet_Grotesk',sans-serif] text-[#1A1A24] tracking-tight line-clamp-2 leading-snug">
            {snippet.title || t.untitled_step}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#1A1A24]/50 font-medium">
            <Layers size={11} />
            <span>{stepsCount} {stepsCount === 1 ? "step" : "steps"}</span>
          </div>
        </div>
      </div>

      {/* Tags + category */}
      <div className="flex flex-wrap gap-1.5 mt-auto">
        <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-md bg-[#2ECC71]/10 border border-[#2ECC71]/30 text-[#2ECC71]">
          {snippet.category}
        </span>
        {(snippet.tags || []).slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-md bg-white/70 border border-white/90 text-[#1A1A24]/60"
          >
            {tag}
          </span>
        ))}
        {(snippet.tags || []).length > 4 && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-white/70 border border-white/90 text-[#1A1A24]/40">
            +{snippet.tags.length - 4}
          </span>
        )}
      </div>

      {/* Hover actions */}
      <div className="flex items-center gap-1.5 pt-3 border-t border-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          data-testid={`card-copy-all-${snippet.id}`}
          onClick={copyAll}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
            copied
              ? "bg-[#2ECC71] text-white shadow-[0_0_12px_rgba(46,204,113,0.4)]"
              : "bg-white/70 hover:bg-white text-[#1A1A24]/70 border border-white"
          }`}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? t.copied : t.copy_all}
        </button>
        <div className="flex-1" />
        <button
          data-testid={`card-pin-${snippet.id}`}
          onClick={(e) => { e.stopPropagation(); onPin(snippet); }}
          title={snippet.pinned ? t.unpin : t.pin}
          className="p-1.5 rounded-lg hover:bg-white/80 text-[#1A1A24]/50 hover:text-[#2ECC71] transition-colors"
        >
          <Pin size={13} className={snippet.pinned ? "fill-current text-[#2ECC71]" : ""} />
        </button>
        <button
          data-testid={`card-favorite-${snippet.id}`}
          onClick={(e) => { e.stopPropagation(); onFavorite(snippet); }}
          title={snippet.favorite ? t.unfavorite : t.favorite}
          className="p-1.5 rounded-lg hover:bg-white/80 text-[#1A1A24]/50 hover:text-rose-500 transition-colors"
        >
          <Heart size={13} className={snippet.favorite ? "fill-current text-rose-500" : ""} />
        </button>
        <button
          data-testid={`card-edit-${snippet.id}`}
          onClick={(e) => { e.stopPropagation(); onEdit(snippet); }}
          title={t.edit}
          className="p-1.5 rounded-lg hover:bg-white/80 text-[#1A1A24]/50 hover:text-[#1A1A24] transition-colors"
        >
          <Edit size={13} />
        </button>
        <button
          data-testid={`card-delete-${snippet.id}`}
          onClick={(e) => { e.stopPropagation(); onDelete(snippet); }}
          title={t.delete}
          className="p-1.5 rounded-lg hover:bg-rose-50 text-[#1A1A24]/50 hover:text-rose-500 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}