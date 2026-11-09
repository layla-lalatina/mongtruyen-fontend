import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../config";
import { getComicThumbUrl } from "../../utils/imageHelpers";
import AgeBadge from "../Common/AgeBadge";

const SEARCH_TYPES = [
  {
    id: "title",
    label: "Tên truyện",
    fullLabel: "Tìm theo tên truyện & nội dung liên quan",
    icon: "📖",
    desc: "Tìm theo tiêu đề & nội dung tác phẩm",
    placeholder: "Nhập ít nhất 2 chữ cái (vd: Wind, Tận Thế, Hệ Thống...)",
    hotSuggestions: [
      "Wind Breaker",
      "Tận Thế",
      "Tài Phiệt",
      "Vương Giả",
      "Tonikaku",
      "Chainsaw Man",
      "Blue Lock",
      "Hệ Thống",
    ],
  },
  {
    id: "author",
    label: "Tác giả",
    fullLabel: "Tìm theo tác giả",
    icon: "✍️",
    desc: "Tìm theo tác giả / họa sĩ",
    placeholder: "Nhập ít nhất 2 chữ cái (vd: Jo Yongseok, Sing N Song...)",
    hotSuggestions: [
      "Jo Yongseok",
      "Sing N Song",
      "Yuuji Yuuji",
      "Takase Waka",
      "Shirakome Ryo",
    ],
  },
  {
    id: "description",
    label: "Nội dung",
    fullLabel: "Tìm theo nội dung cốt truyện",
    icon: "📝",
    desc: "Tìm trong tóm tắt cốt truyện",
    placeholder: "Nhập ít nhất 2 chữ cái (vd: Hệ thống, Isekai, Harem...)",
    hotSuggestions: [
      "Hệ thống",
      "Isekai",
      "Harem",
      "Dungeon",
      "Chuyển sinh",
      "Ma vương",
    ],
  },
];

