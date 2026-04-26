const storageKeys = {
  theme: "toolnest-theme",
  accent: "toolnest-accent",
  favorites: "toolnest-favorites",
  resume: "toolnest-resume",
  budget: "toolnest-budget",
  bio: "toolnest-bio",
};

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initSearchAndFavorites();
  initResumeBuilder();
  initImageConverter();
  initPdfTools();
  initTextFormatter();
  initPromptHelper();
  initBudgetCalculator();
  initBioLinkGenerator();
});

function initTheme() {
  const themeMode = qs("#themeMode");
  const accentPicker = qs("#accentPicker");
  if (!themeMode || !accentPicker) return;

  const savedTheme = localStorage.getItem(storageKeys.theme) || "system";
  const savedAccent = localStorage.getItem(storageKeys.accent) || "sunburst";

  themeMode.value = savedTheme;
  accentPicker.value = savedAccent;

  applyTheme(savedTheme);
  applyAccent(savedAccent);

  themeMode.addEventListener("change", () => {
    localStorage.setItem(storageKeys.theme, themeMode.value);
    applyTheme(themeMode.value);
  });

  accentPicker.addEventListener("change", () => {
    localStorage.setItem(storageKeys.accent, accentPicker.value);
    applyAccent(accentPicker.value);
  });

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if ((localStorage.getItem(storageKeys.theme) || "system") === "system") {
      applyTheme("system");
    }
  });
}

function applyTheme(mode) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = mode === "system" ? (prefersDark ? "dark" : "light") : mode;
  document.body.dataset.theme = resolved;
}

function applyAccent(accent) {
  document.body.dataset.accent = accent;
}

function initSearchAndFavorites() {
  const toolCards = qsa(".tool-card");
  const favoriteButtons = qsa(".favorite-toggle");
  if (!toolCards.length) return;

  const favorites = new Set(JSON.parse(localStorage.getItem(storageKeys.favorites) || "[]"));

  favoriteButtons.forEach((button) => {
    const key = button.dataset.favorite;
    syncFavoriteButton(button, favorites.has(key));
    button.addEventListener("click", () => {
      if (favorites.has(key)) {
        favorites.delete(key);
      } else {
        favorites.add(key);
      }
      localStorage.setItem(storageKeys.favorites, JSON.stringify([...favorites]));
      syncFavoriteButton(button, favorites.has(key));
    });
  });

  const searchInput = qs("#toolSearch");
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim().toLowerCase();
    toolCards.forEach((card) => {
      const haystack = card.dataset.toolName.toLowerCase();
      card.hidden = !haystack.includes(term);
    });
  });
}

function syncFavoriteButton(button, isFavorite) {
  button.classList.toggle("is-favorite", isFavorite);
  button.textContent = isFavorite ? "*" : "+";
}

