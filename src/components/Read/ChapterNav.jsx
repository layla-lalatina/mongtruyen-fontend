import React, { useEffect } from "react";
import {
  LuPanelLeft,
  LuChevronLeft,
  LuChevronRight,
  LuChevronDown,
  LuHeart,
  LuBookOpen,
} from "react-icons/lu";

/**
 * 🌳 ChapterNav Component (Lucide Icons)
 * Fixed bottom navigation bar for comic reader with keyboard shortcut support (← / →).
 */
const ChapterNav = ({
  allChapters = [],
  currentChapterIdx = -1,
  prevIdx = -1,
  nextIdx = -1,
  goToChapter,
  showChapterList,
  setShowChapterList,
  renderChapterList,
  isFollowing,
  toggleFollow,
  onToggleSidebar,
  dropdownPlacement = "up",
  className = "",
  style = {},
}) => {
  const isDropdownUp = dropdownPlacement === "up";

  // Hỗ trợ phím tắt ← (chương trước) và → (chương sau)
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || e.target?.isContentEditable) {
        return;
      }
      if (e.key === "ArrowLeft" && prevIdx !== -1) {
        goToChapter(prevIdx);
      } else if (e.key === "ArrowRight" && nextIdx !== -1) {
        goToChapter(nextIdx);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [prevIdx, nextIdx, goToChapter]);

  return (
    <div
      className={`bg-white/95 backdrop-blur-md border-t border-emerald-200/80 shadow-2xl shadow-emerald-950/20 w-full z-40 ${className}`}
      style={style}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between px-3 sm:px-4 py-2 gap-2">
        {/* Nút mở thanh thông tin bên trái */}
        <button
          onClick={onToggleSidebar}
          className="px-3 py-2 rounded-xl bg-emerald-100/90 hover:bg-emerald-200 text-emerald-900 font-bold border border-emerald-300/60 shadow-sm transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
          title="Mở / Ẩn bảng thông tin bên trái"
        >
          <LuPanelLeft className="w-4 h-4 text-emerald-700" />
          <span className="hidden sm:inline text-xs font-extrabold">Thông tin</span>
        </button>

        {/* Cụm điều hướng chương */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Nút Chương trước */}
          <button
            className="px-2.5 sm:px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 transition-all font-bold disabled:opacity-35 disabled:cursor-not-allowed shadow-sm active:scale-95 flex items-center gap-1 text-xs sm:text-sm"
            title={
              prevIdx !== -1
                ? `Chương trước: Chương ${allChapters[prevIdx]?.chapter_name} (Phím ←)`
                : "Không có chương trước"
            }
            disabled={prevIdx === -1}
            onClick={() => goToChapter(prevIdx)}
          >
            <LuChevronLeft className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden md:inline font-extrabold">Trước</span>
          </button>

          {/* Bộ chọn chương hiện tại */}
          <div className="relative">
            <button
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-extrabold flex items-center gap-2 shadow-md shadow-emerald-500/20 transition-all text-xs sm:text-sm active:scale-95"
              onClick={() => setShowChapterList((v) => !v)}
            >
              <LuBookOpen className="w-4 h-4 shrink-0" />
              <span className="truncate max-w-[130px] sm:max-w-[200px]">
                Chương {allChapters[currentChapterIdx]?.chapter_name || "?"}
              </span>
              <LuChevronDown
                className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
                  showChapterList ? "rotate-180" : ""
                }`}
              />
            </button>

            {showChapterList && (
              <div
                className={
                  isDropdownUp
                    ? "fixed left-2 right-2 bottom-[70px] z-50 sm:absolute sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:bottom-full sm:mb-2 sm:w-[540px] sm:max-w-[92vw]"
                    : "absolute left-1/2 top-full mt-2 -translate-x-1/2 z-50 w-[360px] max-w-[92vw] sm:w-[540px]"
                }
              >
                {renderChapterList()}
              </div>
            )}
          </div>

          {/* Nút Chương sau */}
          <button
            className="px-2.5 sm:px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 transition-all font-bold disabled:opacity-35 disabled:cursor-not-allowed shadow-sm active:scale-95 flex items-center gap-1 text-xs sm:text-sm"
            title={
              nextIdx !== -1
                ? `Chương sau: Chương ${allChapters[nextIdx]?.chapter_name} (Phím →)`
                : "Không có chương tiếp theo"
            }
            disabled={nextIdx === -1}
            onClick={() => goToChapter(nextIdx)}
          >
            <span className="hidden md:inline font-extrabold">Sau</span>
            <LuChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Nút Theo dõi */}
        <button
          onClick={toggleFollow}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 text-xs sm:text-sm transition-all shadow-sm shrink-0 active:scale-95 ${
            isFollowing
              ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20"
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
          }`}
        >
          <LuHeart className={`w-4 h-4 ${isFollowing ? "fill-current" : ""}`} />
          <span className="hidden sm:inline">{isFollowing ? "Đã theo dõi" : "Theo dõi"}</span>
        </button>
      </div>
    </div>
  );
};

export default ChapterNav;
