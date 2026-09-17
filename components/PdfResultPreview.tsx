"use client";

import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
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
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let pdf: Awaited<ReturnType<typeof loadPdf>> | undefined;

    (async () => {
      try {
        // An <iframe src="blob:..."> only renders PDFs inline on browsers
        // with a built-in PDF viewer wired into iframes — most mobile
        // browsers don't have one and show a broken-file icon instead.
        // Rendering page 1 ourselves via pdf.js works everywhere.
        //
        // pdf.js transfers (detaches) the ArrayBuffer it's given to its
        // worker — passing `bytes.buffer` directly would neuter the same
        // buffer the download button's Blob([bytes]) depends on, silently
        // producing a 0-byte download. Give it a copy instead.
        pdf = await loadPdf(bytes.slice().buffer);
        if (cancelled) return;
        setPageCount(pdf.numPages);

        const canvas = await renderPageToCanvas(pdf, 1, 1.5);
        if (cancelled) return;

        canvas.className = "w-full h-auto";
        const container = containerRef.current;
        if (container) {
          container.replaceChildren(canvas);
        }
      } catch (err) {
        console.error("PDF preview render failed:", err);
        if (!cancelled) setPreviewFailed(true);
      } finally {
        pdf?.destroy();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bytes]);

  return (
    <div className="mt-6">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        ตัวอย่างไฟล์ผลลัพธ์
        {pageCount !== null && pageCount > 1 ? ` (หน้า 1 จาก ${pageCount})` : ""}
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
