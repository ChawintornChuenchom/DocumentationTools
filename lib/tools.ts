export type ToolStatus = "ready" | "soon";

export type ToolDef = {
  slug: string;
  title: string;
  description: string;
  icon:
    | "scan"
    | "merge"
    | "organize"
    | "split"
    | "compress"
    | "pdf-to-jpg"
    | "compress-image"
    | "jpg-to-pdf"
    | "page-numbers"
    | "watermark"
    | "rotate"
    | "ocr"
    | "word-to-pdf"
    | "pdf-to-word"
    | "excel-to-pdf"
    | "pdf-to-excel"
    | "ppt-to-pdf"
    | "pdf-to-ppt"
    | "protect"
    | "unlock";
  status: ToolStatus;
};

export const TOOLS: ToolDef[] = [
  {
    slug: "scan",
    title: "สแกนเอกสาร",
    description: "ถ่ายหรือเลือกรูปเอกสารแล้วแปลงเป็น PDF",
    icon: "scan",
    status: "ready",
  },
  {
    slug: "merge",
    title: "รวมไฟล์ PDF",
    description: "ต่อหลายไฟล์เข้าด้วยกันตามลำดับที่ต้องการ",
    icon: "merge",
    status: "ready",
  },
  {
    slug: "organize",
    title: "จัดหน้า PDF",
    description: "ลากสลับลำดับ หมุน หรือลบหน้าที่ไม่ต้องการ",
    icon: "organize",
    status: "ready",
  },
  {
    slug: "split",
    title: "แยกไฟล์ PDF",
    description: "ดึงเฉพาะหน้าที่ต้องการออกมาเป็นไฟล์ใหม่",
    icon: "split",
    status: "ready",
  },
  {
    slug: "compress",
    title: "ลดขนาด PDF",
    description: "บีบอัดภาพในเอกสารให้ไฟล์เล็กลง",
    icon: "compress",
    status: "ready",
  },
  {
    slug: "pdf-to-jpg",
    title: "แปลงเป็นรูป PDF → JPG",
    description: "เปลี่ยนทุกหน้าเป็น PNG หรือ JPG",
    icon: "pdf-to-jpg",
    status: "ready",
  },
  {
    slug: "compress-image",
    title: "ลดขนาดไฟล์ภาพ",
    description: "บีบอัด JPG, PNG, WEBP ให้เบาลง",
    icon: "compress-image",
    status: "ready",
  },
  {
    slug: "jpg-to-pdf",
    title: "Image → PDF",
    description: "รวมรูปถ่ายหรือเอกสารหลายรูปเป็น PDF เดียว",
    icon: "jpg-to-pdf",
    status: "ready",
  },
  {
    slug: "page-numbers",
    title: "ใส่เลขหน้า PDF",
    description: "ใส่เลขหน้าอัตโนมัติ เลือกตำแหน่งได้",
    icon: "page-numbers",
    status: "ready",
  },
  {
    slug: "watermark",
    title: "ใส่ลายน้ำ PDF",
    description: "ใส่ข้อความหรือโลโก้ลายน้ำทับเอกสาร",
    icon: "watermark",
    status: "ready",
  },
  {
    slug: "rotate",
    title: "หมุนหน้า PDF",
    description: "หมุนหน้าที่วางผิดทิศให้ตรง",
    icon: "rotate",
    status: "ready",
  },
  {
    slug: "ocr",
    title: "อ่านข้อความจากภาพ (OCR)",
    description: "แปลงรูปหรือ PDF ให้เป็นข้อความ รองรับไทย เลขไทย และอังกฤษ",
    icon: "ocr",
    status: "ready",
  },
  {
    slug: "word-to-pdf",
    title: "Word → PDF",
    description: "แปลงไฟล์ Word (.docx) เป็น PDF",
    icon: "word-to-pdf",
    status: "ready",
  },
  {
    slug: "pdf-to-word",
    title: "PDF → Word",
    description: "แปลงไฟล์ PDF ให้แก้ไขได้ใน Word",
    icon: "pdf-to-word",
    status: "soon",
  },
  {
    slug: "excel-to-pdf",
    title: "Excel → PDF",
    description: "แปลงไฟล์ Excel (.xlsx) เป็น PDF",
    icon: "excel-to-pdf",
    status: "ready",
  },
  {
    slug: "pdf-to-excel",
    title: "PDF → Excel",
    description: "แปลงตารางใน PDF ให้แก้ไขได้ใน Excel",
    icon: "pdf-to-excel",
    status: "soon",
  },
  {
    slug: "ppt-to-pdf",
    title: "PowerPoint → PDF",
    description: "แปลงไฟล์สไลด์ PowerPoint (.pptx) เป็น PDF",
    icon: "ppt-to-pdf",
    status: "soon",
  },
  {
    slug: "pdf-to-ppt",
    title: "PDF → PowerPoint",
    description: "แปลงแต่ละหน้า PDF เป็นสไลด์รูปภาพใน PowerPoint",
    icon: "pdf-to-ppt",
    status: "ready",
  },
  {
    slug: "protect",
    title: "ใส่รหัสผ่าน PDF",
    description: "ล็อกไฟล์ด้วยรหัสผ่านกันคนอื่นเปิด",
    icon: "protect",
    status: "soon",
  },
  {
    slug: "unlock",
    title: "ปลดล็อก PDF",
    description: "เอารหัสผ่านออกจากไฟล์ที่คุณเป็นเจ้าของ",
    icon: "unlock",
    status: "soon",
  },
];

export function getTool(slug: string): ToolDef | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
