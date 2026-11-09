import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../config";
import { Link } from "react-router-dom";
import { getComicThumbUrl } from "../../utils/imageHelpers";

const ITEMS_PER_PAGE = 20;

const Comments = ({ user }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [comicDetails, setComicDetails] = useState({}); // Lưu trữ name, thumb, totalChapters

  useEffect(() => {
    if (!user?.token) return;
    fetch(`${API_BASE_URL}/api/comment/user`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setComments(data.comments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  // Fetch thông tin chi tiết các truyện từ CSDL nội bộ
  useEffect(() => {
    if (!comments.length) return;
    const uniqueSlugs = [...new Set(comments.map((c) => c.comicSlug))];
    Promise.all(
      uniqueSlugs.map((slug) =>
        fetch(`${API_BASE_URL}/api/comic/comics/${slug}`)
          .then((res) => res.json())
          .then((data) => {
            const item = data.data?.item;
            const fullThumb = getComicThumbUrl(item?.thumb_url || item?.thumbUrl);
            
            // Tính toán tổng số chương truyện
            let totalChapters = 0;
            if (item?.chapters) {
              item.chapters.forEach((srv) => {
                if (srv.server_data?.length > totalChapters) {
                  totalChapters = srv.server_data.length;
                }
              });
            }

            return {
              slug,
              name: item?.name || item?.title || slug,
              thumb: fullThumb,
              totalChapters: totalChapters || "Đang cập nhật",
            };
          })
          .catch(() => ({ 
            slug, 
            name: slug, 
            thumb: "/default-cover.jpg",
            totalChapters: "Đang cập nhật" 
          }))
      )
    ).then((arr) => {
      const obj = {};
      arr.forEach((item) => {
        obj[item.slug] = item;
      });
      setComicDetails(obj);
    });
  }, [comments]);

  if (!user?.token) return null;

  const totalPages = Math.ceil(comments.length / ITEMS_PER_PAGE);

  const paginatedComments = comments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-transparent">
      <div className="font-bold text-lg mb-4 text-emerald-800 flex items-center gap-1.5 border-b border-emerald-100 pb-2">
        📝 Lịch sử bình luận
      </div>
      {loading ? (
        <div className="text-gray-500 text-sm">Đang tải bình luận...</div>
      ) : comments.length === 0 ? (
        <div className="text-sm text-emerald-800/60 font-medium italic py-4">
          Lữ Hành chưa để lại bình luận nào trên Cây Thế Giới.
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedComments.map((c) => {
              const detail = comicDetails[c.comicSlug] || {
                name: c.comicSlug,
                thumb: "https://placehold.co/75x106?text=Comic",
                totalChapters: "..."
              };

              return (
                <li
                  key={c.id}
                  className="flex gap-4 p-3 rounded-2xl border border-emerald-100/60 bg-white hover:shadow-md hover:border-emerald-300 transition-all duration-300 overflow-hidden h-[130px]"
                >
                  {/* CỘT TRÁI: Ảnh truyện, tên truyện, tổng chương (Chiều cao vừa khít h-[106px] của ảnh) */}
                  <div className="w-[190px] shrink-0 flex gap-2.5 h-full border-r border-emerald-100/50 pr-2">
                    <img
                      src={detail.thumb}
                      alt={detail.name}
                      className="w-[75px] h-full object-cover rounded-xl border border-emerald-50 shadow-sm shrink-0"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/75x106?text=Comic";
                      }}
                    />
                    <div className="flex flex-col justify-between min-w-0 py-0.5">
                      <div className="space-y-1">
                        <Link 
                          to={`/truyen/${c.comicSlug}`}
                          className="font-black text-[12px] text-emerald-950 hover:text-emerald-600 transition-colors line-clamp-2 leading-tight"
                          title={detail.name}
                        >
                          {detail.name}
                        </Link>
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded-lg border border-emerald-100/40 inline-block">
                          {detail.totalChapters} chương
                        </span>
                      </div>
                      <Link 
                        to={`/truyen/${c.comicSlug}`}
                        className="text-[9px] font-black text-emerald-600 hover:text-emerald-700 transition"
                      >
                        Xem truyện →
                      </Link>
                    </div>
                  </div>

                  {/* CỘT PHẢI: Nhận xét bình luận (Giới hạn chiều cao vừa khít ảnh bên trái) */}
                  <div className="flex-1 flex flex-col justify-between min-w-0 h-full py-0.5">
                    <div className="space-y-1.5 min-h-0 flex-1 flex flex-col justify-between">
                      {/* Tiêu đề & thời gian bình luận */}
                      <div className="flex justify-between items-center text-[9px] text-gray-400 font-bold shrink-0">
                        <div className="flex items-center gap-1">
                          <span>💬 Cảm nhận của bạn</span>
                          <Link 
                            to={`/truyen/${c.comicSlug}`} 
                            className="text-emerald-600 hover:underline font-extrabold"
                          >
                            (xem bình luận của bạn →)
                          </Link>
                        </div>
                        <span>🕒 {new Date(c.createdAt).toLocaleDateString("vi-VN")}</span>
                      </div>
                      {/* Nội dung bình luận (cuộn mượt nếu quá dài) */}
                      <div className="text-gray-700 text-[11px] bg-emerald-50/10 p-2 rounded-xl border border-emerald-50/50 shadow-inner overflow-y-auto max-h-[70px] break-words whitespace-pre-wrap leading-relaxed">
                        {c.content}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
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

export default Comments;
