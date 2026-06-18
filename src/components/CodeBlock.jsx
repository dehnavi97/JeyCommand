import React, { useEffect, useRef, useState } from "react";
import hljs from "highlight.js/lib/common";
import { Copy, Check } from "lucide-react";

export default function CodeBlock({ code, language = "plaintext", onCopy, testId = "code-block" }) {
  const ref = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (ref.current) {
      // Reset previous highlight
      ref.current.removeAttribute("data-highlighted");
      ref.current.textContent = code || "";
      try {
        if (language && language !== "plaintext" && hljs.getLanguage(language)) {
          ref.current.className = `hljs language-${language}`;
          ref.current.innerHTML = hljs.highlight(code || "", { language }).value;
        } else {
          ref.current.className = "hljs";
          ref.current.innerHTML = hljs.highlightAuto(code || "").value;
        }
      } catch (e) {
        ref.current.textContent = code || "";
      }
    }
  }, [code, language]);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code || "");
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // noop
    }
  };

  return (
    <div className="relative group rounded-xl overflow-hidden bg-white/70 border border-white shadow-inner" data-testid={testId}>
      <button
        onClick={handleCopy}
        data-testid={`${testId}-copy-btn`}
        className={`absolute top-2.5 end-2.5 z-10 opacity-0 group-hover:opacity-100 transition-all px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 active:scale-95 border ${
          copied
            ? "bg-[#2ECC71] text-white border-[#2ECC71] shadow-[0_0_12px_rgba(46,204,113,0.5)] opacity-100"
            : "bg-white hover:bg-gray-50 text-[#1A1A24] border-white/80 shadow-sm"
        }`}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="p-4 pe-20 text-sm leading-relaxed overflow-x-auto custom-scrollbar font-['JetBrains_Mono',monospace]">
        <code ref={ref} className="hljs" />
      </pre>
    </div>
  );
}