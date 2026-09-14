"use client";

import { useEffect, useMemo } from "react";
import { Download } from "lucide-react";
import { downloadBytes } from "@/lib/download";
import { sanitizeFilename } from "@/lib/filename";
import { PrimaryButton } from "@/components/PrimaryButton";

export function PdfResultPreview({
  bytes,
  filename,
  fallbackFilename,
}: {
  bytes: Uint8Array;
  filename: string;
  fallbackFilename: string;
}) {
  const url = useMemo(() => {
    const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
    return URL.createObjectURL(blob);
  }, [bytes]);

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return (
    <div className="mt-6">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        ตัวอย่างไฟล์ผลลัพธ์
      </p>
      <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <iframe
          src={url}
          title="ตัวอย่างไฟล์ PDF"
          className="h-[420px] w-full bg-gray-50 dark:bg-gray-900"
        />
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
