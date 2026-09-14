"use client";

import { useState } from "react";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { getTool } from "@/lib/tools";
import { ToolHeader } from "@/components/ToolHeader";
import { FilePicker } from "@/components/FilePicker";
import { FilenameInput } from "@/components/FilenameInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { PdfResultPreview } from "@/components/PdfResultPreview";

const tool = getTool("watermark")!;

export default function WatermarkPage() {
  const [file, setFile] = useState<File[]>([]);
  const [text, setText] = useState("");
  const [filename, setFilename] = useState("watermarked");
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
    if (!text.trim()) {
      setError("กรุณาใส่ข้อความลายน้ำ");
      return;
    }
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const bytes = await f.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const font = await doc.embedFont(StandardFonts.HelveticaBold);

      for (const page of doc.getPages()) {
        const { width, height } = page.getSize();
        const size = Math.min(width, height) / 10;
        const textWidth = font.widthOfTextAtSize(text, size);
        page.drawText(text, {
          x: width / 2 - textWidth / 2,
          y: height / 2,
          size,
          font,
          color: rgb(0.6, 0.6, 0.6),
          opacity: 0.3,
          rotate: degrees(45),
        });
      }

      const out = await doc.save();
      setResult(out);
    } catch (err) {
      console.error("Watermarking failed:", err);
      setError("ไม่สามารถใส่ลายน้ำได้ กรุณาตรวจสอบว่าเป็นไฟล์ PDF ที่ไม่ได้ล็อกรหัสผ่าน");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <ToolHeader tool={tool} />
      <main className="mx-auto max-w-xl flex-1 px-5 py-6 md:px-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          เลือกไฟล์ PDF แล้วใส่ข้อความที่จะทำเป็นลายน้ำทับทุกหน้า
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
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ข้อความลายน้ำ
              </label>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="เช่น CONFIDENTIAL, ตัวอย่าง"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-gray-100"
              />
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
          ใส่ลายน้ำ
        </PrimaryButton>

        {result && (
          <PdfResultPreview
            bytes={result}
            filename={filename}
            fallbackFilename="watermarked"
          />
        )}

        <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
          ประมวลผลในเบราว์เซอร์ของคุณเท่านั้น ไฟล์ไม่ถูกอัปโหลดขึ้นเซิร์ฟเวอร์
        </p>
      </main>
    </div>
  );
}
