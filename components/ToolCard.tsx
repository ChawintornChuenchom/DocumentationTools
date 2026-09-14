import Link from "next/link";
import type { ToolDef } from "@/lib/tools";
import { ToolIcon } from "@/components/ToolIcon";

export function ToolCard({ tool }: { tool: ToolDef }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md active:translate-y-0 active:scale-[0.98] active:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none dark:hover:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 transition-colors group-hover:border-gray-300 group-hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:group-hover:border-gray-600 dark:group-hover:text-gray-100">
          <ToolIcon icon={tool.icon} className="h-[18px] w-[18px]" />
        </div>
        {tool.status === "soon" && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">
            เร็วๆ นี้
          </span>
        )}
      </div>
      <div>
        <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-gray-900 dark:text-gray-100">
          {tool.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-gray-500 dark:text-gray-400">
          {tool.description}
        </p>
      </div>
    </Link>
  );
}
