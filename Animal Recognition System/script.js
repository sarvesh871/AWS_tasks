/* ==========================================================================
   CONFIG
   ========================================================================== */
const API_BASE_URL = "https://rebvmy210k.execute-api.ap-south-1.amazonaws.com/dev";
const MAX_POLL_RETRIES = 10;
const POLL_INTERVAL_MS = 1000;
const INITIAL_WAIT_MS = 2000;

const LOADING_MESSAGES = [
  "Uploading Image...",
  "Scanning Animals...",
  "Analyzing Image...",
  "Processing Results...",
  "Almost Done..."
];

/* ==========================================================================
   STATE
   ========================================================================== */
let selectedFile = null;
let loadingMessageInterval = null;
let historyData = [];

/* ==========================================================================
   DOM REFERENCES
   ========================================================================== */
const dropzone = document.getElementById("dropzone");
const dropzoneEmpty = document.getElementById("dropzoneEmpty");
const dropzonePreview = document.getElementById("dropzonePreview");
const fileInput = document.getElementById("fileInput");
const previewImage = document.getElementById("previewImage");
const previewFilename = document.getElementById("previewFilename");
const analyzeBtn = document.getElementById("analyzeBtn");

const resultsCard = document.getElementById("resultsCard");
const totalSpeciesEl = document.getElementById("totalSpecies");
const totalAnimalsEl = document.getElementById("totalAnimals");
const analysisTimeEl = document.getElementById("analysisTime");
const resultImage = document.getElementById("resultImage");
const detectionTableBody = document.getElementById("detectionTableBody");

const historyList = document.getElementById("historyList");
const historyEmpty = document.getElementById("historyEmpty");

const loadingOverlay = document.getElementById("loadingOverlay");
const loadingMessage = document.getElementById("loadingMessage");

const toastContainer = document.getElementById("toastContainer");

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initDropzone();
  initAnalyzeButton();
  loadHistory();
});

/* ==========================================================================
   DROPZONE / FILE SELECTION
   ========================================================================== */
function initDropzone() {
  dropzone.addEventListener("click", () => fileInput.click());

  dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });

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
  const validExtensions = ["jpg", "jpeg", "png"];
  const extension = getFileExtension(file.name);

  if (!validExtensions.includes(extension)) {
    showToast("error", "Upload Failed");
    return;
  }

  selectedFile = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    previewImage.src = e.target.result;
    previewFilename.textContent = file.name;
    dropzoneEmpty.classList.add("hidden");
    dropzonePreview.classList.remove("hidden");
    analyzeBtn.disabled = false;
  };
  reader.readAsDataURL(file);
}

function getFileExtension(filename) {
  return filename.split(".").pop().toLowerCase();
}

/* ==========================================================================
   ANALYZE BUTTON / MAIN WORKFLOW
   ========================================================================== */
function initAnalyzeButton() {
  analyzeBtn.addEventListener("click", (e) => {
    createRipple(e, analyzeBtn);
    if (!selectedFile) return;
    runAnalysisWorkflow(selectedFile);
  });
}

async function runAnalysisWorkflow(file) {
  try {
    showLoadingOverlay();
    showToast("info", "Uploading Image");

    // STEP 1: Extract extension & request pre-signed upload URL
    const extension = getFileExtension(file.name);
    const uploadUrlData = await requestUploadUrl(extension);

    const { uploadUrl, imageName, imageUrl } = uploadUrlData;

    // STEP 3: Upload image directly to S3 via PUT
    await uploadImageToS3(uploadUrl, file);

    // STEP 5: Wait before polling
    await wait(INITIAL_WAIT_MS);

    // STEP 6: Poll for results
    const resultData = await pollForResults(imageName);

    // Display result
    displayResults(resultData, previewImage.src);

    hideLoadingOverlay();
    showToast("success", "Analysis Completed Successfully");

    // Refresh history to include the new analysis
    loadHistory();
  } catch (error) {
    hideLoadingOverlay();
    showToast("error", "Upload Failed");
    console.error("Analysis workflow error:", error);
  }
}

/* ==========================================================================
   API CALLS
   ========================================================================== */
async function requestUploadUrl(extension) {
  const response = await fetch(
    `${API_BASE_URL}/upload-url?extension=${encodeURIComponent(extension)}`,
    { method: "POST" }
  );

  if (!response.ok) {
    throw new Error("Failed to obtain upload URL");
  }

  const json = await response.json();

  if (!json.success) {
    throw new Error("Upload URL request unsuccessful");
  }

  return json.data;
}

async function uploadImageToS3(uploadUrl, file) {

    const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
            "Content-Type": file.type
        },
        body: file
    });

    if (!response.ok) {
        throw new Error("Failed to upload image to S3");
    }
}

async function pollForResults(imageName) {
  for (let attempt = 0; attempt < MAX_POLL_RETRIES; attempt++) {
    const response = await fetch(
      `${API_BASE_URL}/results?imageName=${encodeURIComponent(imageName)}`
    );

    if (response.status === 404) {
      await wait(POLL_INTERVAL_MS);
      continue;
    }

    if (!response.ok) {
      throw new Error("Failed to fetch results");
    }

    const json = await response.json();

    if (json.success) {
      return json.data;
    }

    await wait(POLL_INTERVAL_MS);
  }

  throw new Error("Max polling retries exceeded");
}

