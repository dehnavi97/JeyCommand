import React from "react";
import { Minus, Square, X, Languages } from "lucide-react";

export default function TitleBar({ lang, setLang, t }) {
  const handleMinimize = async () => {
    // Tauri stub: in web preview, just log
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    getCurrentWindow().minimize();
  };
  const handleMaximize = async () => {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    getCurrentWindow().toggleMaximize();
  };
  const handleClose = async () => {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    getCurrentWindow().close();
  };

  return (
    <div
      data-testid="title-bar"
      dir="ltr"
      className="h-12 w-full flex items-center justify-between px-4 z-50 bg-white/30 backdrop-blur-xl border-b border-white/40 shadow-sm select-none relative"
      style={{ WebkitAppRegion: "drag" }}
    >
      {/* Language toggle */}
      <div className="flex items-center gap-2" style={{ WebkitAppRegion: "no-drag" }}>
        <button
          data-testid="lang-toggle-btn"
          onClick={() => setLang(lang === "en" ? "fa" : "en")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/50 hover:bg-white/80 border border-white/60 text-xs font-bold tracking-wide text-[#1A1A24]/70 transition-all"
          title={t.language}
        >
          <Languages size={12} />
          {lang === "en" ? "EN" : "FA"}
        </button>
      </div>

      {/* App title - centered */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 font-['Cabinet_Grotesk',sans-serif]">
        <div className="w-2 h-2 rounded-full bg-[#2ECC71] shadow-[0_0_8px_rgba(46,204,113,0.7)]" />
        <span data-testid="app-title" className="text-xs font-bold tracking-[0.3em] uppercase text-[#1A1A24]/60">
          JeyCommand
        </span>
      </div>

      {/* Window controls (macOS style) */}
      <div className="flex gap-2 items-center" style={{ WebkitAppRegion: "no-drag" }}>
        <button
          data-testid="window-minimize-btn"
          onClick={handleMinimize}
          className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 hover:scale-110 transition-transform"
          aria-label="Minimize"
        />
        <button
          data-testid="window-maximize-btn"
          onClick={handleMaximize}
          className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-500 hover:scale-110 transition-transform"
          aria-label="Maximize"
        />
        <button
          data-testid="window-close-btn"
          onClick={handleClose}
          className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 hover:scale-110 transition-transform"
          aria-label="Close"
        />
      </div>
    </div>
  );
}