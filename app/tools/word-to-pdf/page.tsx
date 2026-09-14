"use client";

import { useState } from "react";
import { getTool } from "@/lib/tools";
import { ToolHeader } from "@/components/ToolHeader";
import { FilePicker } from "@/components/FilePicker";
import { FilenameInput } from "@/components/FilenameInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { PdfResultPreview } from "@/components/PdfResultPreview";
import { htmlToPdfBytes } from "@/lib/htmlToPdf";

const tool = getTool("word-to-pdf")!;

export default function WordToPdfPage() {
  const [file, setFile] = useState<File[]>([]);
  const [filename, setFilename] = useState("document");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Uint8Array | null>(null);

  function handleFileChange(newFiles: File[]) {
    setFile(newFiles);
    setResult(null);
  }

  async function handleConvert() {
    const f = file[0];
    if (!f) return;
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const mammoth = await import("mammoth");
      const arrayBuffer = await f.arrayBuffer();
      const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
      const pdfBytes = await htmlToPdfBytes(html);
      setResult(pdfBytes);
    } catch (err) {
      console.error("Word to PDF conversion failed:", err);
      setError("ไม่สามารถแปลงไฟล์นี้ได้ กรุณาตรวจสอบว่าเป็นไฟล์ .docx ที่ไม่เสียหาย");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <ToolHeader tool={tool} />
      <main className="mx-auto max-w-xl flex-1 px-5 py-6 md:px-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          เลือกไฟล์ Word (.docx) แล้วแปลงเป็น PDF — เหมาะกับเอกสารข้อความทั่วไป
          รูปแบบซับซ้อน (คอลัมน์หลายแถว, header/footer, จัดหน้าเฉพาะ) อาจไม่ตรงกับต้นฉบับ 100%
        </p>

        <div className="mt-4">
          <FilePicker
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            files={file}
            onChange={handleFileChange}
            label="แตะเพื่อเลือกไฟล์ Word (.docx)"
          />
        </div>

        {file[0] && <FilenameInput value={filename} onChange={setFilename} />}

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <PrimaryButton disabled={!file[0] || busy} onClick={handleConvert} busy={busy}>
          แปลงเป็น PDF
        </PrimaryButton>

        {result && (
          <PdfResultPreview bytes={result} filename={filename} fallbackFilename="document" />
        )}

        <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
          ประมวลผลในเบราว์เซอร์ของคุณเท่านั้น ไฟล์ไม่ถูกอัปโหลดขึ้นเซิร์ฟเวอร์
        </p>
      </main>
    </div>
  );
}
