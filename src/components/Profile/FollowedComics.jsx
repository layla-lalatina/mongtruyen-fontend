import React, { useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../../config";
import { getComicThumbUrl } from "../../utils/imageHelpers";

const ITEMS_PER_PAGE = 30;

const FollowedComics = ({ comics, user, onUnfollow }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [unfollowingSlug, setUnfollowingSlug] = useState(null);

  const totalPages = Math.ceil(comics.length / ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleUnfollow = async (slug) => {
    if (!user?.token) return;
    setUnfollowingSlug(slug);
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/unfollow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ comicSlug: slug }),
      });
      if (res.ok) {
        if (onUnfollow) {
          onUnfollow();
        }
      }
    } catch (err) {
      console.error("Lỗi khi hủy theo dõi:", err);
    } finally {
      setUnfollowingSlug(null);
    }
  };

  const paginatedComics = comics.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div id="followed-tab">
      {comics.length === 0 ? (
        <div className="text-center text-emerald-800/60 py-8 font-medium italic">
          Bạn chưa theo dõi truyện nào trên Cây Thế Giới.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
            {paginatedComics.map((comic) => (
              <div
                key={comic.slug}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-md hover:shadow-emerald-100/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full relative"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-emerald-50/50 w-full shrink-0">
                  <img
                    src={getComicThumbUrl(comic.thumb_url)}
                    alt={comic.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-cover.jpg";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  <div
                    className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase shadow-sm border ${
                      comic.status?.toLowerCase() === "hoàn thành" || comic.status?.toLowerCase() === "completed"
                        ? "bg-emerald-600 text-white border-emerald-500/20"
                        : "bg-amber-500 text-white border-amber-400/20"
                    }`}
                  >
                    {comic.status?.toLowerCase() === "hoàn thành" || comic.status?.toLowerCase() === "completed"
                      ? "Hoàn Thành"
                      : "Đang Ra"}
                  </div>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5 bg-white/40">
                  <div>
                    <h3 className="font-bold text-[14px] leading-snug text-gray-800 line-clamp-2 min-h-[2.5rem] group-hover:text-emerald-700 transition-colors">
                      <Link to={`/truyen/${comic.slug}`}>{comic.name}</Link>
                    </h3>
                    <p className="text-gray-500 text-[11px] font-medium mt-1 truncate">
                      Tác giả: {comic.author || "Đang cập nhật"}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs text-gray-600 flex justify-between items-center bg-emerald-50/40 p-1.5 rounded border border-emerald-100/30 font-medium">
                      <span>Mới nhất:</span>
                      <span className="font-bold text-emerald-700">
                        {String(comic.chap || "").startsWith("Chương")
                          ? comic.chap
                          : `Chương ${comic.latestChapter || comic.chap || comic.totalChapters || "Mới"}`}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => handleUnfollow(comic.slug)}
                      disabled={unfollowingSlug === comic.slug}
                      className="w-full text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-500 border border-rose-100 hover:border-rose-500 py-1.5 rounded-lg transition-all duration-200 shadow-sm flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      {unfollowingSlug === comic.slug ? "Đang hủy..." : "🗑️ Hủy theo dõi"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mb-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                }`}
              >
                ← Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3.5 py-1.5 rounded-lg border text-sm font-bold transition ${
                    page === currentPage
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white border-emerald-100 text-emerald-800 hover:bg-emerald-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                }`}
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FollowedComics;
