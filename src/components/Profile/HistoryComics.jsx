import React, { useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../../config";
import { getComicThumbUrl } from "../../utils/imageHelpers";

const ITEMS_PER_PAGE = 30;

const HistoryComics = ({ history }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const paginatedHistory = history.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div id="history-tab">
      {history.length === 0 ? (
        <div className="text-center text-emerald-800/60 py-8 font-medium italic">
          Lịch sử lưu dấu của Lữ Hành hiện đang trống.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
            {paginatedHistory.map((item, idx) => (
              <div
                key={item.slug + idx}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-md hover:shadow-emerald-100/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full relative"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-emerald-50/50 w-full shrink-0">
                  <img
                    src={getComicThumbUrl(item.thumb_url)}
                    alt={item.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-cover.jpg";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                  {/* Badge chương đè trên ảnh */}
                  <span className="absolute bottom-2.5 right-2.5 bg-emerald-500/90 backdrop-blur-sm text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-lg shadow-sm border border-emerald-400/20 truncate max-w-[85%]">
                    Đã đọc: Chương {item.chapter || "0"}
                  </span>
                </div>
                
                <div className="p-3.5 flex-1 flex flex-col justify-between bg-white/40">
                  <div>
                    <h3 className="font-bold text-[14px] leading-snug text-gray-800 line-clamp-2 min-h-[2.5rem] group-hover:text-emerald-700 transition-colors">
                      <Link to={`/truyen/${item.slug}`}>{item.name}</Link>
                    </h3>
                  </div>
                  
                  <div className="border-t border-emerald-50/50 pt-2 text-[10px] text-gray-400 shrink-0 truncate flex items-center gap-1 font-semibold" title={item.updatedAt ? new Date(item.updatedAt).toLocaleString("vi-VN") : ""}>
                    🕒 {item.updatedAt 
                      ? new Date(item.updatedAt).toLocaleDateString("vi-VN") + " " + new Date(item.updatedAt).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})
                      : ""}
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

export default HistoryComics;