function initResumeBuilder() {
  const form = qs("#resumeForm");
  const preview = qs("#resumePreview");
  const saveButton = qs("#saveResumeDraft");
  const downloadButton = qs("#downloadResume");
  const printButton = qs("#printResume");
  if (!form || !preview || !saveButton || !downloadButton || !printButton) return;

  const savedDraft = localStorage.getItem(storageKeys.resume);
  if (savedDraft) {
    const data = JSON.parse(savedDraft);
    [...form.elements].forEach((field) => {
      if (field.name && data[field.name] !== undefined) {
        field.value = data[field.name];
      }
    });
  }

  const render = () => {
    const data = Object.fromEntries(new FormData(form).entries());
    const skills = data.skills
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const roles = data.experience
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [role, company, dates, achievement] = line.split("|").map((part) => part?.trim() || "");
        return { role, company, dates, achievement };
      });

    preview.innerHTML = `
      <div class="resume-preview">
        <div class="resume-header">
          <h4>${escapeHtml(data.name || "Your Name")}</h4>
          <div class="resume-title">${escapeHtml(data.title || "Professional Title")}</div>
          <div class="resume-meta">
            <span class="tag">${escapeHtml(data.email || "email@example.com")}</span>
            <span class="tag">${escapeHtml(data.phone || "+1 555 000 0000")}</span>
          </div>
        </div>
        <div>
          <h4>Summary</h4>
          <p>${escapeHtml(data.summary || "")}</p>
        </div>
        <div>
          <h4>Skills</h4>
          <div class="resume-skills">${skills.map((skill) => `<span class="tag">${escapeHtml(skill)}</span>`).join("")}</div>
        </div>
        <div>
          <h4>Experience</h4>
          <div class="experience-list">
            ${roles
              .map(
                (item) => `
              <article class="experience-item">
                <strong>${escapeHtml(item.role || "Role")}</strong>
                <div>${escapeHtml(item.company || "Company")} ${item.dates ? `| ${escapeHtml(item.dates)}` : ""}</div>
                <p>${escapeHtml(item.achievement || "")}</p>
              </article>
            `,
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  };

  form.addEventListener("input", render);
  saveButton.addEventListener("click", () => {
    localStorage.setItem(
      storageKeys.resume,
      JSON.stringify(Object.fromEntries(new FormData(form).entries())),
    );
    flashButton(saveButton, "Saved", "Save draft");
  });

  downloadButton.addEventListener("click", () => {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Resume</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
          .tag { display: inline-block; margin: 0 8px 8px 0; padding: 8px 12px; background: #f3f4f6; border-radius: 999px; }
          .item { border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; margin-bottom: 12px; }
        </style>
      </head>
      <body>${preview.innerHTML}</body>
      </html>
    `;
    downloadBlob(new Blob([html], { type: "text/html" }), "resume.html");
  });

  printButton.addEventListener("click", () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Resume</title>
        <style>body { font-family: Arial, sans-serif; padding: 40px; color: #111; }</style>
      </head>
      <body>${preview.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  });

  render();
}

function initImageConverter() {
  const fileInput = qs("#imageFiles");
  const formatSelect = qs("#imageFormat");
  const qualityInput = qs("#imageQuality");
  const maxWidthInput = qs("#imageMaxWidth");
  const convertButton = qs("#convertImages");
  const resultGrid = qs("#imageResults");
  if (!fileInput || !formatSelect || !qualityInput || !maxWidthInput || !convertButton || !resultGrid) return;

  convertButton.addEventListener("click", async () => {
    const files = [...fileInput.files];
    if (!files.length) {
      resultGrid.innerHTML = `<div class="status-box">Choose one or more image files first.</div>`;
      return;
    }

    resultGrid.innerHTML = "";
    for (const file of files) {
      const card = document.createElement("article");
      card.className = "result-card";
      card.innerHTML = `<strong>${escapeHtml(file.name)}</strong><p>Processing...</p>`;
      resultGrid.appendChild(card);

      try {
        const converted = await convertImageFile(
          file,
          formatSelect.value,
          Number(qualityInput.value),
          Number(maxWidthInput.value) || null,
        );
        const previewUrl = URL.createObjectURL(converted.blob);
        card.innerHTML = `
          <img src="${previewUrl}" alt="${escapeHtml(file.name)} preview" />
          <strong>${escapeHtml(converted.name)}</strong>
          <div class="metric">${formatBytes(converted.blob.size)}</div>
        `;
        const link = document.createElement("a");
        link.className = "button primary";
        link.href = previewUrl;
        link.download = converted.name;
        link.textContent = "Download";
        card.appendChild(link);
      } catch (error) {
        card.innerHTML = `<strong>${escapeHtml(file.name)}</strong><p>${escapeHtml(error.message)}</p>`;
      }
    }
  });
}

async function convertImageFile(file, mimeType, quality, maxWidth) {
  const bitmap = await createImageBitmap(file);
  const scale = maxWidth ? Math.min(1, maxWidth / bitmap.width) : 1;
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality));
  if (!blob) throw new Error("Conversion failed");

  const extension = mimeType.split("/")[1].replace("jpeg", "jpg");
  const baseName = file.name.replace(/\.[^.]+$/, "");
  return { blob, name: `${baseName}.${extension}` };
}

