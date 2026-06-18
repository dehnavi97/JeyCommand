import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Search, Plus, Sparkles } from "lucide-react";
import { Toaster, toast } from "sonner";
import TitleBar from "./components/TitleBar";
import Sidebar from "./components/Sidebar";
import SnippetCard from "./components/SnippetCard";
import SnippetModal from "./components/SnippetModal";
import { snippetsApi, backupApi } from "./api";
import { getDict } from "./i18n";
import { CATEGORIES } from "./utils/langDetect";
import "./App.css";

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem("jc:lang") || "en");
  const t = getDict(lang);
  const dir = lang === "fa" ? "rtl" : "ltr";

  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("all"); // all | pinned | favorites | category
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [modalSnippet, setModalSnippet] = useState(null);
  const [modalMode, setModalMode] = useState(null); // view | edit | create
  const searchRef = useRef(null);

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    localStorage.setItem("jc:lang", lang);
  }, [lang, dir]);

  const fetchSnippets = useCallback(async () => {
    try {
      const data = await snippetsApi.list();
      setSnippets(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load snippets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

  // Global hotkey: Ctrl/Cmd + Shift + J focuses search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "j") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
      // Ctrl/Cmd + N to create new
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n" && !modalMode) {
        e.preventDefault();
        openCreate();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalMode]);

  const filtered = useMemo(() => {
    let list = [...snippets];
    if (view === "pinned") list = list.filter((s) => s.pinned);
    else if (view === "favorites") list = list.filter((s) => s.favorite);
    else if (view === "category" && selectedCategory) list = list.filter((s) => s.category === selectedCategory);

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((s) => {
        if (s.title?.toLowerCase().includes(q)) return true;
        if (s.category?.toLowerCase().includes(q)) return true;
        if ((s.tags || []).some((t) => t.toLowerCase().includes(q))) return true;
        if ((s.steps || []).some((st) =>
          st.title?.toLowerCase().includes(q) ||
          st.code?.toLowerCase().includes(q) ||
          st.explanation?.toLowerCase().includes(q)
        )) return true;
        return false;
      });
    }
    // Pinned first
    list.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
    });
    return list;
  }, [snippets, search, view, selectedCategory]);

  const counts = useMemo(() => ({
    total: snippets.length,
    pinned: snippets.filter((s) => s.pinned).length,
    favorites: snippets.filter((s) => s.favorite).length,
  }), [snippets]);

  const openView = (snippet) => {
    setModalSnippet(snippet);
    setModalMode("view");
  };
  const openEdit = (snippet) => {
    setModalSnippet(snippet);
    setModalMode("edit");
  };
  const openCreate = () => {
    setModalSnippet(null);
    setModalMode("create");
  };
  const closeModal = () => {
    setModalSnippet(null);
    setModalMode(null);
  };

  const handleSave = async (draft) => {
    try {
      if (modalMode === "create") {
        const created = await snippetsApi.create(draft);
        setSnippets((s) => [created, ...s]);
        toast.success(t.snippet_saved);
      } else {
        const updated = await snippetsApi.update(draft.id, draft);
        setSnippets((s) => s.map((x) => (x.id === updated.id ? updated : x)));
        toast.success(t.snippet_saved);
      }
      closeModal();
    } catch (e) {
      console.error(e);
      toast.error("Save failed");
    }
  };

  const handleDelete = async (snippet) => {
    try {
      await snippetsApi.delete(snippet.id);
      setSnippets((s) => s.filter((x) => x.id !== snippet.id));
      toast.success(t.snippet_deleted);
      closeModal();
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const handlePin = async (snippet) => {
    try {
      const updated = await snippetsApi.togglePin(snippet.id);
      setSnippets((s) => s.map((x) => (x.id === updated.id ? updated : x)));
      if (modalSnippet?.id === updated.id) setModalSnippet(updated);
    } catch (e) {}
  };

  const handleFavorite = async (snippet) => {
    try {
      const updated = await snippetsApi.toggleFavorite(snippet.id);
      setSnippets((s) => s.map((x) => (x.id === updated.id ? updated : x)));
      if (modalSnippet?.id === updated.id) setModalSnippet(updated);
    } catch (e) {}
  };

  const handleCardDelete = async (snippet) => {
    if (window.confirm(t.confirm_delete)) {
      await handleDelete(snippet);
    }
  };

  const handleExport = async () => {
    try {
      const data = await backupApi.export();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jeycommand-backup-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t.backup_exported);
    } catch (e) {
      toast.error("Export failed");
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed) ? parsed : parsed.snippets;
      if (!Array.isArray(list)) {
        toast.error("Invalid backup file");
        return;
      }
      const replace = window.confirm(t.replace_existing + "?");
      await backupApi.import(list, replace);
      await fetchSnippets();
      toast.success(t.backup_imported);
    } catch (err) {
      console.error(err);
      toast.error("Import failed");
    } finally {
      e.target.value = "";
    }
  };

  const viewLabel = useMemo(() => {
    if (view === "pinned") return t.pinned;
    if (view === "favorites") return t.favorites;
    if (view === "category") return selectedCategory;
    return t.all_snippets;
  }, [view, selectedCategory, t]);

  return (
    <div dir={dir} className="App mesh-bg relative overflow-hidden h-screen w-screen flex flex-col">
      {/* Decorative blobs */}
      <div className="blob bg-[#cdeaff] w-[420px] h-[420px] top-[-100px] left-[-100px]" />
      <div className="blob bg-[#ffdce6] w-[360px] h-[360px] bottom-[-120px] right-[-80px]" />
      <div className="blob bg-[#d2ffe1] w-[300px] h-[300px] top-[40%] left-[50%]" />

      <TitleBar lang={lang} setLang={setLang} t={t} />

      <div className="flex flex-1 min-h-0 relative">
        <Sidebar
          view={view}
          setView={setView}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={CATEGORIES}
          counts={counts}
          t={t}
          onExport={handleExport}
          onImport={handleImport}
        />

        <main className="flex-1 flex flex-col min-w-0 p-6 gap-5 overflow-hidden">
          {/* Top bar: search + new */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative flex-1 max-w-2xl">
              <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-4 text-[#1A1A24]/40" />
              <input
                ref={searchRef}
                data-testid="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.search_placeholder}
                className="w-full bg-white/50 border border-white/60 rounded-full ps-11 pe-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ECC71]/50 shadow-sm placeholder:text-[#1A1A24]/40 backdrop-blur-md text-[#1A1A24] transition-all"
              />
              <span className="absolute top-1/2 -translate-y-1/2 end-4 text-[10px] font-bold tracking-wider text-[#1A1A24]/30 hidden md:block">
                ⌘⇧J
              </span>
            </div>
            <button
              data-testid="new-snippet-btn"
              onClick={openCreate}
              className="flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm bg-[#2ECC71] hover:bg-[#27ae60] text-white shadow-[0_4px_14px_rgba(46,204,113,0.35)] transition-all hover:-translate-y-0.5 active:scale-95"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">{t.new_snippet}</span>
            </button>
          </div>

          {/* View header */}
          <div className="flex items-end justify-between flex-shrink-0">
            <div>
              <h1 className="text-3xl font-bold font-['Cabinet_Grotesk',sans-serif] text-[#1A1A24] tracking-tight">
                {viewLabel}
              </h1>
              <p className="text-xs text-[#1A1A24]/50 mt-1 font-medium tracking-wide">
                {filtered.length} {filtered.length === 1 ? "snippet" : "snippets"} · {t.hotkey_hint}
              </p>
            </div>
          </div>

          {/* Snippets grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pe-1 -me-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-44 rounded-2xl bg-white/30 border border-white/40 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div data-testid="empty-state" className="h-full min-h-[400px] flex flex-col items-center justify-center text-center gap-4 p-8">
                <div className="w-16 h-16 rounded-2xl bg-white/60 border border-white flex items-center justify-center shadow-sm">
                  <Sparkles size={28} className="text-[#2ECC71]" />
                </div>
                <h3 className="text-2xl font-bold font-['Cabinet_Grotesk',sans-serif] text-[#1A1A24]">
                  {search ? t.no_results : t.no_snippets}
                </h3>
                <p className="text-sm text-[#1A1A24]/60 max-w-md">
                  {search ? t.try_different : t.no_snippets_hint}
                </p>
                {!search && (
                  <button
                    data-testid="empty-create-btn"
                    onClick={openCreate}
                    className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-[#2ECC71] hover:bg-[#27ae60] text-white shadow-[0_4px_14px_rgba(46,204,113,0.3)] transition-all hover:-translate-y-0.5"
                  >
                    <Plus size={14} />
                    {t.new_snippet}
                  </button>
                )}
              </div>
            ) : (
              <div data-testid="snippets-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
                {filtered.map((s) => (
                  <SnippetCard
                    key={s.id}
                    snippet={s}
                    onOpen={openView}
                    onPin={handlePin}
                    onFavorite={handleFavorite}
                    onEdit={openEdit}
                    onDelete={handleCardDelete}
                    t={t}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {modalMode && (
        <SnippetModal
          snippet={modalSnippet}
          mode={modalMode}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={handleDelete}
          onPin={handlePin}
          onFavorite={handleFavorite}
          t={t}
        />
      )}

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.8)",
            color: "#1A1A24",
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 600,
          },
        }}
      />
    </div>
  );
}