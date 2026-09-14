# เครื่องมือ PDF

เว็บแอปส่วนตัวสำหรับจัดการไฟล์ PDF ทำเองใช้เอง ประมวลผลไฟล์ทั้งหมด **ฝั่ง Browser (client-side)** — ไฟล์ของผู้ใช้ไม่ถูกอัปโหลดขึ้นเซิร์ฟเวอร์ ปลอดภัยและเร็ว

## Tech Stack

- **Next.js** (App Router) + TypeScript
- **Tailwind CSS v4** สำหรับ UI (class-based dark mode ผ่าน `@custom-variant dark`)
- **next-themes** — สลับ light/dark mode พร้อมจำค่าไว้
- **pdf-lib** — สร้าง/แก้ไข PDF (merge, split, page numbers, watermark, rotate, organize, compress)
- **pdfjs-dist** — render หน้า PDF เป็นภาพ (ใช้กับ PDF → JPG, organize thumbnails, compress) โหลดแบบ dynamic import ฝั่ง client เท่านั้น (`lib/pdfjs.ts`) เพื่อไม่ให้ทำงานตอน SSR
- **browser-image-compression** — บีบอัดรูปภาพฝั่ง client
- **jszip** — รวมหลายไฟล์เป็น .zip เดียวตอนดาวน์โหลด (ใช้กับ PDF→JPG, ลดขนาดไฟล์ภาพ เมื่อมีมากกว่า 1 ไฟล์)
- **tesseract.js** — OCR ฝั่ง client รองรับ `eng+tha` (ไทย เลขไทย อังกฤษ) โหลด core/lang data จาก CDN ตอนใช้งานจริงเท่านั้น (ต้องมีอินเทอร์เน็ตครั้งแรก หลังจากนั้น browser cache ไว้)
- Deploy: Vercel หรือ static export

## Security

- **npm audit: 0 vulnerabilities.** ทุก dependency อยู่ที่เวอร์ชันล่าสุดที่ published บน npm (เช็คด้วย `npm view <pkg> version` เทียบ installed) ยกเว้น dev-only tooling บางตัว (eslint, typescript, @types/node) ที่ตามหลัง major version ล่าสุดแต่ไม่มี known CVE
- **ไม่มี XSS surface ในโค้ดเอง** — ไม่มี `dangerouslySetInnerHTML`, `innerHTML`, `eval`, หรือ `javascript:` URL ที่ไหนเลยในแอป (เช็คด้วย grep ทั้ง repo) ข้อความ user-generated ทั้งหมด (ชื่อไฟล์, OCR output, ข้อความลายน้ำ) render ผ่าน JSX ธรรมดาซึ่ง React auto-escape ให้
- **Security headers** ตั้งใน `next.config.ts` (`headers()`): `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` (เปิดเฉพาะ `camera=(self)` ให้เครื่องมือสแกน ปิดที่เหลือ), `Strict-Transport-Security`
  - CSP `connect-src` จำกัดไว้แค่ `'self'` และ `https://cdn.jsdelivr.net` (โดเมนเดียวที่ tesseract.js ดึง worker/core/language data มาใช้ตอน OCR ทั้งหมด pinned เป็น version เฉพาะ ไม่ใช่ `latest`)
  - `script-src`/`style-src` มี `'unsafe-inline'` เพราะ Next.js/next-themes/React ต้องใช้ inline script+style บางจุด — พิจารณาแล้วว่าใช้ nonce-based CSP แทนได้ แต่ต้องเพิ่ม middleware.ts ซึ่งบังคับให้ทั้งแอปเป็น dynamic rendering (เสีย static export ที่เป็นจุดขายหลักของโปรเจกต์) เทียบกับความเสี่ยงจริงที่ไม่มี injection vector ในโค้ดเลย จึงเลือกไม่ทำ
  - `frame-ancestors 'none'` + `object-src 'none'` กัน clickjacking/plugin-based attack