function initPdfTools() {
  const fileInput = qs("#pdfFiles");
  const status = qs("#pdfStatus");
  const mergeButton = qs("#mergePdfs");
  const extractButton = qs("#extractPdfRange");
  const rangeInput = qs("#pdfRange");
  if (!fileInput || !status || !mergeButton || !extractButton || !rangeInput) return;

  mergeButton.addEventListener("click", async () => {
    const files = [...fileInput.files];
    if (!files.length) {
      setStatus(status, "Choose PDF files to merge.");
      return;
    }
    if (!window.PDFLib) {
      setStatus(status, "PDF library is not available. Check your internet connection for the CDN script.");
      return;
    }

    setStatus(status, "Merging PDFs...");
    try {
      const mergedPdf = await window.PDFLib.PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const sourcePdf = await window.PDFLib.PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedBytes = await mergedPdf.save();
      downloadBlob(new Blob([mergedBytes], { type: "application/pdf" }), "merged.pdf");
      setStatus(status, `Merged ${files.length} PDF files successfully.`);
    } catch (error) {
      setStatus(status, `Merge failed: ${error.message}`);
    }
  });

  extractButton.addEventListener("click", async () => {
    const [firstFile] = [...fileInput.files];
    if (!firstFile) {
      setStatus(status, "Choose at least one PDF file to extract pages from.");
      return;
    }
    if (!window.PDFLib) {
      setStatus(status, "PDF library is not available. Check your internet connection for the CDN script.");
      return;
    }

    const pageNumbers = parsePageRange(rangeInput.value);
    if (!pageNumbers.length) {
      setStatus(status, "Enter a valid page range like 1-3.");
      return;
    }

    setStatus(status, "Extracting pages...");
    try {
      const bytes = await firstFile.arrayBuffer();
      const sourcePdf = await window.PDFLib.PDFDocument.load(bytes);
      const pageIndexes = pageNumbers
        .map((num) => num - 1)
        .filter((index) => index >= 0 && index < sourcePdf.getPageCount());

      if (!pageIndexes.length) {
        setStatus(status, "None of those pages exist in the selected PDF.");
        return;
      }

      const targetPdf = await window.PDFLib.PDFDocument.create();
      const copiedPages = await targetPdf.copyPages(sourcePdf, pageIndexes);
      copiedPages.forEach((page) => targetPdf.addPage(page));
      const extractedBytes = await targetPdf.save();
      downloadBlob(new Blob([extractedBytes], { type: "application/pdf" }), "extracted-pages.pdf");
      setStatus(status, `Extracted ${pageIndexes.length} page(s) from ${firstFile.name}.`);
    } catch (error) {
      setStatus(status, `Extraction failed: ${error.message}`);
    }
  });
}

function setStatus(node, message) {
  node.textContent = message;
}

function parsePageRange(input) {
  const match = input.trim().match(/^(\d+)\s*-\s*(\d+)$/);
  if (!match) return [];
  const start = Number(match[1]);
  const end = Number(match[2]);
  if (start <= 0 || end < start) return [];
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function initTextFormatter() {
  const input = qs("#textInput");
  const output = qs("#textOutput");
  const stats = qs("#textStats");
  const buttons = qsa(".text-action");
  const copyButton = qs("#copyFormattedText");
  if (!input || !output || !stats || !copyButton) return;

  const refreshStats = (text) => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const lines = text ? text.split("\n").length : 0;
    stats.innerHTML = `
      <article><strong>${words}</strong><span>Words</span></article>
      <article><strong>${chars}</strong><span>Characters</span></article>
      <article><strong>${lines}</strong><span>Lines</span></article>
    `;
  };

  const applyTransformation = (action) => {
    const text = input.value;
    const transforms = {
      upper: () => text.toUpperCase(),
      lower: () => text.toLowerCase(),
      title: () => text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()),
      sentence: () => text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (chunk) => chunk.toUpperCase()),
      slug: () =>
        text
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-"),
      trim: () =>
        text
          .split("\n")
          .map((line) => line.trim().replace(/\s+/g, " "))
          .join("\n"),
      dedupe: () => [...new Set(text.split("\n").map((line) => line.trim()).filter(Boolean))].join("\n"),
    };
    output.value = transforms[action] ? transforms[action]() : text;
    refreshStats(output.value);
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => applyTransformation(button.dataset.action));
  });

  copyButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(output.value);
    flashButton(copyButton, "Copied", "Copy output");
  });

  output.value = input.value;
  refreshStats(output.value);
}

