"use client";

import { useRef, useState } from "react";
import { getTool } from "@/lib/tools";
import { ToolHeader } from "@/components/ToolHeader";
import { FilePicker } from "@/components/FilePicker";
import { FilenameInput } from "@/components/FilenameInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { loadPdf, renderPageToCanvas } from "@/lib/pdfjs";
import { loadForOcr, preprocessCanvasForOcr } from "@/lib/imagePreprocess";
import { cleanupThaiOcrText } from "@/lib/thaiOcrCleanup";
import { downloadBytes } from "@/lib/download";
import { sanitizeFilename } from "@/lib/filename";
import { Copy, Check, TriangleAlert } from "lucide-react";

const tool = getTool("ocr")!;

const STATUS_LABELS: Record<string, string> = {
  "loading tesseract core": "กำลังโหลดโปรแกรมอ่านข้อความ...",
  "initializing tesseract": "กำลังเริ่มต้นโปรแกรม...",
  "loading language traineddata": "กำลังโหลดโมเดลภาษา (ครั้งแรกอาจใช้เวลาสักครู่)...",
  "initialized api": "พร้อมอ่านข้อความ...",
  "recognizing text": "กำลังอ่านข้อความ...",
};

export default function OcrPage() {
  const [file, setFile] = useState<File[]>([]);
  const [filename, setFilename] = useState("extracted-text");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const pageRef = useRef({ current: 0, total: 0 });

  function handleFileChange(newFiles: File[]) {
    setFile(newFiles);
    setText("");
    setError(null);
    setFilename("extracted-text");
  }

  async function handleRecognize() {
    const f = file[0];
    if (!f) return;
    setError(null);
    setBusy(true);
    setText("");
    setProgress(0);
    pageRef.current = { current: 0, total: 0 };
    setStatus("กำลังเตรียมเครื่องมืออ่านข้อความ...");

    try {
      const { createWorker, PSM } = await import("tesseract.js");
      const worker = await createWorker(["eng", "tha"], undefined, {
        logger: (m) => {
          const label = STATUS_LABELS[m.status] ?? m.status;
          const { current, total } = pageRef.current;
          setStatus(total > 1 ? `หน้า ${current}/${total} — ${label}` : label);
          if (typeof m.progress === "number") setProgress(m.progress);
        },
      });
      // Default auto page-segmentation tries to split the image into
      // multiple independent text "blocks" — on screenshots with colored
      // chat bubbles or UI chrome, it can misdetect overlapping blocks and
      // read the same line twice, or split single words apart at the
      // boundary. SINGLE_BLOCK tells it to treat the whole image as one
      // block of text read top-to-bottom, which matches documents, photos,
      // and screenshots alike (all of this tool's expected input).
      await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_BLOCK });

      let pdf: Awaited<ReturnType<typeof loadPdf>> | undefined;
      try {
        if (f.type === "application/pdf") {
          const bytes = await f.arrayBuffer();
          pdf = await loadPdf(bytes);
          pageRef.current.total = pdf.numPages;
          const parts: string[] = [];
          for (let i = 1; i <= pdf.numPages; i++) {
            pageRef.current.current = i;
            // Higher scale than other pdf.js uses in this app: Thai vowel/tone
            // marks are small combining glyphs that need more pixels to be
            // segmented correctly, or Tesseract misplaces them.
            const canvas = await renderPageToCanvas(pdf, i, 3);
            preprocessCanvasForOcr(canvas);
            const { data } = await worker.recognize(canvas);
            const cleaned = cleanupThaiOcrText(data.text);
            parts.push(
              pdf.numPages > 1 ? `--- หน้า ${i} ---\n${cleaned}` : cleaned
            );
          }
          setText(parts.join("\n\n"));
        } else {
          const canvas = await loadForOcr(f);
          const { data } = await worker.recognize(canvas);
          setText(cleanupThaiOcrText(data.text));
        }
      } finally {
        pdf?.destroy();
        await worker.terminate();
      }
    } catch (err) {
      console.error("OCR failed:", err);
      setError("ไม่สามารถอ่านข้อความจากไฟล์นี้ได้ กรุณาลองใหม่");
    } finally {
      setBusy(false);
      setStatus("");
    }
  }

  function handleDownload() {
    downloadBytes(
      new TextEncoder().encode(text),
      sanitizeFilename(filename, "extracted-text", ".txt"),
      "text/plain;charset=utf-8"
    );
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <ToolHeader tool={tool} />
      <main className="mx-auto max-w-xl flex-1 px-5 py-6 md:px-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          เลือกไฟล์รูปภาพหรือ PDF แล้วแปลงข้อความในภาพให้อ่านและคัดลอกได้
          รองรับภาษาไทย เลขไทย และภาษาอังกฤษ
        </p>

        <div className="mt-3 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          <p>
            ผลลัพธ์จาก OCR <strong>อาจไม่แม่นยำ 100%</strong>
            ขึ้นอยู่กับขนาดและคุณภาพของภาพต้นฉบับ กรุณา
            <strong>ตรวจสอบข้อความก่อนนำไปใช้เสมอ</strong>
          </p>
        </div>

        <div className="mt-4">
          <FilePicker
            accept="application/pdf,image/jpeg,image/png"
            files={file}
            onChange={handleFileChange}
            label="แตะเพื่อเลือกรูปภาพหรือไฟล์ PDF"
          />
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <PrimaryButton disabled={!file[0] || busy} onClick={handleRecognize} busy={busy}>
          อ่านข้อความจากไฟล์
        </PrimaryButton>

        {busy && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {status}
            </p>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-gray-900 transition-all dark:bg-white"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          </div>
        )}

        {text && !busy && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ข้อความที่อ่านได้
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "คัดลอกแล้ว" : "คัดลอก"}
              </button>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-gray-100"
            />

            <FilenameInput
              value={filename}
              onChange={setFilename}
              ext=".txt"
              label="ชื่อไฟล์ข้อความ"
            />

            <button
              type="button"
              onClick={handleDownload}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-800"
            >
              ดาวน์โหลดเป็นไฟล์ .txt
            </button>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
          ประมวลผลในเบราว์เซอร์ของคุณเท่านั้น ไฟล์ไม่ถูกอัปโหลดขึ้นเซิร์ฟเวอร์ —
          ครั้งแรกต้องใช้อินเทอร์เน็ตเพื่อโหลดโมเดลภาษา ครั้งต่อไปจะเร็วขึ้น
        </p>
      </main>
    </div>
  );
}
