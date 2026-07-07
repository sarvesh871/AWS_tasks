// ============================================================
// CONFIGURATION
// ============================================================

const API_URL = "https://nt5jhn1tw0.execute-api.ap-south-1.amazonaws.com/prod_updated/note";

// ============================================================
// DOM REFERENCES
// ============================================================

const filenameInput       = document.getElementById("filename");
const contentInput        = document.getElementById("content");
const notesList           = document.getElementById("notesList");
const emptyState          = document.getElementById("emptyState");
const noteCount           = document.getElementById("noteCount");
const searchInput         = document.getElementById("searchInput");

const saveBtn             = document.getElementById("saveBtn");
const updateBtn           = document.getElementById("updateBtn");
const clearBtn            = document.getElementById("clearBtn");
const refreshBtn          = document.getElementById("refreshBtn");

const viewModalBackdrop   = document.getElementById("viewModalBackdrop");
const viewModalTitle      = document.getElementById("viewModalTitle");
const viewModalContent    = document.getElementById("viewModalContent");
const viewModalClose      = document.getElementById("viewModalClose");

const deleteModalBackdrop = document.getElementById("deleteModalBackdrop");
const deleteFilenameLabel = document.getElementById("deleteFilenameLabel");
const deleteCancelBtn     = document.getElementById("deleteCancelBtn");
const deleteConfirmBtn    = document.getElementById("deleteConfirmBtn");

const toastContainer      = document.getElementById("toastContainer");
const globalLoader        = document.getElementById("globalLoader");

// ============================================================
// STATE
// ============================================================

let allNotes        = [];   // full list from API
let pendingDelete   = null; // filename queued for deletion
let requestInFlight = false;

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================

/**
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {number} duration ms
 */
function showToast(message, type = "success", duration = 3000) {
  const icons = {
    success: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:   `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    warning: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info:    `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  };

  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
  toastContainer.appendChild(el);

  // Trigger animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => el.classList.add("toast-show"));
  });

  setTimeout(() => {
    el.classList.add("toast-hide");
    el.addEventListener("transitionend", () => el.remove(), { once: true });
  }, duration);
}

// ============================================================
// LOADER
// ============================================================

function showLoader() { globalLoader.classList.remove("hidden"); }
function hideLoader() { globalLoader.classList.add("hidden");    }

// ============================================================
// BUTTON STATE HELPERS
// ============================================================

function setEditorLoading(loading) {
  saveBtn.disabled   = loading;
  updateBtn.disabled = loading;
  clearBtn.disabled  = loading;
}

// ============================================================
// MODAL HELPERS
// ============================================================

function openModal(backdrop) {
  backdrop.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal(backdrop) {
  backdrop.classList.remove("open");
  document.body.style.overflow = "";
}

// Close modal on backdrop click (outside the modal box)
function handleBackdropClick(backdrop) {
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal(backdrop);
  });
}

// ESC key closes any open modal
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (viewModalBackdrop.classList.contains("open"))   closeModal(viewModalBackdrop);
  if (deleteModalBackdrop.classList.contains("open")) closeModal(deleteModalBackdrop);
});

handleBackdropClick(viewModalBackdrop);
handleBackdropClick(deleteModalBackdrop);

viewModalClose.addEventListener("click", () => closeModal(viewModalBackdrop));
deleteCancelBtn.addEventListener("click", () => closeModal(deleteModalBackdrop));

// ============================================================
// RENDER NOTES
// ============================================================

function renderNotes(notes) {
  notesList.innerHTML = "";

  if (notes.length === 0) {
    emptyState.classList.remove("hidden");
    noteCount.textContent = "0";
    return;
  }

  emptyState.classList.add("hidden");
  noteCount.textContent = notes.length;

  notes.forEach((note, index) => {
    const card = document.createElement("div");
    card.className = "note-card";
    card.style.animationDelay = `${index * 30}ms`;

    // Build a safe preview string
    const preview = (note.preview || "No preview available.")
      .trim()
      .slice(0, 160);

    // Sanitize filename for inline event (avoid XSS)
    const safeFilename = note.filename.replace(/'/g, "\\'");

    card.innerHTML = `
      <div class="note-card-header">
        <svg class="note-file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <span class="note-filename">${escapeHTML(note.filename)}</span>
      </div>
      <pre class="note-preview">${escapeHTML(preview)}</pre>
      <div class="note-card-actions">
        <button class="btn btn-secondary" onclick="viewNote('${safeFilename}')">View</button>
        <button class="btn btn-ghost"     onclick="editNote('${safeFilename}')">Edit</button>
        <button class="btn btn-danger"    onclick="confirmDelete('${safeFilename}')">Delete</button>
      </div>
    `;

    notesList.appendChild(card);
  });
}

// Simple HTML escape helper
function escapeHTML(str) {
  return String(str)
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#39;");
}

// ============================================================
// LOAD NOTES
// ============================================================

async function loadNotes() {
  if (requestInFlight) return;
  requestInFlight = true;
  showLoader();
  refreshBtn.disabled = true;

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const files = data.files || [];

    // Fetch previews for each note in parallel (up to 6 at once to avoid throttling)
    const withPreviews = await fetchPreviews(files);

    allNotes = withPreviews;
    noteCount.textContent = allNotes.length;
    filterAndRender();

  } catch (err) {
    console.error("loadNotes:", err);
    showToast("Unable to load notes. Check your connection.", "error");
  } finally {
    requestInFlight = false;
    refreshBtn.disabled = false;
    hideLoader();
  }
}

