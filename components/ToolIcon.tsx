import {
  ScanLine,
  Copy,
  LayoutGrid,
  Columns2,
  Minimize2,
  Image as ImageIcon,
  ImageDown,
  FileImage,
  Hash,
  Droplet,
  RotateCw,
  ScanText,
  FileText,
  FileSpreadsheet,
  Presentation,
  Lock,
  Unlock as UnlockIcon,
  type LucideProps,
} from "lucide-react";
import type { ToolDef } from "@/lib/tools";

const ICONS: Record<ToolDef["icon"], React.ComponentType<LucideProps>> = {
  scan: ScanLine,
  merge: Copy,
  organize: LayoutGrid,
  split: Columns2,
  compress: Minimize2,
  "pdf-to-jpg": ImageIcon,
  "compress-image": ImageDown,
  "jpg-to-pdf": FileImage,
  "page-numbers": Hash,
  watermark: Droplet,
  rotate: RotateCw,
  ocr: ScanText,
  "word-to-pdf": FileText,
  "pdf-to-word": FileText,
  "excel-to-pdf": FileSpreadsheet,
  "pdf-to-excel": FileSpreadsheet,
  "ppt-to-pdf": Presentation,
  "pdf-to-ppt": Presentation,
  protect: Lock,
  unlock: UnlockIcon,
};

export function ToolIcon({
  icon,
  className,
}: {
  icon: ToolDef["icon"];
  className?: string;
}) {
  const Icon = ICONS[icon];
  return <Icon className={className} strokeWidth={2} />;
}
