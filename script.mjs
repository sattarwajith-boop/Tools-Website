import { animate, inView, scroll, stagger } from "./node_modules/motion/dist/es/index.mjs";

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

document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  initTopbarState();
  initWorkspaceNavigator();
  initSearchAndFavorites();
  initResumeBuilder();
  initImageConverter();
  initPdfTools();
  initTextFormatter();
  initPromptHelper();
  initBudgetCalculator();
  initBioLinkGenerator();
  initPasswordGenerator();
  initUnitConverter();
  initReadingTime();
  initInvoiceCalculator();
  initAiWritingAssistant();
  initCardValidator();
  initAnimations();
});

function initTheme() {
  const savedTheme = localStorage.getItem(storageKeys.theme) || "light";
  applyTheme(savedTheme);

  qsa(".theme-option").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.themeValue === savedTheme);
    button.addEventListener("click", () => {
      const nextTheme = button.dataset.themeValue || "light";
      localStorage.setItem(storageKeys.theme, nextTheme);
      applyTheme(nextTheme);
      qsa(".theme-option").forEach((item) =>
        item.classList.toggle("is-active", item === button),
      );
    });
  });
}

function applyTheme(theme) {
  document.body.dataset.theme = theme;
}

function initAnimations() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const heroStats = qsa(".hero-stats article");
  if (heroStats.length) {
    animate(
      heroStats,
      { opacity: [0, 1], y: [24, 0], scale: [0.96, 1] },
      { delay: stagger(0.08), duration: 0.5, easing: "ease-out" },
    );

    const firstValue = heroStats[0]?.querySelector("strong");
    if (firstValue && /^\d+$/.test(firstValue.textContent.trim())) {
      animateCounter(firstValue, Number(firstValue.textContent.trim()), "+");
    }
  }

  const staggerGroups = qsa("[data-stagger]");
  staggerGroups.forEach((group) => {
    const children = [...group.children];
    if (!children.length) return;
    children.forEach((child) => {
      child.style.opacity = "0";
      child.style.transform = "translateY(22px)";
    });
    inView(
      group,
      () => {
        animate(
          children,
          { opacity: [0, 1], y: [22, 0] },
          { delay: stagger(0.06), duration: 0.48, easing: "ease-out" },
        );
        return () => {};
      },
      { margin: "-10% 0px -10% 0px" },
    );
  });

  const revealNodes = qsa("[data-reveal]");
  revealNodes.forEach((node) => {
    const direction = node.dataset.reveal || "up";
    const start =
      direction === "left"
        ? { x: 26, y: 0 }
        : direction === "right"
          ? { x: -26, y: 0 }
          : { x: 0, y: 30 };

    node.style.opacity = "0";
    node.style.transform = `translate(${start.x}px, ${start.y}px)`;

    inView(
      node,
      () => {
        animate(
          node,
          { opacity: [0, 1], x: [start.x, 0], y: [start.y, 0], filter: ["blur(6px)", "blur(0px)"] },
          { duration: 0.6, easing: "ease-out" },
        );
        return () => {};
      },
      { margin: "-12% 0px -12% 0px" },
    );
  });

  const heroStage = qs(".hero-stage");
  if (heroStage) {
    animate(
      heroStage,
      { y: [0, -10, 0] },
      { duration: 6, repeat: Infinity, easing: "ease-in-out" },
    );
  }

  const pageNoise = qs(".page-noise");
  scroll(() => {
    const offset = Math.min(window.scrollY, 140);
    if (pageNoise) {
      pageNoise.style.opacity = `${Math.max(0.14, 0.35 - offset * 0.0012)}`;
    }
  });
}

function initTopbarState() {
  const sections = qsa("main section[id]");
  const navLinks = qsa(".topnav a[href^='#']");
  const topbar = qs(".topbar");
  if (!sections.length || !navLinks.length) return;

  const linkMap = new Map(
    navLinks.map((link) => [link.getAttribute("href")?.slice(1), link]),
  );

  const observer = new IntersectionObserver(
    (entries) => {
      const active = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!active) return;

      navLinks.forEach((link) => link.removeAttribute("aria-current"));
      const activeLink = linkMap.get(active.target.id);
      if (activeLink) {
        activeLink.setAttribute("aria-current", "page");
      }
    },
    { rootMargin: "-28% 0px -55% 0px", threshold: [0.2, 0.45, 0.7] },
  );

  sections.forEach((section) => observer.observe(section));

  window.addEventListener("scroll", () => {
    if (!topbar) return;
    topbar.classList.toggle("is-scrolled", window.scrollY > 12);
  });
}

