import JSZip from "jszip";
import { downloadBytes } from "@/lib/download";

// Defense-in-depth against zip-slip style entries: keep only the final path
// segment and drop any leading dots, so a crafted name (e.g. containing
// "../") can't escape the archive root when someone later extracts it.
function sanitizeZipEntryName(name: string): string {
  const base = name.replace(/\\/g, "/").split("/").pop() || "";
  return base.replace(/^\.+/, "") || "file";
}

export async function downloadAsZip(
  files: { name: string; bytes: Uint8Array }[],
  zipFilename: string
) {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(sanitizeZipEntryName(file.name), file.bytes);
  }
  const bytes = await zip.generateAsync({ type: "uint8array" });
  downloadBytes(bytes, zipFilename, "application/zip");
}