- **Zip entry names sanitize แล้ว** (`lib/zip.ts`) — ตัด path component ทิ้งก่อนใส่ในไฟล์ zip กัน zip-slip แม้ในบริบทแอปนี้ (client-only, ผู้ใช้คนเดียว) จะแทบไม่มีทางถูกโจมตีจริงก็ตาม
- **ไม่มี API route / backend เลย** — ไม่มี A01 (access control), A10 (SSRF) หรือ server-side injection surface ให้ต้องกังวล เพราะไม่มีเซิร์ฟเวอร์ประมวลผลอะไรทั้งสิ้น

## Design Harness (กติกาการออกแบบ — ยึดตามนี้เสมอ)

หลักการ: **"น้อยแต่มาก"** — ลดสี ลดของตกแต่ง ให้ตัวอักษรกับไอคอนพาไปแทน ไม่ใช่สี ไม่เอาการ์ดไล่เฉดสีหลากสี ไม่มีโลโก้/แบรนด์หน่วยงานในตัวแอป (เป็นเครื่องมือส่วนตัว)

**หมายเหตุ (revision 2):** เดิมใช้ indigo-600 เป็น accent ของปุ่ม/ทุกจุดโต้ตอบ ซึ่งเป็นสีที่ generic มาก (สีเริ่มต้นของ Tailwind/เทมเพลต AI ทั่วไป) และแทบทุก interactive element ไม่มี hover state เลย (ทดสอบแต่ mobile touch) — ดูเป็น "AI vibe coded" ไม่ใช่งานที่คนออกแบบจริง ปรับเป็นภาษาสี **โมโนโครมเป็นหลัก + accent สงวนไว้ใช้แค่จุดเดียว** ตามด้านล่าง

**พาเลตสี (light mode):**

| บทบาท | สี | Tailwind class |
|---|---|---|
| พื้นหลัง/การ์ด | ขาว | `bg-white` |
| ตัวอักษรหลัก | เทาเข้มเกือบดำ | `text-gray-900` |
| ตัวอักษรรอง | เทากลาง | `text-gray-500` / `text-gray-400` |
| เส้นขอบ/คั่น | เทาอ่อน | `border-gray-200` |
| Primary action (ปุ่มหลัก, selected state, active nav) | ดำ/ขาวสลับกัน ("ink") | `bg-gray-900 text-white` (dark mode สลับเป็น `bg-white text-gray-900`) |
| Accent สี (จุดเดียวในแอป — dark mode toggle switch ตอนเปิด) | Indigo | `bg-indigo-600` |
| สถานะ "เร็วๆ นี้" | เขียวอ่อน | `bg-green-100 text-green-700` |
| คำเตือน (เช่น บีบอัด PDF จะคัดลอกข้อความไม่ได้) | เหลืองอำพัน | `bg-amber-50 text-amber-800` |

**Dark mode:** ทุก surface มี `dark:` คู่กัน (เช่น `bg-white dark:bg-gray-900`, `border-gray-200 dark:border-gray-800`, `text-gray-900 dark:text-gray-100`) — ปุ่ม/selected-state สีดำในโหมดสว่างจะ**สลับเป็นสีขาว**ในโหมดมืด (ไม่ใช่ดำบนพื้นดำ)