function initWorkspaceNavigator() {
  const panels = qsa(".workspace-panels > .workspace-card");
  const tabs = qsa(".workspace-tab");
  const select = qs("#workspaceSelect");
  const label = qs("#workspaceCurrentName");
  if (!panels.length || !tabs.length) return;

  const panelMap = new Map(panels.map((panel) => [panel.id, panel]));

  const setActiveWorkspace = (id, shouldScroll = false) => {
    const target = panelMap.get(id);
    if (!target) return;

    panels.forEach((panel) => {
      panel.hidden = panel !== target;
    });

    tabs.forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.workspaceTarget === id);
    });

    if (select) {
      select.value = id;
    }

    if (label) {
      const title = target.querySelector("h3")?.textContent?.trim() || "Workspace";
      label.textContent = `Currently viewing ${title}.`;
    }

    history.replaceState(null, "", `#${id}`);
    if (shouldScroll) {
      qs("#workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    announce(`${target.querySelector("h3")?.textContent || "Tool"} opened.`);
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setActiveWorkspace(tab.dataset.workspaceTarget, false);
    });
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-open-tool]");
    if (!trigger) return;
    const target = trigger.dataset.openTool;
    if (!target) return;
    setActiveWorkspace(target, true);
  });

  if (select) {
    select.addEventListener("change", () => {
      setActiveWorkspace(select.value, false);
    });
  }

  const initialHash = window.location.hash.replace("#", "");
  const initialTarget = panelMap.has(initialHash) ? initialHash : "resume-builder";
  setActiveWorkspace(initialTarget, false);
}

