"use client";

import { usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { useSearch } from "@/components/SearchContext";

const TITLES: Record<string, string> = {
  "/settings": "ตั้งค่า",
};

export function PageHeader() {
  const pathname = usePathname();
  const { query, setQuery } = useSearch();

  if (pathname === "/") {
    return (
      <header className="border-b border-gray-200 bg-white px-5 py-5 md:rounded-xl md:border md:px-6 md:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
        <div className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 transition-colors focus-within:border-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:focus-within:border-gray-100">
          <Search className="h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาเครื่องมือจัดการเอกสาร"
            className="w-full min-w-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="ล้างคำค้นหา"
              className="shrink-0 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>
    );
  }

  if (!(pathname in TITLES)) return null;

  return (
    <header className="border-b border-gray-200 bg-white px-5 py-5 md:rounded-xl md:border md:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
        <h1 className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl dark:text-gray-100">
          {TITLES[pathname]}
        </h1>
        <div className="h-10 w-10" aria-hidden="true" />
      </div>
    </header>
  );
}
