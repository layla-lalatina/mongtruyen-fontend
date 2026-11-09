import React, { useRef, useState } from "react";
import {
  LuSearch,
  LuLock,
  LuLockOpen,
  LuCrown,
  LuCheck,
  LuBookOpen,
  LuTriangleAlert,
} from "react-icons/lu";

const ChapterList = ({ chapters, slug, user, readingHistory, handleClickChapter, isChapterRead }) => {
  const rawData = chapters?.[0]?.server_data || [];
  const chapterData = [...rawData].sort((a, b) => {
    const numA = parseFloat(String(a.chapter_name).replace(/[^\d.]/g, "")) || 0;
    const numB = parseFloat(String(b.chapter_name).replace(/[^\d.]/g, "")) || 0;
    return numA - numB;
  });
  const [chapterQuery, setChapterQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [searchError, setSearchError] = useState("");
  const listRef = useRef(null);
  const chapterRefs = useRef({});

  const normalizeChapter = (value) =>
    String(value || "")
      .toLowerCase()
      .replace("chapter", "")
      .trim();

  const handleFindChapter = (e) => {
    e.preventDefault();

    const query = normalizeChapter(chapterQuery);
    if (!query) {
      setSearchError("Nhập số chapter cần tìm");
      return;
    }

    const foundIndex = chapterData.findIndex(
      (chap) => normalizeChapter(chap.chapter_name) === query
    );

    if (foundIndex === -1) {
      setSearchError(`Không tìm thấy chapter ${chapterQuery}`);
      setHighlightedIndex(null);
      return;
    }

    setSearchError("");
    setHighlightedIndex(foundIndex);

    const chapterEl = chapterRefs.current[foundIndex];
    const containerEl = listRef.current;

    if (chapterEl && containerEl) {
      const containerRect = containerEl.getBoundingClientRect();
      const chapterRect = chapterEl.getBoundingClientRect();
      const chapterTopInContainer = chapterRect.top - containerRect.top + containerEl.scrollTop;
      const targetTop =
        chapterTopInContainer - containerEl.clientHeight / 2 + chapterEl.clientHeight / 2;

      containerEl.scrollTo({
        top: Math.max(0, targetTop),
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="mt-6 bg-white/90 backdrop-blur-md rounded-2xl border border-emerald-100 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <LuBookOpen className="w-5 h-5 text-emerald-600" />
          <span className="font-bold text-lg text-emerald-950">Danh sách chương</span>
          <span className="text-xs text-emerald-800/60 font-semibold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100/40">
            ({chapterData.length || 0} chương)
          </span>
        </div>

        <form onSubmit={handleFindChapter} className="flex items-center gap-2">
          <div className="relative w-full md:w-56">
            <LuSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={chapterQuery}
              onChange={(e) => setChapterQuery(e.target.value)}
              placeholder="Tìm số chương, ví dụ 10"
              className="w-full pl-9 pr-3.5 py-1.5 text-xs border border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all hover:shadow-lg hover:shadow-emerald-600/10 flex items-center gap-1.5"
          >
            <LuSearch className="w-3.5 h-3.5" />
            Tìm
          </button>
        </form>
      </div>
      {searchError && (
        <div className="mb-2 text-xs text-rose-600 font-semibold flex items-center gap-1.5">
          <LuTriangleAlert className="w-4 h-4" />
          <span>{searchError}</span>
        </div>
      )}

      <div ref={listRef} className="max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {chapterData.map((chap, idx) => {
            const read = user && isChapterRead(slug, chap.chapter_name);
            const unlockType = (chap.unlock_type || "FREE").toUpperCase();
            const isLocked = Boolean(chap.is_locked);
            const isPaidType = unlockType !== "FREE";

            return (
              <button
                key={chap.chapter_name || idx}
                ref={(el) => {
                  chapterRefs.current[idx] = el;
                }}
                onClick={() => handleClickChapter(chap.chapter_name)}
                className={`text-left px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between gap-2 ${
                  idx === highlightedIndex
                    ? "ring-2 ring-emerald-500 border-emerald-500"
                    : ""
                } ${
                  isLocked
                    ? "bg-amber-50/60 hover:bg-amber-100/60 text-amber-950 border-amber-200/80"
                    : read
                    ? "bg-emerald-100/60 text-emerald-900 border-emerald-200/50 hover:bg-emerald-200/60 font-bold"
                    : "bg-white hover:bg-emerald-50/50 text-gray-700 border-emerald-100/60"
                }`}
                title={`Chương ${chap.chapter_name}`}
              >
                <span className="truncate flex items-center gap-1.5">
                  {read && <LuCheck className="w-4 h-4 text-emerald-600 shrink-0" />}
                  <span>Chương {chap.chapter_name}</span>
                </span>

                {isPaidType && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold shrink-0 ${
                      !isLocked
                        ? "bg-emerald-100 text-emerald-700"
                        : unlockType === "VIP"
                        ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950"
                        : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}
                  >
                    {!isLocked ? (
                      <>
                        <LuLockOpen className="w-3 h-3" /> Đã mở
                      </>
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
};

export default ChapterList;