function initSearchAndFavorites() {
  const toolCards = qsa(".tool-card");
  const favoriteButtons = qsa(".favorite-toggle");
  const filters = qsa(".filter-chip");
  const favoritesShelf = qs("#favoritesShelf");
  const favoritesList = qs("#favoritesList");
  const emptyState = qs("#toolEmptyState");
  const countLabel = qs("#toolCountLabel");
  if (!toolCards.length) return;

  const favorites = new Set(JSON.parse(localStorage.getItem(storageKeys.favorites) || "[]"));
  let activeFilter = "all";
  let searchTerm = "";

  const refreshToolDiscovery = () => {
    let visibleCount = 0;
    toolCards.forEach((card) => {
      const haystack = card.dataset.toolName.toLowerCase();
      const category = (card.dataset.toolCategory || "").toLowerCase();
      const matchesSearch = haystack.includes(searchTerm);
      const matchesFilter = activeFilter === "all" || category === activeFilter;
      const isVisible = matchesSearch && matchesFilter;
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    if (countLabel) {
      countLabel.textContent = `${visibleCount} tool${visibleCount === 1 ? "" : "s"} visible in the current view`;
    }
    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }
  };

  const renderFavoritesShelf = () => {
    if (!favoritesShelf || !favoritesList) return;
    const favoriteCards = toolCards.filter((card) =>
      favorites.has(card.querySelector(".favorite-toggle")?.dataset.favorite || ""),
    );
    favoritesShelf.hidden = favoriteCards.length === 0;
    favoritesList.innerHTML = favoriteCards
      .map((card) => {
        const title = card.dataset.toolTitle || card.querySelector("h3")?.textContent || "Tool";
        const target = card.querySelector("[data-open-tool]")?.dataset.openTool || "";
        const category = card.dataset.toolCategory || "general";
        return `
          <button class="favorite-link-card workspace-launch" data-open-tool="${escapeAttribute(target)}" type="button">
            <span class="category-label">${escapeHtml(titleCase(category))}</span>
            <strong>${escapeHtml(title)}</strong>
          </button>
        `;
      })
      .join("");
  };

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
      renderFavoritesShelf();
      announce(
        `${button.closest(".tool-card")?.dataset.toolTitle || "Tool"} ${
          favorites.has(key) ? "saved to favorites" : "removed from favorites"
        }.`,
      );
    });
  });

  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      activeFilter = filter.dataset.filter || "all";
      filters.forEach((item) => item.classList.toggle("is-active", item === filter));
      refreshToolDiscovery();
      announce(`Showing ${activeFilter === "all" ? "all tools" : `${activeFilter} tools`}.`);
    });
  });

  const searchInput = qs("#toolSearch");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchTerm = searchInput.value.trim().toLowerCase();
      refreshToolDiscovery();
    });
  }

  renderFavoritesShelf();
  refreshToolDiscovery();
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
    const skills = data.skills.split(",").map((item) => item.trim()).filter(Boolean);
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
            <span class="tag">${escapeHtml(data.website || "your-site.com")}</span>
            <span class="tag">${escapeHtml(data.location || "City, Country")}</span>
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
    localStorage.setItem(storageKeys.resume, JSON.stringify(Object.fromEntries(new FormData(form).entries())));
    flashButton(saveButton, "Saved", "Save draft");
  });

  downloadButton.addEventListener("click", () => {
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><title>Resume</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#111}.tag{display:inline-block;margin:0 8px 8px 0;padding:8px 12px;background:#f3f4f6;border-radius:999px}.experience-item{border:1px solid #e5e7eb;border-radius:12px;padding:14px;margin-bottom:12px}</style></head><body>${preview.innerHTML}</body></html>`;
    downloadBlob(new Blob([html], { type: "text/html" }), "resume.html");
  });

  printButton.addEventListener("click", () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><title>Resume</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#111}</style></head><body>${preview.innerHTML}</body></html>`);
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
  const presetInput = qs("#imagePreset");
  const grayScaleInput = qs("#imageGrayScale");
  const convertButton = qs("#convertImages");
  const resultGrid = qs("#imageResults");
  if (!fileInput || !formatSelect || !qualityInput || !maxWidthInput || !presetInput || !grayScaleInput || !convertButton || !resultGrid) return;

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
          presetInput.value,
          grayScaleInput.checked,
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

async function convertImageFile(file, mimeType, quality, maxWidth, preset, useGrayScale) {
  const bitmap = await createImageBitmap(file);
  const scale = maxWidth ? Math.min(1, maxWidth / bitmap.width) : 1;
  let width = Math.round(bitmap.width * scale);
  let height = Math.round(bitmap.height * scale);

  const presetRatios = {
    square: 1,
    landscape: 16 / 9,
    story: 9 / 16,
  };

  if (preset !== "original" && presetRatios[preset]) {
    const targetRatio = presetRatios[preset];
    const currentRatio = width / height;
    if (currentRatio > targetRatio) {
      height = Math.round(width / targetRatio);
    } else {
      width = Math.round(height * targetRatio);
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  if (useGrayScale) context.filter = "grayscale(1)";
  const fittedScale = Math.min(width / bitmap.width, height / bitmap.height);
  const drawWidth = Math.round(bitmap.width * fittedScale);
  const drawHeight = Math.round(bitmap.height * fittedScale);
  const offsetX = Math.round((width - drawWidth) / 2);
  const offsetY = Math.round((height - drawHeight) / 2);
  context.drawImage(bitmap, offsetX, offsetY, drawWidth, drawHeight);

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
      announce(`Merged ${files.length} PDF files.`);
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
      const pageIndexes = pageNumbers.map((num) => num - 1).filter((index) => index >= 0 && index < sourcePdf.getPageCount());
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
      announce(`Extracted ${pageIndexes.length} page${pageIndexes.length === 1 ? "" : "s"} from ${firstFile.name}.`);
    } catch (error) {
      setStatus(status, `Extraction failed: ${error.message}`);
    }
  });
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
      slug: () => text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"),
      trim: () => text.split("\n").map((line) => line.trim().replace(/\s+/g, " ")).join("\n"),
      dedupe: () => [...new Set(text.split("\n").map((line) => line.trim()).filter(Boolean))].join("\n"),
      sort: () => text.split("\n").map((line) => line.trim()).filter(Boolean).sort((a, b) => a.localeCompare(b)).join("\n"),
      noblank: () => text.split("\n").filter((line) => line.trim()).join("\n"),
    };
    output.value = transforms[action] ? transforms[action]() : text;
    refreshStats(output.value);
  };

  buttons.forEach((button) => button.addEventListener("click", () => applyTransformation(button.dataset.action)));
  copyButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(output.value);
    flashButton(copyButton, "Copied", "Copy output");
    announce("Formatted text copied.");
  });

  output.value = input.value;
  refreshStats(output.value);
}

