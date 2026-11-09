import React from "react";
import { Link } from "react-router-dom";
import { getComicThumbUrl } from "../../utils/imageHelpers";

const ReadingHistory = ({ user, readingHistory, historyComics }) => (
  <div className="bg-white/90 backdrop-blur-md border border-emerald-100 rounded-2xl p-5 shadow-sm mb-6">
    <div className="font-bold text-base mb-3 text-emerald-900 flex items-center gap-1.5">
      <span>📖 Lịch sử đọc truyện</span>
    </div>
    {user ? (
      readingHistory.length === 0 ? (
        <div className="text-xs text-emerald-800/60 italic">Bạn chưa đọc truyện nào.</div>
      ) : (
        <ul className="text-xs text-gray-800 space-y-3">
          {[...new Set(readingHistory.map((h) => h.slug))]
            .slice(0, 5)
            .map((slug) => {
              const comic = historyComics[slug];
              const historyItem = readingHistory.find(h => h.slug === slug);
              const chapNum = historyItem?.chapter || "1";
              return (
                <li key={slug} className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-emerald-50/50 transition-all border border-transparent hover:border-emerald-50">
                  <Link to={`/truyen/${slug}`} className="shrink-0">
                    <img
                      src={getComicThumbUrl(comic?.thumb_url || historyItem?.thumb_url || historyItem?.thumbUrl)}
                      alt={comic?.name || historyItem?.name || slug}
                      className="w-10 h-14 object-cover rounded-lg border border-emerald-100/60 shadow-sm bg-emerald-50"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-cover.jpg";
                      }}
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/truyen/${slug}`}
                      className="font-bold hover:text-emerald-700 text-emerald-950 transition-colors text-sm line-clamp-1 block"
                    >
                      {comic?.name || historyItem?.name || historyItem?.title || slug}
                    </Link>
                    <Link
                      to={`/doc/${slug}/${encodeURIComponent(chapNum)}`}
                      className="text-[11px] text-emerald-600 hover:underline font-semibold"
                    >
                      Đang đọc: Chương {chapNum}
                    </Link>
                  </div>
                </li>
              );
            })}
        </ul>
      )
    ) : (
      <div className="text-xs text-emerald-800/60 italic">Đăng nhập để lưu lịch sử đọc truyện.</div>
    )}
  </div>
);

export default ReadingHistory;