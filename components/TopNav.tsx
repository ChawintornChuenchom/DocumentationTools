"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Settings } from "lucide-react";
import { SettingsPanel } from "@/components/SettingsPanel";

export function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const containerRef = useRef<HTMLDivElement>(null);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const settingsActive = open || pathname === "/settings";

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/5 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <header className="relative z-30 hidden border-b border-gray-200 bg-white md:block dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100">
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Documentation Tools
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <div className="relative" ref={containerRef}>
              <button
                type="button"
                aria-label="ตั้งค่า"
                aria-haspopup="true"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                  settingsActive
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                    : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                <Settings
                  className="h-5 w-5 transition-transform duration-500 ease-in-out"
                  style={{ transform: open ? "rotate(360deg)" : "rotate(0deg)" }}
                />
              </button>

              {open && (
                <div className="absolute right-0 top-full z-30 mt-2 w-80 rounded-xl shadow-xl ring-1 ring-black/5 dark:shadow-black/50 dark:ring-white/10">
                  <SettingsPanel />
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
