"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { getTool } from "@/lib/tools";
import { ToolHeader } from "@/components/ToolHeader";
import { FilePicker } from "@/components/FilePicker";
import { FilenameInput } from "@/components/FilenameInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { PdfResultPreview } from "@/components/PdfResultPreview";
import { loadPdf, renderPageToCanvas, canvasToJpegBytes } from "@/lib/pdfjs";
import { TriangleAlert } from "lucide-react";

const tool = getTool("compress")!;

const LEVELS = [
  { key: "high", label: "บีบอัดมาก", scale: 1.0, quality: 0.4 },
  { key: "medium", label: "ปานกลาง", scale: 1.3, quality: 0.6 },
  { key: "low", label: "บีบอัดน้อย", scale: 1.6, quality: 0.8 },
] as const;

export default function CompressPage() {
  const [file, setFile] = useState<File[]>([]);
  const [level, setLevel] = useState<(typeof LEVELS)[number]["key"]>("medium");
  const [filename, setFilename] = useState("compressed");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Uint8Array | null>(null);

  function handleFileChange(newFiles: File[]) {
    setFile(newFiles);
    setResult(null);
  }

  async function handleCompress() {
    const f = file[0];
    if (!f) return;
    const opts = LEVELS.find((l) => l.key === level)!;
    setError(null);
    setResult(null);
    setBusy(true);
    let pdfjsDoc: Awaited<ReturnType<typeof loadPdf>> | undefined;
    try {
      const bytes = await f.arrayBuffer();
      const [loadedPdfjsDoc, sourceDoc] = await Promise.all([
        loadPdf(bytes.slice(0)),
        PDFDocument.load(bytes),
      ]);
      pdfjsDoc = loadedPdfjsDoc;
      const outDoc = await PDFDocument.create();

      for (let i = 0; i < sourceDoc.getPageCount(); i++) {
        const { width, height } = sourceDoc.getPage(i).getSize();
        const canvas = await renderPageToCanvas(pdfjsDoc, i + 1, opts.scale);
        const jpegBytes = await canvasToJpegBytes(canvas, opts.quality);
        const image = await outDoc.embedJpg(jpegBytes);
        const page = outDoc.addPage([width, height]);
        page.drawImage(image, { x: 0, y: 0, width, height });
      }

      const out = await outDoc.save();
      setResult(out);
    } catch {
      setError("ไม่สามารถบีบอัดไฟล์นี้ได้ กรุณาตรวจสอบว่าเป็นไฟล์ PDF ที่ไม่ได้ล็อกรหัสผ่าน");
    } finally {
      pdfjsDoc?.destroy();
      setBusy(false);
    }
  }

  return (
    <div>
      <ToolHeader tool={tool} />
      <main className="mx-auto max-w-xl flex-1 px-5 py-6 md:px-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          เลือกไฟล์ PDF แล้วเลือกระดับการบีบอัด
        </p>

        <div className="mt-3 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          <p>
            วิธีนี้แปลงแต่ละหน้าเป็นรูปภาพก่อนบีบอัด ไฟล์ผลลัพธ์จะมีขนาดเล็กลง
            แต่จะ<strong>คัดลอกข้อความไม่ได้อีก</strong>
          </p>
        </div>

        <div className="mt-4">
          <FilePicker
            accept="application/pdf"
            files={file}
            onChange={handleFileChange}
            label="แตะเพื่อเลือกไฟล์ PDF"
          />
        </div>

        {file[0] && (
          <>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {LEVELS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setLevel(key)}
                  className={`rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors ${
                    level === key
                      ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:border-gray-700 dark:hover:bg-gray-800"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <FilenameInput value={filename} onChange={setFilename} />
          </>
        )}

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <PrimaryButton disabled={!file[0] || busy} onClick={handleCompress} busy={busy}>
          บีบอัด PDF
        </PrimaryButton>

        {result && (
          <PdfResultPreview
            bytes={result}
            filename={filename}
            fallbackFilename="compressed"
          />
        )}

        <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
          ประมวลผลในเบราว์เซอร์ของคุณเท่านั้น ไฟล์ไม่ถูกอัปโหลดขึ้นเซิร์ฟเวอร์
        </p>
      </main>
    </div>
  );
}
