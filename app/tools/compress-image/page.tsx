"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import { getTool } from "@/lib/tools";
import { ToolHeader } from "@/components/ToolHeader";
import { FilePicker } from "@/components/FilePicker";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ImageResultsPreview } from "@/components/ImageResultsPreview";

const tool = getTool("compress-image")!;

const TARGETS = [
  { value: 0.2, label: "เล็กสุด (0.2 MB)" },
  { value: 0.5, label: "เล็ก (0.5 MB)" },
  { value: 1, label: "กลาง (1 MB)" },
  { value: 2, label: "ใหญ่ (2 MB)" },
];

type ImageResult = { name: string; bytes: Uint8Array };

export default function CompressImagePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [targetMB, setTargetMB] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ImageResult[] | null>(null);

  function handleFilesChange(newFiles: File[]) {
    setFiles(newFiles);
    setResults(null);
  }

  async function handleCompress() {
    setError(null);
    setResults(null);
    setBusy(true);
    try {
      // Each file compresses independently (its own web worker), so run them
      // concurrently — Promise.all preserves the original file order regardless
      // of which one finishes first.
      const compressed = await Promise.all(
        files.map(async (file) => {
          const compressedFile = await imageCompression(file, {
            maxSizeMB: targetMB,
            maxWidthOrHeight: 4096,
            useWebWorker: true,
            initialQuality: 0.85,
          });
          return {
            name: file.name,
            bytes: new Uint8Array(await compressedFile.arrayBuffer()),
          };
        })
      );
      setResults(compressed);
    } catch (err) {
      console.error("Image compression failed:", err);
      setError("ไม่สามารถบีบอัดรูปภาพได้ กรุณาลองใหม่");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <ToolHeader tool={tool} />
      <main className="mx-auto max-w-xl flex-1 px-5 py-6 md:px-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          เลือกรูปภาพ JPG, PNG หรือ WEBP หลายรูป แล้วเลือกขนาดไฟล์เป้าหมาย
        </p>

        <div className="mt-4">
          <FilePicker
            accept="image/jpeg,image/png,image/webp"
            multiple
            files={files}
            onChange={handleFilesChange}
            label="แตะเพื่อเลือกรูปภาพหลายรูป"
          />
        </div>

        {files.length > 0 && (
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ขนาดไฟล์เป้าหมาย
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {TARGETS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTargetMB(value)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                    targetMB === value
                      ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:border-gray-700 dark:hover:bg-gray-800"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <PrimaryButton
          disabled={files.length === 0 || busy}
          onClick={handleCompress}
          busy={busy}
        >
          บีบอัดรูปภาพ ({files.length} รูป)
        </PrimaryButton>

        {results && (
          <ImageResultsPreview
            results={results}
            zipFilename="compressed-images.zip"
            singleMime="application/octet-stream"
          />
        )}

        <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
          ประมวลผลในเบราว์เซอร์ของคุณเท่านั้น ไฟล์ไม่ถูกอัปโหลดขึ้นเซิร์ฟเวอร์
        </p>
      </main>
    </div>
  );
}
