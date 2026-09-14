"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <li className="flex items-center gap-3 px-4 py-3.5">
      {isDark ? (
        <Moon className="h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500" />
      ) : (
        <Sun className="h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500" />
      )}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
          โหมดมืด
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          ปรับหน้าจอให้เข้ากับการใช้งานตอนกลางคืน
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label="สลับโหมดมืด"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          isDark ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            isDark ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </li>
  );
}
