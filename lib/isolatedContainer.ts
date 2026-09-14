// Creates an off-screen iframe with a blank stylesheet (no inheritance from
// this app's global Tailwind CSS) to host content that will be rasterized
// with html2canvas. html2canvas's color parser doesn't understand modern CSS
// color functions (oklch()/lab()), which Tailwind v4's default palette uses —
// mounting content directly into the main document crashes the capture.
export function createIsolatedContainer(widthPx: number): {
  iframe: HTMLIFrameElement;
  doc: Document;
  body: HTMLElement;
  cleanup: () => void;
} {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-99999px";
  iframe.style.top = "0";
  iframe.style.width = `${widthPx}px`;
  iframe.style.height = "1px";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: #ffffff; }
    </style></head><body></body></html>`
  );
  doc.close();

  return {
    iframe,
    doc,
    body: doc.body,
    cleanup: () => document.body.removeChild(iframe),
  };
}
