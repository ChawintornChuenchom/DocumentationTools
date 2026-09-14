import { track } from "@vercel/analytics";

export function downloadBytes(
  bytes: Uint8Array,
  filename: string,
  mime: string
) {
  const blob = new Blob([bytes as BlobPart], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoking immediately can race with the browser starting the download
  // (most noticeable on Firefox), so free the URL on the next tick instead.
  setTimeout(() => URL.revokeObjectURL(url), 0);

  // Every tool's "ดาวน์โหลด" button funnels through here, so this is the
  // one spot that reliably captures real usage (as opposed to page views).
  // Track only the mime type, never the filename — filenames come from the
  // user's own documents and may contain sensitive content.
  track("download", { mime });
}
