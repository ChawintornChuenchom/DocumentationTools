export function FilenameInput({
  value,
  onChange,
  label = "ชื่อไฟล์ผลลัพธ์",
  ext = ".pdf",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  ext?: string;
}) {
  return (
    <div className="mt-4">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="mt-2 flex items-center rounded-xl border border-gray-300 bg-white pr-3 transition-colors focus-within:border-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:focus-within:border-gray-100">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="output"
          className="w-full min-w-0 bg-transparent px-4 py-3 text-sm text-gray-900 outline-none dark:text-gray-100"
        />
        <span className="shrink-0 text-sm text-gray-400 dark:text-gray-500">
          {ext}
        </span>
      </div>
    </div>
  );
}
