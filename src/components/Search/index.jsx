import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { API_BASE_URL } from "../../../config";
import { SearchResults } from "./SearchResults";
import AdvancedSearchModal from "../Navbar/AdvancedSearchModal";
import AgeBadge from "../Common/AgeBadge";

/**
 * 🌳 SYSTEM: IRMINSUL FANTASY RPG - SEARCH CONTAINER
 * @file index.jsx
 * @path fontend/src/components/Search/index.jsx
 */
const Search = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const isAdvanced = searchParams.get("adv") === "true";
  const query = searchParams.get("q") || "";
  const searchType = searchParams.get("searchType") || searchParams.get("type") || "title";
  const category = searchParams.get("category") || "";
  const minChapters = searchParams.get("minChapters") || "";
  const status = searchParams.get("status") || "";
  const ageRating = searchParams.get("ageRating") || "";

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/comic/categories`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data?.data?.items) ? data.data.items : [];
        setCategories(list.filter((cat) => !!cat.slug));
      })
      .catch((err) => console.error("Lỗi tải danh mục:", err));
  }, []);

  const selectedCategorySlugs = category
    ? category.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const getSearchTypeInfo = () => {
    if (searchType === "author") {
      return { label: "Tác giả", icon: "✍️", text: "Tìm theo tác giả" };
    }
    if (searchType === "description") {
      return { label: "Nội dung", icon: "📝", text: "Tìm theo nội dung" };
    }
    return { label: "Tên truyện", icon: "📖", text: "Tìm theo tên truyện" };
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (query) params.set("keyword", query);
    if (searchType) params.set("searchType", searchType);
    if (category) params.set("category", category);
    if (minChapters) params.set("minChapters", minChapters);
    if (status) params.set("status", status);
    if (ageRating) params.set("ageRating", ageRating);

    fetch(`${API_BASE_URL}/api/comic/advanced-search?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.comics)) {
          const normalized = data.comics.map((c) => {
            let parsedCats = [];
            try {
              parsedCats = JSON.parse(c.categories || "[]");
            } catch {
              parsedCats = [];
            }
            return {
              _id: c.slug,
              slug: c.slug,
              name: c.name || c.title,
              thumb_url: c.thumb_url || c.thumbUrl,
              ageRating: c.ageRating || c.age_rating || "ALL",
              age_rating: c.age_rating || c.ageRating || "ALL",
              isVip: Boolean(c.isVip || c.is_vip),
              category: parsedCats.map((cat) => ({ name: cat.name, id: cat.slug })),
              soChuong: c.soChuong || "0 chương",
            };
          });
          setResults(normalized);
        } else {
          setResults([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi tìm kiếm:", err);
        setError("Lỗi khi tìm kiếm");
        setLoading(false);
      });
  }, [location.search]);

  const typeInfo = getSearchTypeInfo();

  return (
    <div className="bg-[#f3fbf8] min-h-screen relative overflow-hidden py-8 px-2 md:px-4">
      {/* Hiệu ứng các hạt sáng bay Irminsul ở nền */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(10)].map((_, i) => {
          const size = Math.random() * 8 + 4;
          const left = Math.random() * 100;
          const delay = Math.random() * 15;
          const duration = Math.random() * 20 + 10;
          const flyX = (Math.random() * 100 - 50) + "px";
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
        {/* Breadcrumb & Nút mở lại bộ lọc */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-emerald-800 flex flex-wrap items-center gap-2 font-medium">
            <Link to="/" className="hover:text-emerald-500 hover:underline transition-colors flex items-center gap-1">
              <span>🏠 Trang chủ</span>
            </Link>
            <span className="text-emerald-300">/</span>
            <span className="font-bold text-emerald-950 bg-emerald-100/60 px-2 py-0.5 rounded-lg border border-emerald-200/50">
              Tìm kiếm
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <span>🔍</span>
            <span>Tùy chỉnh bộ lọc nâng cao</span>
          </button>
        </div>

        {/* Tiêu đề kết quả tìm kiếm */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-block w-2.5 h-8 bg-emerald-500 rounded-full"></span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-emerald-950 flex flex-wrap items-center gap-2">
              <span>Kết quả tìm kiếm:</span>
              <span className="text-emerald-600 font-bold">
                "{query || (selectedCategorySlugs.length > 0 ? "Theo thể loại" : "Tất cả truyện")}"
              </span>
            </h2>

            {/* Badge hiển thị loại tìm kiếm */}
            {query && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100/80 text-emerald-900 border border-emerald-300/60 text-xs font-bold">
                <span>{typeInfo.icon}</span>
                <span>{typeInfo.text}</span>
              </span>
            )}
          </div>

          {/* Chi tiết bộ lọc đang áp dụng */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {isAdvanced && (
              <div className="text-xs font-bold text-emerald-700/90 bg-emerald-50/80 px-3 py-1 rounded-xl border border-emerald-200/60 inline-flex items-center gap-1">
                <span>⚡</span>
                <span>Bộ lọc Cây Thế Giới đang áp dụng</span>
              </div>
            )}

            {selectedCategorySlugs.length > 0 && (
              <div className="text-xs text-emerald-900 flex flex-wrap items-center gap-1.5 bg-emerald-50/60 px-3 py-1 rounded-xl border border-emerald-200/50">
                <span className="font-semibold text-emerald-800">
                  {selectedCategorySlugs.length >= 2 ? "Chứa đủ tất cả thể loại:" : "Thể loại:"}
                </span>
                {selectedCategorySlugs.map((slug, idx) => {
                  const catObj = categories.find((c) => c.slug === slug);
                  const name = catObj ? catObj.name : slug;
                  return (
                    <React.Fragment key={slug}>
                      <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
                        ✓ {name}
                      </span>
                      {idx < selectedCategorySlugs.length - 1 && (
                        <span className="text-emerald-400 font-bold">+</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            {minChapters && (
              <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                &gt; {minChapters} chương
              </div>
            )}

            {status && (
              <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {status === "completed" ? "Đã hoàn thành" : "Đang tiến hành"}
              </div>
            )}

            {ageRating && (
              <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                <span>Độ tuổi:</span>
                <AgeBadge rating={ageRating} size="xs" showLabel />
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
            <div className="text-emerald-800 font-medium animate-pulse">Đang định hình ký ức từ Cây Thế Giới...</div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-12 bg-red-50 rounded-2xl border border-red-100 my-4 w-full">
            <span className="text-lg">⚠️ {error}</span>
          </div>
        ) : (
          <SearchResults results={results} />
        )}
      </div>

      {/* Modal tìm kiếm nâng cao để người dùng có thể chỉnh sửa lại ngay tại trang Search */}
      <AdvancedSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        initialKeyword={query}
        initialSearchType={searchType}
        initialCategories={selectedCategorySlugs}
        initialMinChapters={minChapters}
        initialStatus={status}
        initialAgeRating={ageRating}
      />
    </div>
  );
};

export default Search;
