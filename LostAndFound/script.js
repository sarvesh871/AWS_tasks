/* ====================================================================
   LOST & FOUND PORTAL — APPLICATION LOGIC
   Organized into small, single-purpose functions.
==================================================================== */

/* -------------------------------------------------------------
   CONFIG
---------------------------------------------------------------- */
const API_BASE = "https://rycihqz0t0.execute-api.ap-south-1.amazonaws.com/dev";

/* -------------------------------------------------------------
   DOM REFERENCES
---------------------------------------------------------------- */
const dom = {
  // Navbar
  navbar: document.getElementById("navbar"),
  navToggle: document.getElementById("navToggle"),
  navLinks: document.getElementById("navLinks"),

  // Hero
  statTotal: document.getElementById("statTotal"),

  // Report form
  reportForm: document.getElementById("reportForm"),
  itemImageInput: document.getElementById("itemImage"),
  uploadDropzone: document.getElementById("uploadDropzone"),
  uploadPlaceholder: document.getElementById("uploadPlaceholder"),
  imagePreview: document.getElementById("imagePreview"),
  removeImageBtn: document.getElementById("removeImageBtn"),
  itemNameInput: document.getElementById("itemName"),
  itemLocationInput: document.getElementById("itemLocation"),
  concernPersonInput: document.getElementById("concernPerson"),
  submitReportBtn: document.getElementById("submitReportBtn"),
  errorImage: document.getElementById("errorImage"),
  errorItemName: document.getElementById("errorItemName"),
  errorItemLocation: document.getElementById("errorItemLocation"),
  errorConcernPerson: document.getElementById("errorConcernPerson"),

  // Search
  searchInput: document.getElementById("searchInput"),
  searchBtn: document.getElementById("searchBtn"),
  clearSearchBtn: document.getElementById("clearSearchBtn"),

  // Items grid
  itemsGrid: document.getElementById("itemsGrid"),
  itemsLoading: document.getElementById("itemsLoading"),
  itemsEmpty: document.getElementById("itemsEmpty"),
  refreshBtn: document.getElementById("refreshBtn"),

  // Overlays
  globalLoader: document.getElementById("globalLoader"),
  toastContainer: document.getElementById("toastContainer"),

  // Delete modal
  confirmModal: document.getElementById("confirmModal"),
  cancelDeleteBtn: document.getElementById("cancelDeleteBtn"),
  confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),

  // Footer
  footerYear: document.getElementById("footerYear"),
};

/* -------------------------------------------------------------
   STATE
---------------------------------------------------------------- */
const state = {
  selectedFile: null, // File object chosen by the user
  pendingDeleteId: null, // itemId queued for deletion
};

/* -------------------------------------------------------------
   INIT
---------------------------------------------------------------- */
function init() {
  dom.footerYear.textContent = new Date().getFullYear();

  bindNavbarEvents();
  bindUploadEvents();
  bindFormEvents();
  bindSearchEvents();
  bindGridEvents();
  bindModalEvents();

  loadItems();
}

document.addEventListener("DOMContentLoaded", init);

/* ================================================================
   NAVBAR
================================================================= */
function bindNavbarEvents() {
  // Add a subtle shadow once the page is scrolled
  window.addEventListener("scroll", () => {
    dom.navbar.classList.toggle("is-scrolled", window.scrollY > 8);
  });

  // Mobile menu toggle
  dom.navToggle.addEventListener("click", () => {
    dom.navLinks.classList.toggle("is-open");
  });

  // Close mobile menu after a link is tapped
  dom.navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => dom.navLinks.classList.remove("is-open"));
  });
}

/* ================================================================
   IMAGE UPLOAD UI (preview, drag & drop, remove)
================================================================= */
function bindUploadEvents() {
  dom.itemImageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) previewImage(file);
  });

  // Drag & drop support
  ["dragenter", "dragover"].forEach((evt) => {
    dom.uploadDropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dom.uploadDropzone.classList.add("is-dragover");
    });
  });

  ["dragleave", "drop"].forEach((evt) => {
    dom.uploadDropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dom.uploadDropzone.classList.remove("is-dragover");
    });
  });

  dom.uploadDropzone.addEventListener("drop", (e) => {
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      dom.itemImageInput.files = e.dataTransfer.files;
      previewImage(file);
    }
  });

  dom.removeImageBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearImageSelection();
  });
}

/**
 * Show a local preview of the selected image file.
 */
