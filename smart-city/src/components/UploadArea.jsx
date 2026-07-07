import { useCallback, useRef, useState } from "react";
import { FileImage, Loader2, UploadCloud, X } from "lucide-react";
import { uploadIncident, ApiError } from "../services/api.js";
import { ACCEPTED_IMAGE_TYPES } from "../config.js";
import "../styles/UploadArea.css";

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

function UploadArea({ sectionRef, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef(null);
  const dragCounter = useRef(0);

  const resetSelection = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setStatus("idle");
    setErrorMessage("");
  };

  const handleFiles = useCallback(
    (fileList) => {
      const selected = fileList?.[0];
      if (!selected) return;

      if (!ACCEPTED_IMAGE_TYPES.includes(selected.type)) {
        setErrorMessage("Please choose a JPG, PNG, or WEBP image.");
        setStatus("error");
        return;
      }

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setStatus("idle");
      setErrorMessage("");
    },
    [previewUrl]
  );

  const handleDrop = (event) => {
    event.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    dragCounter.current += 1;
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    setErrorMessage("");
    try {
      const { imageId } = await uploadIncident(file);
      setStatus("success");
      onUploadSuccess?.(imageId);
      setTimeout(() => {
        resetSelection();
      }, 4000);
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <section className="upload" id="upload" ref={sectionRef}>
      <div className="container">
        <div className="upload__header">
          <h2 className="upload__title">Report an Incident</h2>
          <p className="upload__subtitle">
            Upload a photo and our AI will identify and categorize the issue automatically.
          </p>
        </div>

        <div className="upload__panel glass">
          {status === "success" ? (
            <div className="upload__success">
              <svg className="upload__success-icon" viewBox="0 0 52 52" fill="none">
                <circle cx="26" cy="26" r="24" stroke="var(--color-success)" strokeWidth="2" />
                <path
                  className="upload__success-check"
                  d="M15 27L22 34L37 18"
                  stroke="var(--color-success)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h3>Incident uploaded successfully.</h3>
              <p>Refreshing the dashboard with your report…</p>
            </div>
          ) : !file ? (
            <div
              className={`upload__dropzone ${isDragging ? "upload__dropzone--active" : ""}`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                hidden
                onChange={(e) => handleFiles(e.target.files)}
              />
              <div className="upload__icon-wrap">
                <UploadCloud size={30} />
              </div>
              <p className="upload__dropzone-title">Drag & drop an image here</p>
              <p className="upload__dropzone-hint">or click to browse · JPG, JPEG, PNG, WEBP</p>
              {status === "error" && <p className="upload__error">{errorMessage}</p>}
            </div>
          ) : (
            <div className="upload__preview">
              <div className="upload__preview-image-wrap">
                <img src={previewUrl} alt="Selected incident preview" className="upload__preview-image" />
                {status !== "uploading" && (
                  <button className="upload__remove" onClick={resetSelection} aria-label="Remove image">
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="upload__meta">
                <FileImage size={18} className="upload__meta-icon" />
                <div className="upload__meta-text">
                  <span className="upload__meta-name">{file.name}</span>
                  <span className="upload__meta-size">{formatBytes(file.size)}</span>
                </div>
              </div>

              {status === "error" && <p className="upload__error">{errorMessage}</p>}

              <button
                className="upload__submit"
                onClick={handleUpload}
                disabled={status === "uploading"}
              >
                {status === "uploading" ? (
                  <>
                    <Loader2 size={18} className="upload__spinner" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <UploadCloud size={18} />
                    Upload
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default UploadArea;
