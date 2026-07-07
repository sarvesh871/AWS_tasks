/* ==========================================================================
   CONFIG
   ========================================================================== */
const CONFIG = {
  API_BASE: "https://svt4mi8k4e.execute-api.ap-south-1.amazonaws.com",
  LIBRARY_REFRESH_DELAY: 3000
};

/* ==========================================================================
   STATE
   ========================================================================== */
let selectedFile = null;
let storiesCache = [];
let isUploading = false;

/* ==========================================================================
   DOM REFERENCES
   ========================================================================== */
const dropzone = document.getElementById("dropzone");
const dropzoneContent = document.getElementById("dropzoneContent");
const dropzoneFile = document.getElementById("dropzoneFile");
const fileInput = document.getElementById("fileInput");
const fileNameEl = document.getElementById("fileName");
const uploadBtn = document.getElementById("uploadBtn");

const progressWrap = document.getElementById("progressWrap");
const progressFill = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");

const storyGrid = document.getElementById("storyGrid");
const emptyState = document.getElementById("emptyState");

const modalOverlay = document.getElementById("modalOverlay");
const modal = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");
const modalTitle = document.getElementById("modalTitle");
const modalVoice = document.getElementById("modalVoice");
const modalDate = document.getElementById("modalDate");
const modalAudio = document.getElementById("modalAudio");
const modalStoryText = document.getElementById("modalStoryText");
const modalTextSpinner = document.getElementById("modalTextSpinner");

const loadingOverlay = document.getElementById("loadingOverlay");
const toastContainer = document.getElementById("toastContainer");

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initDropzone();
  initUploadButton();
  initModalControls();
  loadStories();
});

/* ==========================================================================
   DROPZONE / FILE SELECTION
   ========================================================================== */
function initDropzone() {
  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  });

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dropzone--drag");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dropzone--drag");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dropzone--drag");
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelection(file);
  });
}

function handleFileSelection(file) {
  if (!file.name.toLowerCase().endsWith(".txt")) {
    showToast("error", "Please choose a .txt file only.");
    return;
  }

  selectedFile = file;
  fileNameEl.textContent = file.name;
  dropzoneContent.classList.add("hidden");
  dropzoneFile.classList.remove("hidden");
  uploadBtn.disabled = false;
}

/* ==========================================================================
   UPLOAD WORKFLOW
   ========================================================================== */
function initUploadButton() {
  uploadBtn.addEventListener("click", () => {
    if (!selectedFile || isUploading) return;
    runUploadWorkflow(selectedFile);
  });
}

async function runUploadWorkflow(file) {
  isUploading = true;
  uploadBtn.disabled = true;
  showProgress(0, "Preparing upload...");

  try {
    const { uploadUrl } = await requestUploadUrl();

    await uploadFileToS3(uploadUrl, file, (percent) => {
      showProgress(percent, `Uploading... ${percent}%`);
    });

    showProgress(100, "Story uploaded successfully.");
    showToast("success", "Story uploaded successfully.");

    setTimeout(() => {
      resetUploadForm();
      loadStories();
    }, CONFIG.LIBRARY_REFRESH_DELAY);
  } catch (error) {
    console.error("Upload workflow error:", error);
    showToast("error", "Story upload failed. Please try again.");
    progressWrap.classList.add("hidden");
    uploadBtn.disabled = false;
  } finally {
    isUploading = false;
  }
}

function resetUploadForm() {
  selectedFile = null;
  fileInput.value = "";
  dropzoneContent.classList.remove("hidden");
  dropzoneFile.classList.add("hidden");
  progressWrap.classList.add("hidden");
  progressFill.style.width = "0%";
  uploadBtn.disabled = true;
}

function showProgress(percent, label) {
  progressWrap.classList.remove("hidden");
  progressFill.style.width = `${percent}%`;
  progressLabel.textContent = label;
}

/* ==========================================================================
   API CALLS
   ========================================================================== */
async function requestUploadUrl() {
  const response = await fetch(`${CONFIG.API_BASE}/upload-url`, {
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Failed to obtain upload URL");
  }

  return response.json();
}

// Uses XMLHttpRequest instead of fetch so we can report real upload progress
function uploadFileToS3(uploadUrl, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", "text/plain");

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    });

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error("S3 upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));

    xhr.send(file);
  });
}