function previewImage(file) {
  state.selectedFile = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    dom.imagePreview.src = e.target.result;
    dom.imagePreview.hidden = false;
    dom.uploadPlaceholder.hidden = true;
    dom.removeImageBtn.hidden = false;
  };
  reader.readAsDataURL(file);

  clearFieldError("errorImage");
}

/**
 * Reset the upload field back to its empty state.
 */
function clearImageSelection() {
  state.selectedFile = null;
  dom.itemImageInput.value = "";
  dom.imagePreview.src = "";
  dom.imagePreview.hidden = true;
  dom.uploadPlaceholder.hidden = false;
  dom.removeImageBtn.hidden = true;
}

/* ================================================================
   REPORT FORM — VALIDATION + SUBMISSION FLOW
================================================================= */
function bindFormEvents() {
  dom.reportForm.addEventListener("submit", handleReportSubmit);
}

/**
 * Validate required fields. Returns true if the form is valid.
 */
function validateReportForm() {
  let isValid = true;

  if (!state.selectedFile) {
    setFieldError("errorImage", "Please add a photo of the item.");
    isValid = false;
  } else {
    clearFieldError("errorImage");
  }

  if (!dom.itemNameInput.value.trim()) {
    setFieldError("errorItemName", "Item name is required.");
    isValid = false;
  } else {
    clearFieldError("errorItemName");
  }

  if (!dom.itemLocationInput.value.trim()) {
    setFieldError("errorItemLocation", "Location is required.");
    isValid = false;
  } else {
    clearFieldError("errorItemLocation");
  }

  if (!dom.concernPersonInput.value.trim()) {
    setFieldError("errorConcernPerson", "Contact person is required.");
    isValid = false;
  } else {
    clearFieldError("errorConcernPerson");
  }

  return isValid;
}

function setFieldError(errorId, message) {
  const el = document.getElementById(errorId);
  el.textContent = message;
  el.closest(".field, .upload-field")?.classList.add("has-error");
}

function clearFieldError(errorId) {
  const el = document.getElementById(errorId);
  el.textContent = "";
  el.closest(".field, .upload-field")?.classList.remove("has-error");
}

/**
 * Full submit flow: validate -> get upload URL -> PUT image to S3 ->
 * POST report metadata -> refresh grid.
 */
async function handleReportSubmit(e) {
  e.preventDefault();

  if (!validateReportForm()) {
    showToast("warning", "Missing details", "Please fill in every field and add a photo.");
    return;
  }

  setSubmitButtonBusy(true);

  try {
    // Step 1: extract extension from the selected file's name
    const extension = getFileExtension(state.selectedFile.name);

    // Step 2: ask the backend for a pre-signed upload URL
    const uploadData = await requestUploadUrl(extension);

    // Step 3: upload the raw image file straight to S3
    await uploadImage(uploadData.uploadUrl, state.selectedFile);

    // Step 4: only after a successful upload, save the item metadata
    await submitReport({
      itemId: uploadData.itemId,
      itemName: dom.itemNameInput.value.trim(),
      location: dom.itemLocationInput.value.trim(),
      concernPerson: dom.concernPersonInput.value.trim(),
      imageKey: uploadData.imageKey,
      imageUrl: uploadData.imageUrl,
    });

    showToast("success", "Item reported", "Thanks — it's now visible on the shelf.");
    resetReportForm();
    loadItems();
  } catch (err) {
    console.error(err);
    showToast("error", "Couldn't submit report", friendlyErrorMessage(err));
  } finally {
    setSubmitButtonBusy(false);
  }
}

/**
 * Pull the file extension (without the dot) from a filename.
 */
function getFileExtension(filename) {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "jpg";
}

/**
 * POST /upload-url?extension=... -> { itemId, imageKey, imageUrl, uploadUrl }
 */
async function requestUploadUrl(extension) {
  const res = await fetch(`${API_BASE}/upload-url?extension=${encodeURIComponent(extension)}`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Could not prepare the image upload. Please try again.");
  }

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error("Could not prepare the image upload. Please try again.");
  }

  return json.data;
}

/**
 * PUT the raw image file directly to the pre-signed S3 URL.
 */
async function uploadImage(uploadUrl, file) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });

  if (!res.ok) {
    throw new Error("The image upload failed. Please try a different photo.");
  }
}

/**
 * POST /report with item metadata.
 */
