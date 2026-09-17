// Tesseract's models are trained overwhelmingly on dark text on a light
// background. Screenshots of dark-mode UIs (chat apps, code editors, etc.)
// — light text on a dark background — read far worse as-is. Detecting a
// dark-dominant image and inverting it first measurably improves accuracy
// for that case, at effectively no cost for normal light-background scans
// (which are left untouched).
// Thai vowel/tone marks are small combining glyphs stacked above or below
// the base consonant — at low pixel resolution they blur into neighboring
// characters and Tesseract misplaces or drops them, which reads as letters
// "jumping around". Upscaling small images before recognition (not just
// leaving it to Tesseract) gives the segmenter enough pixels to place them
// correctly.
const MIN_LONG_EDGE = 1800;
const MAX_UPSCALE = 3;

export async function loadForOcr(file: File): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file);
  const longEdge = Math.max(bitmap.width, bitmap.height);
  const scale = longEdge < MIN_LONG_EDGE ? Math.min(MAX_UPSCALE, MIN_LONG_EDGE / longEdge) : 1;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  preprocessCanvasForOcr(canvas);
  return canvas;
}

// Same dark-background inversion, for a canvas that's already rendered
// (e.g. a PDF page rasterized via pdf.js) rather than loaded from a file.
export function preprocessCanvasForOcr(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d")!;
  invertIfDarkBackground(ctx, canvas.width, canvas.height);
}

function invertIfDarkBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;

  // Sample roughly a few thousand pixels rather than every pixel — a
  // luminance estimate doesn't need full precision.
  const pixelCount = data.length / 4;
  const targetSamples = 5000;
  const stridePixels = Math.max(1, Math.floor(pixelCount / targetSamples));

  let sum = 0;
  let samples = 0;
  for (let p = 0; p < pixelCount; p += stridePixels) {
    const i = p * 4;
    sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    samples++;
  }
  const avgLuminance = sum / samples;
  if (avgLuminance >= 115) return; // light (or neutral) background — leave as-is

  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
  ctx.putImageData(imageData, 0, 0);
}
