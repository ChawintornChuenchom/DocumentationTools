"use client";

import { useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { getTool } from "@/lib/tools";
import { ToolHeader } from "@/components/ToolHeader";
import { FilePicker } from "@/components/FilePicker";
import { FilenameInput } from "@/components/FilenameInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { PdfResultPreview } from "@/components/PdfResultPreview";
import { RotateCcw, RotateCw } from "lucide-react";

const tool = getTool("rotate")!;

const ANGLES = [
  { value: -90, label: "หมุนซ้าย 90°", icon: RotateCcw },
  { value: 90, label: "หมุนขวา 90°", icon: RotateCw },
  { value: 180, label: "หมุนกลับด้าน 180°", icon: RotateCw },
];

export default function RotatePage() {
  const [file, setFile] = useState<File[]>([]);
  const [angle, setAngle] = useState(90);
  const [filename, setFilename] = useState("rotated");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Uint8Array | null>(null);

  function handleFileChange(newFiles: File[]) {
    setFile(newFiles);
    setResult(null);
  }

  async function handleRotate() {
    const f = file[0];
    if (!f) return;
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const bytes = await f.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      for (const page of doc.getPages()) {
        const current = page.getRotation().angle;
        page.setRotation(degrees((current + angle + 360) % 360));
      }
      const out = await doc.save();
      setResult(out);
    } catch (err) {
      console.error("Rotating PDF failed:", err);
      setError("ไม่สามารถหมุนไฟล์นี้ได้ กรุณาตรวจสอบว่าเป็นไฟล์ PDF ที่ไม่ได้ล็อกรหัสผ่าน");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <ToolHeader tool={tool} />
      <main className="mx-auto max-w-xl flex-1 px-5 py-6 md:px-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          เลือกไฟล์ PDF แล้วเลือกทิศทางที่จะหมุนทุกหน้าในไฟล์
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
            <div className="mt-4 grid grid-cols-3 gap-2">
              {ANGLES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAngle(value)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-colors ${
                    angle === value
                      ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:border-gray-700 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="h-5 w-5" />
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

        <PrimaryButton disabled={!file[0] || busy} onClick={handleRotate} busy={busy}>
          หมุนหน้า PDF
        </PrimaryButton>

        {result && (
          <PdfResultPreview
            bytes={result}
            filename={filename}
            fallbackFilename="rotated"
          />
        )}

        <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
          ประมวลผลในเบราว์เซอร์ของคุณเท่านั้น ไฟล์ไม่ถูกอัปโหลดขึ้นเซิร์ฟเวอร์
        </p>
      </main>
    </div>
  );
}
