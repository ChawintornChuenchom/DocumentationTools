"use client";

import { useState } from "react";
import { getTool } from "@/lib/tools";
import { ToolHeader } from "@/components/ToolHeader";
import { FilePicker } from "@/components/FilePicker";
import { FilenameInput } from "@/components/FilenameInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { FileResultDownload } from "@/components/FileResultDownload";
import { loadPdf, renderPageToCanvas, canvasToJpegBytes } from "@/lib/pdfjs";

const tool = getTool("pdf-to-ppt")!;

// PDF points are 1/72 inch; pptxgenjs layout dimensions are in inches.
const POINTS_PER_INCH = 72;
const RENDER_SCALE = 2;

function uint8ToBase64(bytes: Uint8Array): string {
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export default function PdfToPptPage() {
  const [file, setFile] = useState<File[]>([]);
  const [filename, setFilename] = useState("presentation");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ bytes: Uint8Array; pages: number } | null>(null);

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
    let pdf: Awaited<ReturnType<typeof loadPdf>> | undefined;
    try {
      const bytes = await f.arrayBuffer();
      pdf = await loadPdf(bytes);

      const { default: PptxGenJS } = await import("pptxgenjs");
      const pptx = new PptxGenJS();

      // Every slide in a pptxgenjs presentation shares one layout size, but
      // PDF pages can vary. We size the layout to page 1 and letterbox any
      // differently-sized pages into it, centered.
      let layoutWidthIn = 10;
      let layoutHeightIn = 7.5;

      for (let i = 1; i <= pdf.numPages; i++) {
        const canvas = await renderPageToCanvas(pdf, i, RENDER_SCALE);
        const widthIn = canvas.width / RENDER_SCALE / POINTS_PER_INCH;
        const heightIn = canvas.height / RENDER_SCALE / POINTS_PER_INCH;

        if (i === 1) {
          layoutWidthIn = widthIn;
          layoutHeightIn = heightIn;
          pptx.defineLayout({ name: "PDF_PAGE", width: layoutWidthIn, height: layoutHeightIn });
          pptx.layout = "PDF_PAGE";
        }

        const jpegBytes = await canvasToJpegBytes(canvas, 0.85);
        const dataUrl = `data:image/jpeg;base64,${uint8ToBase64(jpegBytes)}`;

        const fitScale = Math.min(layoutWidthIn / widthIn, layoutHeightIn / heightIn);
        const w = widthIn * fitScale;
        const h = heightIn * fitScale;

        const slide = pptx.addSlide();
        slide.addImage({
          data: dataUrl,
          x: (layoutWidthIn - w) / 2,
          y: (layoutHeightIn - h) / 2,
          w,
          h,
        });
      }

      const out = await pptx.write({ outputType: "uint8array" });
      setResult({ bytes: out as Uint8Array, pages: pdf.numPages });
    } catch (err) {
      console.error("PDF to PowerPoint conversion failed:", err);
      setError("ไม่สามารถแปลงไฟล์นี้เป็น PowerPoint ได้ กรุณาตรวจสอบว่าเป็นไฟล์ PDF ที่ไม่ได้ล็อกรหัสผ่าน");
    } finally {
      pdf?.destroy();
      setBusy(false);
    }
  }

  return (
    <div>
      <ToolHeader tool={tool} />
      <main className="mx-auto max-w-xl flex-1 px-5 py-6 md:px-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          เลือกไฟล์ PDF แล้วแปลงแต่ละหน้าเป็นสไลด์ PowerPoint (แต่ละสไลด์เป็นรูปหน้าเอกสาร
          ไม่ใช่ข้อความที่แก้ไขได้ เหมาะสำหรับนำไปนำเสนอต่อ)
        </p>

        <div className="mt-4">
          <FilePicker
            accept="application/pdf"
            files={file}
            onChange={handleFileChange}
            label="แตะเพื่อเลือกไฟล์ PDF"
          />
        </div>

        {file[0] && <FilenameInput value={filename} onChange={setFilename} ext=".pptx" />}

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <PrimaryButton disabled={!file[0] || busy} onClick={handleConvert} busy={busy}>
          แปลงเป็น PowerPoint
        </PrimaryButton>

        {result && (
          <FileResultDownload
            bytes={result.bytes}
            filename={filename}
            fallbackFilename="presentation"
            ext=".pptx"
            mime="application/vnd.openxmlformats-officedocument.presentationml.presentation"
            label="ดาวน์โหลดไฟล์ PowerPoint"
            note={`แปลงสำเร็จ ${result.pages} สไลด์`}
          />
        )}

        <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
          ประมวลผลในเบราว์เซอร์ของคุณเท่านั้น ไฟล์ไม่ถูกอัปโหลดขึ้นเซิร์ฟเวอร์
        </p>
      </main>
    </div>
  );
}
