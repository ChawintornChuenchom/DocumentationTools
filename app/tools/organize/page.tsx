"use client";

import { useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { getTool } from "@/lib/tools";
import { ToolHeader } from "@/components/ToolHeader";
import { FilePicker } from "@/components/FilePicker";
import { FilenameInput } from "@/components/FilenameInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { PdfResultPreview } from "@/components/PdfResultPreview";
import { loadPdf, renderPageToCanvas } from "@/lib/pdfjs";
import {
  Loader2,
  RotateCw,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

const tool = getTool("organize")!;

type PageItem = {
  id: number;
  originalIndex: number;
  rotation: number;
  thumb: string;
};

export default function OrganizePage() {
  const [file, setFile] = useState<File[]>([]);
  const [pages, setPages] = useState<PageItem[] | null>(null);
  const [filename, setFilename] = useState("organized");
  const [loadingThumbs, setLoadingThumbs] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Uint8Array | null>(null);

  async function handleFileChange(newFiles: File[]) {
    setFile(newFiles);
    setPages(null);
    setError(null);
    setResult(null);
    setFilename("organized");
    const f = newFiles[0];
    if (!f) return;

    setLoadingThumbs(true);
    let pdf: Awaited<ReturnType<typeof loadPdf>> | undefined;
    try {
      const bytes = await f.arrayBuffer();
      pdf = await loadPdf(bytes);
      const items: PageItem[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const canvas = await renderPageToCanvas(pdf, i, 0.35);
        items.push({
          id: i,
          originalIndex: i - 1,
          rotation: 0,
          thumb: canvas.toDataURL("image/jpeg", 0.7),
        });
      }
      setPages(items);
    } catch (err) {
      console.error("Loading PDF for organize failed:", err);
      setError("ไม่สามารถอ่านไฟล์ PDF นี้ได้");
    } finally {
      pdf?.destroy();
      setLoadingThumbs(false);
    }
  }

  function rotatePage(id: number) {
    setResult(null);
    setPages((prev) =>
      prev
        ? prev.map((p) =>
            p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p
          )
        : prev
    );
  }

  function removePage(id: number) {
    setResult(null);
    setPages((prev) => (prev ? prev.filter((p) => p.id !== id) : prev));
  }

  function movePage(index: number, dir: -1 | 1) {
    setResult(null);
    setPages((prev) => {
      if (!prev) return prev;
      const j = index + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  async function handleSave() {
    const f = file[0];
    if (!f || !pages || pages.length === 0) return;
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const bytes = await f.arrayBuffer();
      const sourceDoc = await PDFDocument.load(bytes);
      const outDoc = await PDFDocument.create();
      const copied = await outDoc.copyPages(
        sourceDoc,
        pages.map((p) => p.originalIndex)
      );
      copied.forEach((page, i) => {
        const rotation = pages[i].rotation;
        if (rotation) {
          page.setRotation(degrees((page.getRotation().angle + rotation) % 360));
        }
        outDoc.addPage(page);
      });
      const out = await outDoc.save();
      setResult(out);
    } catch (err) {
      console.error("Saving organized PDF failed:", err);
      setError("ไม่สามารถบันทึกไฟล์ได้ กรุณาตรวจสอบว่าเป็นไฟล์ PDF ที่ไม่ได้ล็อกรหัสผ่าน");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <ToolHeader tool={tool} />
      <main className="mx-auto max-w-3xl flex-1 px-5 py-6 md:px-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          เลือกไฟล์ PDF แล้วลากสลับลำดับ หมุน หรือลบหน้าที่ไม่ต้องการ
        </p>

        <div className="mt-4">
          <FilePicker
            accept="application/pdf"
            files={file}
            onChange={handleFileChange}
            label="แตะเพื่อเลือกไฟล์ PDF"
          />
        </div>

        {loadingThumbs && (
          <div className="mt-6 flex items-center justify-center gap-2 py-10 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            กำลังโหลดหน้า PDF...
          </div>
        )}

        {pages && pages.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {pages.map((page, i) => (
              <div
                key={page.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
              >
                <div className="flex items-center justify-center bg-gray-100 p-2 dark:bg-gray-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={page.thumb}
                    alt={`หน้า ${page.originalIndex + 1}`}
                    className="max-h-40 w-auto transition-transform"
                    style={{ transform: `rotate(${page.rotation}deg)` }}
                  />
                </div>
                <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    หน้า {page.originalIndex + 1}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => movePage(i, -1)}
                      disabled={i === 0}
                      className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                      aria-label="เลื่อนขึ้น"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => movePage(i, 1)}
                      disabled={i === pages.length - 1}
                      className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                      aria-label="เลื่อนลง"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => rotatePage(page.id)}
                      className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                      aria-label="หมุนหน้านี้"
                    >
                      <RotateCw className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removePage(page.id)}
                      className="rounded-md p-1 text-red-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                      aria-label="ลบหน้านี้"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pages && pages.length > 0 && (
          <FilenameInput value={filename} onChange={setFilename} />
        )}

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <PrimaryButton
          disabled={!pages || pages.length === 0 || busy}
          onClick={handleSave}
          busy={busy}
        >
          บันทึกไฟล์ PDF
        </PrimaryButton>

        {result && (
          <PdfResultPreview
            bytes={result}
            filename={filename}
            fallbackFilename="organized"
          />
        )}

        <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
          ประมวลผลในเบราว์เซอร์ของคุณเท่านั้น ไฟล์ไม่ถูกอัปโหลดขึ้นเซิร์ฟเวอร์
        </p>
      </main>
    </div>
  );
}
