// Tesseract's Thai model unreliably inserts spurious spaces between
// individual Thai characters (e.g. "เข้าสอบ" comes back as "เข ้ า ส อ บ") —
// a documented, deep limitation in Tesseract's own word-spacing algorithm
// (tesseract-ocr/tesseract#3449), not something a config parameter fixes.
// Thai script doesn't use spaces between words at all, so any space that
// sits directly between two Thai characters is almost certainly one of
// these artifacts, not real typography — collapsing it is safe and leaves
// spaces next to non-Thai text (numbers, English, punctuation) untouched.
const THAI_CHAR = "฀-๿";
const SPURIOUS_SPACE = new RegExp(`([${THAI_CHAR}])[ \\t]+(?=[${THAI_CHAR}])`, "g");

export function cleanupThaiOcrText(text: string): string {
  return text.replace(SPURIOUS_SPACE, "$1");
}
