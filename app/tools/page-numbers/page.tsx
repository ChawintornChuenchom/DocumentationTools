"use client";

import { useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getTool } from "@/lib/tools";
import { ToolHeader } from "@/components/ToolHeader";
import { FilePicker } from "@/components/FilePicker";
import { FilenameInput } from "@/components/FilenameInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { PdfResultPreview } from "@/components/PdfResultPreview";

const tool = getTool("page-numbers")!;

const POSITIONS = [
  { value: "bottom-center", label: "ล่าง-กลาง" },
  { value: "bottom-right", label: "ล่าง-ขวา" },
  { value: "top-center", label: "บน-กลาง" },
  { value: "top-right", label: "บน-ขวา" },
] as const;

type Position = (typeof POSITIONS)[number]["value"];

export default function PageNumbersPage() {
  const [file, setFile] = useState<File[]>([]);
  const [position, setPosition] = useState<Position>("bottom-center");
  const [filename, setFilename] = useState("numbered");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Uint8Array | null>(null);

  function handleFileChange(newFiles: File[]) {
    setFile(newFiles);
    setResult(null);
  }

  async function handleApply() {
    const f = file[0];
    if (!f) return;
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const bytes = await f.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      const margin = 28;
      const size = 10;

      pages.forEach((page, i) => {
        const text = `${i + 1} / ${pages.length}`;
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, size);
        let x: number;
        let y: number;

        if (position.startsWith("bottom")) y = margin - size * 0.3;
        else y = height - margin;

        if (position.endsWith("center")) x = (width - textWidth) / 2;
        else x = width - margin - textWidth;

        page.drawText(text, { x, y, size, font, color: rgb(0.35, 0.35, 0.35) });
      });

      const out = await doc.save();
      setResult(out);
    } catch (err) {
      console.error("Page numbering failed:", err);
      setError("ไม่สามารถใส่เลขหน้าได้ กรุณาตรวจสอบว่าเป็นไฟล์ PDF ที่ไม่ได้ล็อกรหัสผ่าน");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <ToolHeader tool={tool} />
      <main className="mx-auto max-w-xl flex-1 px-5 py-6 md:px-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          เลือกไฟล์ PDF แล้วเลือกตำแหน่งที่จะใส่เลขหน้า
        </p>

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
            <div className="mt-4 grid grid-cols-2 gap-2">
              {POSITIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPosition(value)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                    position === value
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

        <PrimaryButton disabled={!file[0] || busy} onClick={handleApply} busy={busy}>
          ใส่เลขหน้า
        </PrimaryButton>

        {result && (
          <PdfResultPreview
            bytes={result}
            filename={filename}
            fallbackFilename="numbered"
          />
        )}

        <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
          ประมวลผลในเบราว์เซอร์ของคุณเท่านั้น ไฟล์ไม่ถูกอัปโหลดขึ้นเซิร์ฟเวอร์
        </p>
      </main>
    </div>
  );
}
