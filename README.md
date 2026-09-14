# เครื่องมือ PDF

เว็บแอปส่วนตัวรวมเครื่องมือจัดการไฟล์ PDF ประมวลผลไฟล์ทั้งหมดในเบราว์เซอร์ ไม่มีการอัปโหลดขึ้นเซิร์ฟเวอร์ ดีไซน์แบบมินิมอล ไม่เกิน 5 สีทั้งแอป (ดูกติกาใน [SPEC.md](./SPEC.md#design-harness-กติกาการออกแบบ---ยึดตามนี้เสมอ))

รายละเอียดเครื่องมือทั้งหมดและแผนพัฒนา ดูที่ [SPEC.md](./SPEC.md)

## เริ่มต้นใช้งาน

```bash
npm install
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## เครื่องมือที่ใช้งานได้แล้ว (12/20)

- สแกนเอกสาร (กล้อง/เลือกรูป) — `/tools/scan`
- รวมไฟล์ PDF — `/tools/merge`
- จัดหน้า PDF (reorder/หมุน/ลบ) — `/tools/organize`
- แยกไฟล์ PDF — `/tools/split`
- ลดขนาด PDF — `/tools/compress`
- แปลงเป็นรูป PDF → JPG — `/tools/pdf-to-jpg`
- ลดขนาดไฟล์ภาพ — `/tools/compress-image`
- Image → PDF — `/tools/jpg-to-pdf`
- ใส่เลขหน้า PDF — `/tools/page-numbers`
- ใส่ลายน้ำ PDF — `/tools/watermark`
- หมุนหน้า PDF — `/tools/rotate`
- อ่านข้อความจากภาพ (OCR, ไทย/เลขไทย/อังกฤษ) — `/tools/ocr`

เครื่องมือแปลง Office (Word/Excel/PowerPoint ↔ PDF) และรหัสผ่าน PDF ยังเป็น placeholder "เร็วๆ นี้" — ต้องการ backend หรือไลบรารีเพิ่มเติมที่ยังไม่ได้ตัดสินใจ ดูรายละเอียดใน [SPEC.md](./SPEC.md)
