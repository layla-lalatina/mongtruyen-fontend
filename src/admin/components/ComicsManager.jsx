import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import ChaptersManager from "./ChaptersManager";
import { getComicThumbUrl } from "../../utils/imageHelpers";
import AgeBadge from "../../components/Common/AgeBadge";
import {
  LuPlus,
  LuBookOpen,
  LuPencil,
  LuTrash2,
  LuSparkles,
  LuShieldAlert,
  LuX,
} from "react-icons/lu";

const ComicsManager = ({ comics, totalComics, page, totalPages, goToPage }) => {
  const [activeComicSlug, setActiveComicSlug] = useState(null);
  const [activeComicName, setActiveComicName] = useState("");

  // Quản lý Modal Đăng / Sửa Truyện
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditSlug, setCurrentEditSlug] = useState("");

  // Form fields
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formAuthor, setFormAuthor] = useState("");
  const [formStatus, setFormStatus] = useState("ONGOING");
  const [formAgeRating, setFormAgeRating] = useState("ALL");
  const [formDescription, setFormDescription] = useState("");
  const [formThumbUrl, setFormThumbUrl] = useState("");
  const [formCoverBase64, setFormCoverBase64] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);

  // AI Gợi ý độ tuổi & cảnh báo
  const [isAiSuggestingAge, setIsAiSuggestingAge] = useState(false);
  const [aiAgeSuggestion, setAiAgeSuggestion] = useState(null);

  // Quản lý Modal Cảnh Báo Truyện (ComicNotice)
  const [noticeModalComic, setNoticeModalComic] = useState(null);
  const [comicNotices, setComicNotices] = useState([]);
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [noticeType, setNoticeType] = useState("WARNING");
  const [noticeSeverity, setNoticeSeverity] = useState("WARN");
  const [noticeContent, setNoticeContent] = useState("");
  const [isAddingNotice, setIsAddingNotice] = useState(false);
  const [isAiSuggestingNotice, setIsAiSuggestingNotice] = useState(false);
  const [noticeCountMap, setNoticeCountMap] = useState({});

  // Danh sách tất cả thể loại
  const [allCategories, setAllCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  const getToken = () => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser).token : null;
  };

  // Tải danh mục thể loại
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/comic/categories`)
      .then((res) => res.json())
      .then((data) => {
        const items = data.data?.items || data.categories || [];
        setAllCategories(items);
      })
      .catch((err) => console.error("Lỗi lấy danh mục thể loại:", err));
  }, []);

  // Tự động tạo slug từ tên truyện
  const generateSlug = (str) => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/([^0-9a-z-\s])/g, "")
      .replace(/(\s+)/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormTitle(title);
    if (!isEditing) {
      setFormSlug(generateSlug(title));
    }
  };

  // Xử lý tải ảnh bìa từ máy tính
  const handleCoverFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormCoverBase64(reader.result);
      setCoverPreview(reader.result);
      setFormThumbUrl(""); // Ưu tiên ảnh tải lên
    };
    reader.readAsDataURL(file);
  };

  // Mở modal thêm truyện mới
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentEditSlug("");
    setFormTitle("");
    setFormSlug("");
    setFormAuthor("");
    setFormStatus("ONGOING");
    setFormAgeRating("ALL");
    setFormDescription("");
    setFormThumbUrl("");
    setFormCoverBase64("");
    setCoverPreview("");
    setSelectedGenres([]);
    setAiAgeSuggestion(null);
    setFormError("");
    setShowModal(true);
  };

  // Mở modal sửa truyện
  const handleOpenEditModal = async (item) => {
    setIsEditing(true);
    setCurrentEditSlug(item.slug);
    setFormTitle(item.name || item.title || "");
    setFormSlug(item.slug || "");
    setFormAuthor(Array.isArray(item.author) ? item.author.join(", ") : (item.author || ""));
    setFormStatus((item.status || "ONGOING").toUpperCase());
    setFormAgeRating(item.ageRating || item.age_rating || "ALL");
    setFormDescription(item.description || item.content || "");
    setFormThumbUrl(item.thumb_url || item.thumbUrl || "");
    setFormCoverBase64("");
    setCoverPreview(getComicThumbUrl(item.thumb_url || item.thumbUrl));
    setAiAgeSuggestion(null);
    setFormError("");

    // Trích xuất thể loại đã chọn
    let genres = [];
    if (Array.isArray(item.genres)) {
      genres = item.genres.map((g) => g.id || g.slug);
    } else if (Array.isArray(item.category)) {
      genres = item.category.map((c) => c.id || c.slug);
    }
    setSelectedGenres(genres);

    setShowModal(true);
  };

  // Gợi ý độ tuổi & cảnh báo bằng AI
  const handleAiSuggestAgeRating = async () => {
    if (!formTitle.trim() && !formDescription.trim()) {
      setFormError("Vui lòng nhập tên truyện hoặc mô tả trước khi nhờ AI phân tích!");
      return;
    }
    const token = getToken();
    setIsAiSuggestingAge(true);
    setFormError("");
    try {
      const genreNames = allCategories
        .filter((cat) => selectedGenres.includes(cat.id) || selectedGenres.includes(cat.slug))
        .map((cat) => cat.name);
      const res = await axios.post(
        `${API_BASE_URL}/api/ai/suggest-age-warning`,
        {
          title: formTitle,
          description: formDescription,
          genres: genreNames,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success && res.data.data) {
        const data = res.data.data;
        if (data.suggestedAgeRating) {
          setFormAgeRating(data.suggestedAgeRating);
        }
        setAiAgeSuggestion(data);
      }
    } catch (err) {
      setFormError(err.response?.data?.error || "Không thể gọi AI gợi ý độ tuổi lúc này.");
    } finally {
      setIsAiSuggestingAge(false);
    }
  };

  // Bật/tắt thể loại
  const toggleGenre = (genreId) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]
    );
  };

  // Lưu truyện (Thêm mới hoặc Cập nhật)
  const handleSubmitComic = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formTitle.trim()) {
      setFormError("Vui lòng nhập tên truyện!");
      return;
    }
    if (!formSlug.trim()) {
      setFormError("Vui lòng nhập slug cho truyện!");
      return;
    }

    const token = getToken();
    if (!token) {
      setFormError("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formTitle.trim(),
        name: formTitle.trim(),
        slug: formSlug.trim(),
        author: formAuthor.trim(),
        status: formStatus,
        ageRating: formAgeRating,
        description: formDescription.trim(),
        thumbUrl: formThumbUrl.trim(),
        coverBase64: formCoverBase64,
        genres: selectedGenres,
      };

      if (isEditing) {
        // Cập nhật truyện
        await axios.put(`${API_BASE_URL}/api/comic/comics/${currentEditSlug}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("🎉 Đã cập nhật truyện thành công!");
      } else {
        // Tạo truyện mới
        await axios.post(`${API_BASE_URL}/api/comic/comics`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("🎉 Đã đăng truyện mới thành công!");
      }

      setShowModal(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.error || err.response?.data?.message || "Lỗi khi lưu truyện.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xóa truyện
  const handleDeleteComic = async (comic) => {
    const confirmName = window.prompt(
      `⚠️ CẢNH BÁO: Bạn sắp xóa vĩnh viễn bộ truyện "${comic.name || comic.title}" và TOÀN BỘ các chương cùng trang ảnh liên quan!\n\nNhập đúng slug "${comic.slug}" để xác nhận xóa:`
    );

    if (confirmName !== comic.slug) {
      if (confirmName !== null) alert("Xác nhận không khớp. Hủy thao tác xóa.");
      return;
    }

    const token = getToken();
    if (!token) {
      alert("Vui lòng đăng nhập quyền admin!");
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/comic/comics/${comic.slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`Đã xóa vĩnh viễn truyện "${comic.name || comic.title}" thành công!`);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Lỗi khi xóa truyện.");
    }
  };

  // Mở modal quản lý Cảnh báo của truyện
  const handleOpenNoticeModal = async (comic) => {
    setNoticeModalComic(comic);
    setNoticeContent("");
    setNoticeType("WARNING");
    setNoticeSeverity("WARN");
    setNoticeLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/comic/comics/${comic.slug}/notices`);
      const list = res.data?.notices || [];
      setComicNotices(list);
      setNoticeCountMap((prev) => ({ ...prev, [comic.slug]: list.length }));
    } catch (err) {
      console.error("Lỗi tải cảnh báo truyện:", err);
      setComicNotices(comic.notices || []);
    } finally {
      setNoticeLoading(false);
    }
  };

  const handleAddComicNotice = async (e) => {
    e.preventDefault();
    if (!noticeModalComic || !noticeContent.trim()) return;
    const token = getToken();
    if (!token) return alert("Vui lòng đăng nhập quyền Admin!");
    setIsAddingNotice(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/comic/comics/${noticeModalComic.slug}/notices`,
        {
          type: noticeType,
          severity: noticeSeverity,
          content: noticeContent.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success && res.data?.notice) {
        const updated = [res.data.notice, ...comicNotices];
        setComicNotices(updated);
        setNoticeCountMap((prev) => ({ ...prev, [noticeModalComic.slug]: updated.length }));
        setNoticeContent("");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi thêm cảnh báo truyện.");
    } finally {
      setIsAddingNotice(false);
    }
  };

  const handleDeleteComicNotice = async (noticeId) => {
    const token = getToken();
    if (!token || !noticeModalComic) return;
    try {
      const res = await axios.delete(`${API_BASE_URL}/api/comic/notices/${noticeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        const updated = comicNotices.filter((n) => n.id !== noticeId);
        setComicNotices(updated);
        setNoticeCountMap((prev) => ({ ...prev, [noticeModalComic.slug]: updated.length }));
      }
    } catch (err) {
      alert("Lỗi khi xóa cảnh báo truyện.");
    }
  };

  const handleAiSuggestComicNotice = async () => {
    if (!noticeModalComic) return;
    const token = getToken();
    setIsAiSuggestingNotice(true);
    try {
      const genreNames = (noticeModalComic.category || noticeModalComic.genres || []).map(
        (g) => g.name || g
      );
      const res = await axios.post(
        `${API_BASE_URL}/api/ai/suggest-age-warning`,
        {
          title: noticeModalComic.name || noticeModalComic.title,
          description: noticeModalComic.description || noticeModalComic.content || "",
          genres: genreNames,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const firstWarn = res.data?.suggestedWarnings?.[0] || res.data?.data?.suggestedWarnings?.[0];
      if (firstWarn) {
        setNoticeType(firstWarn.type || "WARNING");
        setNoticeSeverity(firstWarn.severity || "WARN");
        setNoticeContent(firstWarn.content || "");
      }
    } catch (err) {
      alert("Không thể gọi AI gợi ý cảnh báo lúc này.");
    } finally {
      setIsAiSuggestingNotice(false);
    }
  };

  // Lọc truyện theo từ khóa tìm kiếm
  const filteredComics = comics.filter((item) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    const name = (item.name || item.title || "").toLowerCase();
    const slug = (item.slug || "").toLowerCase();
    return name.includes(term) || slug.includes(term);
  });

  return (
    <div>
      {activeComicSlug && (
        <ChaptersManager
          comicSlug={activeComicSlug}
          comicName={activeComicName}
          onBack={() => {
            setActiveComicSlug(null);
            setActiveComicName("");
          }}
        />
      )}

      {!activeComicSlug && (
        <>
          {/* Header & Công cụ quản lý */}
          <div className="bg-white rounded-3xl p-5 md:p-6 border border-emerald-100 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-emerald-950 flex items-center gap-2.5">
                <span className="w-3 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></span>
                Quản Trị Truyện Tự Đăng
              </h2>
              <p className="text-xs text-emerald-800/70 font-medium mt-1">
                Tự do đăng truyện, chỉnh sửa và tải ảnh đọc truyện trực tiếp lên máy chủ Cây Thế Giới.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleOpenAddModal}
                className="w-full md:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs md:text-sm hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>➕ Đăng Truyện Mới</span>
              </button>
            </div>
          </div>

          {/* Ô tìm kiếm nhanh trong trang */}
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="text-xs font-bold text-emerald-900">
              Tổng số: <span className="text-emerald-600 font-extrabold">{totalComics.toLocaleString()}</span> bộ truyện
            </div>
            <div className="w-full max-w-xs">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="🔍 Lọc truyện trên trang này..."
                className="w-full px-3.5 py-2 text-xs bg-white border border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-emerald-800/40"
              />
            </div>
          </div>

          {filteredComics.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-emerald-100 text-emerald-800/60 text-sm font-medium">
              Không tìm thấy truyện nào.
            </div>
          )}

          {/* Grid danh sách truyện */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredComics.map((item, idx) => {
              const thumb = getComicThumbUrl(item.thumb_url || item.thumbUrl);

              return (
                <div
                  key={item._id || item.slug || idx}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 text-black block overflow-hidden border border-emerald-100 hover:border-emerald-300 hover:-translate-y-1.5 relative flex flex-col justify-between"
                >
                  <div>
                    <div className="relative w-full aspect-[3/4] overflow-hidden bg-emerald-50/50">
                      <img
                        src={thumb}
                        alt={item?.name || item?.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default-cover.jpg";
                        }}
                        className="w-full h-full object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-500 border-b border-emerald-100/60"
                        loading="lazy"
                      />
                      <span
                        className={`absolute top-2 left-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-sm border ${
                          item.status?.toLowerCase() === "completed"
                            ? "bg-emerald-600 text-white border-emerald-500/20"
                            : "bg-teal-600 text-white border-teal-500/20"
                        }`}
                      >
                        {item.status?.toLowerCase() === "completed" ? "Đã Xong" : "Đang Ra"}
                      </span>
                      <div className="absolute top-2 right-2">
                        <AgeBadge ageRating={item.ageRating || item.age_rating || "ALL"} size="xs" />
                      </div>
                    </div>

                    <div className="p-3 flex flex-col gap-1">
                      <h3 className="text-xs md:text-sm font-black text-emerald-950 group-hover:text-emerald-600 line-clamp-2 min-h-[2.5em] leading-tight transition-colors">
                        {item.name || item.title}
                      </h3>
                      <p className="text-[10px] text-emerald-800/60 font-medium truncate">
                        Slug: {item.slug}
                      </p>
                      <p className="text-[10px] text-emerald-700 font-bold">
                        {item.chap || `${item.chapters?.length || 0} chương`}
                      </p>
                    </div>
                  </div>

                  {/* Nhóm nút hành động */}
                  <div className="p-2.5 pt-0 flex flex-col gap-1.5">
                    <button
                      onClick={() => {
                        setActiveComicSlug(item.slug);
                        setActiveComicName(item.name || item.title);
                      }}
                      className="w-full py-1.5 text-[11px] font-extrabold rounded-xl transition duration-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white border border-emerald-200 flex items-center justify-center gap-1 shadow-xs"
                    >
                      📖 Quản lý chương
                    </button>

                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => handleOpenNoticeModal(item)}
                        className="py-1 text-[10px] font-bold rounded-lg transition duration-200 bg-orange-50 text-orange-800 hover:bg-orange-500 hover:text-white border border-orange-200 flex items-center justify-center gap-0.5"
                        title="Quản lý cảnh báo & ghi chú của bộ truyện"
                      >
                        ⚠️ Cảnh báo
                        {(noticeCountMap[item.slug] ?? item.noticeCount ?? item.notices?.length ?? 0) > 0 && (
                          <span className="ml-0.5 px-1 rounded-full bg-rose-600 text-white text-[9px] font-black">
                            {noticeCountMap[item.slug] ?? item.noticeCount ?? item.notices?.length}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="py-1 text-[10px] font-bold rounded-lg transition duration-200 bg-amber-50 text-amber-800 hover:bg-amber-600 hover:text-white border border-amber-200 flex items-center justify-center gap-0.5"
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteComic(item)}
                        className="py-1 text-[10px] font-bold rounded-lg transition duration-200 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 flex items-center justify-center gap-0.5"
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
              <button
                className="px-3 py-1.5 rounded-xl border border-emerald-100 text-xs font-bold bg-white text-emerald-800 hover:bg-emerald-50 disabled:opacity-40 transition-colors"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                ←
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
                  .reduce((arr, p) => {
                    if (p === "..." && arr[arr.length - 1] === "...") return arr;
                    arr.push(p);
                    return arr;
                  }, [])
                  .map((p, idx) =>
                    p === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-emerald-800/40 text-xs font-bold">...</span>
                    ) : (
                      <button
                        key={`page-${p}`}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                          page === p
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-transparent shadow-sm shadow-emerald-500/10"
                            : "bg-white text-emerald-800 border-emerald-100 hover:bg-emerald-50"
                        }`}
                        onClick={() => goToPage(p)}
                      >
                        {p}
                      </button>
                    )
                  );
              })()}
              <button
                className="px-3 py-1.5 rounded-xl border border-emerald-100 text-xs font-bold bg-white text-emerald-800 hover:bg-emerald-50 disabled:opacity-40 transition-colors"
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
              >
                →
              </button>
            </div>
          )}
        </>
      )}

      {/* MODAL ĐĂNG / SỬA TRUYỆN */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-7 shadow-2xl border border-emerald-100 flex flex-col max-h-[92vh] my-auto">
            <div className="flex justify-between items-center border-b border-emerald-100 pb-3.5 mb-4 shrink-0">
              <h3 className="text-base md:text-lg font-black text-emerald-950 flex items-center gap-2">
                <span className="w-2.5 h-5 bg-emerald-500 rounded-full"></span>
                {isEditing ? `✏️ Chỉnh Sửa Truyện: ${formTitle}` : "➕ Đăng Truyện Mới Lên Máy Chủ"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitComic} className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs text-black custom-scrollbar">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl font-bold">
                  ⚠️ {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                    Tên truyện *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Võ Luyện Đỉnh Phong"
                    value={formTitle}
                    onChange={handleTitleChange}
                    className="w-full px-3 py-2 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                    Đường dẫn tĩnh (Slug) *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isEditing}
                    placeholder="vo-luyen-dinh-phong"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full px-3 py-2 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                    Tác giả
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Mạc Mặc"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full px-3 py-2 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                    Tình trạng
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="ONGOING">Đang tiến hành (Ongoing)</option>
                    <option value="COMPLETED">Đã hoàn thành (Completed)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-emerald-900">
                      Nhãn độ tuổi
                    </label>
                    <button
                      type="button"
                      disabled={isAiSuggestingAge}
                      onClick={handleAiSuggestAgeRating}
                      className="text-[10px] font-extrabold text-teal-700 hover:text-teal-900 flex items-center gap-1 disabled:opacity-50"
                      title="Dùng AI phân tích tên, mô tả & thể loại để gợi ý nhãn độ tuổi"
                    >
                      <LuSparkles className="w-3 h-3" />
                      {isAiSuggestingAge ? "Đang phân tích..." : "AI Gợi ý"}
                    </button>
                  </div>
                  <select
                    value={formAgeRating}
                    onChange={(e) => setFormAgeRating(e.target.value)}
                    className="w-full px-3 py-2 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-bold"
                  >
                    <option value="ALL">ALL - Mọi lứa tuổi</option>
                    <option value="13+">13+ - Thiếu niên</option>
                    <option value="16+">16+ - Trưởng thành</option>
                    <option value="18+">18+ - Nội dung nhạy cảm</option>
                  </select>
                </div>
              </div>

              {aiAgeSuggestion && (
                <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 text-[11px] space-y-1">
                  <div className="font-extrabold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <LuShieldAlert className="w-4 h-4 text-amber-600" />
                      Đề xuất từ AI Irminsul: Nhãn{" "}
                      <span className="px-1.5 py-0.5 rounded bg-amber-600 text-white font-black">
                        {aiAgeSuggestion.suggestedAgeRating}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setAiAgeSuggestion(null)}
                      className="text-amber-700 hover:text-amber-950"
                    >
                      <LuX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {aiAgeSuggestion.reason && (
                    <p className="text-amber-900 font-medium">{aiAgeSuggestion.reason}</p>
                  )}
                  {Array.isArray(aiAgeSuggestion.warnings) && aiAgeSuggestion.warnings.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {aiAgeSuggestion.warnings.map((w, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full bg-white border border-amber-200 text-[10px] font-bold text-amber-800"
                        >
                          ⚠️ {w}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tải ảnh bìa */}
              <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100 space-y-3">
                <label className="block text-[11px] font-bold text-emerald-900">
                  Ảnh bìa truyện (Tải lên hoặc nhập URL)
                </label>

                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="shrink-0 w-24 h-32 rounded-xl overflow-hidden border-2 border-emerald-200 bg-white flex items-center justify-center">
                    {coverPreview ? (
                      <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-gray-400 font-bold text-center p-1">Chưa có ảnh</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <div>
                      <span className="text-[10px] text-emerald-800/80 font-bold block mb-1">Tùy chọn 1: Tải từ máy tính</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverFileUpload}
                        className="w-full text-xs text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-emerald-800/80 font-bold block mb-1">Tùy chọn 2: Nhập đường dẫn ảnh</span>
                      <input
                        type="text"
                        placeholder="Ví dụ: /Images/comics/ten-truyen.jpg hoặc link https://"
                        value={formThumbUrl}
                        onChange={(e) => {
                          setFormThumbUrl(e.target.value);
                          setCoverPreview(getComicThumbUrl(e.target.value));
                        }}
                        className="w-full px-3 py-1.5 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Thể loại */}
              <div>
                <label className="block text-[11px] font-bold text-emerald-900 mb-1.5">
                  Thể loại truyện ({selectedGenres.length} đã chọn)
                </label>
                <div className="max-h-36 overflow-y-auto p-2.5 bg-emerald-50/30 rounded-2xl border border-emerald-100 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 custom-scrollbar">
                  {allCategories.map((cat) => {
                    const catId = cat.id || cat.slug;
                    const isChecked = selectedGenres.includes(catId) || selectedGenres.includes(cat.slug) || selectedGenres.includes(cat.id);

                    return (
                      <label
                        key={cat.id || cat.slug}
                        className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-[11px] font-semibold cursor-pointer transition-colors ${
                          isChecked
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-emerald-950 border-emerald-100 hover:bg-emerald-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleGenre(catId)}
                          className="hidden"
                        />
                        <span className="truncate">{cat.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                  Mô tả / Tóm tắt nội dung
                </label>
                <textarea
                  rows={4}
                  placeholder="Nhập tóm tắt truyện ở đây..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none custom-scrollbar"
                ></textarea>
              </div>

              {/* Nút lưu */}
              <div className="flex justify-end gap-2 pt-2 border-t border-emerald-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? "Đang lưu..." : isEditing ? "💾 Cập Nhật Truyện" : "🚀 Đăng Truyện Ngay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL QUẢN LÝ CẢNH BÁO TRUYỆN (COMIC NOTICE) */}
      {noticeModalComic && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-amber-200 flex flex-col max-h-[90vh] my-auto text-black">
            <div className="flex justify-between items-center border-b border-amber-100 pb-3.5 mb-4">
              <div>
                <h3 className="text-base md:text-lg font-black text-emerald-950 flex items-center gap-2">
                  <LuShieldAlert className="w-5 h-5 text-amber-600" />
                  Cảnh Báo & Ghi Chú Truyện
                </h3>
                <p className="text-xs text-emerald-700 font-bold mt-0.5 truncate">
                  📖 {noticeModalComic.name || noticeModalComic.title} ({noticeModalComic.slug})
                </p>
              </div>
              <button
                onClick={() => setNoticeModalComic(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* Form thêm cảnh báo mới */}
              <form
                onSubmit={handleAddComicNotice}
                className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-amber-950">
                    ➕ Gắn cảnh báo / thông báo mới lên trang truyện
                  </span>
                  <button
                    type="button"
                    disabled={isAiSuggestingNotice}
                    onClick={handleAiSuggestComicNotice}
                    className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold flex items-center gap-1 disabled:opacity-50"
                  >
                    <LuSparkles className="w-3.5 h-3.5" />
                    {isAiSuggestingNotice ? "AI đang soạn..." : "AI Tự Soạn Cảnh Báo"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">
                      Loại thông báo
                    </label>
                    <select
                      value={noticeType}
                      onChange={(e) => setNoticeType(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-amber-200 bg-white font-bold"
                    >
                      <option value="WARNING">⚠️ Cảnh báo nội dung (WARNING)</option>
                      <option value="SPOILER">🔒 Cảnh báo Spoiler (SPOILER)</option>
                      <option value="NOTE">📌 Ghi chú Ban Quản Trị (NOTE)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">
                      Mức độ hiển thị
                    </label>
                    <select
                      value={noticeSeverity}
                      onChange={(e) => setNoticeSeverity(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-amber-200 bg-white font-bold"
                    >
                      <option value="WARN">🟡 Cảnh báo vàng (WARN)</option>
                      <option value="DANGER">🔴 Nghiêm trọng đỏ (DANGER)</option>
                      <option value="INFO">🔵 Thông tin xanh (INFO)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">
                    Nội dung cảnh báo hiển thị cho độc giả *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={noticeContent}
                    onChange={(e) => setNoticeContent(e.target.value)}
                    placeholder="Ví dụ: Truyện có yếu tố bạo lực / 16+, độc giả cân nhắc trước khi đọc..."
                    className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isAddingNotice}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black transition disabled:opacity-50"
                  >
                    {isAddingNotice ? "Đang lưu..." : "🛡️ Gắn Cảnh Báo Ngay"}
                  </button>
                </div>
              </form>

              {/* Danh sách cảnh báo đang hoạt động của truyện */}
              <div className="space-y-2">
                <div className="font-extrabold text-emerald-950">
                  📋 Danh sách cảnh báo đang hiển thị ({comicNotices.length})
                </div>

                {noticeLoading ? (
                  <div className="py-6 text-center text-gray-400 font-semibold">
                    Đang tải cảnh báo...
                  </div>
                ) : comicNotices.length === 0 ? (
                  <div className="p-6 rounded-2xl border border-dashed border-gray-200 text-center text-gray-400 font-medium">
                    Bộ truyện này hiện chưa có cảnh báo nào.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {comicNotices.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-2xl border flex items-start justify-between gap-3 ${
                          n.severity === "DANGER"
                            ? "bg-rose-50 border-rose-200 text-rose-950"
                            : n.severity === "WARN"
                            ? "bg-amber-50 border-amber-200 text-amber-950"
                            : "bg-sky-50 border-sky-200 text-sky-950"
                        }`}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-white/80 border border-current/20 text-[10px] font-black uppercase">
                              {n.type} • {n.severity}
                            </span>
                          </div>
                          <p className="font-semibold text-xs leading-relaxed">{n.content}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteComicNotice(n.id)}
                          className="p-1.5 rounded-lg bg-white/80 hover:bg-rose-600 hover:text-white text-rose-600 transition shrink-0"
                          title="Xóa cảnh báo này"
                        >
                          <LuTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComicsManager;
