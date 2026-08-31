"use client";

import { useRef, useState } from "react";

export default function ImageUploader({
  name,
  initial,
  max,
}: {
  name: string;
  initial: string[];
  max?: number;
}) {
  const [images, setImages] = useState<string[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || `Failed to upload ${file.name}`);
        uploaded.push(json.url);
      }
      setImages((prev) => (max ? uploaded.slice(0, max) : [...prev, ...uploaded]));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function makePrimary(idx: number) {
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      return [item, ...next];
    });
  }

  return (
    <div>
      {/* Hidden field the form action actually reads. Multi-image mode joins
          with newlines (same format saveProduct() already parsed from the
          old textarea); single-image mode (max=1) just sends the one URL. */}
      <input type="hidden" name={name} value={max === 1 ? images[0] ?? "" : images.join("\n")} />

      {images.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-3">
          {images.map((src, idx) => (
            <div key={src + idx} className="relative group aspect-square rounded-md overflow-hidden border border-cc-background-300 bg-cc-background-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" />
              {idx === 0 && (
                <span className="absolute top-1 left-1 text-[9px] font-medium bg-cc-primary-500 text-cc-background-50 px-1.5 py-0.5 rounded">
                  Primary
                </span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => makePrimary(idx)}
                    title="Make primary"
                    className="w-6 h-6 rounded bg-white/90 text-cc-foreground-900 text-xs flex items-center justify-center hover:bg-white"
                  >
                    <i className="ri-star-line" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeAt(idx)}
                  title="Remove"
                  className="w-6 h-6 rounded bg-white/90 text-cc-accent-700 text-xs flex items-center justify-center hover:bg-white"
                >
                  <i className="ri-delete-bin-line" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <label
        className="flex flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-cc-background-300 bg-cc-background-50 py-6 cursor-pointer hover:border-cc-primary-500 transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          uploadFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={max !== 1}
          className="hidden"
          onChange={(e) => uploadFiles(e.target.files)}
        />
        <i className={`text-xl text-cc-foreground-500 ${uploading ? "ri-loader-4-line animate-spin" : "ri-upload-cloud-2-line"}`} />
        <span className="text-xs text-cc-foreground-600">
          {uploading ? "Uploading…" : max === 1 ? "Click or drag an image here — JPG, PNG, WEBP, GIF (max 8MB)" : "Click or drag images here — JPG, PNG, WEBP, GIF (max 8MB each)"}
        </span>
      </label>
      {error && <p className="text-xs text-cc-accent-700 mt-1.5">{error}</p>}
    </div>
  );
}