function initPromptHelper() {
  const fields = {
    goal: qs("#promptGoal"),
    audience: qs("#promptAudience"),
    role: qs("#promptRole"),
    tone: qs("#promptTone"),
    format: qs("#promptFormat"),
    creativity: qs("#promptCreativity"),
    constraints: qs("#promptConstraints"),
  };
  const output = qs("#promptOutput");
  const buttons = qsa(".prompt-template");
  const copyButton = qs("#copyPrompt");
  if (!output || !copyButton || Object.values(fields).some((field) => !field)) return;

  const renderPrompt = (template) => {
    const values = Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, input.value.trim()]));
    const creativityLine = `Creativity level: ${values.creativity}/10`;
    const templates = {
      structured: `You are an expert assistant acting as a ${values.role}.\n\nGoal:\n${values.goal}\n\nAudience:\n${values.audience}\n\nTone:\n${values.tone}\n\nConstraints:\n${values.constraints}\n\nOutput format:\n${values.format}\n\n${creativityLine}\n\nBefore answering, think through the user's likely needs. Then provide the best response in the requested format.`,
      expert: `Act as a ${values.role}. Help with this task: ${values.goal}. The target audience is ${values.audience}. Use a ${values.tone} tone. Respect these constraints: ${values.constraints}. Deliver the answer as: ${values.format}. ${creativityLine}. Include practical recommendations, not just theory.`,
      system: `System instruction:\nYou are a reliable assistant focused on quality and clarity.\nRole: ${values.role}\nUser objective: ${values.goal}\nAudience: ${values.audience}\nRequired tone: ${values.tone}\nConstraints: ${values.constraints}\nRequired output: ${values.format}\n${creativityLine}`,
      brief: `Act as a ${values.role}. Help me with ${values.goal} for ${values.audience}. Use a ${values.tone} tone. Keep these constraints in mind: ${values.constraints}. Return: ${values.format}. ${creativityLine}.`,
    };
    output.value = templates[template];
  };

  buttons.forEach((button) => button.addEventListener("click", () => renderPrompt(button.dataset.template)));
  Object.values(fields).forEach((input) => input.addEventListener("input", () => renderPrompt("structured")));
  copyButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(output.value);
    flashButton(copyButton, "Copied", "Copy prompt");
    announce("Prompt copied.");
  });
  renderPrompt("structured");
}

function initBudgetCalculator() {
  const incomeInput = qs("#budgetIncome");
  const goalInput = qs("#budgetGoal");
  const expenseList = qs("#expenseList");
  const summary = qs("#budgetSummary");
  const addButton = qs("#addExpense");
  const saveButton = qs("#saveBudget");
  if (!incomeInput || !goalInput || !expenseList || !summary || !addButton || !saveButton) return;

  const defaultRows = [
    { label: "Housing", amount: 1400 },
    { label: "Food", amount: 520 },
    { label: "Transport", amount: 220 },
    { label: "Savings", amount: 800 },
  ];

  const savedBudget = JSON.parse(localStorage.getItem(storageKeys.budget) || "null");
  incomeInput.value = savedBudget?.income ?? incomeInput.value;
  goalInput.value = savedBudget?.goal ?? goalInput.value;
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
    const goal = Number(goalInput.value) || 0;
    const spent = rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
    const saved = income - spent;
    const savingsRate = income ? Math.max(0, (saved / income) * 100) : 0;
    const goalGap = goal - saved;

    summary.innerHTML = `
      <div class="metric-row">
        <article><strong>$${income.toFixed(0)}</strong><span>Income</span></article>
        <article><strong>$${spent.toFixed(0)}</strong><span>Expenses</span></article>
        <article><strong>$${saved.toFixed(0)}</strong><span>Left over</span></article>
        <article><strong>${savingsRate.toFixed(1)}%</strong><span>Savings rate</span></article>
      </div>
      <div class="goal-banner ${goalGap <= 0 ? "is-good" : ""}">
        ${goalGap <= 0 ? `You are above your savings goal by $${Math.abs(goalGap).toFixed(0)}.` : `You need $${goalGap.toFixed(0)} more to hit your savings goal.`}
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
    localStorage.setItem(storageKeys.budget, JSON.stringify({ income: Number(incomeInput.value) || 0, goal: Number(goalInput.value) || 0, expenses: rows }));
    flashButton(saveButton, "Saved", "Save budget");
  });
  incomeInput.addEventListener("input", renderSummary);
  goalInput.addEventListener("input", renderSummary);
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
    buttonStyle: qs("#bioButtonStyle"),
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

  const linkStyleMap = {
    solid: (accent) => `background:${accent};color:white;border:0;`,
    soft: (accent) => `background:${hexToRgba(accent, 0.16)};color:white;border:1px solid rgba(255,255,255,0.14);`,
    outline: (accent) => `background:transparent;color:white;border:1px solid ${accent};`,
  };

  const renderPreview = () => {
    const values = Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, input.value]));
    const initials = values.name.split(" ").map((part) => part[0] || "").slice(0, 2).join("").toUpperCase();
    preview.style.background = values.background;
    preview.innerHTML = `
      <div class="bio-avatar" style="background:${values.accent}">${escapeHtml(initials || "TL")}</div>
      <div>
        <h4 style="margin:0;color:white">${escapeHtml(values.name)}</h4>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.75)">${escapeHtml(values.handle)}</p>
      </div>
      <p style="margin:0;color:rgba(255,255,255,0.86)">${escapeHtml(values.description)}</p>
      <div class="bio-links">
        ${links.map((link) => `<a class="bio-link" href="${escapeAttribute(link.url)}" style="${linkStyleMap[values.buttonStyle](values.accent)}">${escapeHtml(link.label || "Link")}</a>`).join("")}
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
    localStorage.setItem(storageKeys.bio, JSON.stringify({ ...Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, input.value])), links }));
    flashButton(saveButton, "Saved", "Save profile");
  });
  exportButton.addEventListener("click", () => {
    downloadBlob(new Blob([output.value], { type: "text/html" }), "bio-links.html");
  });

  renderLinks();
  renderPreview();
}

