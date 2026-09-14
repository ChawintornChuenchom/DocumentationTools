"use client";

import { useMemo } from "react";
import { TOOLS } from "@/lib/tools";
import { ToolCard } from "@/components/ToolCard";
import { useSearch } from "@/components/SearchContext";

export default function Home() {
  const { query } = useSearch();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TOOLS;
    return TOOLS.filter(
      (tool) =>
        tool.title.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <main className="flex-1 px-5 py-6 md:px-0">
      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
          ไม่พบเครื่องมือที่ค้นหา
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
          {filtered.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      )}
    </main>
  );
}
