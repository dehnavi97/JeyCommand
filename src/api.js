// تابع کمکی برای تولید UUID نسخه 4 مشابه پایتون
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// کلید ذخیره‌سازی در LocalStorage
const STORAGE_KEY = "jeycommand_snippets";

// تابع کمکی برای خواندن کل اسنیپت‌ها از LocalStorage
const getStoredSnippets = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// تابع کمکی برای ذخیره اسنیپت‌ها در LocalStorage
const saveStoredSnippets = (snippets) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
};

export const snippetsApi = {
  list: async () => {
    const snippets = getStoredSnippets();
    // دقیقاً مشابه منطق مرتب‌سازی در پایتون:
    // ابتدا بر اساس زمان آپدیت (نزولی) و سپس پین‌شده‌ها بالا قرار می‌گیرند.
    return snippets.sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1; // پین شده‌ها اول بیایند
      }
      return new Date(b.updated_at) - new Date(a.updated_at); // جدیدترین‌ها اول بیایند
    });
  },

  create: async (data) => {
    const snippets = getStoredSnippets();
    const now = new Date().toISOString();

    // شبیه‌سازی مدل SnippetCreate و تبدیل به Snippet در پایتون
    const newSnippet = {
      id: generateUUID(),
      title: data.title || "",
      category: data.category || "Bash",
      tags: data.tags || [],
      // تولید ID برای استپ‌هایی که آیدی ندارند
      steps: (data.steps || []).map((step) => ({
        id: step.id || generateUUID(),
        title: step.title || "",
        code: step.code || "",
        explanation: step.explanation || "",
        language: step.language || "plaintext",
      })),
      pinned: data.pinned || false,
      favorite: data.favorite || false,
      created_at: now,
      updated_at: now,
    };

    snippets.push(newSnippet);
    saveStoredSnippets(snippets);
    return newSnippet;
  },

  get: async (id) => {
    const snippets = getStoredSnippets();
    const snippet = snippets.find((s) => s.id === id);
    if (!snippet) throw new Error("Snippet not found");
    return snippet;
  },

  update: async (id, data) => {
    const snippets = getStoredSnippets();
    const index = snippets.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Snippet not found");

    const now = new Date().toISOString();
    
    // شبیه‌سازی partial update در پایتون (فقط مقادیری که فرستاده شده‌اند تغییر کنند)
    const updatedSnippet = {
      ...snippets[index],
      ...Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined)),
      updated_at: now
    };

    // در صورتی که ساختار steps آپدیت شده باشد، بررسی آیدی استپ‌ها
    if (data.steps) {
      updatedSnippet.steps = data.steps.map((step) => ({
        id: step.id || generateUUID(),
        title: step.title || "",
        code: step.code || "",
        explanation: step.explanation || "",
        language: step.language || "plaintext",
      }));
    }

    snippets[index] = updatedSnippet;
    saveStoredSnippets(snippets);
    return updatedSnippet;
  },

  delete: async (id) => {
    const snippets = getStoredSnippets();
    const filtered = snippets.filter((s) => s.id !== id);
    if (snippets.length === filtered.length) throw new Error("Snippet not found");
    
    saveStoredSnippets(filtered);
    return { ok: true };
  },

  togglePin: async (id) => {
    const snippets = getStoredSnippets();
    const index = snippets.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Snippet not found");

    snippets[index].pinned = !snippets[index].pinned;
    snippets[index].updated_at = new Date().toISOString();

    saveStoredSnippets(snippets);
    return snippets[index];
  },

  toggleFavorite: async (id) => {
    const snippets = getStoredSnippets();
    const index = snippets.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Snippet not found");

    snippets[index].favorite = !snippets[index].favorite;
    snippets[index].updated_at = new Date().toISOString();

    saveStoredSnippets(snippets);
    return snippets[index];
  },
};

export const backupApi = {
  export: async () => {
    const snippets = getStoredSnippets();
    return {
      app: "JeyCommand",
      version: 1,
      exported_at: new Date().toISOString(),
      snippets: snippets,
    };
  },

  import: async (incomingSnippets, replace = false) => {
    let snippets = replace ? [] : getStoredSnippets();
    let inserted = 0;

    for (const s of incomingSnippets) {
      const doc = { ...s };
      // جلوگیری از برخورد آیدی‌های تکراری در صورت عدم تمایل به جایگزینی (replace = false)
      const exists = snippets.some((existing) => existing.id === doc.id);
      if (exists && !replace) {
        doc.id = generateUUID();
      }
      snippets.push(doc);
      inserted++;
    }

    saveStoredSnippets(snippets);
    return { ok: true, imported: inserted };
  },
};

export const statsApi = {
  get: async () => {
    const snippets = getStoredSnippets();
    const total = snippets.length;
    const pinned = snippets.filter((s) => s.pinned).length;
    const favorites = snippets.filter((s) => s.favorite).length;
    
    // استخراج دسته‌بندی‌های یکتا (Unique Categories)
    const categories = [...new Set(snippets.map((s) => s.category || "Bash"))];

    return {
      total,
      pinned,
      favorites,
      categories,
    };
  },
};