function initPasswordGenerator() {
  const lengthInput = qs("#passwordLength");
  const output = qs("#passwordOutput");
  const copyButton = qs("#copyPassword");
  const generateButton = qs("#generatePassword");
  const stats = qs("#passwordStats");
  const options = {
    upper: qs("#passwordUpper"),
    lower: qs("#passwordLower"),
    numbers: qs("#passwordNumbers"),
    symbols: qs("#passwordSymbols"),
    excludeSimilar: qs("#passwordExcludeSimilar"),
  };
  if (!lengthInput || !output || !copyButton || !generateButton || !stats || Object.values(options).some((node) => !node)) return;

  const generate = () => {
    const pools = [];
    if (options.upper.checked) pools.push("ABCDEFGHJKLMNPQRSTUVWXYZ");
    if (options.lower.checked) pools.push("abcdefghijkmnopqrstuvwxyz");
    if (options.numbers.checked) pools.push(options.excludeSimilar.checked ? "23456789" : "0123456789");
    if (options.symbols.checked) pools.push("!@#$%^&*()_+-=[]{}?");
    const fallback = "abcdef123456";
    const pool = pools.join("") || fallback;
    let password = "";
    const length = Number(lengthInput.value) || 16;
    for (let i = 0; i < length; i += 1) {
      password += pool[Math.floor(Math.random() * pool.length)];
    }
    output.value = password;
    const strength = length >= 16 && pools.length >= 3 ? "Strong" : length >= 12 ? "Medium" : "Basic";
    stats.innerHTML = `
      <article><strong>${length}</strong><span>Length</span></article>
      <article><strong>${pools.length}</strong><span>Sets enabled</span></article>
      <article><strong>${strength}</strong><span>Estimated strength</span></article>
    `;
  };

  generateButton.addEventListener("click", generate);
  copyButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(output.value);
    flashButton(copyButton, "Copied", "Copy password");
    announce("Password copied.");
  });
  [lengthInput, ...Object.values(options)].forEach((node) => node.addEventListener("input", generate));
  generate();
}

