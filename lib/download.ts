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
}
