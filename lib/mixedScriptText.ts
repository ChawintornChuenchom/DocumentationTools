import { PDFDocument, PDFFont, PDFPage, Color, Rotation, toRadians } from "pdf-lib";

// pdf-lib's built-in standard fonts (Helvetica etc.) only support WinAnsi
// encoding, which has no Thai glyphs — drawing Thai text with them throws.
// This embeds a Thai-capable font alongside the standard Latin one and
// splits mixed Thai/Latin text into per-script runs at draw time.
export async function embedThaiCapableFont(
  doc: PDFDocument,
  latinFont: PDFFont,
  weight: "regular" | "bold" = "regular"
): Promise<{ thaiFont: PDFFont; latinFont: PDFFont }> {
  const fontkit = (await import("@pdf-lib/fontkit")).default;
  doc.registerFontkit(fontkit);
  const url = weight === "bold" ? "/fonts/NotoSansThai-Bold.ttf" : "/fonts/NotoSansThai-Regular.ttf";
  const fontBytes = await fetch(url).then((r) => r.arrayBuffer());
  const thaiFont = await doc.embedFont(fontBytes);
  return { thaiFont, latinFont };
}

const THAI_BLOCK = /[฀-๿]/;

function segmentByScript(text: string): { text: string; isThai: boolean }[] {
  const segments: { text: string; isThai: boolean }[] = [];
  for (const ch of text) {
    const isThai = THAI_BLOCK.test(ch);
    const last = segments[segments.length - 1];
    if (last && last.isThai === isThai) {
      last.text += ch;
    } else {
      segments.push({ text: ch, isThai });
    }
  }
  return segments;
}

function fontFor(seg: { isThai: boolean }, fonts: { thaiFont: PDFFont; latinFont: PDFFont }) {
  return seg.isThai ? fonts.thaiFont : fonts.latinFont;
}

export function measureMixedScriptText(
  text: string,
  fonts: { thaiFont: PDFFont; latinFont: PDFFont },
  size: number
): number {
  return segmentByScript(text).reduce(
    (sum, seg) => sum + fontFor(seg, fonts).widthOfTextAtSize(seg.text, size),
    0
  );
}

export function drawMixedScriptText(
  page: PDFPage,
  text: string,
  opts: {
    x: number;
    y: number;
    size: number;
    thaiFont: PDFFont;
    latinFont: PDFFont;
    color?: Color;
    opacity?: number;
    rotate?: Rotation;
  }
): void {
  const angle = opts.rotate ? toRadians(opts.rotate) : 0;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  let cumWidth = 0;
  for (const seg of segmentByScript(text)) {
    const font = fontFor(seg, opts);
    page.drawText(seg.text, {
      x: opts.x + cumWidth * cos,
      y: opts.y + cumWidth * sin,
      size: opts.size,
      font,
      color: opts.color,
      opacity: opts.opacity,
      rotate: opts.rotate,
    });
    cumWidth += font.widthOfTextAtSize(seg.text, opts.size);
  }
}