function initUnitConverter() {
  const categoryInput = qs("#unitCategory");
  const valueInput = qs("#unitValue");
  const fromInput = qs("#unitFrom");
  const toInput = qs("#unitTo");
  const result = qs("#unitResult");
  if (!categoryInput || !valueInput || !fromInput || !toInput || !result) return;

  const config = {
    length: {
      options: { meter: 1, kilometer: 1000, mile: 1609.34, foot: 0.3048 },
      convert: (value, from, to) => (value * config.length.options[from]) / config.length.options[to],
    },
    weight: {
      options: { kilogram: 1, gram: 0.001, pound: 0.453592, ounce: 0.0283495 },
      convert: (value, from, to) => (value * config.weight.options[from]) / config.weight.options[to],
    },
    temperature: {
      options: { celsius: "Celsius", fahrenheit: "Fahrenheit", kelvin: "Kelvin" },
      convert: (value, from, to) => convertTemperature(value, from, to),
    },
  };

  const populate = () => {
    const current = config[categoryInput.value];
    const optionEntries = Object.entries(current.options);
    fromInput.innerHTML = optionEntries.map(([key, label]) => `<option value="${key}">${typeof label === "string" ? label : titleCase(key)}</option>`).join("");
    toInput.innerHTML = fromInput.innerHTML;
    toInput.selectedIndex = Math.min(1, optionEntries.length - 1);
    render();
  };

  const render = () => {
    const current = config[categoryInput.value];
    const value = Number(valueInput.value) || 0;
    const converted = current.convert(value, fromInput.value, toInput.value);
    result.textContent = `${value} ${titleCase(fromInput.value)} = ${formatNumber(converted)} ${titleCase(toInput.value)}`;
  };

  categoryInput.addEventListener("change", populate);
  [valueInput, fromInput, toInput].forEach((node) => node.addEventListener("input", render));
  populate();
}

function initReadingTime() {
  const input = qs("#readingInput");
  const stats = qs("#readingStats");
  if (!input || !stats) return;

  const render = () => {
    const text = input.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;
    const readingMinutes = words / 220;
    const speakingMinutes = words / 130;
    const paragraphs = text ? text.split(/\n\s*\n/).filter(Boolean).length : 0;
    stats.innerHTML = `
      <article><strong>${words}</strong><span>Words</span></article>
      <article><strong>${chars}</strong><span>Characters</span></article>
      <article><strong>${formatMinutes(readingMinutes)}</strong><span>Reading time</span></article>
      <article><strong>${formatMinutes(speakingMinutes)}</strong><span>Speaking time</span></article>
      <article><strong>${paragraphs}</strong><span>Paragraphs</span></article>
    `;
  };

  input.addEventListener("input", render);
  render();
}

function initInvoiceCalculator() {
  const taxInput = qs("#invoiceTax");
  const discountInput = qs("#invoiceDiscount");
  const list = qs("#invoiceList");
  const summary = qs("#invoiceSummary");
  const addButton = qs("#addInvoiceItem");
  if (!taxInput || !discountInput || !list || !summary || !addButton) return;

  const items = [
    { label: "Landing page design", qty: 1, rate: 450 },
    { label: "Copy editing", qty: 2, rate: 120 },
  ];

  const renderItems = () => {
    list.innerHTML = "";
    items.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "invoice-row";
      row.innerHTML = `
        <label class="control">
          <span>Item</span>
          <input value="${escapeAttribute(item.label)}" data-item-field="label" data-item-index="${index}" />
        </label>
        <label class="control">
          <span>Qty</span>
          <input type="number" min="0" value="${item.qty}" data-item-field="qty" data-item-index="${index}" />
        </label>
        <label class="control">
          <span>Rate</span>
          <input type="number" min="0" value="${item.rate}" data-item-field="rate" data-item-index="${index}" />
        </label>
        <button class="icon-button" type="button" data-remove-item="${index}">Remove</button>
      `;
      list.appendChild(row);
    });

    qsa("[data-item-field]", list).forEach((input) => {
      input.addEventListener("input", () => {
        const index = Number(input.dataset.itemIndex);
        const field = input.dataset.itemField;
        items[index][field] = field === "label" ? input.value : Number(input.value) || 0;
        renderSummary();
      });
    });

    qsa("[data-remove-item]", list).forEach((button) => {
      button.addEventListener("click", () => {
        items.splice(Number(button.dataset.removeItem), 1);
        renderItems();
        renderSummary();
      });
    });
  };

  const renderSummary = () => {
    const subtotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);
    const tax = subtotal * ((Number(taxInput.value) || 0) / 100);
    const discount = subtotal * ((Number(discountInput.value) || 0) / 100);
    const total = subtotal + tax - discount;

    summary.innerHTML = `
      <div class="metric-row">
        <article><strong>$${subtotal.toFixed(2)}</strong><span>Subtotal</span></article>
        <article><strong>$${tax.toFixed(2)}</strong><span>Tax</span></article>
        <article><strong>$${discount.toFixed(2)}</strong><span>Discount</span></article>
        <article><strong>$${total.toFixed(2)}</strong><span>Total</span></article>
      </div>
    `;
  };

  addButton.addEventListener("click", () => {
    items.push({ label: "New service", qty: 1, rate: 0 });
    renderItems();
    renderSummary();
  });
  [taxInput, discountInput].forEach((node) => node.addEventListener("input", renderSummary));
  renderItems();
  renderSummary();
}

