"use client";

import { useState } from "react";
import { getTool } from "@/lib/tools";
import { ToolHeader } from "@/components/ToolHeader";
import { FilePicker } from "@/components/FilePicker";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ImageResultsPreview } from "@/components/ImageResultsPreview";
import { loadPdf, renderPageToCanvas, canvasToJpegBytes } from "@/lib/pdfjs";

const tool = getTool("pdf-to-jpg")!;

type ImageResult = { name: string; bytes: Uint8Array };

export default function PdfToJpgPage() {
  const [file, setFile] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ImageResult[] | null>(null);
  const [zipName, setZipName] = useState("images.zip");

  function handleFileChange(newFiles: File[]) {
    setFile(newFiles);
    setResults(null);
  }

  async function handleConvert() {
    const f = file[0];
    if (!f) return;
    setError(null);
    setResults(null);
    setBusy(true);
    let pdf: Awaited<ReturnType<typeof loadPdf>> | undefined;
    try {
      const bytes = await f.arrayBuffer();
      pdf = await loadPdf(bytes);
      const baseName = f.name.replace(/\.pdf$/i, "");
      const pages: ImageResult[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const canvas = await renderPageToCanvas(pdf, i, 2);
        const jpegBytes = await canvasToJpegBytes(canvas, 0.9);
        pages.push({
          name: `${baseName}-page-${i}.jpg`,
          bytes: jpegBytes,
        });
      }

      setZipName(`${baseName}-images.zip`);
      setResults(pages);
    } catch (err) {
      console.error("PDF to JPG conversion failed:", err);
      setError("ไม่สามารถแปลงไฟล์นี้เป็นรูปภาพได้ กรุณาตรวจสอบว่าเป็นไฟล์ PDF ที่ไม่ได้ล็อกรหัสผ่าน");
    } finally {
      pdf?.destroy();
      setBusy(false);
    }
  }

  return (
    <div>
      <ToolHeader tool={tool} />
      <main className="mx-auto max-w-xl flex-1 px-5 py-6 md:px-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          เลือกไฟล์ PDF แล้วแปลงทุกหน้าเป็นรูป JPG (ถ้ามีหลายหน้าจะได้เป็นไฟล์ ZIP)
        </p>

        <div className="mt-4">
          <FilePicker
            accept="application/pdf"
            files={file}
            onChange={handleFileChange}
            label="แตะเพื่อเลือกไฟล์ PDF"
          />
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <PrimaryButton disabled={!file[0] || busy} onClick={handleConvert} busy={busy}>
          แปลงเป็นรูป JPG
        </PrimaryButton>

        {results && (
          <ImageResultsPreview
            results={results}
            zipFilename={zipName}
            singleMime="image/jpeg"
          />
        )}

        <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
          ประมวลผลในเบราว์เซอร์ของคุณเท่านั้น ไฟล์ไม่ถูกอัปโหลดขึ้นเซิร์ฟเวอร์
        </p>
      </main>
    </div>
  );
}