function initPromptHelper() {
  const fields = {
    goal: qs("#promptGoal"),
    audience: qs("#promptAudience"),
    tone: qs("#promptTone"),
    format: qs("#promptFormat"),
    constraints: qs("#promptConstraints"),
  };
  const output = qs("#promptOutput");
  const buttons = qsa(".prompt-template");
  const copyButton = qs("#copyPrompt");
  if (!output || !copyButton || Object.values(fields).some((field) => !field)) return;

  const renderPrompt = (template) => {
    const values = Object.fromEntries(
      Object.entries(fields).map(([key, input]) => [key, input.value.trim()]),
    );

    const templates = {
      structured: `You are an expert assistant.\n\nGoal:\n${values.goal}\n\nAudience:\n${values.audience}\n\nTone:\n${values.tone}\n\nConstraints:\n${values.constraints}\n\nOutput format:\n${values.format}\n\nBefore answering, think through the user's likely needs. Then provide the best response in the requested format.`,
      expert: `Act as a senior specialist. Help with this task: ${values.goal}. The target audience is ${values.audience}. Use a ${values.tone} tone. Respect these constraints: ${values.constraints}. Deliver the answer as: ${values.format}. Include practical recommendations, not just theory.`,
      system: `System instruction:\nYou are a reliable assistant focused on quality and clarity.\nPrioritize usefulness, accuracy, and structure.\nUser objective: ${values.goal}\nAudience: ${values.audience}\nRequired tone: ${values.tone}\nConstraints: ${values.constraints}\nRequired output: ${values.format}`,
      brief: `Help me with ${values.goal} for ${values.audience}. Use a ${values.tone} tone. Keep these constraints in mind: ${values.constraints}. Return: ${values.format}.`,
    };

    output.value = templates[template];
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => renderPrompt(button.dataset.template));
  });

  copyButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(output.value);
    flashButton(copyButton, "Copied", "Copy prompt");
  });

  renderPrompt("structured");
}

