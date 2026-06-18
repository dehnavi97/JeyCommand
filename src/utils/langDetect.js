// Lightweight offline language detection using regex heuristics.
// Returns one of: bash, python, javascript, typescript, sql, json, yaml, html, css, go, rust, ruby, php, java, csharp, powershell, dockerfile, plaintext

const RULES = [
  { lang: "dockerfile", patterns: [/^\s*FROM\s+\S+/m, /^\s*RUN\s+/m, /^\s*COPY\s+/m] },
  { lang: "yaml", patterns: [/^\s*[\w-]+:\s*$/m, /^---\s*$/m] },
  { lang: "json", patterns: [/^\s*[\{\[]/, /"[\w-]+"\s*:/] },
  { lang: "sql", patterns: [/\bSELECT\b.*\bFROM\b/i, /\bINSERT\s+INTO\b/i, /\bUPDATE\b.*\bSET\b/i, /\bCREATE\s+TABLE\b/i] },
  { lang: "html", patterns: [/<!DOCTYPE\s+html/i, /<html[\s>]/i, /<\/?(div|span|p|a|body|head)\b/i] },
  { lang: "css", patterns: [/^[.#]?[\w-]+\s*\{[^}]*:[^}]*\}/m, /@media\s*\(/] },
  { lang: "python", patterns: [/^\s*def\s+\w+\(/m, /^\s*import\s+\w+/m, /^\s*from\s+\w+\s+import/m, /print\(/] },
  { lang: "typescript", patterns: [/:\s*(string|number|boolean|any)\b/, /\binterface\s+\w+/, /\btype\s+\w+\s*=/] },
  { lang: "javascript", patterns: [/\bconst\s+\w+\s*=/, /\blet\s+\w+/, /=>\s*[\{\(]/, /\bconsole\.log\(/, /\bfunction\s+\w+\(/] },
  { lang: "rust", patterns: [/\bfn\s+\w+\(/, /\blet\s+mut\s+/, /\buse\s+std::/, /::<.*>/] },
  { lang: "go", patterns: [/\bpackage\s+\w+/, /\bfunc\s+\w+\(/, /:=/] },
  { lang: "ruby", patterns: [/\bdef\s+\w+/, /\bend\b/, /\bputs\s+/] },
  { lang: "php", patterns: [/<\?php/, /\$\w+\s*=/] },
  { lang: "java", patterns: [/\bpublic\s+class\s+\w+/, /System\.out\.println/] },
  { lang: "csharp", patterns: [/\busing\s+System\b/, /\bConsole\.WriteLine/, /\bnamespace\s+\w+/] },
  { lang: "powershell", patterns: [/\$\w+\s*=/, /\bGet-\w+/, /\bSet-\w+/, /Write-Host/] },
  { lang: "bash", patterns: [/^#!.*\b(bash|sh)\b/m, /\bsudo\s+/, /\b(apt|yum|brew|npm|yarn|pnpm|docker|git|curl|wget|ssh|scp|cd|ls|mkdir|rm|cp|mv|cat|grep|sed|awk|chmod|chown|export)\b/, /\$\{?\w+\}?/, /^\s*\w+=\S+/m] },
];

export function detectLanguage(code) {
  if (!code || !code.trim()) return "plaintext";
  let bestLang = "plaintext";
  let bestScore = 0;
  for (const rule of RULES) {
    let score = 0;
    for (const p of rule.patterns) {
      if (p.test(code)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestLang = rule.lang;
    }
  }
  return bestScore >= 1 ? bestLang : "plaintext";
}

export const CATEGORIES = [
  "Bash",
  "Python",
  "JavaScript",
  "TypeScript",
  "SQL",
  "Git",
  "Docker",
  "PowerShell",
  "Go",
  "Rust",
  "Ruby",
  "PHP",
  "Java",
  "C#",
  "YAML",
  "JSON",
  "HTML/CSS",
  "Other",
];