function initAiWritingAssistant() {
  const input = qs("#aiTextInput");
  const analyzeButton = qs("#analyzeAiText");
  const summary = qs("#aiAnalysisSummary");
  const notes = qs("#aiAnalysisNotes");
  const output = qs("#humanizedOutput");
  const rewriteButtons = qsa(".rewrite-style");
  if (!input || !analyzeButton || !summary || !notes || !output || !rewriteButtons.length) return;

  const analyze = () => {
    const text = input.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const sentences = text ? text.split(/[.!?]+/).filter(Boolean) : [];
    const avgSentence = sentences.length ? words / sentences.length : 0;
    const repeatedTransitions = countMatches(text.toLowerCase(), ["moreover", "furthermore", "in conclusion", "overall", "additionally"]);
    const repeatedPhrases = countRepeatedPhrases(text);
    const punctuationDensity = countMatches(text, [":", ";", " - ", "--"]);
    const aiLikelihood = Math.min(
      100,
      Math.round(avgSentence * 2 + repeatedTransitions * 8 + repeatedPhrases * 12 + punctuationDensity * 4),
    );

    summary.innerHTML = `
      <div class="metric-row">
        <article><strong>${words}</strong><span>Words</span></article>
        <article><strong>${Math.round(avgSentence || 0)}</strong><span>Avg sentence length</span></article>
        <article><strong>${aiLikelihood}%</strong><span>Pattern score</span></article>
      </div>
    `;

    notes.value = [
      "This is only a heuristic writing analysis, not a reliable detector.",
      repeatedTransitions ? `Detected ${repeatedTransitions} common transition phrases that can make writing feel formulaic.` : "Transition phrasing looks balanced.",
      repeatedPhrases ? `Found ${repeatedPhrases} repeated phrase patterns that may feel repetitive.` : "No heavy repeated phrase pattern detected.",
      avgSentence > 22 ? "Sentence length is on the longer side. Shorter sentences may feel more natural." : "Sentence length is fairly readable.",
      "Best improvement path: vary sentence rhythm, add concrete specifics, and reduce generic filler.",
    ].join("\n\n");
    announce("Writing analysis updated.");
  };

  const rewrite = (style) => {
    const text = input.value.trim();
    if (!text) {
      output.value = "";
      return;
    }

    let rewritten = text
      .replace(/\bmoreover\b/gi, "also")
      .replace(/\bfurthermore\b/gi, "and")
      .replace(/\bin conclusion\b/gi, "to sum up")
      .replace(/\butilize\b/gi, "use")
      .replace(/\bapproximately\b/gi, "about")
      .replace(/\btherefore\b/gi, "so");

    if (style === "conversational") {
      rewritten = rewritten
        .replace(/\bhowever\b/gi, "but")
        .replace(/\bdo not\b/gi, "don't")
        .replace(/\bcannot\b/gi, "can't");
    }

    if (style === "plain") {
      rewritten = rewritten
        .split(". ")
        .map((sentence) => sentence.trim())
        .filter(Boolean)
        .map((sentence) => (sentence.length > 110 ? `${sentence.slice(0, 107)}...` : sentence))
        .join(". ");
    }

    if (style === "professional") {
      rewritten = rewritten
        .replace(/\bdon't\b/gi, "do not")
        .replace(/\bcan't\b/gi, "cannot")
        .replace(/\bso\b/gi, "therefore");
    }

    output.value = rewritten;
    announce(`Text rewritten in ${style} style.`);
  };

  analyzeButton.addEventListener("click", analyze);
  rewriteButtons.forEach((button) => {
    button.addEventListener("click", () => rewrite(button.dataset.rewriteStyle));
  });
  analyze();
}

function initCardValidator() {
  const input = qs("#cardInput");
  const summary = qs("#cardValidationSummary");
  const maskToggle = qs("#maskCardPreview");
  if (!input || !summary || !maskToggle) return;

  const render = () => {
    const raw = input.value.replace(/\D/g, "");
    const formatted = raw.replace(/(.{4})/g, "$1 ").trim();
    const masked = raw.length > 4 ? `${"*".repeat(Math.max(0, raw.length - 4))}${raw.slice(-4)}` : raw;
    const isValidLength = raw.length >= 12 && raw.length <= 19;
    const passesLuhn = isValidLength ? runLuhn(raw) : false;
    const brand = detectCardBrand(raw);
    const preview = maskToggle.checked ? masked.replace(/(.{4})/g, "$1 ").trim() : formatted;

    summary.innerHTML = `
      <div class="metric-row">
        <article><strong>${brand}</strong><span>Detected brand</span></article>
        <article><strong>${raw.length || 0}</strong><span>Digits</span></article>
        <article><strong>${passesLuhn ? "Pass" : "Check"}</strong><span>Luhn result</span></article>
      </div>
      <div class="goal-banner">
        Preview: ${escapeHtml(preview || "No number entered")}
      </div>
      <div class="goal-banner">
        This tool only formats and validates numbers. It does not generate live payment cards.
      </div>
    `;
  };

  input.addEventListener("input", render);
  maskToggle.addEventListener("input", render);
  render();
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

function buildBioHtml(values, links) {
  const styleMap = {
    solid: `background:${values.accent};color:white;border:0;`,
    soft: `background:${hexToRgba(values.accent, 0.16)};color:white;border:1px solid rgba(255,255,255,0.14);`,
    outline: `background:transparent;color:white;border:1px solid ${values.accent};`,
  };
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
    a { display:block; padding:14px; border-radius:14px; text-decoration:none; font-weight:700; margin-bottom:10px; ${styleMap[values.buttonStyle]} }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="avatar">${escapeHtml(values.name.split(" ").map((part) => part[0] || "").slice(0, 2).join("").toUpperCase())}</div>
    <div>
      <h1>${escapeHtml(values.name)}</h1>
      <p>${escapeHtml(values.handle)}</p>
    </div>
    <p>${escapeHtml(values.description)}</p>
    <div>${links.map((link) => `<a href="${escapeAttribute(link.url)}">${escapeHtml(link.label)}</a>`).join("")}</div>
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

function formatMinutes(value) {
  if (!value || value < 1) return "<1 min";
  return `${Math.ceil(value)} min`;
}

function titleCase(value) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatNumber(value) {
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 3 });
}

function convertTemperature(value, from, to) {
  let celsius = value;
  if (from === "fahrenheit") celsius = ((value - 32) * 5) / 9;
  if (from === "kelvin") celsius = value - 273.15;
  if (to === "celsius") return celsius;
  if (to === "fahrenheit") return (celsius * 9) / 5 + 32;
  if (to === "kelvin") return celsius + 273.15;
  return value;
}

function runLuhn(number) {
  let sum = 0;
  let shouldDouble = false;
  for (let i = number.length - 1; i >= 0; i -= 1) {
    let digit = Number(number[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function detectCardBrand(number) {
  if (/^4/.test(number)) return "Visa-like";
  if (/^(5[1-5]|2[2-7])/.test(number)) return "Mastercard-like";
  if (/^3[47]/.test(number)) return "Amex-like";
  if (/^6(?:011|5)/.test(number)) return "Discover-like";
  return number ? "Unknown" : "No input";
}

function countMatches(text, patterns) {
  return patterns.reduce((total, pattern) => {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = text.match(new RegExp(escaped, "g"));
    return total + (matches ? matches.length : 0);
  }, 0);
}

function countRepeatedPhrases(text) {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  const seen = new Map();
  for (let i = 0; i < words.length - 2; i += 1) {
    const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
    seen.set(phrase, (seen.get(phrase) || 0) + 1);
  }
  let repeats = 0;
  seen.forEach((count) => {
    if (count > 1) repeats += 1;
  });
  return repeats;
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const bigint = Number.parseInt(clean, 16);
  const red = (bigint >> 16) & 255;
  const green = (bigint >> 8) & 255;
  const blue = bigint & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function announce(message) {
  const liveRegion = qs("#liveRegion");
  if (!liveRegion) return;
  liveRegion.textContent = "";
  window.setTimeout(() => {
    liveRegion.textContent = message;
  }, 10);
}

function animateCounter(node, target, suffix = "") {
  const state = { value: 0 };
  animate(state, { value: target }, {
    duration: 1,
    easing: "ease-out",
    onUpdate: (latest) => {
      node.textContent = `${Math.round(latest.value)}${suffix}`;
    },
  });
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
