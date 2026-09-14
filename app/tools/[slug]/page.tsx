import { notFound } from "next/navigation";
import { Construction } from "lucide-react";
import { getTool } from "@/lib/tools";
import { ToolHeader } from "@/components/ToolHeader";

export default async function ToolPlaceholderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  return (
    <div>
      <ToolHeader tool={tool} />
      <main className="mx-auto flex max-w-sm flex-1 flex-col items-center justify-center gap-3 px-8 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
          <Construction className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-gray-800 dark:text-gray-100">
          เร็วๆ นี้
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          เครื่องมือ &ldquo;{tool.title}&rdquo; กำลังอยู่ระหว่างการพัฒนา
          จะเปิดให้ใช้งานในเวอร์ชันถัดไป
        </p>
      </main>
    </div>
  );
}
