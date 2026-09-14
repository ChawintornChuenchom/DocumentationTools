"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { getTool } from "@/lib/tools";
import { ToolHeader } from "@/components/ToolHeader";
import { FilePicker } from "@/components/FilePicker";
import { FilenameInput } from "@/components/FilenameInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { PdfResultPreview } from "@/components/PdfResultPreview";

const tool = getTool("jpg-to-pdf")!;

export default function JpgToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [filename, setFilename] = useState("images");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Uint8Array | null>(null);

  function handleFilesChange(newFiles: File[]) {
    setFiles(newFiles);
    setResult(null);
  }

  async function handleConvert() {
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const doc = await PDFDocument.create();
      // Reading each file is independent I/O, so do it concurrently; embedding
      // must stay sequential since it mutates the single shared `doc`.
      const loaded = await Promise.all(
        files.map(async (file) => ({
          bytes: new Uint8Array(await file.arrayBuffer()),
          isPng: file.type === "image/png",
        }))
      );
      for (const { bytes, isPng } of loaded) {
        const image = isPng
          ? await doc.embedPng(bytes)
          : await doc.embedJpg(bytes);
        const page = doc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }
      const out = await doc.save();
      setResult(out);
    } catch (err) {
      console.error("JPG to PDF conversion failed:", err);
      setError("รองรับเฉพาะไฟล์ JPG และ PNG เท่านั้น");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <ToolHeader tool={tool} />
      <main className="mx-auto max-w-xl flex-1 px-5 py-6 md:px-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          เลือกรูปภาพ JPG หรือ PNG หลายรูป จัดลำดับหน้าด้วยลูกศร แล้วแปลงเป็น PDF เดียว
        </p>

        <div className="mt-4">
          <FilePicker
            accept="image/jpeg,image/png"
            multiple
            allowReorder
            files={files}
            onChange={handleFilesChange}
            label="แตะเพื่อเลือกรูปภาพหลายรูป"
          />
        </div>

        {files.length > 0 && (
          <FilenameInput value={filename} onChange={setFilename} />
        )}

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <PrimaryButton
          disabled={files.length === 0 || busy}
          onClick={handleConvert}
          busy={busy}
        >
          แปลงเป็น PDF ({files.length} รูป)
        </PrimaryButton>

        {result && (
          <PdfResultPreview
            bytes={result}
            filename={filename}
            fallbackFilename="images"
          />
        )}

        <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
          ประมวลผลในเบราว์เซอร์ของคุณเท่านั้น ไฟล์ไม่ถูกอัปโหลดขึ้นเซิร์ฟเวอร์
        </p>
      </main>
    </div>
  );
}
