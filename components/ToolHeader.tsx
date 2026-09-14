import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ToolDef } from "@/lib/tools";
import { ToolIcon } from "@/components/ToolIcon";

export function ToolHeader({ tool }: { tool: ToolDef }) {
  return (
    <header className="border-b border-gray-200 bg-white px-5 py-4 md:rounded-xl md:border md:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <Link
          href="/"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300">
          <ToolIcon icon={tool.icon} className="h-[18px] w-[18px]" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight leading-tight text-gray-900 dark:text-gray-100">
            {tool.title}
          </h1>
          <p className="text-xs leading-tight text-gray-500 dark:text-gray-400">
            {tool.description}
          </p>
        </div>
      </div>
    </header>
  );
}
