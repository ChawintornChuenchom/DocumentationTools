"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { getTool } from "@/lib/tools";
import { ToolHeader } from "@/components/ToolHeader";
import { FilePicker } from "@/components/FilePicker";
import { FilenameInput } from "@/components/FilenameInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { PdfResultPreview } from "@/components/PdfResultPreview";

const tool = getTool("merge")!;

export default function MergePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [filename, setFilename] = useState("merged");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Uint8Array | null>(null);

  function handleFilesChange(newFiles: File[]) {
    setFiles(newFiles);
    setResult(null);
  }

  async function handleMerge() {
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const merged = await PDFDocument.create();
      // Each source file loads into its own independent PDFDocument, so
      // loading can happen concurrently; only copying into `merged` (the
      // single shared document) needs to stay sequential to preserve order.
      const sources = await Promise.all(
        files.map(async (file) => {
          const bytes = await file.arrayBuffer();
          return PDFDocument.load(bytes);
        })
      );
      for (const src of sources) {
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const out = await merged.save();
      setResult(out);
    } catch (err) {
      console.error("Merge failed:", err);
      setError("ไม่สามารถรวมไฟล์ได้ กรุณาตรวจสอบว่าเป็นไฟล์ PDF ที่ไม่ได้ล็อกรหัสผ่าน");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <ToolHeader tool={tool} />
      <main className="mx-auto max-w-xl flex-1 px-5 py-6 md:px-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          เลือกไฟล์ PDF ตั้งแต่ 2 ไฟล์ขึ้นไป จัดลำดับด้วยลูกศร แล้วกดรวมไฟล์
        </p>

        <div className="mt-4">
          <FilePicker
            accept="application/pdf"
            multiple
            allowReorder
            files={files}
            onChange={handleFilesChange}
            label="แตะเพื่อเลือกไฟล์ PDF หลายไฟล์"
          />
        </div>

        {files.length >= 2 && (
          <FilenameInput value={filename} onChange={setFilename} />
        )}

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <PrimaryButton
          disabled={files.length < 2 || busy}
          onClick={handleMerge}
          busy={busy}
        >
          รวมไฟล์ PDF ({files.length} ไฟล์)
        </PrimaryButton>

        {result && (
          <PdfResultPreview
            bytes={result}
            filename={filename}
            fallbackFilename="merged"
          />
        )}

        <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
          ประมวลผลในเบราว์เซอร์ของคุณเท่านั้น ไฟล์ไม่ถูกอัปโหลดขึ้นเซิร์ฟเวอร์
        </p>
      </main>
    </div>
  );
}
