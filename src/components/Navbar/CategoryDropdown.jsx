import React, { useMemo } from "react";
import { Link } from "react-router-dom";

const normalizeAlphabet = (char) => {
  return char
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
};

export default function CategoryDropdown({
  categories = [],
  isOpen,
  onClose,
  dropdownRef,
}) {
  const { groups, sortedKeys } = useMemo(() => {
    const grps = {};
    categories.forEach((cat) => {
      const name = cat.name?.trim() || "";
      if (!name) return;
      const rawChar = name.charAt(0);
      const letter = normalizeAlphabet(rawChar);
      const key = /[A-Z]/.test(letter) ? letter : "#";
      if (!grps[key]) grps[key] = [];
      grps[key].push(cat);
    });

    Object.keys(grps).forEach((k) => {
      grps[k].sort((a, b) => a.name.localeCompare(b.name, "vi"));
    });

    const keys = Object.keys(grps).sort((a, b) => {
      if (a === "#") return 1;
      if (b === "#") return -1;
      return a.localeCompare(b);
    });

    return { groups: grps, sortedKeys: keys };
  }, [categories]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-1 w-[560px] sm:w-[640px] max-w-[92vw] bg-white/98 dark:bg-[#07241d]/98 backdrop-blur-md rounded-2xl shadow-2xl border border-emerald-200/90 dark:border-emerald-700/80 p-3.5 z-50 text-emerald-950 dark:text-emerald-50 animate-fade-in"
      onMouseEnter={() => {}}
      onMouseLeave={onClose}
    >
      {/* Header gọn gàng */}
      <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-800 pb-2 mb-2.5">
        <div className="flex items-center gap-1.5 font-black text-xs text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
          <span>📚</span>
          <span>Danh Sách Thể Loại (A — Z)</span>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold lowercase">
            ({categories.length} thể loại)
          </span>
        </div>
        <Link
          to="/the-loai"
          onClick={onClose}
          className="text-[11px] font-black text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 bg-emerald-50 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-700 transition hover:scale-105"
        >
          Xem tất cả ➔
        </Link>
      </div>

      {/* Grid các nhóm theo chữ cái (4 cột gọn gàng) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
        {sortedKeys.map((letter) => (
          <div
            key={letter}
            className="p-1.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/40 border border-emerald-100/70 dark:border-emerald-800/60 flex flex-col justify-start"
          >
            {/* Tiêu đề Chữ cái */}
            <div className="flex items-center justify-between pb-1 mb-1 border-b border-emerald-200/60 dark:border-emerald-700/60">
              <span className="w-5 h-5 rounded-md bg-gradient-to-tr from-emerald-600 to-teal-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                {letter}
              </span>
              <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold">
                {groups[letter].length} mục
              </span>
            </div>

            {/* Danh sách thể loại của chữ cái đó */}
            <div className="space-y-0.5">
              {groups[letter].map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/the-loai/${cat.slug}`}
                  onClick={onClose}
                  className="block text-[11px] font-semibold text-gray-700 dark:text-gray-200 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 px-1.5 py-0.5 rounded transition line-clamp-1"
                  title={cat.name}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