function initBudgetCalculator() {
  const incomeInput = qs("#budgetIncome");
  const expenseList = qs("#expenseList");
  const summary = qs("#budgetSummary");
  const addButton = qs("#addExpense");
  const saveButton = qs("#saveBudget");
  if (!incomeInput || !expenseList || !summary || !addButton || !saveButton) return;

  const defaultRows = [
    { label: "Housing", amount: 1400 },
    { label: "Food", amount: 520 },
    { label: "Transport", amount: 220 },
    { label: "Savings", amount: 800 },
  ];

  const savedBudget = JSON.parse(localStorage.getItem(storageKeys.budget) || "null");
  incomeInput.value = savedBudget?.income ?? incomeInput.value;
  const rows = savedBudget?.expenses?.length ? savedBudget.expenses : defaultRows;

  const renderRows = () => {
    expenseList.innerHTML = "";
    rows.forEach((row, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "expense-row";
      wrapper.innerHTML = `
        <label class="control">
          <span>Category</span>
          <input value="${escapeAttribute(row.label)}" data-field="label" data-index="${index}" />
        </label>
        <label class="control">
          <span>Amount</span>
          <input type="number" min="0" value="${Number(row.amount) || 0}" data-field="amount" data-index="${index}" />
        </label>
        <button class="icon-button" type="button" data-remove-expense="${index}">Remove</button>
      `;
      expenseList.appendChild(wrapper);
    });

    qsa("[data-field]", expenseList).forEach((input) => {
      input.addEventListener("input", () => {
        const index = Number(input.dataset.index);
        const field = input.dataset.field;
        rows[index][field] = field === "amount" ? Number(input.value) || 0 : input.value;
        renderSummary();
      });
    });

    qsa("[data-remove-expense]", expenseList).forEach((button) => {
      button.addEventListener("click", () => {
        rows.splice(Number(button.dataset.removeExpense), 1);
        renderRows();
        renderSummary();
      });
    });
  };

  const renderSummary = () => {
    const income = Number(incomeInput.value) || 0;
    const spent = rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
    const saved = income - spent;
    const savingsRate = income ? Math.max(0, (saved / income) * 100) : 0;

    summary.innerHTML = `
      <div class="metric-row">
        <article><strong>$${income.toFixed(0)}</strong><span>Income</span></article>
        <article><strong>$${spent.toFixed(0)}</strong><span>Expenses</span></article>
        <article><strong>$${saved.toFixed(0)}</strong><span>Left over</span></article>
        <article><strong>${savingsRate.toFixed(1)}%</strong><span>Savings rate</span></article>
      </div>
      ${rows
        .map((row) => {
          const ratio = spent ? (Number(row.amount) / spent) * 100 : 0;
          return `
            <div>
              <div class="tool-card-head">
                <strong>${escapeHtml(row.label || "Category")}</strong>
                <span>$${(Number(row.amount) || 0).toFixed(0)}</span>
              </div>
              <div class="summary-bar"><span style="width:${ratio.toFixed(1)}%"></span></div>
            </div>
          `;
        })
        .join("")}
    `;
  };

  addButton.addEventListener("click", () => {
    rows.push({ label: "New category", amount: 0 });
    renderRows();
    renderSummary();
  });

  saveButton.addEventListener("click", () => {
    localStorage.setItem(
      storageKeys.budget,
      JSON.stringify({
        income: Number(incomeInput.value) || 0,
        expenses: rows,
      }),
    );
    flashButton(saveButton, "Saved", "Save budget");
  });

  incomeInput.addEventListener("input", renderSummary);
  renderRows();
  renderSummary();
}

