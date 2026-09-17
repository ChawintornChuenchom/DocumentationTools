"use client";

import { useEffect, useMemo, useRef } from "react";
import { UploadCloud, X, ChevronUp, ChevronDown, FileIcon } from "lucide-react";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilePicker({
  accept,
  multiple = false,
  files,
  onChange,
  allowReorder = false,
  label = "แตะเพื่อเลือกไฟล์ หรือวางไฟล์ที่นี่",
}: {
  accept: string;
  multiple?: boolean;
  files: File[];
  onChange: (files: File[]) => void;
  allowReorder?: boolean;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  // A filename-and-icon row gives no visual confirmation that e.g. a camera
  // capture actually worked — a thumbnail does. Keyed by File identity so
  // reordering doesn't churn object URLs, only additions/removals do.
  // Object URL creation is synchronous, so it's derived directly via
  // useMemo rather than mirrored into state from an effect; the effect
  // below only handles the side effect of revoking old URLs.
  const thumbUrls = useMemo(() => {
    const map = new Map<File, string>();
    for (const f of files) {
      if (f.type.startsWith("image/")) map.set(f, URL.createObjectURL(f));
    }
    return map;
  }, [files]);

  useEffect(() => {
    return () => thumbUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [thumbUrls]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const picked = Array.from(list);
    onChange(multiple ? [...files, ...picked] : picked.slice(0, 1));
  }

  function removeAt(i: number) {
    onChange(files.filter((_, idx) => idx !== i));
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= files.length) return;
    const next = [...files];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-8 text-center transition-colors hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600 dark:hover:bg-gray-800"
      >
        <UploadCloud className="h-8 w-8 text-gray-400 dark:text-gray-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            // Reset so selecting the exact same file again still fires onChange
            // (browsers don't emit "change" when the selection doesn't differ).
            e.target.value = "";
          }}
        />
      </button>

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-800 dark:bg-gray-900"
            >
              {thumbUrls.has(f) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbUrls.get(f)}
                  alt=""
                  className="h-8 w-8 shrink-0 rounded object-cover"
                />
              ) : (
                <FileIcon className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
              )}
              <span className="flex-1 truncate text-sm text-gray-800 dark:text-gray-200">
                {f.name}
              </span>
              <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                {formatSize(f.size)}
              </span>
              {allowReorder && (
                <div className="flex shrink-0 flex-col">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === files.length - 1}
                    className="rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="shrink-0 rounded p-0.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-gray-500 dark:hover:bg-red-950/30"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