const AdvancedSearchModal = ({
  isOpen,
  onClose,
  categories = [],
  initialKeyword = "",
  initialSearchType = "title",
  initialCategories = [],
  initialMinChapters = "",
  initialStatus = "",
  initialAgeRating = "",
}) => {
  const [keyword, setKeyword] = useState(initialKeyword || "");
  const [searchType, setSearchType] = useState(initialSearchType || "title");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(initialCategories || []);
  const [minChapters, setMinChapters] = useState(initialMinChapters || "");
  const [status, setStatus] = useState(initialStatus || "");
  const [ageRating, setAgeRating] = useState(initialAgeRating || "");

  // Live preview kết quả khi gõ ít nhất 2 chữ cái
  const [liveResults, setLiveResults] = useState([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Live search debounced khi nhập ít nhất 2 ký tự
  useEffect(() => {
    const trimmed = keyword.trim();
    if (trimmed.length < 2) {
      setLiveResults([]);
      setIsSearchingLive(false);
      return;
    }

    setIsSearchingLive(true);
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        params.set("keyword", trimmed);
        params.set("searchType", searchType);
        if (selectedCategories.length > 0) {
          params.set("category", selectedCategories.join(","));
        }
        if (minChapters) params.set("minChapters", minChapters);
        if (status) params.set("status", status);
        if (ageRating) params.set("ageRating", ageRating);
        params.set("limit", "6");

        const res = await fetch(
          `${API_BASE_URL}/api/comic/advanced-search?${params.toString()}`
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.comics)) {
          setLiveResults(data.comics);
        } else {
          setLiveResults([]);
        }
      } catch (err) {
        console.error("Lỗi tìm kiếm gợi ý trực tiếp:", err);
        setLiveResults([]);
      } finally {
        setIsSearchingLive(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [keyword, searchType, selectedCategories, minChapters, status, ageRating]);

  // Đồng bộ giá trị khi modal mở
  useEffect(() => {
    if (isOpen) {
      setKeyword(initialKeyword || "");
      setSearchType(initialSearchType || "title");
      if (Array.isArray(initialCategories) && initialCategories.length > 0) {
        setSelectedCategories(initialCategories);
      }
      setMinChapters(initialMinChapters || "");
      setStatus(initialStatus || "");
      setAgeRating(initialAgeRating || "");
      setIsTypeDropdownOpen(false);
      setLiveResults([]);
    }
  }, [isOpen, initialKeyword, initialSearchType, initialMinChapters, initialStatus, initialAgeRating]);

  // Click ra ngoài để đóng dropdown loại tìm kiếm
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsTypeDropdownOpen(false);
      }
    };

    if (isTypeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTypeDropdownOpen]);

  if (!isOpen) return null;

  const currentTypeConfig =
    SEARCH_TYPES.find((t) => t.id === searchType) || SEARCH_TYPES[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("adv", "true");
    if (keyword.trim()) params.set("q", keyword.trim());
    params.set("searchType", searchType);
    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories.join(","));
    }
    if (minChapters) params.set("minChapters", minChapters);
    if (status) params.set("status", status);
    if (ageRating) params.set("ageRating", ageRating);

    navigate(`/search?${params.toString()}`);
    onClose();
  };

  const toggleCategory = (slug) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4">
      <div className="bg-white dark:bg-[#0c221c] border border-emerald-100 dark:border-emerald-500/20 rounded-3xl w-full max-w-lg shadow-2xl p-6 relative animate-scale-up text-emerald-950 dark:text-emerald-50 max-h-[92vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-4 border-b border-emerald-50 dark:border-emerald-900/40 pb-3">
          <h3 className="text-lg font-black flex items-center gap-2 text-emerald-900 dark:text-emerald-400">
            <span>🔍</span> Tìm Kiếm Nâng Cao
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-emerald-900/50 dark:hover:bg-emerald-800 text-gray-500 dark:text-emerald-200 text-xs font-bold transition"
            title="Đóng"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Ô nhập từ khóa + Menu chọn loại tìm kiếm bên phải ngoài cùng */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Từ khóa & Tiêu chí tìm kiếm
              </label>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Đang tìm: <strong>{currentTypeConfig.fullLabel}</strong>
              </span>
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-gray-400 text-sm pointer-events-none select-none">
                {currentTypeConfig.icon}
              </span>

              <input
                type="text"
                placeholder={currentTypeConfig.placeholder}
                className="w-full pl-10 pr-36 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/80 focus:border-emerald-500 outline-none text-xs sm:text-sm transition-all bg-emerald-50/20 dark:bg-emerald-950/30 text-black dark:text-white font-medium focus:ring-1 focus:ring-emerald-400 shadow-inner"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                autoFocus
              />

              {/* Nút xóa từ khóa nếu đã nhập */}
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword("")}
                  className="absolute right-32 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-black p-1 transition"
                  title="Xóa từ khóa"
                >
                  ✕
                </button>
              )}

              {/* Mục chọn ngay bên phải ngoài cùng (Dropdown draw ra các tùy chọn) */}
              <div className="absolute right-1.5 flex items-center" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsTypeDropdownOpen((prev) => !prev)}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm select-none ${
                    isTypeDropdownOpen
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/40"
                      : "bg-emerald-100/90 hover:bg-emerald-200/90 dark:bg-emerald-900/60 dark:hover:bg-emerald-800/80 text-emerald-950 dark:text-emerald-200 border-emerald-200/80 dark:border-emerald-700/60"
                  }`}
                  title="Bấm để chọn tiêu chí: Tìm theo tên truyện, tác giả hoặc nội dung"
                >
                  <span className="text-xs">{currentTypeConfig.icon}</span>
                  <span className="truncate max-w-[65px] sm:max-w-none text-[11px] sm:text-xs">
                    {currentTypeConfig.label}
                  </span>
                  <span
                    className={`text-[9px] transition-transform duration-200 ml-0.5 ${
                      isTypeDropdownOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {/* Dropdown Menu xổ ra các ô chọn */}
                {isTypeDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#0c221c] border border-emerald-200 dark:border-emerald-700/80 rounded-2xl shadow-2xl p-1.5 z-50 animate-scale-up backdrop-blur-md">
                    <div className="px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 border-b border-emerald-100 dark:border-emerald-900/40 mb-1 flex items-center justify-between">
                      <span>🎯 Tiêu chí tìm kiếm</span>
                      <span className="text-[9px] font-normal text-emerald-600 dark:text-emerald-300">
                        Chọn 1 kiểu
                      </span>
                    </div>

                    <div className="space-y-1">
                      {SEARCH_TYPES.map((type) => {
                        const isSelected = searchType === type.id;
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => {
                              setSearchType(type.id);
                              setIsTypeDropdownOpen(false);
                            }}
                            className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all ${
                              isSelected
                                ? "bg-emerald-600 text-white font-bold shadow-sm"
                                : "hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-emerald-950 dark:text-emerald-100"
                            }`}
                          >
                            <span className="text-base shrink-0 mt-0.5">{type.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold flex items-center justify-between">
                                <span>{type.fullLabel}</span>
                                {isSelected && (
                                  <span className="text-xs text-white bg-emerald-700/50 rounded-full px-1.5 py-0.2">
                                    ✓ Đang chọn
                                  </span>
                                )}
                              </div>
                              <div
                                className={`text-[11px] truncate mt-0.5 ${
                                  isSelected
                                    ? "text-emerald-100"
                                    : "text-gray-500 dark:text-emerald-400/70"
                                }`}
                              >
                                {type.desc}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chữ hướng dẫn ẩn/gợi ý khi nhập số lượng ký tự */}
            <div className="mt-1.5 px-1">
              {keyword.trim().length === 0 ? (
                <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 font-medium flex items-center gap-1">
                  <span>💡</span>
                  <span>Nhập ít nhất <strong>2 chữ cái</strong> để hệ thống tự động tìm kiếm & lọc truyện gần đúng.</span>
                </p>
              ) : keyword.trim().length === 1 ? (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 animate-pulse">
                  <span>✍️</span>
                  <span>Nhập thêm <strong>1 chữ cái nữa</strong> để bắt đầu hiện truyện tương ứng...</span>
                </p>
              ) : null}
            </div>

            {/* Gợi ý từ khóa hot có truyện thật 100% trong CSDL */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                🔥 Gợi ý ({currentTypeConfig.label}):
              </span>
              {currentTypeConfig.hotSuggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setKeyword(sug)}
                  className="text-[11px] px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 transition-all font-semibold active:scale-95"
                >
                  {sug}
                </button>
              ))}
            </div>

            {/* Danh sách truyện gợi ý xuất hiện trực tiếp khi nhập từ 2 chữ cái trở lên */}
            {keyword.trim().length >= 2 && (
              <div className="mt-3 p-3 bg-emerald-50/40 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/70 shadow-sm animate-fade-in">
                <div className="flex items-center justify-between text-[11px] font-extrabold text-emerald-900 dark:text-emerald-300 pb-1.5 border-b border-emerald-100 dark:border-emerald-900/60 mb-2">
                  <span className="flex items-center gap-1.5">
                    <span>⚡</span>
                    <span>Truyện khớp với từ khóa "{keyword}"</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-white dark:bg-emerald-900/60 px-2 py-0.5 rounded-full font-bold border border-emerald-200/60 dark:border-emerald-800/40">
                    {isSearchingLive ? "Đang lọc..." : `${liveResults.length} truyện`}
                  </span>
                </div>

                {isSearchingLive ? (
                  <div className="py-4 flex items-center justify-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                    <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span>Đang lọc các bộ truyện liên quan...</span>
                  </div>
                ) : liveResults.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                    {liveResults.map((c) => (
                      <div
                        key={c.id || c.slug}
                        onClick={() => {
                          navigate(`/truyen/${c.slug}`);
                          onClose();
                        }}
                        className="group flex items-center gap-2.5 p-1.5 rounded-xl bg-white/80 dark:bg-[#0c221c]/70 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 border border-emerald-100/60 dark:border-emerald-800/40 hover:border-emerald-300 dark:hover:border-emerald-600 cursor-pointer transition shadow-xs"
                      >
                        <img
                          src={getComicThumbUrl(c.thumbUrl || c.thumb_url)}
                          alt={c.title || c.name}
                          className="w-9 h-12 object-cover rounded-lg shrink-0 border border-emerald-100 shadow-2xs bg-emerald-50"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/100x140?text=No+Cover";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-xs font-bold text-gray-900 dark:text-emerald-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition truncate">
                              {c.title || c.name}
                            </h5>
                            <AgeBadge rating={c.ageRating || c.age_rating || "ALL"} size="xs" />
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-emerald-400/80 mt-0.5">
                            <span className="font-medium text-emerald-700 dark:text-emerald-400">
                              📖 {c.chapters?.length || c.totalChapters || c.soChuong || "Đang cập nhật"}
                            </span>
                            {c.author && (
                              <span className="truncate text-gray-500 dark:text-gray-400">
                                ✍️ {c.author}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition shrink-0 pr-1 flex items-center gap-0.5">
                          Đọc ➔
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-3 text-center text-[11px] text-gray-500 dark:text-emerald-400/70 italic">
                    Chưa tìm thấy truyện nào khớp với "{keyword}". Bạn có thể bấm nút "Tìm Kiếm" bên dưới để quét toàn bộ.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Thể loại (Chọn nhiều - TÌM TRUYỆN CÓ ĐỦ TẤT CẢ THỂ LOẠI ĐÃ CHỌN) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Thể loại ({selectedCategories.length} đã chọn)
              </label>
              {selectedCategories.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedCategories([])}
                  className="text-[10px] font-bold text-red-500 hover:underline hover:text-red-600 transition-colors"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            {selectedCategories.length >= 2 && (
              <div className="mb-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-1.5">
                <span>✨</span>
                <span>
                  Lọc kết hợp (AND): Truyện tìm thấy phải chứa <strong>toàn bộ {selectedCategories.length} thể loại</strong> đã chọn.
                </span>
              </div>
            )}

            <div className="w-full max-h-40 overflow-y-auto border border-emerald-100 dark:border-emerald-800/80 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 bg-emerald-50/10 dark:bg-emerald-950/20 custom-scrollbar text-black dark:text-white">
              {categories.map((cat) => {
                const isSelected = selectedCategories.includes(cat.slug);
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => toggleCategory(cat.slug)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between border ${
                      isSelected
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-sm glow-emerald-shadow border-transparent"
                        : "bg-white dark:bg-[#0c221c]/40 border-emerald-100/60 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    }`}
                  >
                    <span className="truncate mr-1 text-left">{cat.name}</span>
                    <span className="shrink-0 text-[10px]">
                      {isSelected ? "✓" : "+"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Số chương */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-emerald-800 dark:text-emerald-300">
                Số chương tối thiểu
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-emerald-100 dark:border-emerald-800 outline-none text-sm transition-all focus:border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/40 text-black dark:text-white"
                value={minChapters}
                onChange={(e) => setMinChapters(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="10">&gt; 10 chương</option>
                <option value="50">&gt; 50 chương</option>
                <option value="100">&gt; 100 chương</option>
                <option value="200">&gt; 200 chương</option>
              </select>
            </div>

            {/* Trạng thái */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-emerald-800 dark:text-emerald-300">
                Trạng thái
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-emerald-100 dark:border-emerald-800 outline-none text-sm transition-all focus:border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/40 text-black dark:text-white"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="ongoing">Đang tiến hành</option>
                <option value="completed">Hoàn thành</option>
              </select>
            </div>
          </div>

          {/* Giới hạn độ tuổi */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-emerald-800 dark:text-emerald-300">
              Giới hạn độ tuổi
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-xl border border-emerald-100 dark:border-emerald-800 outline-none text-sm transition-all focus:border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/40 text-black dark:text-white"
              value={ageRating}
              onChange={(e) => setAgeRating(e.target.value)}
            >
              <option value="">Mọi độ tuổi (Tất cả)</option>
              <option value="ALL">ALL - Mọi lứa tuổi</option>
              <option value="13+">13+ Thiếu niên</option>
              <option value="16+">16+ Trưởng thành</option>
              <option value="18+">18+ Giới hạn tuổi</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-emerald-100 dark:border-emerald-500/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-sm transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-md text-sm transition-all flex items-center gap-1.5"
            >
              <span>🔍</span>
              <span>Tìm Kiếm</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvancedSearchModal;
