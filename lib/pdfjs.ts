import type * as PdfjsLib from "pdfjs-dist";

let pdfjsPromise: Promise<typeof PdfjsLib> | null = null;

async function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

export async function loadPdf(bytes: ArrayBuffer) {
  const pdfjs = await getPdfjs();
  const task = pdfjs.getDocument({ data: bytes });
  const pdf = await task.promise;
  // PDFDocumentProxy itself has no destroy(); it lives on the loading task
  // (which is what actually releases the worker-side document data).
  return Object.assign(pdf, { destroy: () => task.destroy() });
}

export async function renderPageToCanvas(
  pdf: PdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale: number
): Promise<HTMLCanvasElement> {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d")!;
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  page.cleanup();
  return canvas;
}

export function canvasToJpegBytes(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("toBlob failed"));
        blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
      },
      "image/jpeg",
      quality
    );
  });
}
