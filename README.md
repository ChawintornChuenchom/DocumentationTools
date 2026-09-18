# DoctoolS

เว็บแอปส่วนตัวรวมเครื่องมือจัดการไฟล์ PDF ประมวลผลไฟล์ทั้งหมดในเบราว์เซอร์ ไม่มีการอัปโหลดขึ้นเซิร์ฟเวอร์ ดีไซน์แบบมินิมอล ไม่เกิน 5 สีทั้งแอป (ดูกติกาใน [SPEC.md](./SPEC.md#design-harness-กติกาการออกแบบ---ยึดตามนี้เสมอ))

รายละเอียดเครื่องมือทั้งหมดและแผนพัฒนา ดูที่ [SPEC.md](./SPEC.md)

## เริ่มต้นใช้งาน

```bash
npm install
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## เครื่องมือที่ใช้งานได้แล้ว (15/20)

- สแกนเอกสาร (กล้อง/เลือกรูป) — `/tools/scan`
- รวมไฟล์ PDF — `/tools/merge`
- จัดหน้า PDF (reorder/หมุน/ลบ) — `/tools/organize`
- แยกไฟล์ PDF — `/tools/split`
- ลดขนาด PDF — `/tools/compress`
- แปลงเป็นรูป PDF → JPG — `/tools/pdf-to-jpg`
- ลดขนาดไฟล์ภาพ — `/tools/compress-image`
- Image → PDF — `/tools/jpg-to-pdf`
- ใส่เลขหน้า PDF — `/tools/page-numbers`
- ใส่ลายน้ำ PDF (รองรับภาษาไทย) — `/tools/watermark`
- หมุนหน้า PDF — `/tools/rotate`
- อ่านข้อความจากภาพ (OCR, ไทย/เลขไทย/อังกฤษ) — `/tools/ocr`
- Word → PDF — `/tools/word-to-pdf`
- Excel → PDF — `/tools/excel-to-pdf`
- PDF → PowerPoint (แต่ละหน้าเป็นสไลด์รูปภาพ) — `/tools/pdf-to-ppt`

## ยังเป็น placeholder "เร็วๆ นี้" (5 เครื่องมือ)

- PDF → Word, PDF → Excel, PowerPoint → PDF — ยังไม่มีไลบรารีฝั่ง client ที่แปลงกลับทิศทางนี้ได้คุณภาพดีพอ (ตัวเลือกที่มีต้องพึ่ง backend ซึ่งขัดกับหลักการ client-only ของแอป)
- ใส่รหัสผ่าน PDF / ปลดล็อก PDF — `pdf-lib` ไม่รองรับการเข้ารหัส ไลบรารีทางเลือก (เช่น `qpdf-wasm`) ต้องการ Cross-Origin Isolation ที่เสี่ยงกระทบเครื่องมืออื่นในแอป ยังไม่ได้ข้อสรุปที่ปลอดภัยพอ

ดูรายละเอียดและเหตุผลเต็มๆ ใน [SPEC.md](./SPEC.md)