async function fetchStories() {
  const response = await fetch(`${CONFIG.API_BASE}/stories`);
  if (!response.ok) {
    throw new Error("Failed to fetch stories");
  }
  return response.json();
}

async function fetchStoryText(textUrl) {
  const response = await fetch(textUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch story text");
  }
  return response.text();
}

/* ==========================================================================
   STORY LIBRARY
   ========================================================================== */
async function loadStories() {
  showLoadingOverlay();

  try {
    const stories = await fetchStories();
    storiesCache = Array.isArray(stories) ? sortStoriesByNewest(stories) : [];
    renderStories(storiesCache);
  } catch (error) {
    console.error("Load stories error:", error);
    showToast("error", "Unable to load the story library.");
  } finally {
    hideLoadingOverlay();
  }
}

function sortStoriesByNewest(stories) {
  return [...stories].sort((a, b) => (b.uploadTimestamp || 0) - (a.uploadTimestamp || 0));
}

function renderStories(stories) {
  storyGrid.innerHTML = "";

  if (!stories || stories.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  stories.forEach((story, index) => {
    const card = document.createElement("div");
    card.className = "story-card";
    card.style.animationDelay = `${index * 0.06}s`;

    card.innerHTML = `
      <div class="story-card__icon-wrap">📖</div>
      <p class="story-card__title">${escapeHtml(story.title || "Untitled Story")}</p>
      <div class="story-card__meta">
        <span>🎙️ ${escapeHtml(story.voice || "Unknown voice")}</span>
        <span>📅 ${formatTimestamp(story.uploadTimestamp)}</span>
      </div>
      <div class="story-card__actions">
        <button class="btn-small btn-small--listen" data-action="listen">🔊 Listen</button>
        <button class="btn-small btn-small--read" data-action="read">📘 Read Story</button>
      </div>
    `;

    card.addEventListener("click", () => openStoryModal(story));

    storyGrid.appendChild(card);
  });
}

/* ==========================================================================
   NETFLIX-STYLE MODAL
   ========================================================================== */
function initModalControls() {
  modalClose.addEventListener("click", closeStoryModal);

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      closeStoryModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modalOverlay.classList.contains("hidden")) {
      closeStoryModal();
    }
  });
}

async function openStoryModal(story) {
  modalTitle.textContent = story.title || "Untitled Story";
  modalVoice.textContent = `🎙️ ${story.voice || "Unknown voice"}`;
  modalDate.textContent = `📅 ${formatTimestamp(story.uploadTimestamp)}`;

  modalAudio.src = story.audioUrl || "";
  modalStoryText.innerHTML = "";
  modalStoryText.appendChild(modalTextSpinner);
  modalTextSpinner.classList.remove("hidden");

  modalOverlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  if (story.textUrl) {
    try {
      const text = await fetchStoryText(story.textUrl);
      modalStoryText.textContent = text;
    } catch (error) {
      console.error("Story text fetch error:", error);
      modalStoryText.textContent = "";
      showToast("error", "Unable to load the story text.");
      modalStoryText.innerHTML = `<p>Sorry, this story's text could not be loaded.</p>`;
    }
  } else {
    modalStoryText.innerHTML = `<p>No story text is available.</p>`;
  }
}

function closeStoryModal() {
  modalOverlay.classList.add("hidden");
  document.body.style.overflow = "";
  modalAudio.pause();
  modalAudio.src = "";
}

/* ==========================================================================
   LOADING OVERLAY
   ========================================================================== */
function showLoadingOverlay() {
  loadingOverlay.classList.remove("hidden");
}

function hideLoadingOverlay() {
  loadingOverlay.classList.add("hidden");
}

/* ==========================================================================
   TOAST NOTIFICATIONS
   ========================================================================== */
function showToast(type, message) {
  const icon = type === "success" ? "🎉" : "⚠️";

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast--hide");
    setTimeout(() => toast.remove(), 350);
  }, 3200);
}

/* ==========================================================================
   UTILITIES
   ========================================================================== */
function formatTimestamp(timestamp) {
  if (!timestamp) return "--";
  const date = new Date(timestamp * 1000);
  if (isNaN(date.getTime())) return "--";
  return date.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