// Fetch note content for preview snippets (parallel, capped)
async function fetchPreviews(filenames) {
  const BATCH = 8;
  const results = [];

  for (let i = 0; i < filenames.length; i += BATCH) {
    const batch = filenames.slice(i, i + BATCH);
    const settled = await Promise.allSettled(
      batch.map(async (filename) => {
        const res  = await fetch(`${API_URL}?filename=${encodeURIComponent(filename)}`);
        const data = await res.json();
        return { filename: data.filename || filename, preview: data.content || "" };
      })
    );
    settled.forEach((s, idx) => {
      if (s.status === "fulfilled") {
        results.push(s.value);
      } else {
        results.push({ filename: batch[idx], preview: "" });
      }
    });
  }

  return results;
}

// ============================================================
// SEARCH / FILTER
// ============================================================

function filterAndRender() {
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    renderNotes(allNotes);
    return;
  }

  const filtered = allNotes.filter(
    (n) =>
      n.filename.toLowerCase().includes(query) ||
      n.preview.toLowerCase().includes(query)
  );

  renderNotes(filtered);

  // Update count to show filtered vs total
  noteCount.textContent = filtered.length === allNotes.length
    ? allNotes.length
    : `${filtered.length} / ${allNotes.length}`;
}

searchInput.addEventListener("input", filterAndRender);

// ============================================================
// VIEW NOTE
// ============================================================

async function viewNote(filename) {
  showLoader();

  try {
    const response = await fetch(`${API_URL}?filename=${encodeURIComponent(filename)}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    viewModalTitle.textContent   = data.filename || filename;
    viewModalContent.textContent = data.content  || "(empty)";

    openModal(viewModalBackdrop);
  } catch (err) {
    console.error("viewNote:", err);
    showToast("Unable to load note content.", "error");
  } finally {
    hideLoader();
  }
}

// ============================================================
// EDIT NOTE
// ============================================================

async function editNote(filename) {
  showLoader();
  setEditorLoading(true);

  try {
    const response = await fetch(`${API_URL}?filename=${encodeURIComponent(filename)}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    filenameInput.value = data.filename || filename;
    contentInput.value  = data.content  || "";

    // Scroll sidebar into view on mobile
    filenameInput.scrollIntoView({ behavior: "smooth", block: "nearest" });
    contentInput.focus();
  } catch (err) {
    console.error("editNote:", err);
    showToast("Unable to load note for editing.", "error");
  } finally {
    hideLoader();
    setEditorLoading(false);
  }
}

// ============================================================
// SAVE NOTE
// ============================================================

saveBtn.addEventListener("click", async () => {
  const filename = filenameInput.value.trim();
  const content  = contentInput.value.trim();

  if (!filename || !content) {
    showToast("Filename and content are required.", "warning");
    return;
  }

  setEditorLoading(true);
  showLoader();

  try {
    const response = await fetch(API_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ filename, content }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    showToast("Note saved.", "success");
    await loadNotes();
  } catch (err) {
    console.error("saveNote:", err);
    showToast("Failed to save note.", "error");
  } finally {
    setEditorLoading(false);
    hideLoader();
  }
});

// ============================================================
// UPDATE NOTE
// ============================================================

updateBtn.addEventListener("click", async () => {
  const filename = filenameInput.value.trim();
  const content  = contentInput.value.trim();

  if (!filename || !content) {
    showToast("Filename and content are required.", "warning");
    return;
  }

  setEditorLoading(true);
  showLoader();

  try {
    const response = await fetch(API_URL, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ filename, content }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    showToast("Note updated.", "success");
    await loadNotes();
  } catch (err) {
    console.error("updateNote:", err);
    showToast("Failed to update note.", "error");
  } finally {
    setEditorLoading(false);
    hideLoader();
  }
});

// ============================================================
// DELETE NOTE
// ============================================================

function confirmDelete(filename) {
  pendingDelete = filename;
  deleteFilenameLabel.textContent = filename;
  openModal(deleteModalBackdrop);
}

deleteConfirmBtn.addEventListener("click", async () => {
  if (!pendingDelete) return;

  const filename = pendingDelete;
  pendingDelete  = null;

  closeModal(deleteModalBackdrop);
  showLoader();
  deleteConfirmBtn.disabled = true;

  try {
    const response = await fetch(
      `${API_URL}?filename=${encodeURIComponent(filename)}`,
      { method: "DELETE" }
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    showToast("Note deleted.", "success");
    await loadNotes();
  } catch (err) {
    console.error("deleteNote:", err);
    showToast("Failed to delete note.", "error");
  } finally {
    deleteConfirmBtn.disabled = false;
    hideLoader();
  }
});

// ============================================================
// CLEAR EDITOR
// ============================================================

clearBtn.addEventListener("click", () => {
  filenameInput.value = "";
  contentInput.value  = "";
  filenameInput.focus();
});

// ============================================================
// REFRESH
// ============================================================

refreshBtn.addEventListener("click", loadNotes);

// ============================================================
// INIT
// ============================================================

loadNotes();