กติกา:
- **ห้าม** ใช้ `bg-gradient-*` หรือกำหนดสีพื้นหลัง/ไอคอนแยกตามรายเครื่องมือ (เดิมทำให้ดูเหมือน "ลอก" มา)
- ไอคอนในการ์ด/หัวข้อใช้กล่อง **ขอบเส้น** (`border border-gray-200`, ไม่ใช่พื้นหลังทึบ `bg-gray-100`) — ให้ความรู้สึกเป็น "chip" ที่ประณีตกว่า ไม่ใช่กล่องสีเทาแบนๆ ที่ทุกแอป AI-generated ใช้เหมือนกันหมด
- ปุ่ม primary action ใช้ `PrimaryButton` component (`components/PrimaryButton.tsx`) เท่านั้น อย่า copy-paste className ปุ่มเอง — สี ink ดำ/ขาว, มี `hover:`/`active:` ครบ, `rounded-xl`
- ตัวเลือกแบบ segmented (เช่น เลือกทิศทางหมุน, ตำแหน่งเลขหน้า, ระดับบีบอัด) ตอนเลือก = `bg-gray-900 text-white dark:bg-white dark:text-gray-900`, ตอนไม่เลือก = `border-gray-200 text-gray-600` **ต้องมี** `hover:border-gray-300 hover:bg-gray-50` เสมอ
- ป้ายสถานะ "เร็วๆ นี้" เป็น pill สีเขียวอ่อน — เป็นสีเดียวที่ยกเว้นได้เพราะสื่อความหมายสถานะ ไม่ใช่แบรนด์ดิ้งรายเครื่องมือ
- radius มาตรฐาน = `rounded-xl` (ไม่ใช่ `rounded-2xl`) ทั้งแอป — เรียบคมกว่า ไม่ "bubbly" แบบเทมเพลตทั่วไป
- การ์ด/แถบลอย (popover, dropdown) **ต้องมีเงา** (`shadow-sm`/`shadow-xl` ตามบริบท) เพื่อให้รู้สึกมีมิติ ไม่ flat จนไม่มีความลึกเลย — แต่ปิดเงาในโหมดมืด (`dark:shadow-none`) เพราะเงาไม่ขึ้นบนพื้นมืด ให้ border ทำหน้าที่แยกชั้นแทน
- **ทุก element ที่คลิกได้ต้องมี `hover:` state** (ไม่ใช่แค่ `active:` สำหรับมือถือ) — เดิมไม่มี hover เลยทั้งแอป ทำให้ผู้ใช้เมาส์บนเดสก์ท็อปไม่เห็น feedback ใดๆ จนกว่าจะคลิก
- หัวข้อ (h1/h2/การ์ด title) ใส่ `tracking-tight` เพื่อความรู้สึก "ตั้งใจออกแบบ" มากกว่า default letter-spacing
- ไม่มีชื่อหน่วยงาน/โลโก้หน่วยงานปรากฏใน UI
- ทุก `<button>`/interactive element ต้องใส่ `dark:` variant คู่กันเสมอ ห้ามลืมฝั่งใดฝั่งหนึ่ง

## โครงสร้างหน้า

- `/` — หน้าแรก แสดงเครื่องมือทั้งหมดเป็นการ์ด grid responsive + **แถบค้นหาเต็มความกว้างที่หัวหน้า** (placeholder "ค้นหาเครื่องมือจัดการเอกสาร" กรองรายชื่อ/คำอธิบายเครื่องมือแบบ client-side ผ่าน `SearchContext`) — ไม่ใช่ปุ่ม toggle แบบเดิมแล้ว ค้นหาได้ทันที
- `/tools/[อื่นๆ]` — placeholder "เร็วๆ นี้" เฉพาะเครื่องมือที่ยัง implement ไม่ได้ (ดูตารางด้านล่าง)
- `/settings` — ตั้งค่า (dark mode toggle, ความเป็นส่วนตัว, เกี่ยวกับแอป, สนับสนุน) — ใช้ `SettingsPanel` component เดียวกันทั้งในหน้านี้และใน dropdown ของ TopNav

Bottom navigation (mobile-first) มี 2 ปุ่ม: **หน้าแรก / ตั้งค่า**
(ตัด "เครื่องมือ" ออกเพราะซ้ำซ้อนกับหน้าแรก, ตัด "สแกน" ออกจาก nav แต่เครื่องมือสแกนยังเข้าถึงได้ผ่านการ์ดในหน้าแรก, ตัด "ล่าสุด" ออกเพราะไม่มีการเก็บประวัติการใช้งาน)

