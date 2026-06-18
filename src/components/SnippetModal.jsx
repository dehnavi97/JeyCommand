import React, { useEffect, useState, useMemo } from "react";
import { X, Plus, Trash2, Save, Copy, Check, Eye, Edit3, Pin, Heart } from "lucide-react";
import CodeBlock from "./CodeBlock";
import { detectLanguage, CATEGORIES } from "../utils/langDetect";

const emptyStep = () => ({
  id: crypto.randomUUID(),
  title: "",
  code: "",
  explanation: "",
  language: "plaintext",
});

const emptySnippet = () => ({
  title: "",
  category: "Bash",
  tags: [],
  steps: [emptyStep()],
  pinned: false,
  favorite: false,
});

export default function SnippetModal({ snippet, mode, onClose, onSave, onDelete, onPin, onFavorite, t }) {
  const [editing, setEditing] = useState(mode === "edit" || mode === "create");
  const [draft, setDraft] = useState(() => snippet ? { ...snippet, steps: snippet.steps?.length ? snippet.steps : [emptyStep()] } : emptySnippet());
  const [tagInput, setTagInput] = useState("");
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    if (snippet) {
      setDraft({ ...snippet, steps: snippet.steps?.length ? snippet.steps : [emptyStep()] });
    } else {
      setDraft(emptySnippet());
    }
    setEditing(mode === "edit" || mode === "create");
  }, [snippet, mode]);

  // ESC to close
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const updateStep = (idx, patch) => {
    setDraft((d) => {
      const steps = [...d.steps];
      steps[idx] = { ...steps[idx], ...patch };
      // auto-detect language on code change
      if (patch.code !== undefined) {
        steps[idx].language = detectLanguage(patch.code);
      }
      return { ...d, steps };
    });
  };

  const addStep = () => setDraft((d) => ({ ...d, steps: [...d.steps, emptyStep()] }));
  const removeStep = (idx) =>
    setDraft((d) => ({ ...d, steps: d.steps.length > 1 ? d.steps.filter((_, i) => i !== idx) : d.steps }));

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag) return;
    if (draft.tags.includes(tag)) {
      setTagInput("");
      return;
    }
    setDraft((d) => ({ ...d, tags: [...d.tags, tag] }));
    setTagInput("");
  };

  const removeTag = (tag) => setDraft((d) => ({ ...d, tags: d.tags.filter((t) => t !== tag) }));

  const handleSave = () => {
    if (!draft.title.trim()) return;
    onSave(draft);
  };

  const handleCopyAll = async () => {
    const text = (draft.steps || [])
      .map((s, i) => {
        const header = s.title ? `# ${s.title}` : `# Step ${i + 1}`;
        return `${header}\n${s.code || ""}`;
      })
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1800);
    } catch {}
  };

  const isCreate = mode === "create";

  return (
    <div
      data-testid="snippet-modal-overlay"
      onClick={onClose}
      className="fixed inset-0 bg-[#1A1A24]/10 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fadeInUp"
    >
      <div
        data-testid="snippet-modal"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl h-[88vh] overflow-hidden bg-white/70 backdrop-blur-[40px] border border-white/70 rounded-[2rem] shadow-2xl flex flex-col relative"
      >
        {/* Header */}
        <div className="px-8 py-5 border-b border-white/40 flex justify-between items-center bg-white/30 flex-shrink-0">
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                data-testid="modal-title-input"
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder={t.title}
                className="w-full text-2xl font-bold font-['Cabinet_Grotesk',sans-serif] bg-transparent border-none outline-none focus:ring-2 focus:ring-[#2ECC71]/40 rounded-lg px-2 -mx-2 text-[#1A1A24] placeholder:text-[#1A1A24]/30"
              />
            ) : (
              <h2 data-testid="modal-title" className="text-2xl font-bold font-['Cabinet_Grotesk',sans-serif] text-[#1A1A24] truncate">
                {draft.title || t.untitled_step}
              </h2>
            )}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {editing ? (
                <select
                  data-testid="modal-category-select"
                  value={draft.category}
                  onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                  className="text-[11px] font-bold tracking-wider uppercase px-2 py-1 rounded-md bg-[#2ECC71]/10 border border-[#2ECC71]/30 text-[#2ECC71] outline-none focus:ring-2 focus:ring-[#2ECC71]/40"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-md bg-[#2ECC71]/10 border border-[#2ECC71]/30 text-[#2ECC71]">
                  {draft.category}
                </span>
              )}
              {draft.tags.map((tag) => (
                <span key={tag} className="text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-md bg-white/70 border border-white/90 text-[#1A1A24]/60 flex items-center gap-1">
                  {tag}
                  {editing && (
                    <button onClick={() => removeTag(tag)} className="hover:text-rose-500" data-testid={`remove-tag-${tag}`}>
                      <X size={10} />
                    </button>
                  )}
                </span>
              ))}
              {editing && (
                <div className="flex items-center gap-1">
                  <input
                    data-testid="tag-input"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    placeholder={t.add_tag}
                    className="text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-md bg-white/40 border border-white/60 text-[#1A1A24]/70 outline-none focus:ring-2 focus:ring-[#2ECC71]/40 w-24"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ms-4 flex-shrink-0">
            {!editing && !isCreate && (
              <>
                <button
                  data-testid="modal-pin-btn"
                  onClick={() => onPin(draft)}
                  title={draft.pinned ? t.unpin : t.pin}
                  className="p-2 rounded-lg bg-white/40 hover:bg-white/80 border border-transparent hover:border-white text-[#1A1A24]/60 hover:text-[#2ECC71] transition-all"
                >
                  <Pin size={16} className={draft.pinned ? "fill-current text-[#2ECC71]" : ""} />
                </button>
                <button
                  data-testid="modal-favorite-btn"
                  onClick={() => onFavorite(draft)}
                  title={draft.favorite ? t.unfavorite : t.favorite}
                  className="p-2 rounded-lg bg-white/40 hover:bg-white/80 border border-transparent hover:border-white text-[#1A1A24]/60 hover:text-rose-500 transition-all"
                >
                  <Heart size={16} className={draft.favorite ? "fill-current text-rose-500" : ""} />
                </button>
                <button
                  data-testid="modal-edit-btn"
                  onClick={() => setEditing(true)}
                  className="p-2 rounded-lg bg-white/40 hover:bg-white/80 border border-transparent hover:border-white text-[#1A1A24]/60 hover:text-[#1A1A24] transition-all"
                  title={t.edit}
                >
                  <Edit3 size={16} />
                </button>
              </>
            )}
            <button
              data-testid="modal-copy-all-btn"
              onClick={handleCopyAll}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold tracking-wide transition-all text-sm ${
                copiedAll
                  ? "bg-[#2ECC71] text-white shadow-[0_0_16px_rgba(46,204,113,0.5)]"
                  : "bg-[#2ECC71] hover:bg-[#27ae60] text-white shadow-[0_4px_14px_rgba(46,204,113,0.3)] hover:-translate-y-0.5"
              }`}
            >
              {copiedAll ? <Check size={14} /> : <Copy size={14} />}
              {copiedAll ? t.copied : t.copy_all}
            </button>
            <button
              data-testid="modal-close-btn"
              onClick={onClose}
              className="p-2 rounded-lg bg-white/40 hover:bg-white/80 border border-transparent hover:border-white text-[#1A1A24]/60 hover:text-[#1A1A24] transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto flex-1 flex flex-col gap-6 custom-scrollbar">
          <div className="relative flex flex-col gap-5">
            {draft.steps.map((step, idx) => (
              <div
                key={step.id}
                data-testid={`step-${idx}`}
                className="bg-white/60 border border-white/70 rounded-2xl p-6 ms-12 relative shadow-sm"
              >
                <div className="absolute -start-12 top-5 w-9 h-9 rounded-full bg-white border-2 border-[#2ECC71] flex items-center justify-center text-[#2ECC71] font-bold text-sm shadow-[0_0_12px_rgba(46,204,113,0.3)]">
                  {idx + 1}
                </div>

                <div className="flex items-start justify-between gap-3 mb-3">
                  {editing ? (
                    <input
                      data-testid={`step-${idx}-title-input`}
                      value={step.title}
                      onChange={(e) => updateStep(idx, { title: e.target.value })}
                      placeholder={t.step_title}
                      className="flex-1 text-lg font-bold font-['Cabinet_Grotesk',sans-serif] bg-transparent border-none outline-none focus:ring-2 focus:ring-[#2ECC71]/40 rounded-lg px-2 -mx-2 text-[#1A1A24] placeholder:text-[#1A1A24]/30"
                    />
                  ) : (
                    <h3 className="flex-1 text-lg font-bold font-['Cabinet_Grotesk',sans-serif] text-[#1A1A24]">
                      {step.title || `${t.step} ${idx + 1}`}
                    </h3>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-md bg-white/80 border border-white text-[#1A1A24]/50">
                      {step.language || "plaintext"}
                    </span>
                    {editing && draft.steps.length > 1 && (
                      <button
                        data-testid={`step-${idx}-remove-btn`}
                        onClick={() => removeStep(idx)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-[#1A1A24]/40 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {editing ? (
                  <textarea
                    data-testid={`step-${idx}-code-input`}
                    value={step.code}
                    onChange={(e) => updateStep(idx, { code: e.target.value })}
                    placeholder={t.code}
                    rows={Math.max(4, Math.min(20, (step.code || "").split("\n").length + 1))}
                    className="w-full font-['JetBrains_Mono',monospace] text-sm bg-white/70 border border-white rounded-xl p-4 outline-none focus:ring-2 focus:ring-[#2ECC71]/40 resize-y text-[#1A1A24]"
                    dir="ltr"
                  />
                ) : (
                  <CodeBlock code={step.code} language={step.language} testId={`step-${idx}-code`} />
                )}

                {editing ? (
                  <textarea
                    data-testid={`step-${idx}-explanation-input`}
                    value={step.explanation}
                    onChange={(e) => updateStep(idx, { explanation: e.target.value })}
                    placeholder={t.explanation}
                    rows={2}
                    className="mt-3 w-full text-sm bg-white/40 border border-white/60 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#2ECC71]/40 text-[#1A1A24]/80 placeholder:text-[#1A1A24]/30"
                  />
                ) : (
                  step.explanation && (
                    <p data-testid={`step-${idx}-explanation`} className="mt-3 text-sm text-[#1A1A24]/70 leading-relaxed">
                      {step.explanation}
                    </p>
                  )
                )}
              </div>
            ))}

            {editing && (
              <button
                data-testid="add-step-btn"
                onClick={addStep}
                className="ms-12 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-[#2ECC71]/40 text-[#2ECC71] font-bold text-sm hover:bg-[#2ECC71]/5 hover:border-[#2ECC71]/70 transition-all"
              >
                <Plus size={16} />
                {t.add_step}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        {editing && (
          <div className="px-8 py-4 border-t border-white/40 bg-white/30 flex justify-between items-center flex-shrink-0">
            <div>
              {!isCreate && (
                <button
                  data-testid="modal-delete-btn"
                  onClick={() => {
                    if (window.confirm(t.confirm_delete)) onDelete(draft);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all"
                >
                  <Trash2 size={14} />
                  {t.delete}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                data-testid="modal-cancel-btn"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white/80 hover:bg-white text-[#1A1A24] border border-white transition-all"
              >
                {t.cancel}
              </button>
              <button
                data-testid="modal-save-btn"
                onClick={handleSave}
                disabled={!draft.title.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-[#2ECC71] hover:bg-[#27ae60] text-white shadow-[0_4px_14px_rgba(46,204,113,0.3)] transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                <Save size={14} />
                {t.save}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}