import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { LuSearch, LuLock, LuLockOpen, LuCrown, LuCheck } from "react-icons/lu";

const ChapterList = forwardRef(
  (
    {
      allChapters,
      currentChapterIdx,
      goToChapter,
      isChapterRead,
      slug,
      user,
      className = "",
      onSelect,
    },
    ref
  ) => {
    const [query, setQuery] = useState("");
    const [error, setError] = useState("");
    const listScrollRef = useRef(null);
    const currentChapterRef = useRef(null);

    const normalizedMap = useMemo(
      () =>
        allChapters.map((chap) =>
          String(chap.chapter_name || "")
            .toLowerCase()
            .replace("chapter", "")
            .trim()
        ),
      [allChapters]
    );

    const jumpToChapter = (e) => {
      e.preventDefault();
      const normalizedQuery = query.toLowerCase().replace("chapter", "").trim();

      if (!normalizedQuery) {
        setError("Nhập số chap cần tìm");
        return;
      }

      const foundIdx = normalizedMap.findIndex((v) => v === normalizedQuery);
      if (foundIdx === -1) {
        setError(`Không thấy chap ${query}`);
        return;
      }

      setError("");
      goToChapter(foundIdx);
      if (onSelect) onSelect();
    };

    useEffect(() => {
      const container = listScrollRef.current;
      const currentEl = currentChapterRef.current;
      if (!container || !currentEl) return;

      const containerRect = container.getBoundingClientRect();
      const itemRect = currentEl.getBoundingClientRect();
      const itemTop = itemRect.top - containerRect.top + container.scrollTop;
      const targetTop = itemTop - container.clientHeight / 2 + currentEl.clientHeight / 2;

      container.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    }, [currentChapterIdx, allChapters.length]);

    return (
      <div
        ref={ref}
        className={`bg-white border border-emerald-200 rounded-2xl shadow-2xl w-full ${className}`}
      >
        <div className="p-3 border-b border-emerald-100">
          <form onSubmit={jumpToChapter} className="flex gap-2">
            <div className="relative flex-1">
              <LuSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm số chương, ví dụ 10"
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 flex items-center gap-1.5"
            >
              <LuSearch className="w-4 h-4" />
              Tìm
            </button>
          </form>
          {error && <p className="text-xs text-rose-500 mt-1 font-semibold">{error}</p>}
        </div>

        <div ref={listScrollRef} className="p-3 max-h-[340px] overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {allChapters.map((chap, idx) => {
              const unlockType = (chap.unlock_type || "FREE").toUpperCase();
              const isLocked = Boolean(chap.is_locked);
              const isPaidType = unlockType !== "FREE";
              const read = user && isChapterRead(slug, chap.chapter_name);

              return (
                <button
                  key={chap.chapter_name || idx}
                  ref={idx === currentChapterIdx ? currentChapterRef : null}
                  onClick={() => {
                    goToChapter(idx);
                    if (onSelect) onSelect();
                  }}
                  className={`px-3 py-2 rounded-xl text-xs sm:text-sm border transition text-left leading-tight flex items-center justify-between gap-1.5 ${
                    idx === currentChapterIdx
                      ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white border-emerald-600 font-bold shadow-sm"
                      : isLocked
                      ? "bg-amber-50/70 text-amber-900 border-amber-200 hover:bg-amber-100/70 font-semibold"
                      : read
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 font-semibold"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-emerald-50/50"
                  }`}
                >
                  <div className="min-w-0">
                    <span className="block truncate">Chương {chap.chapter_name}</span>
                    {read && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold opacity-80">
                        <LuCheck className="w-3 h-3" /> Đã đọc
                      </span>
                    )}
                  </div>

                  {isPaidType && (
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold shrink-0 ${
                        !isLocked
                          ? "bg-emerald-100 text-emerald-700"
                          : unlockType === "VIP"
                          ? "bg-amber-400 text-slate-950"
                          : "bg-amber-100 text-amber-800 border border-amber-300"
                      }`}
                    >
                      {!isLocked ? (
                        <LuLockOpen className="w-3 h-3" />
                      ) : unlockType === "VIP" ? (
                        <>
                          <LuCrown className="w-3 h-3" /> VIP
                        </>
                      ) : (
                        <>
                          <LuLock className="w-3 h-3" /> {chap.final_price || chap.unlock_price}
                        </>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

export default ChapterList;
