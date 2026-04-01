"use client";

import { useState } from "react";
import { uploadManga } from "@/actions/manga";
import { useUIStore } from "@/store/uiStore";
import { useRouter } from "next/navigation";

export default function UploadForm() {
  const showToast = useUIStore((state) => state.showToast);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [cover, setCover] = useState<string | null>(null);
  const [pages, setPages] = useState<string[]>([]);

  const handleFile = (file: File, type: "cover" | "page") => {
    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("File size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === "cover") {
        setCover(result);
      } else {
        setPages((prev) => [...prev, result]);
      }
    };
    reader.readAsDataURL(file);
  };

  const removePage = (index: number) => {
    setPages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!cover) {
      showToast("Please upload a cover image");
      return;
    }
    if (pages.length === 0) {
      showToast("Please upload at least one page");
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("cover", cover);
    formData.set("pages", JSON.stringify(pages));

    const res = await uploadManga(formData);
    setLoading(false);

    if (res.success) {
      showToast("Manga published successfully! 🎉");
      router.push("/");
    } else {
      showToast(res.error || "Upload failed");
    }
  };

  return (
    <div className="upload-section active" id="uploadSection">
      <h2>UPLOAD NEW MANGA</h2>
      <form className="upload-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Manga Title *</label>
          <input type="text" name="title" placeholder="Enter manga title..." required />
        </div>

        <div className="form-group">
          <label>Author Name</label>
          <input type="text" name="author" placeholder="Your name..." />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea name="description" placeholder="Brief description of your story..."></textarea>
        </div>

        <div className="form-group">
          <label>Category</label>
          <select name="category">
            <option value="Action">Action</option>
            <option value="Romance">Romance</option>
            <option value="Comedy">Comedy</option>
            <option value="Drama">Drama</option>
            <option value="Fantasy">Fantasy</option>
            <option value="Horror">Horror</option>
            <option value="Sci-Fi">Sci-Fi</option>
          </select>
        </div>

        <div className="form-group">
          <label>Cover Image *</label>
          <div
            className={`file-drop-zone ${cover ? "has-file" : ""}`}
            onClick={() => document.getElementById("coverInput")?.click()}
          >
            <span className="icon">📷</span>
            <p style={{ fontWeight: 700, marginBottom: "5px" }}>Tap to upload cover</p>
            <p style={{ fontSize: "0.8rem", opacity: 0.7 }}>JPG, PNG (Max 5MB)</p>
            {cover && (
              <div className="preview-container">
                <div className="preview-item">
                  <img src={cover} alt="Preview" />
                  <button
                    type="button"
                    className="remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCover(null);
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
          <input
            type="file"
            id="coverInput"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0], "cover");
            }}
          />
        </div>

        <div className="form-group">
          <label>Manga Pages * (Select multiple)</label>
          <div
            className={`file-drop-zone ${pages.length > 0 ? "has-file" : ""}`}
            onClick={() => document.getElementById("pagesInput")?.click()}
          >
            <span className="icon">📑</span>
            <p style={{ fontWeight: 700, marginBottom: "5px" }}>Tap to add pages</p>
            <p style={{ fontSize: "0.8rem", opacity: 0.7 }}>Select multiple images</p>
          </div>
          <div className="preview-container">
            {pages.map((src, index) => (
              <div key={index} className="preview-item">
                <img src={src} alt="Preview" />
                <button
                  type="button"
                  className="remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePage(index);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <input
            type="file"
            id="pagesInput"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files) {
                Array.from(e.target.files).forEach((file) => handleFile(file, "page"));
              }
            }}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "UPLOADING..." : "PUBLISH MANGA 🚀"}
        </button>
      </form>
    </div>
  );
}
