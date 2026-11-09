import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getComicThumbUrl } from "../../utils/imageHelpers";

export const MobileNavLinks = ({ categories = [], user, historyComics, readingHistory, onClose }) => {
  const [showCategories, setShowCategories] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showFollow, setShowFollow] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      {/* Thể loại */}
      <div className="border-b border-emerald-100/30 pb-3">
        <button
          className="font-bold mb-2 flex items-center justify-between text-left w-full text-emerald-950 hover:text-emerald-700 transition-colors"
          onClick={() => setShowCategories((v) => !v)}
        >
          <span className="flex items-center gap-2">📂 Thể loại</span>
          <span className={`text-xs transition-transform duration-200 ${showCategories ? "rotate-90" : ""}`}>▶</span>
        </button>
        {showCategories && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs mt-2 max-h-48 overflow-y-auto custom-scrollbar bg-emerald-50/30 p-2.5 rounded-xl border border-emerald-100/40">
            {categories.map((cat) => (
              <Link
                key={cat.id || cat.slug}
                to={`/the-loai/${cat.slug}`}
                className="hover:text-emerald-600 hover:font-bold text-emerald-800 transition-colors py-0.5 truncate"
                onClick={onClose}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Lịch sử đọc */}
      {user && (
        <div className="border-b border-emerald-100/30 pb-3">
          <button
            className="font-bold mb-2 flex items-center justify-between text-left w-full text-emerald-950 hover:text-emerald-700 transition-colors"
            onClick={() => setShowHistory((v) => !v)}
          >
            <span className="flex items-center gap-2">🕒 Lịch sử đọc</span>
            <span className={`text-xs transition-transform duration-200 ${showHistory ? "rotate-90" : ""}`}>▶</span>
          </button>
          {showHistory && (
            <div className="mt-2 bg-emerald-50/30 p-2.5 rounded-xl border border-emerald-100/40">
              {readingHistory.length === 0 ? (
                <div className="text-xs text-emerald-800/60 italic">Bạn chưa đọc truyện nào.</div>
              ) : (
                <ul className="text-xs text-gray-800 space-y-3">
                  {[...new Set(readingHistory.map((h) => h.slug))].slice(0, 5).map((slug) => {
                    const comic = historyComics[slug];
                    const historyItem = readingHistory.find((h) => h.slug === slug);
                    return (
                      <li key={slug} className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-white/50 transition-all">
                        <Link to={`/truyen/${slug}`} onClick={onClose} className="shrink-0">
                          <img
                            src={getComicThumbUrl(comic?.thumb_url)}
                            alt={comic?.name || slug}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/default-cover.jpg";
                            }}
                            className="w-8 h-12 object-cover rounded-lg border border-emerald-100/40 shadow-sm"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/truyen/${slug}`}
                            className="font-bold hover:text-emerald-700 text-emerald-950 transition-colors text-[13px] line-clamp-1 block"
                            onClick={onClose}
                          >
                            {comic?.name || slug}
                          </Link>
                          <span className="text-[10px] text-emerald-800/60 font-semibold block mt-0.5">
                            Chương: {historyItem?.chapter || "0"}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              <Link
                to="/profile"
                className="block mt-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                onClick={onClose}
              >
                Xem tất cả lịch sử →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Truyện theo dõi */}
      {user && (
        <div className="border-b border-emerald-100/30 pb-3">
          <button
            className="font-bold mb-2 flex items-center justify-between text-left w-full text-emerald-950 hover:text-emerald-700 transition-colors"
            onClick={() => setShowFollow((v) => !v)}
          >
            <span className="flex items-center gap-2">⭐ Truyện theo dõi</span>
            <span className={`text-xs transition-transform duration-200 ${showFollow ? "rotate-90" : ""}`}>▶</span>
          </button>
          {showFollow && (
            <div className="bg-emerald-50/30 p-2.5 rounded-xl border border-emerald-100/40">
              <p className="text-xs text-emerald-800/60 italic mb-2">Xem danh sách các truyện bạn đã theo dõi tại Hồ Sơ.</p>
              <Link
                to="/profile?tab=followed"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors block"
                onClick={onClose}
              >
                Đến trang theo dõi →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tìm kiếm */}
      <div className="border-b border-emerald-100/30 pb-4">
        <h4 className="font-bold text-emerald-950 text-sm mb-2">🔍 Tìm kiếm truyện</h4>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (search.trim()) {
              onClose();
              navigate(`/search?q=${encodeURIComponent(search.trim())}`);
              setSearch("");
            }
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Tìm từ Cây Thế Giới..."
            className="flex-1 px-3 py-2 rounded-xl border border-emerald-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
          >
            Tìm
          </button>
        </form>
      </div>
    </div>
  );
};