**Desktop TopNav:** โลโก้ + ชื่อแบรนด์ "Documentation Tools" ทางซ้าย, ไอคอน หน้าแรก/ตั้งค่า ทางขวา (ไม่มีข้อความ) — "ตั้งค่า" เป็นปุ่มเปิด dropdown (ไม่ navigate ไปหน้า `/settings`) พร้อม backdrop เบลอฉากหลัง (`backdrop-blur-sm bg-black/5`) ปิดได้ด้วยคลิกนอกกรอบ/กด Escape/คลิก backdrop

**สนับสนุนผู้พัฒนา:** ใน `SettingsPanel` มีหัวข้อ "สนับสนุน" กดแล้วเปิด modal แสดง QR โอนเงิน (`public/QR-Banking.jpg`) พร้อม backdrop เบลอเช่นกัน

**เครดิตท้ายเว็บ:** "@Chawintorn Chuenchom" อยู่ใน `layout.tsx` ท้ายสุดของทุกหน้า (ใต้ `{children}`) ใช้สไตล์เดียวกับคำอธิบายใน `ToolCard` (`text-[13px] leading-snug text-gray-500 dark:text-gray-400`)

ทุกเครื่องมือที่ทำงานได้จริง ให้ผู้ใช้กรอกชื่อไฟล์ output ก่อนดาวน์โหลดได้ (ผ่าน `FilenameInput` + `sanitizeFilename()` ใน `lib/filename.ts`) และมี footer text ย้ำว่าประมวลผลในเบราว์เซอร์เท่านั้น

## รายการเครื่องมือ (20 อัน — ใช้งานได้จริง 12 อัน)

| # | ชื่อเครื่องมือ | คำอธิบาย | สถานะ |
|---|---|---|---|
| 1 | สแกนเอกสาร | ถ่ายภาพด้วยกล้อง (getUserMedia) หรือเลือกรูปแล้วแปลงเป็น PDF | ✅ ทำงานได้จริง |
| 2 | รวมไฟล์ PDF | ต่อหลายไฟล์เข้าด้วยกันตามลำดับ | ✅ ทำงานได้จริง |
| 3 | จัดหน้า PDF | ดูภาพย่อทุกหน้า ลากสลับลำดับ หมุน หรือลบหน้าที่ไม่ต้องการ | ✅ ทำงานได้จริง |
| 4 | แยกไฟล์ PDF | ดึงเฉพาะหน้าที่ต้องการออกมาเป็นไฟล์ใหม่ | ✅ ทำงานได้จริง |
| 5 | ลดขนาด PDF | รีเดอร์แต่ละหน้าเป็นภาพแล้วบีบอัดใหม่ (เลือกระดับได้ 3 แบบ) | ✅ ทำงานได้จริง — ⚠️ ข้อความจะคัดลอกไม่ได้หลังบีบอัด |
| 6 | แปลงเป็นรูป PDF → JPG | แปลงทุกหน้าเป็น JPG ถ้ามีหลายหน้าจะห่อเป็น .zip | ✅ ทำงานได้จริง |
| 7 | ลดขนาดไฟล์ภาพ | บีบอัด JPG, PNG, WEBP เลือกขนาดเป้าหมายได้ | ✅ ทำงานได้จริง |
| 8 | Image → PDF | รวมรูปถ่าย/เอกสารหลายรูปเป็น PDF เดียว | ✅ ทำงานได้จริง |
| 9 | ใส่เลขหน้า PDF | ใส่เลขหน้าอัตโนมัติ เลือกได้ 4 ตำแหน่ง | ✅ ทำงานได้จริง |
| 10 | ใส่ลายน้ำ PDF | ใส่ข้อความลายน้ำแนวทแยงทับทุกหน้า | ✅ ทำงานได้จริง |
| 11 | หมุนหน้า PDF | หมุนทุกหน้าในไฟล์ 90°/180°/270° | ✅ ทำงานได้จริง |
| 12 | อ่านข้อความจากภาพ (OCR) | แปลงรูป/PDF เป็นข้อความคัดลอกได้ ด้วย `tesseract.js` (`eng+tha`) รองรับไทย เลขไทย อังกฤษ | ✅ ทำงานได้จริง |
| 13 | Word → PDF | แปลงไฟล์ Word (.docx) เป็น PDF | 🔜 รอ backend/API |
| 14 | PDF → Word | แปลงไฟล์ PDF ให้แก้ไขได้ใน Word | 🔜 รอ backend/API |
| 15 | Excel → PDF | แปลงไฟล์ Excel (.xlsx) เป็น PDF | 🔜 รอ backend/API |
| 16 | PDF → Excel | แปลงตารางใน PDF ให้แก้ไขได้ใน Excel | 🔜 รอ backend/API |
| 17 | PowerPoint → PDF | แปลงไฟล์สไลด์ PowerPoint (.pptx) เป็น PDF | 🔜 รอ backend/API |
| 18 | PDF → PowerPoint | แปลง PDF ให้แก้ไขเป็นสไลด์ PowerPoint | 🔜 รอ backend/API |
| 19 | ใส่รหัสผ่าน PDF | ล็อกไฟล์ด้วยรหัสผ่านกันคนอื่นเปิด | 🔜 `pdf-lib` ไม่รองรับ encryption |
| 20 | ปลดล็อก PDF | เอารหัสผ่านออกจากไฟล์ที่คุณเป็นเจ้าของ | 🔜 `pdf-lib` ไม่รองรับ encryption |

