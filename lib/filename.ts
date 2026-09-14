export function sanitizeFilename(
  name: string,
  fallback: string,
  ext: string = ".pdf"
): string {
  const escapedExt = ext.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const cleaned = name
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(new RegExp(`${escapedExt}$`, "i"), "")
    .trim();
  return `${cleaned || fallback}${ext}`;
}
