import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import { getComicThumbUrl } from "../../utils/imageHelpers";
import TranslatorAiAssistant from "./TranslatorAiAssistant";
import AgeBadge from "../Common/AgeBadge";
import { LuSparkles, LuLock, LuGem, LuCrown, LuLockOpen, LuCalendarClock, LuShieldAlert } from "react-icons/lu";

const TranslatorDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState("stats");
  const [stats, setStats] = useState({ totalComics: 0, totalChapters: 0, totalViews: 0, totalFollowers: 0 });
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Form Đăng Truyện Mới
  const [newComic, setNewComic] = useState({
    name: "",
    slug: "",
    author: "",
    description: "",
    categories: "[]",
    status: "ongoing",
    ageRating: "ALL",
  });
  const [coverBase64, setCoverBase64] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [isAiSuggestingAge, setIsAiSuggestingAge] = useState(false);
  const [aiAgeSuggestion, setAiAgeSuggestion] = useState(null);

  // Form Thêm Chương Mới
  const [selectedComicSlug, setSelectedComicSlug] = useState("");
  const [newChapter, setNewChapter] = useState({
    chapterNumber: "",
    name: "",
    notes: "",
    unlockType: "FREE",
    unlockPrice: 30,
    freeAt: "",
  });
  const [chapterImages, setChapterImages] = useState([]); // [{ name, base64, preview }]

  // Tab Phân Tích Ý Kiến Độc Giả
  const [analysisSelectedComicSlug, setAnalysisSelectedComicSlug] = useState("");

  // Drawer Chọn Truyện Bên Phải (Ảnh 1)
  const [isComicDrawerOpen, setIsComicDrawerOpen] = useState(false);
  const [drawerTarget, setDrawerTarget] = useState("chapter"); // 'chapter' | 'analysis'
  const [comicSearchKeyword, setComicSearchKeyword] = useState("");
  const [comicSortBy, setComicSortBy] = useState("updated"); // 'updated', 'views', 'chapters', 'name'

  // Bảng Tương Tác Duyệt Tóm Tắt & Tiêu Đề AI
  const [isAnalyzingChapter, setIsAnalyzingChapter] = useState(false);
  const [showAiReviewModal, setShowAiReviewModal] = useState(false);
  const [isDraggingChapterImages, setIsDraggingChapterImages] = useState(false);
  const [aiReviewData, setAiReviewData] = useState({
    suggestedTitle: "",
    summaryText: "",
    storyProgression: "",
    keyPlotPoints: [],
    characterActions: [],
    spoilersDetected: [],
    mainCharacter: "",
    supportingCharacters: [],
    powerType: "",
    powerDescription: "",
    isEarlyChapter: false,
    modelUsed: "",
  });
  const [newPlotPointInput, setNewPlotPointInput] = useState("");
  const [newSupportingCharInput, setNewSupportingCharInput] = useState("");

  const formatComicDate = (dateVal) => {
    if (!dateVal) return "Mới cập nhật";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "Mới cập nhật";
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredComics = comics
    .filter((c) => {
      if (!comicSearchKeyword.trim()) return true;
      const q = comicSearchKeyword.toLowerCase();
      const title = (c.name || c.title || "").toLowerCase();
      const slug = (c.slug || "").toLowerCase();
      const author = (c.author || "").toLowerCase();
      return title.includes(q) || slug.includes(q) || author.includes(q);
    })
    .sort((a, b) => {
      if (comicSortBy === "views") {
        return Number(b.totalViews || b.views || 0) - Number(a.totalViews || a.views || 0);
      }
      if (comicSortBy === "chapters") {
        return Number(b.totalChapters || 0) - Number(a.totalChapters || 0);
      }
      if (comicSortBy === "name") {
        return (a.name || a.title || "").localeCompare(b.name || b.title || "");
      }
      const dateA = new Date(a.updatedAt || a.updated_at || a.folderUpdatedAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.updated_at || b.folderUpdatedAt || 0).getTime();
      return dateB - dateA;
    });

  const currentSelectedComic = comics.find((c) => c.slug === selectedComicSlug);

  useEffect(() => {
    if (!user?.token) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/comic/translator/stats`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Lỗi tải thống kê dịch giả:", err);
    }
  };

  const fetchMyComics = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/comic/translator/my-comics`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.data.success) {
        const list = res.data.comics || [];
        setComics(list);
        if (list.length > 0) {
          if (!selectedComicSlug) setSelectedComicSlug(list[0].slug);
          if (!analysisSelectedComicSlug) setAnalysisSelectedComicSlug(list[0].slug);
        }
      }
    } catch (err) {
      console.error("Lỗi tải truyện dịch giả:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.token) return;
    fetchStats();
    fetchMyComics();
  }, [user]);

  // Xử lý chọn ảnh bìa từ máy
  const handleCoverFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCoverBase64(reader.result);
      setCoverPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAiSuggestComicAge = async () => {
    if (!newComic.name.trim() && !newComic.description.trim()) {
      return setError("Vui lòng nhập Tên truyện hoặc Mô tả trước khi nhờ AI gợi ý nhãn độ tuổi!");
    }
    try {
      setIsAiSuggestingAge(true);
      setError("");
      const res = await axios.post(
        `${API_BASE_URL}/api/ai/suggest-age-warning`,
        {
          title: newComic.name,
          description: newComic.description,
          genres: [],
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      if (res.data.success && res.data.data) {
        const data = res.data.data;
        if (data.suggestedAgeRating) {
          setNewComic((prev) => ({ ...prev, ageRating: data.suggestedAgeRating }));
        }
        setAiAgeSuggestion(data);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Không thể gọi AI gợi ý độ tuổi lúc này.");
    } finally {
      setIsAiSuggestingAge(false);
    }
  };

  // Xử lý tạo truyện mới
  const handleCreateComic = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!newComic.name.trim() || !newComic.slug.trim()) {
      return setError("Vui lòng điền Tên truyện và Slug!");
    }
    if (!coverBase64) {
      return setError("Vui lòng chọn 1 file ảnh bìa từ máy tính!");
    }

    try {
      setSubmitting(true);
      const res = await axios.post(
        `${API_BASE_URL}/api/comic/translator/create-comic`,
        {
          ...newComic,
          coverBase64,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (res.data.success) {
        setMessage("✨ Đã tạo truyện mới thành công! Ảnh bìa đã được lưu vào thư mục truyện.");
        setNewComic({
          name: "",
          slug: "",
          author: "",
          description: "",
          categories: "[]",
          status: "ongoing",
          ageRating: "ALL",
        });
        setAiAgeSuggestion(null);
        setCoverBase64("");
        setCoverPreview("");
        fetchMyComics();
        fetchStats();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Lỗi khi tạo truyện mới");
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý nạp hàng loạt ảnh chương cùng 1 lúc (hỗ trợ Chọn nhiều ảnh, Chọn cả thư mục chương, và Kéo & Thả)
  const processSelectedFilesList = (rawFiles) => {
    const files = Array.from(rawFiles || []).filter(
      (f) => f && (f.type?.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|avif|bmp)$/i.test(f.name || ""))
    );
    if (files.length === 0) return;

    files.sort((a, b) => {
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
    });

    const filePromises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            name: file.name,
            base64: reader.result,
            preview: reader.result,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then((loadedImages) => {
      setChapterImages((prev) => [...prev, ...loadedImages]);
    });
  };

  const handleMultipleChapterFiles = (e) => {
    processSelectedFilesList(e.target.files);
    // Reset value để dịch giả có thể mở chọn thêm lần nữa từ cùng thư mục nếu muốn
    e.target.value = "";
  };

  const handleDropChapterFiles = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingChapterImages(false);
    if (e.dataTransfer?.files?.length) {
      processSelectedFilesList(e.dataTransfer.files);
    }
  };

  const removeChapterImage = (index) => {
    setChapterImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const moveChapterImage = (index, direction) => {
    setChapterImages((prev) => {
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return next;
    });
  };

  // Hàm gọi AI 100% phân tích Tóm tắt & Diễn biến câu chuyện trong chương
  const runAiChapterSummaryAnalysis = async () => {
    // Lấy tối đa 3 trang ảnh đại diện (Đầu - Giữa - Cuối) gửi kèm cho AI quan sát
    const sampleImages = [];
    if (chapterImages.length > 0) {
      sampleImages.push(chapterImages[0]?.base64);
      if (chapterImages.length > 2) {
        sampleImages.push(chapterImages[Math.floor(chapterImages.length / 2)]?.base64);
      }
      if (chapterImages.length > 1) {
        sampleImages.push(chapterImages[chapterImages.length - 1]?.base64);
      }
    }

    const res = await axios.post(
      `${API_BASE_URL}/api/ai/chapter-summary`,
      {
        comicSlug: selectedComicSlug,
        chapterNumber: newChapter.chapterNumber,
        chapterTitle: newChapter.name,
        notes: newChapter.notes,
        sampleImages: sampleImages.filter(Boolean).slice(0, 3),
      },
      { headers: { Authorization: `Bearer ${user?.token}` } }
    );

    const aiData = res.data?.data || {};
    const isEarly = aiData.isEarlyChapter || parseFloat(newChapter.chapterNumber) <= 2;
    setAiReviewData({
      suggestedTitle:
        aiData.suggestedTitle || (newChapter.name ? newChapter.name : `Chương ${newChapter.chapterNumber}`),
      summaryText:
        aiData.summaryText || `Chương ${newChapter.chapterNumber} của bộ truyện ${currentSelectedComic?.name || ""}.`,
      storyProgression:
        aiData.storyProgression ||
        aiData.summaryText ||
        `Mở đầu chương ${newChapter.chapterNumber}, câu chuyện tiếp nối hành trình của nhân vật chính với những diễn biến đầy cảm xúc.`,
      keyPlotPoints:
        Array.isArray(aiData.keyPlotPoints) && aiData.keyPlotPoints.length > 0
          ? aiData.keyPlotPoints
          : ["Diễn biến mới của cốt truyện"],
      characterActions: Array.isArray(aiData.characterActions) ? aiData.characterActions : [],
      spoilersDetected: Array.isArray(aiData.spoilersDetected) ? aiData.spoilersDetected : [],
      mainCharacter: aiData.mainCharacter || "Chưa xác định",
      supportingCharacters: Array.isArray(aiData.supportingCharacters) ? aiData.supportingCharacters : [],
      powerType: aiData.powerType || "Chưa xác định",
      powerDescription: aiData.powerDescription || "",
      isEarlyChapter: isEarly,
      modelUsed: res.data?.modelUsed || "Gemini / Gemma Brain",
    });
  };

  // BƯỚC 1: Dịch giả bấm Đăng Chương -> Gọi AI phân tích & tóm tắt 100% rồi mở BẢNG TƯƠNG TÁC
  const handleStartChapterPublish = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setMessage("");
    setError("");

    if (!selectedComicSlug || !newChapter.chapterNumber.trim()) {
      return setError("Vui lòng chọn bộ truyện và nhập số chương!");
    }
    if (chapterImages.length === 0) {
      return setError("Vui lòng chọn ít nhất 1 file ảnh trang truyện từ máy tính!");
    }

    try {
      setIsAnalyzingChapter(true);
      await runAiChapterSummaryAnalysis();
      setShowAiReviewModal(true);
    } catch (err) {
      console.warn("AI Chapter Summary error fallback:", err);
      const isEarly = parseFloat(newChapter.chapterNumber) <= 2;
      setAiReviewData({
        suggestedTitle: newChapter.name || `Chương ${newChapter.chapterNumber}`,
        summaryText: newChapter.notes || `Chương ${newChapter.chapterNumber} tiếp tục diễn biến câu chuyện.`,
        storyProgression:
          newChapter.notes ||
          `Chương ${newChapter.chapterNumber} mở ra tình tiết mới và đẩy mạch cảm xúc của nhân vật chính lên cao trào.`,
        keyPlotPoints: ["Tình tiết mới trong chương"],
        characterActions: [],
        spoilersDetected: [],
        mainCharacter: "Nhân vật chính",
        supportingCharacters: [],
        powerType: "Chưa xác định",
        powerDescription: "",
        isEarlyChapter: isEarly,
        modelUsed: "AI Fallback",
      });
      setShowAiReviewModal(true);
    } finally {
      setIsAnalyzingChapter(false);
    }
  };

  // BƯỚC 2: Dịch giả kiểm tra xong trên Bảng Tương Tác và bấm "Xác Nhận & Đăng Chương Ngay"
  const handleConfirmPublishChapter = async () => {
    try {
      setSubmitting(true);
      setError("");

      const finalTitle = aiReviewData.suggestedTitle.trim() || newChapter.name.trim() || `Chương ${newChapter.chapterNumber}`;

      const payload = {
        comicSlug: selectedComicSlug,
        chapterNumber: newChapter.chapterNumber,
        chapterName: finalTitle,
        name: finalTitle,
        unlockType: newChapter.unlockType || "FREE",
        unlockPrice: newChapter.unlockType === "CRYSTAL" ? Number(newChapter.unlockPrice || 30) : 0,
        freeAt: newChapter.freeAt || null,
        imagesBase64: chapterImages.map((img) => img.base64),
        aiSummary: aiReviewData,
      };

      const res = await axios.post(
        `${API_BASE_URL}/api/comic/translator/create-chapter`,
        payload,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (res.data.success) {
        setShowAiReviewModal(false);
        setMessage(
          `✨ Đã đăng thành công Chương ${newChapter.chapterNumber}: "${finalTitle}"! Tất cả ${chapterImages.length} trang ảnh và bản tóm tắt AI đã được lưu vào hệ thống.`
        );
        setNewChapter({
          chapterNumber: "",
          name: "",
          notes: "",
          unlockType: "FREE",
          unlockPrice: 30,
          freeAt: "",
        });
        setChapterImages([]);
        fetchStats();
        fetchMyComics();
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Lỗi khi đăng chương mới");
    } finally {
      setSubmitting(false);
    }
  };

  // Mở Drawer chọn truyện với ngữ cảnh cụ thể
  const handleOpenDrawer = (target) => {
    setDrawerTarget(target);
    setIsComicDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f3fbf8] text-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-emerald-950 flex items-center gap-2">
              <span>✍️</span> Khu Vực Dịch Giả
            </h1>
            <p className="text-xs text-emerald-700 font-semibold mt-1">
              Đăng truyện, xuất bản chương mới với AI Review và lắng nghe phản hồi độc giả.
            </p>
          </div>
        </div>

        {/* Navigation Tabs (CÙNG CẤP) */}
        <div className="flex flex-wrap gap-2 border-b border-emerald-100 pb-2">
          {[
            { id: "stats", label: "📊 Thống kê Dịch Giả" },
            { id: "comics", label: "📚 Truyện của tôi & Đăng mới" },
            { id: "chapters", label: "📖 Đăng chương mới từ máy" },
            { id: "comment_analysis", label: "💬 Phân Tích Ý Kiến Độc Giả" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMessage("");
                setError("");
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-white/80 text-emerald-900 hover:bg-emerald-50 border border-emerald-100"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Thông báo Message / Error */}
        {message && (
          <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-2xl animate-fade-in flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage("")} className="text-emerald-600 hover:text-emerald-900 font-bold px-2">✕</button>
          </div>
        )}
        {error && (
          <div className="p-4 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-2xl animate-fade-in flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError("")} className="text-rose-500 hover:text-rose-800 font-bold px-2">✕</button>
          </div>
        )}

        {/* TAB 1: THỐNG KÊ */}
        {activeTab === "stats" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-emerald-100 shadow-sm">
              <span className="text-2xl block mb-2">📚</span>
              <div className="text-2xl font-black text-emerald-950">{stats.totalComics}</div>
              <div className="text-xs text-gray-500 font-bold mt-1">Tổng bộ truyện</div>
            </div>
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-emerald-100 shadow-sm">
              <span className="text-2xl block mb-2">📖</span>
              <div className="text-2xl font-black text-emerald-950">{stats.totalChapters}</div>
              <div className="text-xs text-gray-500 font-bold mt-1">Tổng chương đã đăng</div>
            </div>
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-emerald-100 shadow-sm">
              <span className="text-2xl block mb-2">👁️</span>
              <div className="text-2xl font-black text-emerald-950">{stats.totalViews.toLocaleString()}</div>
              <div className="text-xs text-gray-500 font-bold mt-1">Tổng lượt xem truyện</div>
            </div>
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-emerald-100 shadow-sm">
              <span className="text-2xl block mb-2">💖</span>
              <div className="text-2xl font-black text-emerald-950">{stats.totalFollowers}</div>
              <div className="text-xs text-gray-500 font-bold mt-1">Lượt theo dõi</div>
            </div>
          </div>
        )}

        {/* TAB 2: TRUYỆN CỦA TÔI & ĐĂNG TRUYỆN MỚI */}
        {activeTab === "comics" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            <div className="lg:col-span-5 bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-emerald-950 flex items-center gap-2">
                <span>➕</span> Đăng Bộ Truyện Mới
              </h3>
              <form onSubmit={handleCreateComic} className="space-y-3.5 text-xs font-semibold">
                <div>
                  <label className="block text-gray-700 mb-1">Tên bộ truyện *</label>
                  <input
                    type="text"
                    value={newComic.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[đĐ]/g, "d")
                        .replace(/[^a-z0-9\s-]/g, "")
                        .trim()
                        .replace(/\s+/g, "-");
                      setNewComic({ ...newComic, name, slug });
                    }}
                    placeholder="VD: Cây Thế Giới Thức Tỉnh"
                    className="w-full px-3 py-2 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-300 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Slug (Đường dẫn tĩnh) *</label>
                  <input
                    type="text"
                    value={newComic.slug}
                    onChange={(e) => setNewComic({ ...newComic, slug: e.target.value })}
                    placeholder="cay-the-gioi-thuc-tinh"
                    className="w-full px-3 py-2 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-300 outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 mb-1">Tác giả</label>
                    <input
                      type="text"
                      value={newComic.author}
                      onChange={(e) => setNewComic({ ...newComic, author: e.target.value })}
                      placeholder="VD: Genshin Studio"
                      className="w-full px-3 py-2 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-300 outline-none"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-gray-700">Nhãn độ tuổi</label>
                      <button
                        type="button"
                        disabled={isAiSuggestingAge}
                        onClick={handleAiSuggestComicAge}
                        className="text-[10px] font-extrabold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                      >
                        <LuSparkles className="w-3 h-3" />
                        {isAiSuggestingAge ? "Đang gợi ý..." : "AI Gợi ý"}
                      </button>
                    </div>
                    <select
                      value={newComic.ageRating || "ALL"}
                      onChange={(e) => setNewComic({ ...newComic, ageRating: e.target.value })}
                      className="w-full px-3 py-2 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-300 outline-none bg-white font-bold"
                    >
                      <option value="ALL">ALL - Mọi lứa tuổi</option>
                      <option value="13+">13+ - Thiếu niên</option>
                      <option value="16+">16+ - Trưởng thành</option>
                      <option value="18+">18+ - Nội dung nhạy cảm</option>
                    </select>
                  </div>
                </div>
                {aiAgeSuggestion && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-[11px] space-y-1">
                    <div className="font-extrabold flex items-center gap-1">
                      <LuShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      AI gợi ý nhãn <span className="px-1.5 py-0.5 rounded bg-amber-600 text-white">{aiAgeSuggestion.suggestedAgeRating}</span>
                    </div>
                    {aiAgeSuggestion.reason && <p className="text-amber-900">{aiAgeSuggestion.reason}</p>}
                  </div>
                )}
                <div>
                  <label className="block text-gray-700 mb-1">Mô tả tóm tắt</label>
                  <textarea
                    rows="3"
                    value={newComic.description}
                    onChange={(e) => setNewComic({ ...newComic, description: e.target.value })}
                    placeholder="Nội dung cốt truyện..."
                    className="w-full px-3 py-2 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Chọn ảnh bìa từ máy *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFileChange}
                    className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                  />
                  {coverPreview && (
                    <div className="mt-2 flex items-center gap-3 p-2 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <img src={coverPreview} alt="Preview" className="w-12 h-16 object-cover rounded-lg shadow-xs" />
                      <span className="text-[11px] text-emerald-800 font-bold">✓ Ảnh bìa đã chọn thành công</span>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-2xl transition shadow-md shadow-emerald-600/10 text-xs"
                >
                  {submitting ? "Đang xử lý..." : "✨ Tạo Bộ Truyện Mới"}
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-emerald-100 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-emerald-950 flex items-center gap-2">
                  <span>📚</span> Danh Sách Truyện Của Bạn ({comics.length})
                </h3>
              </div>
              {comics.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                  <span className="text-3xl mb-2">📭</span>
                  <p className="text-xs">Bạn chưa đăng bộ truyện nào. Hãy tạo bộ truyện đầu tiên ở form bên cạnh!</p>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1 custom-scrollbar">
                  {comics.map((c) => (
                    <div
                      key={c.slug}
                      className="p-3.5 bg-emerald-50/40 rounded-2xl border border-emerald-100/80 flex items-center justify-between gap-3 hover:border-emerald-300 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={getComicThumbUrl(c.thumb_url || c.thumbUrl)}
                          alt={c.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/default-cover.jpg";
                          }}
                          className="w-12 h-16 object-cover rounded-xl shadow-xs border border-emerald-150 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-xs text-emerald-950 truncate">{c.name}</h4>
                          <p className="text-[11px] text-gray-500 truncate mt-0.5">Slug: {c.slug}</p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold mt-1">
                            <span className="bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded-md">
                              📖 {c.soChuong || `${c.totalChapters || 0} chương`}
                            </span>
                            <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md">
                              👁️ {(c.totalViews || c.views || 0).toLocaleString()} views
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedComicSlug(c.slug);
                          setActiveTab("chapters");
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 transition"
                      >
                        + Đăng Chương
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ĐĂNG CHƯƠNG MỚI TỪ MÁY (KÈM AI REVIEW & INTERACTIVE MODAL) */}
        {activeTab === "chapters" && (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-emerald-100 shadow-sm max-w-3xl mx-auto space-y-5 animate-fade-in">
            <div>
              <h3 className="text-base font-extrabold text-emerald-950 flex items-center gap-2">
                <span>📖</span> Đăng Chương Mới Cho Truyện (Chọn Ảnh Từ Máy)
              </h3>
              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                Hệ thống tự động chạy phân tích AI, gợi ý tiêu đề & tóm tắt rồi mở bảng tương tác cho bạn kiểm tra trước khi đăng.
              </p>
            </div>

            <form onSubmit={handleStartChapterPublish} className="space-y-4 text-xs font-semibold">
              {/* Mục chọn truyện có nút bấm mở Drawer bên phải (Ảnh 1) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-emerald-950 font-extrabold text-xs">
                    Bộ truyện đăng chương *
                  </label>
                  <button
                    type="button"
                    onClick={() => handleOpenDrawer("chapter")}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <span>🔍</span> Mở danh sách chọn ({comics.length} truyện)
                  </button>
                </div>

                {currentSelectedComic ? (
                  <div
                    onClick={() => handleOpenDrawer("chapter")}
                    className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200/80 flex items-center justify-between gap-3 shadow-2xs hover:border-emerald-400 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={getComicThumbUrl(currentSelectedComic.thumb_url || currentSelectedComic.thumbUrl)}
                        alt={currentSelectedComic.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default-cover.jpg";
                        }}
                        className="w-12 h-16 object-cover rounded-xl shadow-xs border border-emerald-200 shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0">
                        <div className="font-extrabold text-xs sm:text-sm text-emerald-950 truncate group-hover:text-emerald-600 transition-colors">
                          {currentSelectedComic.name}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-gray-500 flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200/60">
                            📖 {currentSelectedComic.soChuong || `${currentSelectedComic.totalChapters || 0} chương`}
                          </span>
                          <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                            👁️ {(currentSelectedComic.totalViews || currentSelectedComic.views || 0).toLocaleString()} views
                          </span>
                          <span className="text-gray-500">
                            🕒 Cập nhật: {formatComicDate(currentSelectedComic.updatedAt || currentSelectedComic.updated_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDrawer("chapter");
                      }}
                      className="shrink-0 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1 active:scale-95"
                    >
                      <span>🔄</span>
                      <span className="hidden sm:inline">Đổi truyện</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenDrawer("chapter")}
                    className="w-full p-4 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl bg-emerald-50/30 hover:bg-emerald-50/70 text-emerald-800 transition flex items-center justify-between font-bold text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xl">📚</span>
                      <span>Bấm vào đây để chọn bộ truyện muốn đăng chương... ({comics.length} bộ truyện)</span>
                    </span>
                    <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs shadow-xs font-bold">
                      Chọn truyện 👉
                    </span>
                  </button>
                )}
              </div>

              {/* Số chương & Tên chương */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-gray-700 mb-1 font-bold">Số chương * (VD: 1, 2, 10.5)</label>
                  <input
                    type="text"
                    value={newChapter.chapterNumber}
                    onChange={(e) => setNewChapter({ ...newChapter, chapterNumber: e.target.value })}
                    placeholder="VD: 1"
                    className="w-full px-3 py-2.5 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-300 outline-none bg-white font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1 font-bold">Tên/Tiêu đề dự kiến (không bắt buộc)</label>
                  <input
                    type="text"
                    value={newChapter.name}
                    onChange={(e) => setNewChapter({ ...newChapter, name: e.target.value })}
                    placeholder="VD: Khởi đầu mới (hoặc để AI gợi ý)"
                    className="w-full px-3 py-2.5 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-300 outline-none bg-white font-medium"
                  />
                </div>
              </div>

              {/* Ghi chú / bối cảnh cho AI */}
              <div>
                <label className="block text-gray-700 mb-1 font-bold flex items-center justify-between">
                  <span>Ghi chú nội dung / Bối cảnh chương (Cho AI phân tích chuẩn xác hơn):</span>
                  <span className="text-[10px] text-gray-400 font-normal">Không bắt buộc</span>
                </label>
                <textarea
                  rows="2"
                  value={newChapter.notes}
                  onChange={(e) => setNewChapter({ ...newChapter, notes: e.target.value })}
                  placeholder="Ví dụ: Nhân vật chính thức tỉnh kỹ năng mới, giải cứu bạn học khỏi ma vật trong rừng..."
                  className="w-full px-3 py-2 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-300 outline-none bg-white font-medium text-xs"
                />
              </div>

              {/* Thiết lập Khóa Chương / VIP */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                <label className="block text-emerald-950 font-extrabold text-xs flex items-center gap-1.5">
                  <LuLock className="w-4 h-4 text-emerald-600" /> Chế Độ Mở Khóa Chương (VIP / Linh Thạch)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "FREE", label: "Miễn phí", icon: LuLockOpen },
                    { id: "CRYSTAL", label: "Khóa Linh Thạch", icon: LuGem },
                    { id: "VIP", label: "Đặc quyền VIP", icon: LuCrown },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const active = (newChapter.unlockType || "FREE") === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setNewChapter({ ...newChapter, unlockType: opt.id })}
                        className={`py-2 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
                          active
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>

                {newChapter.unlockType && newChapter.unlockType !== "FREE" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {newChapter.unlockType === "CRYSTAL" && (
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-950 mb-1">
                          Giá mở khóa (World Crystal)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="5000"
                          value={newChapter.unlockPrice ?? 30}
                          onChange={(e) =>
                            setNewChapter({ ...newChapter, unlockPrice: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 border border-emerald-200 rounded-xl bg-white text-xs font-bold"
                        />
                      </div>
                    )}
                    <div className={newChapter.unlockType === "VIP" ? "sm:col-span-2" : ""}>
                      <label className="block text-[11px] font-bold text-emerald-950 mb-1 flex items-center gap-1">
                        <LuCalendarClock className="w-3.5 h-3.5 text-emerald-600" /> Tự động mở miễn phí lúc (Tùy chọn)
                      </label>
                      <input
                        type="datetime-local"
                        value={newChapter.freeAt || ""}
                        onChange={(e) => setNewChapter({ ...newChapter, freeAt: e.target.value })}
                        className="w-full px-3 py-2 border border-emerald-200 rounded-xl bg-white text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Nút chọn NHIỀU trang ảnh cùng 1 lúc / Chọn cả thư mục chương / Kéo thả */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isDraggingChapterImages) setIsDraggingChapterImages(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingChapterImages(false);
                }}
                onDrop={handleDropChapterFiles}
                className={`p-4 rounded-2xl border-2 transition-all space-y-3 ${
                  isDraggingChapterImages
                    ? "bg-emerald-100/80 border-emerald-500 border-dashed scale-[1.01]"
                    : "bg-emerald-50/60 border-emerald-200"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-emerald-950 font-extrabold text-sm">
                    📂 Tải Lên Trang Ảnh Chương (Hỗ trợ chọn 1 lần nhiều ảnh hoặc cả thư mục) *
                  </label>
                  {chapterImages.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setChapterImages((prev) =>
                            [...prev].sort((a, b) =>
                              a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
                            )
                          )
                        }
                        className="text-emerald-700 hover:underline text-[11px] font-bold"
                      >
                        🔢 Tự xếp theo tên file (1➔N)
                      </button>
                      <button
                        type="button"
                        onClick={() => setChapterImages([])}
                        className="text-rose-600 hover:underline text-[11px] font-bold"
                      >
                        🗑️ Xóa tất cả ({chapterImages.length} trang)
                      </button>
                    </div>
                  )}
                </div>

                {/* 2 nút chọn nhanh: Chọn nhiều ảnh 1 lần HOẶC Chọn nguyên cả thư mục chương */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-white hover:bg-emerald-50 border-2 border-dashed border-emerald-300 hover:border-emerald-500 cursor-pointer transition shadow-2xs text-center">
                    <span className="text-xl mb-1">🖼️</span>
                    <span className="text-xs font-extrabold text-emerald-900">
                      Chọn Nhiều Ảnh Cùng Lúc
                    </span>
                    <span className="text-[10px] text-gray-500 mt-0.5">
                      Bấm <b>Ctrl + A</b> hoặc giữ <b>Ctrl / Shift</b> quét chọn hàng loạt ảnh 1 lần
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleMultipleChapterFiles}
                      className="hidden"
                    />
                  </label>

                  <label className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-white hover:bg-teal-50 border-2 border-dashed border-teal-300 hover:border-teal-500 cursor-pointer transition shadow-2xs text-center">
                    <span className="text-xl mb-1">📁</span>
                    <span className="text-xs font-extrabold text-teal-900">
                      Chọn Cả Thư Mục Chương (1 Click)
                    </span>
                    <span className="text-[10px] text-gray-500 mt-0.5">
                      Chọn thẳng folder chương trên máy để tự nạp sạch 100% ảnh bên trong
                    </span>
                    <input
                      type="file"
                      multiple
                      webkitdirectory=""
                      directory=""
                      onChange={handleMultipleChapterFiles}
                      className="hidden"
                    />
                  </label>
                </div>

                <p className="text-[11px] text-gray-500 text-center">
                  💡 *Bạn cũng có thể <b>kéo & thả (Drag & Drop)</b> toàn bộ file ảnh từ máy tính vào khung này. Hệ thống tự động đánh số trang `1, 2, 3...` theo tên file.*
                </p>

                {/* Preview lưới ảnh đã chọn */}
                {chapterImages.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-extrabold text-emerald-900 flex items-center justify-between">
                      <span>📷 Bản xem trước danh sách trang đọc ({chapterImages.length} trang):</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        Có thể bấm chọn thêm ảnh hoặc đổi thứ tự ◄ ►
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-64 overflow-y-auto p-2 bg-white rounded-xl border border-emerald-100 custom-scrollbar">
                      {chapterImages.map((img, idx) => (
                        <div key={idx} className="relative group bg-gray-50 rounded-lg p-1 border text-center flex flex-col items-center">
                          <img src={img.preview} alt={`Page ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                          <span className="text-[10px] font-bold text-emerald-800 mt-1">Trang {idx + 1}</span>
                          <span className="text-[9px] text-gray-400 truncate max-w-full">{img.name}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveChapterImage(idx, "up")}
                              className="px-1 py-0.2 text-[9px] bg-white border rounded disabled:opacity-30 hover:bg-emerald-50"
                              title="Chuyển lên trước"
                            >
                              ◄
                            </button>
                            <button
                              type="button"
                              disabled={idx === chapterImages.length - 1}
                              onClick={() => moveChapterImage(idx, "down")}
                              className="px-1 py-0.2 text-[9px] bg-white border rounded disabled:opacity-30 hover:bg-emerald-50"
                              title="Chuyển ra sau"
                            >
                              ►
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeChapterImage(idx)}
                            className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold opacity-80 hover:opacity-100 shadow-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Nút Phân Tích & Mở Bảng Tương Tác */}
              <button
                type="submit"
                disabled={isAnalyzingChapter || submitting || chapterImages.length === 0}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-2xl transition shadow-md shadow-emerald-600/20 text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isAnalyzingChapter ? (
                  <>
                    <span className="animate-spin text-sm">🌿</span>
                    Đang chạy Bộ não AI phân tích tóm tắt & diễn biến câu chuyện...
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    Phân Tích AI 100% & Xem Bảng Tương Tác Trước Khi Đăng ({chapterImages.length} trang)
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: PHÂN TÍCH Ý KIẾN ĐỘC GIẢ (NGANG CẤP) */}
        {activeTab === "comment_analysis" && (
          <TranslatorAiAssistant
            comics={comics}
            user={user}
            selectedComicSlug={analysisSelectedComicSlug || selectedComicSlug}
            setSelectedComicSlug={setAnalysisSelectedComicSlug}
            onOpenComicDrawer={() => handleOpenDrawer("analysis")}
          />
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* BẢNG TƯƠNG TÁC (INTERACTIVE MODAL): XEM LẠI TÓM TẮT & DIỄN BIẾN CÂU CHUYỆN AI */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showAiReviewModal && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => !submitting && setShowAiReviewModal(false)}
          />

          {/* Modal Panel */}
          <div className="relative bg-white dark:bg-[#0c221c] w-full max-w-2xl rounded-3xl shadow-2xl border border-emerald-200 dark:border-emerald-800 p-5 sm:p-6 text-gray-800 dark:text-emerald-50 space-y-4.5 my-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Header Modal */}
            <div className="flex items-start justify-between border-b border-emerald-100 dark:border-emerald-800/60 pb-3 gap-2">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[10px] font-black uppercase mb-1">
                  <span>✨</span> Bảng Kiểm Duyệt AI 100% {aiReviewData.modelUsed ? `• ${aiReviewData.modelUsed}` : ""}
                </div>
                <h3 className="text-base sm:text-lg font-black text-emerald-950 dark:text-emerald-100">
                  Xem Lại Tiêu Đề, Tóm Tắt & Diễn Biến Câu Chuyện Trong Chương
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Bộ truyện: <b className="text-emerald-700 dark:text-emerald-300">{currentSelectedComic?.name}</b> • Chương <b>{newChapter.chapterNumber}</b> • {chapterImages.length} trang ảnh
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  disabled={isAnalyzingChapter || submitting}
                  onClick={async () => {
                    try {
                      setIsAnalyzingChapter(true);
                      await runAiChapterSummaryAnalysis();
                    } finally {
                      setIsAnalyzingChapter(false);
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-extrabold transition cursor-pointer"
                  title="Gọi lại AI phân tích chương 100%"
                >
                  {isAnalyzingChapter ? "⏳ Đang phân tích..." : "🔄 AI Phân Tích Lại"}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowAiReviewModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-emerald-900/60 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Nội dung tương tác */}
            <div className="space-y-4 text-xs font-semibold">
              {/* 1. Tiêu đề chương đề xuất (có thể sửa) */}
              <div>
                <label className="block text-emerald-950 dark:text-emerald-200 font-extrabold mb-1 flex items-center justify-between">
                  <span>🎯 1. Tiêu đề chương (AI gợi ý - Dịch giả có thể sửa lại):</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Chỉnh sửa trực tiếp ✏️</span>
                </label>
                <input
                  type="text"
                  value={aiReviewData.suggestedTitle}
                  onChange={(e) => setAiReviewData({ ...aiReviewData, suggestedTitle: e.target.value })}
                  placeholder="Nhập tiêu đề chương..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/40 font-bold text-emerald-950 dark:text-white outline-none focus:ring-2 focus:ring-emerald-400 text-xs sm:text-sm"
                />
              </div>

              {/* 2. Tóm tắt nội dung chương (có thể sửa) */}
              <div>
                <label className="block text-emerald-950 dark:text-emerald-200 font-extrabold mb-1 flex items-center justify-between">
                  <span>📝 2. Tóm tắt khái quát nội dung chương (AI Smart Recap):</span>
                  <span className="text-[10px] text-gray-400 font-normal">
                    {aiReviewData.summaryText?.length || 0} ký tự
                  </span>
                </label>
                <textarea
                  rows="2"
                  value={aiReviewData.summaryText}
                  onChange={(e) => setAiReviewData({ ...aiReviewData, summaryText: e.target.value })}
                  placeholder="Nội dung tóm tắt khái quát chương..."
                  className="w-full p-3 rounded-xl border border-emerald-200 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/40 font-medium text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-emerald-400 leading-relaxed text-xs"
                />
              </div>

              {/* 3. MỤC MỚI: DIỄN BIẾN CÂU CHUYỆN TRONG CHƯƠNG (AI CHẠY 100%) */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-50/80 via-emerald-50/60 to-white dark:from-emerald-950/60 dark:to-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-2">
                <label className="block text-teal-950 dark:text-teal-200 font-extrabold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>🎬</span>
                    <span>3. Diễn biến câu chuyện trong chương (AI Phân Tích 100%):</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-600 text-white font-bold">
                    Mở đầu ➔ Cao trào ➔ Kết chương
                  </span>
                </label>
                <p className="text-[11px] text-teal-800 dark:text-teal-300 font-medium">
                  AI phân tích chi tiết mạch diễn biến và cảm xúc nhân vật trong chương này để lưu vào CSDL hỗ trợ độc giả & Nahida AI giải đáp sâu sắc hơn.
                </p>
                <textarea
                  rows="4"
                  value={aiReviewData.storyProgression || ""}
                  onChange={(e) => setAiReviewData({ ...aiReviewData, storyProgression: e.target.value })}
                  placeholder="Diễn biến chi tiết câu chuyện từ mở đầu chương, cao trào cảm xúc đến kết thúc chương..."
                  className="w-full p-3 rounded-xl border border-teal-200 dark:border-teal-700 bg-white dark:bg-emerald-950/60 font-medium text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-teal-400 leading-relaxed text-xs"
                />
              </div>

              {/* 3. Hồ Sơ Nhân Vật & Loại Sức Mạnh Bộ Truyện (Đặc biệt với Chương 1-2) */}
              <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/80 dark:border-emerald-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-extrabold text-emerald-950 dark:text-emerald-100 text-xs">
                    <span>🌟</span> Hồ Sơ Nhân Vật & Hệ Thống Sức Mạnh Bộ Truyện
                  </div>
                  {aiReviewData.isEarlyChapter ? (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-2xs">
                      🌱 Chương mở đầu (1-2)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                      📖 Cập nhật / Bổ sung
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                  {aiReviewData.isEarlyChapter
                    ? "AI tự động phân tích tên nhân vật chính, nhân vật phụ và loại sức mạnh khởi đầu của truyện. Bạn có thể kiểm tra và chỉnh sửa trước khi lưu vào hồ sơ bộ truyện."
                    : "Hệ thống kế thừa hồ sơ truyện từ các chương trước. Bạn có thể bổ sung thêm nhân vật phụ mới hoặc cập nhật cơ chế sức mạnh mới thức tỉnh."}
                </p>

                {/* Hàng 1: Nhân vật chính & Loại sức mạnh */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-emerald-900 dark:text-emerald-200 mb-1">
                      👑 Tên Nhân Vật Chính (Main Character):
                    </label>
                    <input
                      type="text"
                      value={aiReviewData.mainCharacter}
                      onChange={(e) => setAiReviewData({ ...aiReviewData, mainCharacter: e.target.value })}
                      placeholder="VD: Tiêu Viêm, Ren, Yuzaki Nasa..."
                      className="w-full px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-emerald-950/60 font-bold text-emerald-950 dark:text-white outline-none focus:ring-1 focus:ring-emerald-400 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-emerald-900 dark:text-emerald-200 mb-1">
                      ⚡ Loại Sức Mạnh Bộ Truyện (Power System):
                    </label>
                    <input
                      type="text"
                      value={aiReviewData.powerType}
                      onChange={(e) => setAiReviewData({ ...aiReviewData, powerType: e.target.value })}
                      placeholder="VD: Tu Tiên, Hệ Thống RPG, Phép Thuật, Độc Dược..."
                      className="w-full px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-emerald-950/60 font-bold text-emerald-950 dark:text-white outline-none focus:ring-1 focus:ring-emerald-400 text-xs"
                    />
                  </div>
                </div>

                {/* Các thẻ chọn nhanh Loại Sức Mạnh */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Chọn nhanh:</span>
                  {[
                    "🗡️ Tu Tiên / Tu Chân",
                    "🎮 Hệ Thống / Game RPG",
                    "🔮 Phép Thuật Isekai",
                    "🧪 Độc Dược & Giả Kim",
                    "⚡ Dị Năng Đô Thị",
                    "🌸 Đời Thường / Trí Tuệ",
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setAiReviewData({ ...aiReviewData, powerType: tag })}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-white dark:bg-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-800 border border-emerald-200/80 text-emerald-800 dark:text-emerald-200 transition"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Mô tả cơ chế sức mạnh */}
                <div>
                  <label className="block text-[11px] font-extrabold text-emerald-900 dark:text-emerald-200 mb-1">
                    📖 Mô Tả Cơ Chế Sức Mạnh / Nguồn Gốc Năng Lực:
                  </label>
                  <textarea
                    rows="2"
                    value={aiReviewData.powerDescription}
                    onChange={(e) => setAiReviewData({ ...aiReviewData, powerDescription: e.target.value })}
                    placeholder="Tóm tắt ngắn về cấp bậc tu luyện, cách thức kích hoạt kỹ năng, hoặc hệ thống đặc thù..."
                    className="w-full p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-emerald-950/60 text-xs text-gray-800 dark:text-gray-100 outline-none focus:ring-1 focus:ring-emerald-400 leading-relaxed font-medium"
                  />
                </div>

                {/* Nhân vật phụ */}
                <div>
                  <label className="block text-[11px] font-extrabold text-emerald-900 dark:text-emerald-200 mb-1 flex items-center justify-between">
                    <span>👥 Tên Các Nhân Vật Phụ Xuất Hiện:</span>
                    <span className="text-[10px] text-gray-400 font-normal">
                      {aiReviewData.supportingCharacters?.length || 0} nhân vật
                    </span>
                  </label>

                  {/* Danh sách tag nhân vật phụ */}
                  <div className="flex flex-wrap gap-1.5 mb-2 min-h-7 p-1.5 bg-white dark:bg-emerald-950/60 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60">
                    {aiReviewData.supportingCharacters?.length === 0 ? (
                      <span className="text-[11px] text-gray-400 italic p-1">Chưa có nhân vật phụ nào được thêm</span>
                    ) : (
                      aiReviewData.supportingCharacters.map((name, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 border border-indigo-200/70 text-[11px] font-bold"
                        >
                          <span>👤 {name}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setAiReviewData({
                                ...aiReviewData,
                                supportingCharacters: aiReviewData.supportingCharacters.filter((_, i) => i !== idx),
                              })
                            }
                            className="text-rose-500 hover:text-rose-700 font-black text-xs px-0.5"
                            title="Xóa"
                          >
                            ✕
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Input thêm nhân vật phụ mới */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSupportingCharInput}
                      onChange={(e) => setNewSupportingCharInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newSupportingCharInput.trim()) {
                          e.preventDefault();
                          const val = newSupportingCharInput.trim();
                          if (!aiReviewData.supportingCharacters?.includes(val)) {
                            setAiReviewData({
                              ...aiReviewData,
                              supportingCharacters: [...(aiReviewData.supportingCharacters || []), val],
                            });
                          }
                          setNewSupportingCharInput("");
                        }
                      }}
                      placeholder="Nhập tên nhân vật phụ mới xuất hiện rồi bấm Thêm..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-emerald-700 bg-white dark:bg-emerald-950/60 outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newSupportingCharInput.trim()) {
                          const val = newSupportingCharInput.trim();
                          if (!aiReviewData.supportingCharacters?.includes(val)) {
                            setAiReviewData({
                              ...aiReviewData,
                              supportingCharacters: [...(aiReviewData.supportingCharacters || []), val],
                            });
                          }
                          setNewSupportingCharInput("");
                        }
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 transition"
                    >
                      + Thêm Nhân Vật
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Diễn biến quan trọng (Plot Points) */}
              <div>
                <label className="block text-emerald-950 dark:text-emerald-200 font-extrabold mb-1">
                  ⚡ Diễn biến chính (Plot Points):
                </label>
                <div className="space-y-1.5 p-3 bg-gray-50 dark:bg-emerald-950/30 rounded-xl border border-gray-200 dark:border-emerald-800/50">
                  {aiReviewData.keyPlotPoints?.map((point, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 bg-white dark:bg-emerald-900/40 p-2 rounded-lg border border-gray-100 dark:border-emerald-800 text-[11px]">
                      <span className="text-gray-700 dark:text-emerald-100 flex-1">{point}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAiReviewData({
                            ...aiReviewData,
                            keyPlotPoints: aiReviewData.keyPlotPoints.filter((_, i) => i !== idx),
                          });
                        }}
                        className="text-rose-500 hover:text-rose-700 px-1.5 py-0.5 rounded font-bold text-xs"
                        title="Xóa diễn biến này"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* Thêm điểm diễn biến mới */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newPlotPointInput}
                      onChange={(e) => setNewPlotPointInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newPlotPointInput.trim()) {
                          e.preventDefault();
                          setAiReviewData({
                            ...aiReviewData,
                            keyPlotPoints: [...(aiReviewData.keyPlotPoints || []), newPlotPointInput.trim()],
                          });
                          setNewPlotPointInput("");
                        }
                      }}
                      placeholder="Thêm diễn biến chính mới rồi bấm Thêm..."
                      className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-emerald-700 bg-white dark:bg-emerald-950/60 outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newPlotPointInput.trim()) {
                          setAiReviewData({
                            ...aiReviewData,
                            keyPlotPoints: [...(aiReviewData.keyPlotPoints || []), newPlotPointInput.trim()],
                          });
                          setNewPlotPointInput("");
                        }
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shrink-0"
                    >
                      + Thêm
                    </button>
                  </div>
                </div>
              </div>

              {/* 5. Hành động nhân vật (nếu có) */}
              {aiReviewData.characterActions?.length > 0 && (
                <div>
                  <label className="block text-emerald-950 dark:text-emerald-200 font-extrabold mb-1">
                    ⚔️ Hành động nhân vật ghi nhận trong chương:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {aiReviewData.characterActions.map((action, i) => (
                      <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200/60 font-medium">
                        • {action}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Thông báo sẵn sàng đăng */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                <span>📁 Chuẩn bị tải lên <b>{chapterImages.length} file ảnh</b> vào thư mục chương server.</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300">Sẵn sàng xuất bản ✔️</span>
              </div>
            </div>

            {/* Footer Modal với 2 nút hành động */}
            <div className="pt-3 border-t border-emerald-100 dark:border-emerald-800/60 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowAiReviewModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold transition"
              >
                Quay lại chỉnh sửa ảnh/form
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmPublishChapter}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin text-sm">⏳</span>
                    Đang lưu chương & ảnh lên server...
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    Xác Nhận & Đăng Chương Ngay
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* DRAWER BÊN PHẢI CHỌN TRUYỆN (THAM KHẢO ẢNH 1) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isComicDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[140] transition-opacity animate-fade-in"
            onClick={() => setIsComicDrawerOpen(false)}
          />

          {/* Slide-over Drawer Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[500px] md:w-[580px] bg-white dark:bg-[#0c221c] z-[150] shadow-2xl flex flex-col animate-slide-left border-l border-emerald-150 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-50">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-emerald-100 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/40 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                    <span>📚</span> {drawerTarget === "analysis" ? "Chọn Bộ Truyện Phân Tích Ý Kiến Độc Giả" : "Chọn Bộ Truyện Đăng Chương"}
                  </h3>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                    {drawerTarget === "analysis"
                      ? "Chọn bộ truyện cần quét bình luận và phân tích cảm xúc"
                      : "Tìm kiếm và chọn truyện cần thêm chương mới"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsComicDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-white dark:bg-emerald-900/60 hover:bg-gray-100 text-gray-500 dark:text-gray-300 flex items-center justify-center font-bold text-sm shadow-xs transition"
                  title="Đóng"
                >
                  ✕
                </button>
              </div>

              {/* Thanh tìm kiếm tên truyện */}
              <div className="relative flex items-center mb-2.5">
                <span className="absolute left-3.5 text-gray-400 text-sm pointer-events-none">🔍</span>
                <input
                  type="text"
                  value={comicSearchKeyword}
                  onChange={(e) => setComicSearchKeyword(e.target.value)}
                  placeholder="Nhập tên truyện, tác giả hoặc slug cần tìm..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 outline-none text-xs sm:text-sm bg-white dark:bg-emerald-950/60 font-medium focus:ring-1 focus:ring-emerald-400 shadow-inner text-black dark:text-white"
                  autoFocus
                />
                {comicSearchKeyword && (
                  <button
                    type="button"
                    onClick={() => setComicSearchKeyword("")}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 text-xs font-bold p-1"
                    title="Xóa từ khóa"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Thanh lọc sắp xếp nhanh */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] custom-scrollbar">
                <span className="text-[10px] font-extrabold uppercase text-emerald-800 dark:text-emerald-400 shrink-0">
                  Sắp xếp:
                </span>
                {[
                  { id: "updated", label: "🕒 Mới cập nhật" },
                  { id: "views", label: "👁️ Lượt xem cao" },
                  { id: "chapters", label: "📖 Nhiều chương" },
                  { id: "name", label: "🔤 Tên A-Z" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setComicSortBy(opt.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 border ${
                      comicSortBy === opt.id
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                        : "bg-white dark:bg-emerald-950/60 border-emerald-150 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Drawer Body: Danh sách truyện */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-2.5">
              {filteredComics.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <span className="text-3xl block mb-2">🔍</span>
                  <p className="text-xs font-semibold">
                    Không tìm thấy truyện nào khớp với từ khóa "{comicSearchKeyword}"
                  </p>
                </div>
              ) : (
                filteredComics.map((comic) => {
                  const targetSlug = drawerTarget === "analysis" ? analysisSelectedComicSlug : selectedComicSlug;
                  const isSelected = targetSlug === comic.slug;
                  return (
                    <div
                      key={comic.slug}
                      onClick={() => {
                        if (drawerTarget === "analysis") {
                          setAnalysisSelectedComicSlug(comic.slug);
                        } else {
                          setSelectedComicSlug(comic.slug);
                        }
                        setIsComicDrawerOpen(false);
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 group ${
                        isSelected
                          ? "bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 shadow-md ring-2 ring-emerald-400/30"
                          : "bg-white dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-800/40 hover:border-emerald-300 hover:bg-emerald-50/40 shadow-xs hover:shadow-sm"
                      }`}
                    >
                      <img
                        src={getComicThumbUrl(comic.thumb_url || comic.thumbUrl)}
                        alt={comic.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default-cover.jpg";
                        }}
                        className="w-14 h-20 object-cover rounded-xl shadow-xs border border-emerald-150 shrink-0 group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4 className="font-extrabold text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 truncate group-hover:text-emerald-600 transition-colors">
                            {comic.name}
                          </h4>
                          {isSelected && (
                            <span className="shrink-0 text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                              ✓ Đang chọn
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mb-1.5">
                          Tác giả: <span className="font-medium text-gray-700 dark:text-gray-300">{comic.author || "Đang cập nhật"}</span>
                        </p>

                        {/* Badges thông tin: Thời gian cập nhật, số chapter, số view */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className="font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200/50">
                            📖 {comic.soChuong || `${comic.totalChapters || 0} chương`}
                          </span>
                          <span className="font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/50">
                            👁️ {(comic.totalViews || comic.views || 0).toLocaleString()} views
                          </span>
                          <span className="font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                            🕒 {formatComicDate(comic.updatedAt || comic.updated_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-emerald-100 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/20 flex items-center justify-between text-xs font-semibold text-gray-500">
              <span>Hiển thị {filteredComics.length}/{comics.length} bộ truyện</span>
              <button
                type="button"
                onClick={() => setIsComicDrawerOpen(false)}
                className="px-4 py-1.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TranslatorDashboard;
