"use client";

import { useEffect, useRef, useState } from "react";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { downloadBytes } from "@/lib/download";
import { sanitizeFilename } from "@/lib/filename";
import { PrimaryButton } from "@/components/PrimaryButton";
import { loadPdf, renderPageToCanvas } from "@/lib/pdfjs";

export function PdfResultPreview({
  bytes,
  filename,
  fallbackFilename,
}: {
  bytes: Uint8Array;
  filename: string;
  fallbackFilename: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<Awaited<ReturnType<typeof loadPdf>> | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewFailed, setPreviewFailed] = useState(false);

  // Loads the PDF and keeps it open for the component's lifetime so page
  // navigation doesn't have to reload it each time. Every caller sets its
  // `result` state to null before a new one comes in, which unmounts this
  // component (via `{result && <PdfResultPreview .../>}`) and remounts a
  // fresh instance for the new bytes — so plain useState initial values
  // already give each PDF a clean pageCount/currentPage/previewFailed
  // without this effect needing to reset them itself.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // An <iframe src="blob:..."> only renders PDFs inline on browsers
        // with a built-in PDF viewer wired into iframes — most mobile
        // browsers don't have one and show a broken-file icon instead.
        // Rendering pages ourselves via pdf.js works everywhere.
        //
        // pdf.js transfers (detaches) the ArrayBuffer it's given to its
        // worker — passing `bytes.buffer` directly would neuter the same
        // buffer the download button's Blob([bytes]) depends on, silently
        // producing a 0-byte download. Give it a copy instead.
        const pdf = await loadPdf(bytes.slice().buffer);
        if (cancelled) {
          pdf.destroy();
          return;
        }
        pdfRef.current = pdf;
        setPageCount(pdf.numPages);
      } catch (err) {
        console.error("PDF preview load failed:", err);
        if (!cancelled) setPreviewFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      pdfRef.current?.destroy();
      pdfRef.current = null;
    };
  }, [bytes]);

  // Renders whichever page is currently selected. `pageCount` (rather than
  // reading pdfRef.current directly) is what signals "the doc finished
  // loading, render page 1 now" — a ref alone isn't a reactive dependency.
  useEffect(() => {
    const pdf = pdfRef.current;
    if (!pdf || previewFailed) return;
    let cancelled = false;

    (async () => {
      try {
        const canvas = await renderPageToCanvas(pdf, currentPage, 1.5);
        if (cancelled) return;
        canvas.className = "w-full h-auto";
        containerRef.current?.replaceChildren(canvas);
      } catch (err) {
        console.error("PDF page render failed:", err);
        if (!cancelled) setPreviewFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentPage, pageCount, previewFailed]);

  return (
    <div className="mt-6">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        ตัวอย่างไฟล์ผลลัพธ์
      </p>
      <div className="mt-2 flex min-h-[200px] items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
        {previewFailed ? (
          <p className="px-6 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
            ไม่สามารถแสดงตัวอย่างได้ กรุณาดาวน์โหลดไฟล์เพื่อตรวจสอบผลลัพธ์
          </p>
        ) : (
          <div ref={containerRef} className="w-full" />
        )}
      </div>

      {!previewFailed && pageCount !== null && pageCount > 1 && (
        <div className="mt-2 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            aria-label="หน้าก่อนหน้า"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            หน้า {currentPage} / {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
            disabled={currentPage >= pageCount}
            aria-label="หน้าถัดไป"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      <PrimaryButton
        onClick={() =>
          downloadBytes(
            bytes,
            sanitizeFilename(filename, fallbackFilename),
            "application/pdf"
          )
        }
      >
        <Download className="h-4 w-4" />
        ดาวน์โหลดไฟล์ PDF
      </PrimaryButton>
    </div>
  );
}