### ⚠️ ข้อจำกัดที่เหลือ (#13–20)

**Office ↔ PDF (#13–18):** `pdf-lib`/`pdfjs-dist` แปลง PDF ↔ Word/Excel/PowerPoint แบบรักษาฟอร์แมตให้ไม่ได้ ต้องพึ่ง LibreOffice/OnlyOffice หรือ cloud API ที่รันฝั่ง **server** — ขัดกับหลักการ client-only ของแอปนี้ ทางเลือกตอนจะทำจริง:
1. **ยอมรับ backend** — เพิ่ม API route รันผ่าน LibreOffice headless หรือเรียก cloud API — คุณภาพดีแต่เสียหลักการ client-only
2. **ประมาณผลฝั่ง client** (คุณภาพต่ำกว่ามาก, ไม่มีไลบรารีที่ทำ PPTX หรือทิศทาง PDF→Office ได้ดีพอ)

**รหัสผ่าน PDF (#19–20):** `pdf-lib` ไม่รองรับการเข้ารหัส/ถอดรหัส PDF เลย ต้องหาไลบรารีอื่น (เช่น WASM build ของ qpdf/muhammara) ซึ่งยังไม่ได้ประเมินความพร้อมสำหรับ production

**ยังไม่ implement เพราะต้องเลือกแนวทางก่อนเริ่ม** — ตอนนี้ทั้ง 8 เครื่องมือขึ้นเป็น placeholder "เร็วๆ นี้"

## แผนพัฒนาต่อ

1. ตัดสินใจแนวทาง Office ↔ PDF และรหัสผ่าน PDF (ดูข้อจำกัดด้านบน) ก่อนเริ่ม implement #12–19
2. หน้า "สแกน" ปัจจุบันถ่ายทีละรูปแล้วต่อเป็น PDF ตรงๆ — ยังไม่มี crop/perspective correction อัตโนมัติ ถ้าต้องการคุณภาพสแกนแบบแอปสแกนเอกสารจริงต้องเพิ่มทีหลัง
3. รองรับ PWA (installable, offline) เพราะประมวลผลฝั่ง client ทั้งหมด
