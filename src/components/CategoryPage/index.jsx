import React, { useEffect, useRef, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "../../../config";
import { getComicThumbUrl } from "../../utils/imageHelpers";
import { categoryDescriptions } from "./categoryDescriptions";
import AgeBadge from "../Common/AgeBadge";

const sortOptions = [
  { label: "Ngày cập nhật", value: "updated" },
  { label: "Tên A-Z", value: "name" },
  { label: "Số chapter", value: "chapter" },
];

const statusOptions = [
  { label: "Tất cả", value: "" },
  { label: "Hoàn thành", value: "completed" },
  { label: "Đang tiến hành", value: "ongoing" },
];

const CategoryPage = () => {
  const { slug } = useParams();
  const [comics, setComics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("updated");
  const [status, setStatus] = useState("");
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCategoryPanel, setShowCategoryPanel] = useState(false);
  const panelRef = useRef(null);
  console.log("Tổng số trang:", totalPages);

  const currentCategory = categories.find((cat) => cat.slug === slug);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowCategoryPanel(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lấy thể loại sidebar
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/comic/categories`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data?.data?.items) ? data.data.items : [];
        setCategories(list.filter((cat) => !!cat.slug));
      });
  }, []);

  // Đồng bộ page với url (?page=)
  useEffect(() => {
    const p = parseInt(searchParams.get("page") || "1", 10);
    setPage(isNaN(p) || p < 1 ? 1 : p);
  }, [searchParams]);

  // Lấy truyện theo thể loại (hoặc tất cả nếu không có slug), có phân trang
  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const url = slug
          ? `${API_BASE_URL}/api/comic/advanced-search?category=${encodeURIComponent(slug)}&page=${page}&limit=24`
          : `${API_BASE_URL}/api/comic/comics?page=${page}&limit=24`;

        const res = await fetch(url);
        const data = await res.json();

        const rawItems = data.comics || data.data?.items || [];
        let allItems = rawItems.map((c) => {
          let parsedCats = [];
          if (Array.isArray(c.category)) {
            parsedCats = c.category;
          } else if (Array.isArray(c.genres)) {
            parsedCats = c.genres.map((g) => ({ name: g.name, id: g.slug }));
          } else {
            try {
              parsedCats = JSON.parse(c.categories || "[]").map((cat) => ({ name: cat.name, id: cat.slug }));
            } catch {
              parsedCats = [];
            }
          }
          return {
            ...c,
            _id: c.slug,
            name: c.name || c.title,
            slug: c.slug,
            thumb_url: c.thumb_url || c.thumbUrl,
            category: parsedCats,
            chap: c.soChuong || c.chap || "0 chương",
          };
        });

        let apiTotalPages = data.totalPages || 1;

        // Lọc bỏ các truyện không có chương (Đang cập nhật)
        let filteredItems = allItems.filter((item) => {
          const latestChapter =
            item.chaptersLatest && item.chaptersLatest.length > 0
              ? item.chaptersLatest[0].chapter_name
              : item.chap || item.chapter || null;
          return !!latestChapter;
        });

        // Lọc status
        if (status) {
          filteredItems = filteredItems.filter(
            (item) => item.status?.toLowerCase() === status
          );
        }

        // Sắp xếp
        if (sort === "updated") {
          filteredItems.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          );
        } else if (sort === "chapter") {
          filteredItems.sort((a, b) => {
            const aChap = parseFloat(
              a.chaptersLatest?.[0]?.chapter_name || a.chap || a.chapter || 0
            );
            const bChap = parseFloat(
              b.chaptersLatest?.[0]?.chapter_name || b.chap || b.chapter || 0
            );
            return bChap - aChap;
          });
        } else if (sort === "name") {
          filteredItems.sort((a, b) => a.name.localeCompare(b.name));
        }

        setComics(filteredItems.slice(0, 24));
        setTotalPages(Math.ceil(apiTotalPages / 3));
        setLoading(false);
      } catch (err) {
        setError("Lỗi khi tải dữ liệu");
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, sort, status, page]);

  // Xử lý chuyển trang
  const goToPage = (p) => {
    setSearchParams({ page: p });
  };

  return (
    <div className="bg-[#f3fbf8] min-h-screen relative overflow-hidden py-8 px-2 md:px-4">
      {/* Hiệu ứng các hạt sáng bay Irminsul ở nền */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(12)].map((_, i) => {
          const size = Math.random() * 8 + 4; // 4px to 12px
          const left = Math.random() * 100; // 0% to 100%
          const delay = Math.random() * 15; // 0s to 15s
          const duration = Math.random() * 20 + 10; // 10s to 30s
          const flyX = Math.random() * 100 - 50 + "px"; // -50px to 50px
          return (
            <div
              key={i}
              className="irminsul-particle"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                animationDelay: `${delay}s`,
                "--fly-duration": `${duration}s`,
                "--fly-x": flyX,
              }}
            />
          );
        })}
      </div>

      <div className="max-w-7xl mx-auto relative z-10 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-emerald-100/40 border border-emerald-100/50 p-4 md:p-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-emerald-805 flex flex-wrap items-center gap-2 font-medium">
          <Link
            to="/"
            className="hover:text-emerald-500 hover:underline transition-colors flex items-center gap-1"
          >
            <span>🏠 Trang chủ</span>
          </Link>
          <span className="text-emerald-300">/</span>
          <Link
            to="/the-loai"
            className="hover:text-emerald-500 hover:underline transition-colors text-emerald-800"
          >
            Thể loại
          </Link>
          {currentCategory && (
            <>
              <span className="text-emerald-300">/</span>
              <span className="font-bold text-emerald-950 bg-emerald-100/60 px-2 py-0.5 rounded-lg border border-emerald-200/50">
                {currentCategory.name}
              </span>
            </>
          )}
        </div>

        <div>
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-emerald-950 mb-2 flex items-center gap-2">
              <span className="inline-block w-2.5 h-8 bg-emerald-500 rounded-full"></span>
              Truyện tranh {currentCategory ? currentCategory.name : "Tất cả"}
            </h1>
            <p className="text-sm text-emerald-700/80 max-w-3xl bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100/50 leading-relaxed font-medium">
              {slug && categoryDescriptions[slug] ? (
                <span>
                  <strong className="text-emerald-950 font-bold">
                    ✨ Định nghĩa:
                  </strong>{" "}
                  {categoryDescriptions[slug]}
                </span>
              ) : (
                `Khám phá kho lưu trữ truyện tranh ${currentCategory
                  ? `thể loại ${currentCategory.name}`
                  : "đa dạng phong phú"
                }, được cập nhật mới nhất từ Cây Thế Giới Irminsul.`
              )}
            </p>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-emerald-100 pb-5">
            <div className="relative w-full md:w-auto" ref={panelRef}>
              <button
                onClick={() => setShowCategoryPanel((v) => !v)}
                className="w-full md:w-auto px-5 py-2.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-900 font-bold transition-all shadow-sm flex items-center justify-between md:justify-start gap-2 hover:border-emerald-300"
              >
                <span>
                  📂 Thể loại:{" "}
                  {currentCategory ? currentCategory.name : "Tất cả"}
                </span>
                <span
                  className={`text-xs transition-transform duration-200 ${showCategoryPanel ? "rotate-180" : ""
                    }`}
                >
                  ▼
                </span>
              </button>

              {showCategoryPanel && (
                <div className="absolute left-0 top-full mt-2 border border-emerald-100 rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl p-5 w-full md:w-[600px] z-50 animate-fade-in border-t-4 border-t-emerald-500 text-black">
                  <h4 className="text-xs font-bold text-emerald-900/50 uppercase tracking-wider mb-3">
                    Chọn thể loại truyện
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    <Link
                      to="/the-loai"
                      onClick={() => setShowCategoryPanel(false)}
                      className={`px-3 py-1.5 rounded-lg transition-colors font-bold ${!slug
                        ? "bg-emerald-500 text-white"
                        : "text-emerald-800 hover:bg-emerald-50 hover:text-emerald-600"
                        }`}
                    >
                      Tất cả thể loại
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id || cat.slug}
                        to={`/the-loai/${cat.slug}`}
                        onClick={() => setShowCategoryPanel(false)}
                        className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${cat.slug === slug
                          ? "bg-emerald-500 text-white font-bold"
                          : "text-emerald-800 hover:bg-emerald-50 hover:text-emerald-600"
                          }`}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Lọc trạng thái & sắp xếp */}
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-1.5 bg-emerald-50/50 p-1 rounded-xl border border-emerald-100 w-full sm:w-auto justify-around sm:justify-start">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${status === opt.value
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-emerald-800 hover:bg-white"
                      }`}
                    onClick={() => setStatus(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 bg-emerald-50/50 p-1 rounded-xl border border-emerald-100 w-full sm:w-auto justify-around sm:justify-start">
                <span className="text-xs font-bold text-emerald-800 px-2">
                  Sắp xếp:
                </span>
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sort === opt.value
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-emerald-800 hover:bg-white"
                      }`}
                    onClick={() => setSort(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Danh sách truyện */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
              <div className="text-emerald-850 font-medium animate-pulse">
                Đang thu thập ký ức từ Cây Thế Giới...
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-12 bg-red-50 rounded-2xl border border-red-100 my-4 w-full">
              <span className="text-lg">⚠️ {error}</span>
            </div>
          ) : comics.length === 0 ? (
            <div className="text-center text-emerald-800/60 py-20 bg-emerald-50/20 rounded-2xl border border-emerald-100/50 my-4 w-full">
              <span className="text-lg">
                🌸 Không tìm thấy bộ truyện nào phù hợp tiêu chí.
              </span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {comics.map((item, idx) => {
                  const latestChapter =
                    item.chaptersLatest && item.chaptersLatest.length > 0
                      ? item.chaptersLatest[0].chapter_name
                      : item.chap || item.chapter || null;

                  return (
                    <Link
                      to={`/truyen/${item.slug}`}
                      key={item._id || idx}
                      className="group bg-white text-black rounded-2xl border border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-lg hover:shadow-emerald-100/50 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col h-full relative"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-emerald-50/50 w-full shrink-0">
                        <img
                          src={getComicThumbUrl(item.thumb_url || item.thumbUrl)}
                          alt={item.name || item.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/default-cover.jpg";
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />

                        <div className="absolute top-2.5 left-2.5 z-10">
                          <AgeBadge rating={item.ageRating || item.age_rating || "ALL"} size="xs" />
                        </div>

                        {(item.isVip || item.is_vip) && (
                          <span className="absolute top-2.5 right-2.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-md shadow-md border border-amber-300 ring-1 ring-amber-400/40 shiny-gold-title flex items-center gap-1 z-10">
                            👑 VIP
                          </span>
                        )}

                        {/* Glassmorphism Chapter Badge ở góc dưới bên phải */}
                        <span className="absolute bottom-2.5 right-2.5 bg-emerald-500/90 backdrop-blur-sm text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-lg shadow-sm border border-emerald-400/20 truncate max-w-[85%]">
                          {latestChapter ? `Chương ${latestChapter}` : "Đang cập nhật"}
                        </span>
                      </div>

                      <div className="p-3 flex-1 flex flex-col justify-between bg-white/40">
                        <h3 className="font-bold text-[14px] leading-snug text-gray-800 line-clamp-2 min-h-[2.5rem] group-hover:text-emerald-700 transition-colors">
                          {item.name}
                        </h3>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-emerald-800/60 font-semibold border-t border-emerald-50/50 pt-2">
                          <span className="bg-emerald-50 px-1.5 py-0.5 rounded text-emerald-700">
                            {(item.status?.toLowerCase() === "completed" || item.status?.toLowerCase() === "hoàn thành")
                              ? "Hoàn thành"
                              : "Đang tiến hành"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {totalPages > 1 && !loading && !error && (
          <div className="flex justify-center items-center gap-2 mt-12 flex-wrap text-emerald-950 font-bold">
            <button
              className="px-3.5 py-2 rounded-xl border border-emerald-100 bg-white/80 backdrop-blur-sm text-emerald-950 font-bold text-sm shadow-sm transition-all hover:bg-emerald-50 disabled:opacity-40 disabled:hover:bg-white"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              ◀
            </button>
            {(() => {
              const maxShow = 2;
              const range = 1;
              let pages = [];
              for (let i = 1; i <= totalPages; i++) {
                if (
                  i <= maxShow ||
                  i > totalPages - maxShow ||
                  (i >= page - range && i <= page + range)
                ) {
                  pages.push(i);
                } else if (
                  (i === maxShow + 1 && page - range > maxShow + 1) ||
                  (i === totalPages - maxShow && page + range < totalPages - maxShow)
                ) {
                  pages.push("...");
                }
              }
              return pages
                .reduce((arr, p, idx) => {
                  if (p === "..." && arr[arr.length - 1] === "...") return arr;
                  arr.push(p);
                  return arr;
                }, [])
                .map((p, idx) =>
                  p === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-emerald-400 font-bold"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={`pagination-page-${p}`}
                      className={`px-4 py-2 rounded-xl border text-sm font-bold shadow-sm transition-all ${page === p
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-white/80 border-emerald-105 text-emerald-950 hover:bg-emerald-50"
                        }`}
                      onClick={() => goToPage(p)}
                    >
                      {p}
                    </button>
                  )
                );
            })()}
            <button
              className="px-3.5 py-2 rounded-xl border border-emerald-100 bg-white/80 backdrop-blur-sm text-emerald-955 font-bold text-sm shadow-sm transition-all hover:bg-emerald-50 disabled:opacity-40 disabled:hover:bg-white"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
            >
              ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