function initBioLinkGenerator() {
  const fields = {
    name: qs("#bioName"),
    handle: qs("#bioHandle"),
    description: qs("#bioDescription"),
    accent: qs("#bioAccent"),
    background: qs("#bioBackground"),
  };
  const linksList = qs("#bioLinksList");
  const preview = qs("#bioPreview");
  const output = qs("#bioHtmlOutput");
  const addButton = qs("#addBioLink");
  const saveButton = qs("#saveBioLinks");
  const exportButton = qs("#exportBioHtml");
  if (!linksList || !preview || !output || !addButton || !saveButton || !exportButton) return;
  if (Object.values(fields).some((field) => !field)) return;

  const savedBio = JSON.parse(localStorage.getItem(storageKeys.bio) || "null");
  if (savedBio) {
    Object.entries(fields).forEach(([key, input]) => {
      if (savedBio[key] !== undefined) input.value = savedBio[key];
    });
  }

  const links = savedBio?.links?.length
    ? savedBio.links
    : [
        { label: "Portfolio", url: "https://example.com" },
        { label: "YouTube", url: "https://youtube.com" },
        { label: "Newsletter", url: "https://newsletter.example.com" },
      ];

  const renderLinks = () => {
    linksList.innerHTML = "";
    links.forEach((link, index) => {
      const row = document.createElement("div");
      row.className = "bio-link-row";
      row.innerHTML = `
        <label class="control">
          <span>Link label</span>
          <input value="${escapeAttribute(link.label)}" data-bio-field="label" data-bio-index="${index}" />
        </label>
        <label class="control">
          <span>URL</span>
          <input value="${escapeAttribute(link.url)}" data-bio-field="url" data-bio-index="${index}" />
        </label>
        <button class="icon-button" type="button" data-remove-link="${index}">Remove</button>
      `;
      linksList.appendChild(row);
    });

    qsa("[data-bio-field]", linksList).forEach((input) => {
      input.addEventListener("input", () => {
        const index = Number(input.dataset.bioIndex);
        links[index][input.dataset.bioField] = input.value;
        renderPreview();
      });
    });

    qsa("[data-remove-link]", linksList).forEach((button) => {
      button.addEventListener("click", () => {
        links.splice(Number(button.dataset.removeLink), 1);
        renderLinks();
        renderPreview();
      });
    });
  };

  const renderPreview = () => {
    const values = Object.fromEntries(
      Object.entries(fields).map(([key, input]) => [key, input.value]),
    );
    const initials = values.name
      .split(" ")
      .map((part) => part[0] || "")
      .slice(0, 2)
      .join("")
      .toUpperCase();

    preview.style.background = values.background;
    preview.innerHTML = `
      <div class="bio-avatar" style="background:${values.accent}">${escapeHtml(initials || "TL")}</div>
      <div>
        <h4 style="margin:0;color:white">${escapeHtml(values.name)}</h4>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.75)">${escapeHtml(values.handle)}</p>
      </div>
      <p style="margin:0;color:rgba(255,255,255,0.86)">${escapeHtml(values.description)}</p>
      <div class="bio-links">
        ${links
          .map(
            (link) => `
              <a class="bio-link" href="${escapeAttribute(link.url)}" style="background:${values.accent}">
                ${escapeHtml(link.label || "Link")}
              </a>
            `,
          )
          .join("")}
      </div>
    `;

    output.value = buildBioHtml(values, links);
  };

  Object.values(fields).forEach((input) => input.addEventListener("input", renderPreview));

  addButton.addEventListener("click", () => {
    links.push({ label: "New link", url: "https://" });
    renderLinks();
    renderPreview();
  });

  saveButton.addEventListener("click", () => {
    localStorage.setItem(
      storageKeys.bio,
      JSON.stringify({
        ...Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, input.value])),
        links,
      }),
    );
    flashButton(saveButton, "Saved", "Save profile");
  });

  exportButton.addEventListener("click", () => {
    downloadBlob(new Blob([output.value], { type: "text/html" }), "bio-links.html");
  });

  renderLinks();
  renderPreview();
}

function buildBioHtml(values, links) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(values.name)}</title>
  <style>
    body { margin:0; font-family: Arial, sans-serif; display:grid; place-items:center; min-height:100vh; background:${values.background}; color:white; }
    .wrap { width:min(420px, calc(100% - 32px)); display:grid; gap:16px; text-align:center; }
    .avatar { width:76px; height:76px; margin:0 auto; display:grid; place-items:center; border-radius:22px; background:${values.accent}; font-weight:700; font-size:1.4rem; }
    a { display:block; padding:14px; border-radius:14px; background:${values.accent}; color:white; text-decoration:none; font-weight:700; margin-bottom:10px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="avatar">${escapeHtml(
      values.name
        .split(" ")
        .map((part) => part[0] || "")
        .slice(0, 2)
        .join("")
        .toUpperCase(),
    )}</div>
    <div>
      <h1>${escapeHtml(values.name)}</h1>
      <p>${escapeHtml(values.handle)}</p>
    </div>
    <p>${escapeHtml(values.description)}</p>
    <div>${links
      .map((link) => `<a href="${escapeAttribute(link.url)}">${escapeHtml(link.label)}</a>`)
      .join("")}</div>
  </div>
</body>
</html>`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function flashButton(button, nextLabel, resetLabel) {
  button.textContent = nextLabel;
  setTimeout(() => {
    button.textContent = resetLabel;
  }, 1200);
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}