async function submitReport(payload) {
  const res = await fetch(`${API_BASE}/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("The report could not be saved. Please try again.");
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error("The report could not be saved. Please try again.");
  }

  return json;
}

function setSubmitButtonBusy(isBusy) {
  const label = dom.submitReportBtn.querySelector(".btn__label");
  const spinner = dom.submitReportBtn.querySelector(".btn__spinner");

  dom.submitReportBtn.disabled = isBusy;
  label.hidden = isBusy;
  spinner.hidden = !isBusy;
}

function resetReportForm() {
  dom.reportForm.reset();
  clearImageSelection();
  ["errorImage", "errorItemName", "errorItemLocation", "errorConcernPerson"].forEach(clearFieldError);
}

/* ================================================================
   SEARCH
================================================================= */
function bindSearchEvents() {
  dom.searchBtn.addEventListener("click", () => searchItems());

  dom.searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchItems();
    }
  });

  dom.searchInput.addEventListener("input", () => {
    dom.clearSearchBtn.hidden = dom.searchInput.value.trim() === "";
  });

  dom.clearSearchBtn.addEventListener("click", () => {
    dom.searchInput.value = "";
    dom.clearSearchBtn.hidden = true;
    loadItems();
  });
}

/**
 * Search by item name, or fall back to loading every item
 * when the search box is empty.
 */
async function searchItems() {
  const query = dom.searchInput.value.trim();

  if (!query) {
    loadItems();
    return;
  }

  showItemsLoading();

  try {
    const res = await fetch(`${API_BASE}/item?name=${encodeURIComponent(query)}`);

    if (!res.ok) {
      throw new Error("Search failed. Please try again.");
    }

    const json = await res.json();
    renderItems(json.success ? json.data : []);
  } catch (err) {
    console.error(err);
    showToast("error", "Search failed", friendlyErrorMessage(err));
    renderItems([]);
  }
}

/* ================================================================
   ITEMS GRID — LOAD, RENDER, DELETE
================================================================= */
function bindGridEvents() {
  dom.refreshBtn.addEventListener("click", () => {
    dom.searchInput.value = "";
    dom.clearSearchBtn.hidden = true;
    loadItems();
  });

  // Event delegation for delete buttons on dynamically rendered cards
  dom.itemsGrid.addEventListener("click", (e) => {
    const deleteBtn = e.target.closest(".item-card__delete");
    if (deleteBtn) {
      openDeleteModal(deleteBtn.dataset.itemId);
    }
  });
}

/**
 * GET /items -> render every reported item.
 */
async function loadItems() {
  showItemsLoading();

  try {
    const res = await fetch(`${API_BASE}/items`);

    if (!res.ok) {
      throw new Error("Could not load items right now.");
    }

    const json = await res.json();
    renderItems(json.success ? json.data : []);
  } catch (err) {
    console.error(err);
    showToast("error", "Couldn't load items", friendlyErrorMessage(err));
    renderItems([]);
  }
}

function showItemsLoading() {
  dom.itemsLoading.hidden = false;
  dom.itemsEmpty.hidden = true;
  dom.itemsGrid.hidden = true;
  dom.itemsGrid.innerHTML = "";
}

/**
 * Render an array of item objects into the grid.
 * Handles the empty state automatically.
 */
function renderItems(items) {
  dom.itemsLoading.hidden = true;

  dom.statTotal.textContent = Array.isArray(items) ? items.length : 0;

  if (!Array.isArray(items) || items.length === 0) {
    dom.itemsEmpty.hidden = false;
    dom.itemsGrid.hidden = true;
    dom.itemsGrid.innerHTML = "";
    return;
  }

  dom.itemsEmpty.hidden = true;
  dom.itemsGrid.hidden = false;

  dom.itemsGrid.innerHTML = items.map(buildItemCardHTML).join("");
}

/**
 * Build the HTML markup for a single item card.
 */
function buildItemCardHTML(item) {
  const id = item.itemId || item.id || "";
  const name = escapeHtml(item.itemName || "Unnamed item");
  const location = escapeHtml(item.location || "Unknown");
  const concernPerson = escapeHtml(item.concernPerson || "Front desk");
  const imageUrl = item.imageUrl || "";
  const createdDate = formatDate(item.createdAt || item.created_at || item.timestamp);

  const media = imageUrl
    ? `<img src="${escapeHtml(imageUrl)}" alt="${name}" loading="lazy" />`
    : `<div class="no-image"><i class="fa-solid fa-image"></i></div>`;

  return `
    <article class="item-card">
      <div class="item-card__media">
        ${media}
        <span class="item-card__badge"><i class="fa-solid fa-circle"></i> Available</span>
        <button class="item-card__delete" data-item-id="${escapeHtml(id)}" aria-label="Delete ${name}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
      <div class="item-card__body">
        <h3 class="item-card__name">${name}</h3>
        <div class="item-card__meta">
          <i class="fa-solid fa-location-dot"></i>
          <span>${location}</span>
        </div>
        <div class="item-card__meta">
          <i class="fa-solid fa-user"></i>
          <span>${concernPerson}</span>
        </div>
        <div class="item-card__date">Reported ${createdDate}</div>
      </div>
    </article>
  `;
}

/* ================================================================
   DELETE CONFIRMATION MODAL
================================================================= */
function bindModalEvents() {
  dom.cancelDeleteBtn.addEventListener("click", closeDeleteModal);

  dom.confirmModal.addEventListener("click", (e) => {
    if (e.target === dom.confirmModal) closeDeleteModal();
  });

  dom.confirmDeleteBtn.addEventListener("click", async () => {
    if (!state.pendingDeleteId) return;
    await deleteItem(state.pendingDeleteId);
    closeDeleteModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !dom.confirmModal.hidden) closeDeleteModal();
  });
}

function openDeleteModal(itemId) {
  state.pendingDeleteId = itemId;
  dom.confirmModal.hidden = false;
}

function closeDeleteModal() {
  state.pendingDeleteId = null;
  dom.confirmModal.hidden = true;
}

/**
 * DELETE /item?id=itemId -> remove the matching card without a page refresh.
 */
async function deleteItem(itemId) {
  showLoader();

  try {
    const res = await fetch(`${API_BASE}/item?id=${encodeURIComponent(itemId)}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Could not delete this item. Please try again.");
    }

    // Remove the card from the DOM directly, no full reload needed
    const card = dom.itemsGrid.querySelector(`[data-item-id="${cssEscape(itemId)}"]`)?.closest(".item-card");
    if (card) {
      card.style.transition = "opacity 0.25s ease, transform 0.25s ease";
      card.style.opacity = "0";
      card.style.transform = "scale(0.95)";
      setTimeout(() => {
        card.remove();
        const remaining = dom.itemsGrid.querySelectorAll(".item-card").length;
        dom.statTotal.textContent = remaining;
        if (remaining === 0) {
          dom.itemsEmpty.hidden = false;
          dom.itemsGrid.hidden = true;
        }
      }, 250);
    }

    showToast("success", "Item removed", "The report has been deleted from the shelf.");
  } catch (err) {
    console.error(err);
    showToast("error", "Delete failed", friendlyErrorMessage(err));
  } finally {
    hideLoader();
  }
}

