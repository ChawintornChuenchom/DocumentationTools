import { PDFDocument } from "pdf-lib";
import { createIsolatedContainer } from "@/lib/isolatedContainer";

const POINTS_PER_INCH = 72;
const PAGE_WIDTH_IN = 8.27; // A4 portrait
const PAGE_HEIGHT_IN = 11.69;
const MARGIN_PT = 36; // 0.5in
const RENDER_SCALE = 2;

function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("toBlob failed"));
      blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
    }, "image/png");
  });
}

// Renders arbitrary HTML into a paginated PDF by rasterizing it as one tall
// image (via html2canvas) and slicing that image across A4 pages. This is a
// best-effort approximation of print pagination — it can split a line of
// text or a table row across a page break — not a real layout engine.
export async function htmlToPdfBytes(html: string): Promise<Uint8Array> {
  const { default: html2canvas } = await import("html2canvas");

  const pageWidthPt = PAGE_WIDTH_IN * POINTS_PER_INCH;
  const pageHeightPt = PAGE_HEIGHT_IN * POINTS_PER_INCH;
  const contentWidthPt = pageWidthPt - MARGIN_PT * 2;
  const contentHeightPt = pageHeightPt - MARGIN_PT * 2;

  const { doc: iframeDoc, body: container, cleanup } = createIsolatedContainer(contentWidthPt);

  const style = iframeDoc.createElement("style");
  style.textContent = `
    * { box-sizing: border-box; }
    body { color: #111111; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; line-height: 1.5; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
    td, th { border: 1px solid #999999; padding: 4px 6px; text-align: left; }
    h1, h2, h3 { margin: 0 0 8px; font-family: inherit; }
  `;
  iframeDoc.head.appendChild(style);
  container.style.width = `${contentWidthPt}px`;
  container.innerHTML = html;

  let sourceCanvas: HTMLCanvasElement;
  try {
    sourceCanvas = await html2canvas(container, {
      scale: RENDER_SCALE,
      backgroundColor: "#ffffff",
    });
  } finally {
    cleanup();
  }

  const doc = await PDFDocument.create();
  const sliceHeightPx = Math.round(contentHeightPt * RENDER_SCALE);
  const widthPx = sourceCanvas.width;
  const totalHeightPx = sourceCanvas.height;

  let y = 0;
  while (y < totalHeightPx) {
    const sliceH = Math.min(sliceHeightPx, totalHeightPx - y);

    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = widthPx;
    sliceCanvas.height = sliceH;
    const ctx = sliceCanvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, widthPx, sliceH);
    ctx.drawImage(sourceCanvas, 0, y, widthPx, sliceH, 0, 0, widthPx, sliceH);

    const pngBytes = await canvasToPngBytes(sliceCanvas);
    const img = await doc.embedPng(pngBytes);
    const drawHeightPt = sliceH / RENDER_SCALE;

    const page = doc.addPage([pageWidthPt, pageHeightPt]);
    page.drawImage(img, {
      x: MARGIN_PT,
      y: pageHeightPt - MARGIN_PT - drawHeightPt,
      width: contentWidthPt,
      height: drawHeightPt,
    });

    y += sliceH;
  }

  // An empty source (e.g. a blank sheet) produces zero slices — still emit
  // one blank page rather than an invalid zero-page PDF.
  if (doc.getPageCount() === 0) {
    doc.addPage([pageWidthPt, pageHeightPt]);
  }

  return doc.save();
}
