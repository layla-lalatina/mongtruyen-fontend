import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "../../../config";
import { getComicThumbUrl } from "../../utils/imageHelpers";
import AgeBadge from "../Common/AgeBadge";

/**
 * 🌳 SYSTEM: IRMINSUL FANTASY RPG — HOT COMICS LEADERBOARD PAGE
 * ============================================================
 * @file HotComics.jsx
 * @path fontend/src/components/HotComics/index.jsx
 * @description Trang danh sách truyện Hot nhất, thịnh hành, lượt xem cao nhất.
 */
const HotComics = () => {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const p = parseInt(searchParams.get("page") || "1", 10);
    setPage(isNaN(p) || p < 1 ? 1 : p);
  }, [searchParams]);

  useEffect(() => {
    const fetchHotComics = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/comic/comics?page=${page}&limit=24`);
        const data = await res.json();
        const rawItems = data.comics || data.data?.items || [];
        
        // Sắp xếp theo view giảm dần
        const sorted = [...rawItems].sort((a, b) => {
          const viewsA = Number(a.views || a.totalViews || a.total_views || 0);
          const viewsB = Number(b.views || b.totalViews || b.total_views || 0);
          return viewsB - viewsA;
        });

        setComics(sorted);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Lỗi khi tải truyện hot:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHotComics();
  }, [page]);

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) {
      setSearchParams({ page: p });
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3fbf8] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-emerald-700 text-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-rose-900/10 mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black tracking-widest uppercase mb-3 inline-block">
              🔥 BẢNG VÀNG THỊNH HÀNH
            </span>
            <h1 className="text-2xl sm:text-4xl font-black mb-2">
              Top Truyện Tranh Hot Nhất
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl">
              Tổng hợp những bộ truyện tranh có lượt đọc khủng nhất, tương tác sôi nổi và được cộng đồng Irminsul yêu thích nhất tuần qua.
            </p>
          </div>
          <div className="absolute right-4 bottom-2 text-7xl sm:text-9xl opacity-15 pointer-events-none select-none">
            🔥
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-emerald-800">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
            <span className="text-xs font-bold">Đang tổng hợp bảng xếp hạng thịnh hành...</span>
          </div>
        )}

        {/* Comics Grid */}
        {!loading && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {comics.map((comic, idx) => {
                const rank = (page - 1) * 24 + idx + 1;
                const thumb = getComicThumbUrl(comic.thumb_url || comic.thumbUrl || comic.coverImage);
                const views = Number(comic.views || comic.totalViews || comic.total_views || 0);

                return (
                  <Link
                    key={comic.slug}
                    to={`/truyen/${comic.slug}`}
                    className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-emerald-100/60 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative"
                  >
                    {/* Badge Thứ Hạng */}
                    <div
                      className={`absolute top-2 left-2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-md ${
                        rank === 1
                          ? "bg-amber-400 text-amber-950 ring-2 ring-amber-300"
                          : rank === 2
                          ? "bg-slate-300 text-slate-900 ring-2 ring-slate-200"
                          : rank === 3
                          ? "bg-amber-700 text-amber-50 ring-2 ring-amber-600"
                          : "bg-emerald-950/80 text-white backdrop-blur-sm"
                      }`}
                    >
                      {rank}
                    </div>

                    {/* Badge Lượt Xem */}
                    <div className="absolute top-2 right-2 z-10 bg-black/60 backdrop-blur-md text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1">
                      <span>👁️</span>
                      <span>{views.toLocaleString()}</span>
                    </div>

                    {/* Ảnh Bìa */}
                    <div className="aspect-[3/4] w-full overflow-hidden bg-gray-100 relative">
                      <img
                        src={thumb}
                        alt={comic.name || comic.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-2 left-2 z-10">
                        <AgeBadge rating={comic.ageRating || comic.age_rating || "ALL"} size="xs" />
                      </div>
                    </div>

                    {/* Nội dung */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <h3 className="font-extrabold text-xs text-gray-900 line-clamp-2 group-hover:text-emerald-700 transition">
                        {comic.name || comic.title}
                      </h3>
                      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-semibold">
                        <span>{comic.soChuong || `${comic.chapters?.length || 0} chương`}</span>
                        <span className="text-emerald-600 font-bold">Hot 🔥</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 bg-white border border-emerald-100 rounded-xl text-xs font-bold text-gray-700 disabled:opacity-40 hover:bg-emerald-50"
                >
                  ← Trước
                </button>
                <span className="text-xs font-bold text-emerald-900 px-3">
                  Trang {page} / {totalPages}
                </span>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  className="px-4 py-2 bg-white border border-emerald-100 rounded-xl text-xs font-bold text-gray-700 disabled:opacity-40 hover:bg-emerald-50"
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HotComics;