/* ================================================================
   GLOBAL LOADER
================================================================= */
function showLoader() {
  dom.globalLoader.hidden = false;
}

function hideLoader() {
  dom.globalLoader.hidden = true;
}

/* ================================================================
   TOASTS
================================================================= */
const TOAST_ICONS = {
  success: "fa-circle-check",
  error: "fa-circle-exclamation",
  warning: "fa-triangle-exclamation",
};

const TOAST_TITLES = {
  success: "Success",
  error: "Error",
  warning: "Heads up",
};

/**
 * Show an auto-dismissing toast notification.
 * type: "success" | "error" | "warning"
 */
function showToast(type, title, message, duration = 4200) {
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${TOAST_ICONS[type] || TOAST_ICONS.success} toast__icon"></i>
    <div class="toast__body">
      <span class="toast__title">${escapeHtml(title || TOAST_TITLES[type] || "")}</span>
      <span class="toast__message">${escapeHtml(message || "")}</span>
    </div>
    <button class="toast__close" aria-label="Dismiss notification">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;

  dom.toastContainer.appendChild(toast);

  const removeToast = () => {
    toast.classList.add("is-leaving");
    setTimeout(() => toast.remove(), 250);
  };

  toast.querySelector(".toast__close").addEventListener("click", removeToast);
  setTimeout(removeToast, duration);
}

/* ================================================================
   HELPERS
================================================================= */

/**
 * Escape user/API-supplied text before injecting into innerHTML.
 */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = String(str ?? "");
  return div.innerHTML;
}

/**
 * Escape a string for safe use inside a CSS attribute selector.
 */
function cssEscape(str) {
  return String(str).replace(/["\\]/g, "\\$&");
}

/**
 * Format an ISO date / timestamp into a short, readable string.
 */
function formatDate(value) {
  if (!value) return "recently";

  const date = typeof value === "number" ? new Date(value) : new Date(value);
  if (isNaN(date.getTime())) return "recently";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Turn thrown errors (including network failures) into a
 * friendly, user-facing message.
 */
function friendlyErrorMessage(err) {
  if (err instanceof TypeError) {
    return "Network error — please check your connection and try again.";
  }
  return err?.message || "Something went wrong. Please try again.";
}
