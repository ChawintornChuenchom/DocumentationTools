import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import { TopNav } from "@/components/TopNav";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
import { SearchProvider } from "@/components/SearchContext";
import "./globals.css";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DoctoolS",
  description: "รวมเครื่องมือจัดการไฟล์ PDF ใช้งานง่าย ประมวลผลในเบราว์เซอร์ ไม่ต้องอัปโหลดไฟล์ขึ้นเซิร์ฟเวอร์",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${kanit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-gray-50 font-sans dark:bg-gray-950">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SearchProvider>
            <TopNav />
            <div className="mx-auto flex w-full max-w-md flex-1 flex-col pb-20 md:max-w-6xl md:px-6 md:pb-10 md:pt-6">
              <PageHeader />
              {children}
              <p className="mt-8 pb-6 text-center text-[13px] leading-snug text-gray-500 dark:text-gray-400">
                @ 2026 Chawintorn Chuenchom
              </p>
            </div>
            <BottomNav />
          </SearchProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
