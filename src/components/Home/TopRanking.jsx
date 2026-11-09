import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../../config";
import { getComicThumbUrl } from "../../utils/imageHelpers";

const TopRanking = () => {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTopComics = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ratings/top/list`);
      const json = await res.json();
      console.log("API response:", json);

      if (Array.isArray(json.topComics)) {
        const sorted = json.topComics
          .map((item) => ({
            ...item,
            avgRating: Number(item.avgRating || 0),
            ratingCount: Number(item.ratingCount || 0),
          }))
          .sort((a, b) => {
            if (b.avgRating !== a.avgRating) {
              return b.avgRating - a.avgRating;
            }
            return b.ratingCount - a.ratingCount;
          })
          .slice(0, 5);

        setComics(sorted);
      } else {
        console.error("topComics không phải mảng:", json.topComics);
        setComics([]);
      }
    } catch (err) {
      console.error("Lỗi khi tải top ranking:", err);
      setComics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopComics();
  }, []);

  return (
    <div className="bg-white/85 backdrop-blur-sm rounded-xl border border-emerald-50 shadow p-4 w-full">
      <h2 className="text-lg text-emerald-700 font-bold mb-4 flex items-center gap-1.5 border-b border-emerald-100 pb-2">🏆 Top Đánh Giá Cao</h2>
      {loading ? (
        <div className="text-gray-500 text-sm">Đang tải...</div>
      ) : comics.length === 0 ? (
        <div className="text-center text-gray-400 py-4">Không có dữ liệu</div>
      ) : (
        <ul>
          {comics.map((item, idx) => {
            const rankColors = [
              "bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-sm", // Hạng 1
              "bg-gradient-to-r from-slate-300 to-slate-400 text-slate-800 shadow-sm", // Hạng 2
              "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-sm", // Hạng 3
            ];
            const defaultRankStyle = "bg-emerald-50 text-emerald-700 border border-emerald-100";
            const badgeStyle = rankColors[idx] || defaultRankStyle;

            return (
              <li
                key={item.slug}
                className="flex items-center gap-3 py-3 border-b border-emerald-50/50 last:border-b-0 hover:bg-emerald-50/30 px-1 rounded-lg transition-colors"
              >
                <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${badgeStyle} shrink-0`}>
                  {idx + 1}
                </span>
                <img
                  src={getComicThumbUrl(item.thumb_url || item.thumbUrl || item.slug)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-cover.jpg";
                  }}
                  alt={item.name || "Truyện"}
                  className="w-10 h-14 object-cover rounded-lg border border-emerald-100 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/truyen/${item.slug}`}
                    className="font-semibold text-sm text-gray-800 line-clamp-1 hover:text-emerald-700 transition-colors"
                  >
                    {item.name || "Tên truyện không có"}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5">
                      ⭐ {item.avgRating.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-emerald-600/70 font-medium">
                      ({item.ratingCount} lượt đánh giá)
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default TopRanking;
