/**
 * 🌳 SYSTEM: IRMINSUL FANTASY RPG — AI PERSONALIZED RECOMMENDATION SECTION
 * ============================================================
 * @file AIRecommendSection.jsx
 * @description Section "Gợi ý cho bạn" trên trang Home.
 *   - Lấy dữ liệu từ API /api/ai/personalized-recommendations
 *   - Tự động lưu cache SQL trong bảng user_gamification
 *   - 5 ngày load 1 lần theo thời gian thực tế máy chủ (tiết kiệm quota AI)
 *   - 100% truyện thật từ CSDL, không bao giờ mất ảnh bìa hay dính lỗi 404
 * ============================================================
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../../config";
import { getComicThumbUrl } from "../../utils/imageHelpers";

const AIRecommendSection = ({ user, readingHistory }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [meta, setMeta] = useState({ cached: false, daysLeft: 5 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetched, setFetched] = useState(false);

  // Chỉ load khi đã đăng nhập
  const shouldLoad = Boolean(user?.token);

  const fetchRecommendations = async (isForce = false) => {
    if (!user?.token) return;
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE_URL}/api/ai/personalized-recommendations${isForce ? "?force=true" : ""}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.recommendations)) {
        setRecommendations(data.recommendations);
        setMeta({
          cached: Boolean(data.cached),
          daysLeft: data.daysLeft || 5,
          recommendedAt: data.recommendedAt,
        });
      } else {
        setError(data.message || "Chưa có gợi ý phù hợp lúc này.");
      }
    } catch (e) {
      console.error("Lỗi tải gợi ý AI:", e);
      setError("Không thể kết nối Cây Thế Giới lúc này.");
    } finally {
      setLoading(false);
      setFetched(true);
    }
  };

  useEffect(() => {
    if (!shouldLoad || fetched) return;
    fetchRecommendations(false);
  }, [shouldLoad, fetched, user]);

  if (!shouldLoad) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          <h2 className="text-base font-extrabold text-emerald-900">Gợi ý dành cho bạn</h2>
          <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 font-bold flex items-center gap-1 shadow-xs">
            <span>🌿 Trợ Lý Nahida Gợi Ý</span>
          </span>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 py-6 justify-center bg-white/60 rounded-2xl border border-emerald-100">
          <div className="animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full" />
          <span className="text-xs text-emerald-700 font-bold animate-pulse">
            Nahida đang đối chiếu ký ức từ Cây Thế Giới để chọn truyện cho bạn...
          </span>
        </div>
      )}

      {error && !loading && (
        <div className="text-xs text-gray-500 italic px-2 py-3 bg-gray-50 rounded-xl border border-gray-200">
          🌱 {error}
        </div>
      )}

      {!loading && recommendations.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3.5">
          {recommendations.map((comic) => {
            const rawThumb = comic.thumbUrl || comic.thumb_url;
            const fullThumb = getComicThumbUrl(rawThumb);

            return (
              <Link
                key={comic.slug || comic.id}
                to={`/truyen/${comic.slug}`}
                className="group flex flex-col rounded-2xl overflow-hidden border border-emerald-100/80 bg-white shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-emerald-50">
                  <img
                    src={fullThumb}
                    alt={comic.name || comic.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-cover.jpg";
                    }}
                  />
                  {/* Badge AI */}
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md backdrop-blur-xs flex items-center gap-0.5">
                    <span>✨</span>
                    <span>AI Gợi Ý</span>
                  </div>
                </div>

                <div className="p-2.5 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-emerald-50/20">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 line-clamp-2 group-hover:text-emerald-700 transition-colors leading-snug">
                      {comic.name || comic.title}
                    </h3>
                    {comic.reason && (
                      <p className="text-[10px] text-emerald-800/80 line-clamp-2 mt-1 italic font-medium leading-tight">
                        💬 "{comic.reason}"
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && !error && fetched && recommendations.length === 0 && (
        <div className="text-xs text-gray-500 italic p-4 text-center bg-white rounded-2xl border border-gray-100">
          🌿 Đọc thêm vài chương truyện để Nahida hiểu rõ gu đọc của bạn hơn nhé!
        </div>
      )}
    </section>
  );
};

export default AIRecommendSection;
