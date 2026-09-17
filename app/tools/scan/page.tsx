"use client";

import { useEffect, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { getTool } from "@/lib/tools";
import { ToolHeader } from "@/components/ToolHeader";
import { FilePicker } from "@/components/FilePicker";
import { FilenameInput } from "@/components/FilenameInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { PdfResultPreview } from "@/components/PdfResultPreview";
import { Camera, CircleDot, X } from "lucide-react";

const tool = getTool("scan")!;

export default function ScanPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [filename, setFilename] = useState("scan");
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const shotCount = useRef(0);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // The <video> element only mounts once `cameraOn` is true, so
  // `videoRef.current` is always null at the point openCamera() requests
  // the stream — assigning srcObject there was a no-op and the preview
  // stayed black. Assign it here instead, once the element actually exists.
  useEffect(() => {
    if (!cameraOn) return;
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    video.play().catch((err) => {
      console.error("Starting camera preview failed:", err);
      setCameraError("ไม่สามารถแสดงภาพจากกล้องได้ กรุณาลองใหม่");
    });
  }, [cameraOn]);

  async function openCamera() {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setCameraOn(true);
    } catch (err) {
      console.error("Opening camera failed:", err);
      setCameraError("ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการเข้าถึงกล้อง");
    }
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        shotCount.current += 1;
        const file = new File([blob], `scan-${shotCount.current}.jpg`, {
          type: "image/jpeg",
        });
        setFiles((prev) => [...prev, file]);
        setResult(null);
      },
      "image/jpeg",
      0.92
    );
  }

  function handleFilesChange(newFiles: File[]) {
    setFiles(newFiles);
    setResult(null);
  }

  async function handleConvert() {
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const doc = await PDFDocument.create();
      // Reading each file is independent I/O, so do it concurrently; embedding
      // must stay sequential since it mutates the single shared `doc`.
      const loaded = await Promise.all(
        files.map(async (file) => ({
          bytes: new Uint8Array(await file.arrayBuffer()),
          isPng: file.type === "image/png",
        }))
      );
      for (const { bytes, isPng } of loaded) {
        const image = isPng
          ? await doc.embedPng(bytes)
          : await doc.embedJpg(bytes);
        const page = doc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }
      const out = await doc.save();
      setResult(out);
    } catch (err) {
      console.error("Scan conversion failed:", err);
      setError("รองรับเฉพาะไฟล์ JPG และ PNG เท่านั้น");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <ToolHeader tool={tool} />
      <main className="mx-auto max-w-xl flex-1 px-5 py-6 md:px-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          ถ่ายภาพเอกสารด้วยกล้อง หรือเลือกรูปที่มีอยู่แล้ว จัดลำดับ แล้วแปลงเป็น PDF
        </p>

        {cameraOn ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-black dark:border-gray-800">
            <video ref={videoRef} className="w-full" playsInline muted />
            <div className="flex items-center justify-between bg-white px-4 py-3 dark:bg-gray-900">
              <button
                type="button"
                onClick={closeCamera}
                aria-label="ปิดกล้อง"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={capture}
                aria-label="ถ่ายภาพ"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white transition-colors hover:bg-gray-700 active:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >
                <CircleDot className="h-7 w-7" />
              </button>
              <div className="h-10 w-10" />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={openCamera}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white py-6 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800"
          >
            <Camera className="h-5 w-5" />
            เปิดกล้องถ่ายเอกสาร
          </button>
        )}

        {cameraError && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            {cameraError}
          </p>
        )}

        <div className="mt-4">
          <FilePicker
            accept="image/jpeg,image/png"
            multiple
            allowReorder
            files={files}
            onChange={handleFilesChange}
            label="หรือแตะเพื่อเลือกรูปจากเครื่อง"
          />
        </div>

        {files.length > 0 && (
          <FilenameInput value={filename} onChange={setFilename} />
        )}

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <PrimaryButton
          disabled={files.length === 0 || busy}
          onClick={handleConvert}
          busy={busy}
        >
          แปลงเป็น PDF ({files.length} หน้า)
        </PrimaryButton>

        {result && (
          <PdfResultPreview
            bytes={result}
            filename={filename}
            fallbackFilename="scan"
          />
        )}

        <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
          ประมวลผลในเบราว์เซอร์ของคุณเท่านั้น ไฟล์ไม่ถูกอัปโหลดขึ้นเซิร์ฟเวอร์
        </p>
      </main>
    </div>
  );
}
