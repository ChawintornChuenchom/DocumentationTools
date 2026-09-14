"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { getTool } from "@/lib/tools";
import { ToolHeader } from "@/components/ToolHeader";
import { FilePicker } from "@/components/FilePicker";
import { FilenameInput } from "@/components/FilenameInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { PdfResultPreview } from "@/components/PdfResultPreview";

const tool = getTool("split")!;

function parseRanges(input: string, pageCount: number): number[] | null {
  const indices = new Set<number>();
  const parts = input.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return null;

  for (const part of parts) {
    const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);
    const singleMatch = part.match(/^(\d+)$/);
    if (rangeMatch) {
      let [, a, b] = rangeMatch.map(Number) as unknown as [number, number, number];
      if (a > b) [a, b] = [b, a];
      for (let n = a; n <= b; n++) {
        if (n < 1 || n > pageCount) return null;
        indices.add(n - 1);
      }
    } else if (singleMatch) {
      const n = Number(singleMatch[1]);
      if (n < 1 || n > pageCount) return null;
      indices.add(n - 1);
    } else {
      return null;
    }
  }
  return [...indices].sort((a, b) => a - b);
}

export default function SplitPage() {
  const [file, setFile] = useState<File[]>([]);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [range, setRange] = useState("");
  const [filename, setFilename] = useState("split");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Uint8Array | null>(null);

  function handleFileChange(newFiles: File[]) {
    setFile(newFiles);
    setPageCount(null);
    setError(null);
    setRange("");
    setFilename("split");
    setResult(null);
    const f = newFiles[0];
    if (!f) return;
    f.arrayBuffer()
      .then((buf) => PDFDocument.load(buf))
      .then((doc) => setPageCount(doc.getPageCount()))
      .catch((err) => {
        console.error("Loading PDF for split failed:", err);
        setError("ไม่สามารถอ่านไฟล์ PDF นี้ได้");
      });
  }

  async function handleSplit() {
    const f = file[0];
    if (!f || pageCount === null) return;
    const indices = parseRanges(range, pageCount);
    if (!indices || indices.length === 0) {
      setError(`กรุณาระบุเลขหน้าให้ถูกต้อง (1-${pageCount}) เช่น 1-3,5`);
      return;
    }
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const bytes = await f.arrayBuffer();
      const src = await PDFDocument.load(bytes);
      const out = await PDFDocument.create();
      const pages = await out.copyPages(src, indices);
      pages.forEach((p) => out.addPage(p));
      const outBytes = await out.save();
      setResult(outBytes);
    } catch (err) {
      console.error("Splitting PDF failed:", err);
      setError("เกิดข้อผิดพลาดระหว่างแยกไฟล์");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <ToolHeader tool={tool} />
      <main className="mx-auto max-w-xl flex-1 px-5 py-6 md:px-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          เลือกไฟล์ PDF แล้วระบุเลขหน้าที่ต้องการดึงออกมา เช่น 1-3,5,8
        </p>

        <div className="mt-4">
          <FilePicker
            accept="application/pdf"
            files={file}
            onChange={handleFileChange}
            label="แตะเพื่อเลือกไฟล์ PDF"
          />
        </div>

        {pageCount !== null && (
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ไฟล์นี้มีทั้งหมด {pageCount} หน้า — เลือกหน้าที่ต้องการ
            </label>
            <input
              value={range}
              onChange={(e) => setRange(e.target.value)}
              placeholder="เช่น 1-3,5"
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-gray-100"
            />
          </div>
        )}

        {pageCount !== null && (
          <FilenameInput value={filename} onChange={setFilename} />
        )}

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <PrimaryButton
          disabled={!file[0] || pageCount === null || busy}
          onClick={handleSplit}
          busy={busy}
        >
          แยกไฟล์ PDF
        </PrimaryButton>

        {result && (
          <PdfResultPreview
            bytes={result}
            filename={filename}
            fallbackFilename="split"
          />
        )}

        <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
          ประมวลผลในเบราว์เซอร์ของคุณเท่านั้น ไฟล์ไม่ถูกอัปโหลดขึ้นเซิร์ฟเวอร์
        </p>
      </main>
    </div>
  );
}