async function fetchHistory() {
  const response = await fetch(`${API_BASE_URL}/history`);

  if (!response.ok) {
    throw new Error("Failed to fetch history");
  }

  const json = await response.json();

  if (!json.success) {
    throw new Error("History request unsuccessful");
  }

  return json.data;
}

/* ==========================================================================
   RESULTS RENDERING
   ========================================================================== */
function displayResults(data, imageUrlFallback) {
  const animals = data.animals || [];
  const totalSpecies = animals.length;
  const totalAnimals = animals.reduce((sum, a) => sum + (a.count || 0), 0);

  totalSpeciesEl.textContent = totalSpecies;
  totalAnimalsEl.textContent = totalAnimals;
  analysisTimeEl.textContent = formatTimestamp(data.timestamp, true);

  resultImage.src = imageUrlFallback;

  renderDetectionTable(animals);

  resultsCard.classList.remove("hidden");
  resultsCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderDetectionTable(animals) {
  detectionTableBody.innerHTML = "";

  animals.forEach((animal, index) => {
    const row = document.createElement("tr");
    row.style.animationDelay = `${index * 0.08}s`;

    const confidence = Math.round(animal.confidence || 0);

    row.innerHTML = `
      <td>
        <span class="animal-name">
          <i class="bi bi-paw"></i>${escapeHtml(animal.animal)}
        </span>
      </td>
      <td>${animal.count}</td>
      <td>
        <div class="confidence-bar-track">
          <div class="confidence-bar-fill" data-confidence="${confidence}"></div>
        </div>
        <span class="confidence-label">${confidence}%</span>
      </td>
    `;

    detectionTableBody.appendChild(row);
  });

  // Animate confidence bars after render
  requestAnimationFrame(() => {
    document.querySelectorAll(".confidence-bar-fill").forEach((bar) => {
      const value = bar.getAttribute("data-confidence");
      setTimeout(() => {
        bar.style.width = `${value}%`;
      }, 100);
    });
  });
}

/* ==========================================================================
   HISTORY PANEL
   ========================================================================== */
async function loadHistory() {
  try {
    const data = await fetchHistory();
    historyData = data || [];
    renderHistory(historyData);
  } catch (error) {
    console.error("History load error:", error);
  }
}

function renderHistory(items) {
  historyList.innerHTML = "";

  if (!items || items.length === 0) {
    historyList.appendChild(historyEmpty);
    return;
  }

  items.forEach((item, index) => {
    const speciesCount = (item.animals || []).length;

    const historyItem = document.createElement("div");
    historyItem.className = "history-item";
    historyItem.style.animationDelay = `${index * 0.05}s`;

    historyItem.innerHTML = `
      <div class="history-item__thumb">
        ${
          item.imageUrl
            ? `<img src="${item.imageUrl}" alt="${escapeHtml(item.imageName)}">`
            : `<i class="bi bi-image"></i>`
        }
      </div>
      <div class="history-item__info">
        <p class="history-item__name">${escapeHtml(item.imageName)}</p>
        <p class="history-item__meta">${formatTimestamp(item.timestamp)} &middot; ${speciesCount} species</p>
      </div>
    `;

    historyItem.addEventListener("click", () => {
      displayResults(item, item.imageUrl);
    });

    historyList.appendChild(historyItem);
  });
}

/* ==========================================================================
   LOADING OVERLAY
   ========================================================================== */
function showLoadingOverlay() {
  loadingOverlay.classList.remove("hidden");
  let index = 0;
  loadingMessage.textContent = LOADING_MESSAGES[0];

  loadingMessageInterval = setInterval(() => {
    index = (index + 1) % LOADING_MESSAGES.length;
    loadingMessage.textContent = LOADING_MESSAGES[index];
  }, 1000);
}

function hideLoadingOverlay() {
  loadingOverlay.classList.add("hidden");
  clearInterval(loadingMessageInterval);
  loadingMessageInterval = null;
}

/* ==========================================================================
   TOAST NOTIFICATIONS
   ========================================================================== */
function showToast(type, message) {
  const iconMap = {
    success: "bi-check-circle-fill",
    info: "bi-info-circle-fill",
    error: "bi-exclamation-triangle-fill"
  };

  const toast = document.createElement("div");
  toast.className = `toast toast--${type === "error" ? "error" : type}`;
  toast.innerHTML = `<i class="bi ${iconMap[type]}"></i><span>${message}</span>`;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast--hide");
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

/* ==========================================================================
   BUTTON RIPPLE EFFECT
   ========================================================================== */
function createRipple(event, button) {
  const circle = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;
  const rect = button.getBoundingClientRect();

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - rect.left - radius}px`;
  circle.style.top = `${event.clientY - rect.top - radius}px`;
  circle.classList.add("ripple");

  const existingRipple = button.querySelector(".ripple");
  if (existingRipple) existingRipple.remove();

  button.appendChild(circle);
  setTimeout(() => circle.remove(), 600);
}

/* ==========================================================================
   UTILITIES
   ========================================================================== */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatTimestamp(timestamp, shortForm = false) {
  if (!timestamp) return "--";

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "--";

  if (shortForm) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
