"use client";

import { useEffect, useMemo } from "react";
import { Download } from "lucide-react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { downloadBytes } from "@/lib/download";
import { downloadAsZip } from "@/lib/zip";

export function ImageResultsPreview({
  results,
  zipFilename,
  singleMime,
}: {
  results: { name: string; bytes: Uint8Array }[];
  zipFilename: string;
  singleMime: string;
}) {
  const urls = useMemo(
    () =>
      results.map((r) => URL.createObjectURL(new Blob([r.bytes as BlobPart]))),
    [results]
  );

  useEffect(() => {
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [urls]);

  async function handleDownload() {
    if (results.length === 1) {
      downloadBytes(results[0].bytes, results[0].name, singleMime);
    } else {
      await downloadAsZip(results, zipFilename);
    }
  }

  return (
    <div className="mt-6">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        ตัวอย่างผลลัพธ์ ({results.length} ไฟล์)
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {results.map((r, i) => (
          <div
            key={r.name}
            className="overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800"
          >
            {urls[i] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={urls[i]}
                alt={r.name}
                className="aspect-square w-full object-cover"
              />
            )}
          </div>
        ))}
      </div>
      <PrimaryButton onClick={handleDownload}>
        <Download className="h-4 w-4" />
        {results.length === 1
          ? "ดาวน์โหลดรูปภาพ"
          : `ดาวน์โหลดเป็น .zip (${results.length} ไฟล์)`}
      </PrimaryButton>
    </div>
  );
}
