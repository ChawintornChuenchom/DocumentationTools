"use client";

import { useState } from "react";
import { Info, ShieldCheck, HeartHandshake, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function SettingsPanel() {
  const [showSupport, setShowSupport] = useState(false);

  return (
    <>
      <ul className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
        <ThemeToggle />
        <li className="flex items-center gap-3 px-4 py-3.5">
          <ShieldCheck className="h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
              ความเป็นส่วนตัว
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ไฟล์ทุกไฟล์ประมวลผลในเบราว์เซอร์ ไม่มีการอัปโหลดขึ้นเซิร์ฟเวอร์
            </p>
          </div>
        </li>
        <li className="flex items-center gap-3 px-4 py-3.5">
          <Info className="h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
              เกี่ยวกับแอป
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Documentation Tools v0.1.0
            </p>
          </div>
        </li>
        <li>
          <button
            type="button"
            onClick={() => setShowSupport(true)}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <HeartHandshake className="h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                สนับสนุน
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                สแกน QR เพื่อสนับสนุนผู้พัฒนา
              </p>
            </div>
          </button>
        </li>
      </ul>

      {showSupport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm"
          onClick={() => setShowSupport(false)}
        >
          <div
            className="w-full max-w-xs rounded-xl bg-white p-5 shadow-xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-tight text-gray-900 dark:text-gray-100">
                สนับสนุนผู้พัฒนา
              </h3>
              <button
                type="button"
                onClick={() => setShowSupport(false)}
                aria-label="ปิด"
                className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/QR-Banking.jpg"
              alt="QR Code สำหรับสนับสนุนผู้พัฒนา"
              className="mt-4 w-full rounded-lg border border-gray-200 dark:border-gray-700"
            />
          </div>
        </div>
      )}
    </>
  );
}
