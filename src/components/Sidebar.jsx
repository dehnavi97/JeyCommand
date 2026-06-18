import React from "react";
import { Code2, Pin, Heart, Folder, Settings, Download, Upload, Sparkles } from "lucide-react";

export default function Sidebar({
  view,
  setView,
  selectedCategory,
  setSelectedCategory,
  categories,
  counts,
  t,
  onExport,
  onImport,
}) {
  const navItems = [
    { id: "all", label: t.all_snippets, icon: Code2, count: counts.total, testId: "nav-all" },
    { id: "pinned", label: t.pinned, icon: Pin, count: counts.pinned, testId: "nav-pinned" },
    { id: "favorites", label: t.favorites, icon: Heart, count: counts.favorites, testId: "nav-favorites" },
  ];

  return (
    <aside
      data-testid="sidebar"
      className="w-64 h-[calc(100vh-4rem-1.5rem)] my-3 ms-3 flex-shrink-0 flex flex-col gap-4 p-4 rounded-3xl bg-white/30 backdrop-blur-[30px] border border-white/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
    >
      {/* Brand */}
      <div className="flex items-center gap-2 px-2 py-1">
        <div className="w-8 h-8 rounded-xl bg-[#2ECC71] flex items-center justify-center shadow-[0_0_16px_rgba(46,204,113,0.4)]">
          <Sparkles size={16} className="text-white" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-base font-bold font-['Cabinet_Grotesk',sans-serif] text-[#1A1A24]">JeyCommand</span>
          <span className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#1A1A24]/40">snippet vault</span>
        </div>
      </div>

      {/* Main nav */}
      <div className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = view === item.id;
          return (
            <button
              key={item.id}
              data-testid={item.testId}
              onClick={() => {
                setView(item.id);
                setSelectedCategory(null);
              }}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all relative ${
                isActive
                  ? "bg-white/80 text-[#1A1A24] shadow-sm border border-white"
                  : "text-[#1A1A24]/70 hover:bg-white/60 hover:text-[#1A1A24] border border-transparent"
              }`}
            >
              {isActive && (
                <span className="absolute start-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-[#2ECC71] rounded-e-full shadow-[0_0_8px_rgba(46,204,113,0.6)]" />
              )}
              <Icon size={16} className={isActive ? "text-[#2ECC71]" : ""} />
              <span className="flex-1 text-start">{item.label}</span>
              <span className="text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded-md bg-white/60 text-[#1A1A24]/60 border border-white/80">
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-1 flex-1 min-h-0">
        <div className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#1A1A24]/50 px-3 mt-2 mb-1 flex items-center gap-2">
          <Folder size={10} />
          {t.categories}
        </div>
        <div className="flex flex-col gap-0.5 overflow-y-auto custom-scrollbar pe-1">
          {categories.map((cat) => {
            const isActive = view === "category" && selectedCategory === cat;
            return (
              <button
                key={cat}
                data-testid={`category-${cat.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                onClick={() => {
                  setView("category");
                  setSelectedCategory(cat);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-white/80 text-[#1A1A24] shadow-sm border border-white font-semibold"
                    : "text-[#1A1A24]/65 hover:bg-white/50 hover:text-[#1A1A24] border border-transparent"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#2ECC71]" : "bg-[#1A1A24]/20"}`} />
                <span className="flex-1 text-start truncate">{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex flex-col gap-1.5 pt-3 border-t border-white/50">
        <button
          data-testid="export-btn"
          onClick={onExport}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#1A1A24]/70 hover:bg-white/60 hover:text-[#1A1A24] transition-all"
        >
          <Download size={14} />
          {t.export}
        </button>
        <label
          data-testid="import-btn"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#1A1A24]/70 hover:bg-white/60 hover:text-[#1A1A24] transition-all cursor-pointer"
        >
          <Upload size={14} />
          {t.import}
          <input type="file" accept="application/json" className="hidden" onChange={onImport} data-testid="import-file-input" />
        </label>
      </div>
    </aside>
  );
}