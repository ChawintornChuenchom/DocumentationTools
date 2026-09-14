"use client";

import { Download } from "lucide-react";
import { downloadBytes } from "@/lib/download";
import { sanitizeFilename } from "@/lib/filename";
import { PrimaryButton } from "@/components/PrimaryButton";

export function FileResultDownload({
  bytes,
  filename,
  fallbackFilename,
  ext,
  mime,
  label = "ดาวน์โหลดไฟล์",
  note,
}: {
  bytes: Uint8Array;
  filename: string;
  fallbackFilename: string;
  ext: string;
  mime: string;
  label?: string;
  note?: string;
}) {
  return (
    <div className="mt-6">
      {note && (
        <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">{note}</p>
      )}
      <PrimaryButton
        onClick={() =>
          downloadBytes(bytes, sanitizeFilename(filename, fallbackFilename, ext), mime)
        }
      >
        <Download className="h-4 w-4" />
        {label}
      </PrimaryButton>
    </div>
  );
}
