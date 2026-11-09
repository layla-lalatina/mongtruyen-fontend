import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../../config";
import AddChapterModal from "./AddChapterModal";
import ImageGridEditor from "./ImageGridEditor";
import {
  LuArrowLeft,
  LuBookOpen,
  LuPlus,
  LuEye,
  LuEyeOff,
  LuSettings,
  LuTrash2,
  LuGem,
  LuCrown,
  LuLockOpen,
} from "react-icons/lu";

const ChaptersManager = ({ comicSlug, comicName, onBack }) => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Quản lý form thêm chương
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChapterNumber, setNewChapterNumber] = useState("");
  const [newChapterName, setNewChapterName] = useState("");
  const [newChapterUnlockType, setNewChapterUnlockType] = useState("FREE");
  const [newChapterUnlockPrice, setNewChapterUnlockPrice] = useState(30);
  const [newChapterFreeAt, setNewChapterFreeAt] = useState("");
  const [newChapterUploadedImages, setNewChapterUploadedImages] = useState([]);
  const [isUploadingNewChapter, setIsUploadingNewChapter] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Quản lý biên tập ảnh chương
  const [editingChapter, setEditingChapter] = useState(null);
  const [chapterImages, setChapterImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isSavingImages, setIsSavingImages] = useState(false);

  // Lấy token đăng nhập
  const getHeaders = () => {
    const storedUser = localStorage.getItem("user");
    const token = storedUser ? JSON.parse(storedUser).token : null;
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchChapters = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/comic/comics/${comicSlug}/admin-chapters`,
        getHeaders()
      );
      if (res.data.success) {
        setChapters(res.data.chapters || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Không thể tải danh sách chương.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, [comicSlug]);

  const handleNewChapterImagesUpload = async (e) => {
    const rawFiles = Array.from(e.target?.files || e || []).filter((f) =>
      f.type ? f.type.startsWith("image/") : /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(f.name)
    );
    if (!rawFiles.length) return;

    const files = [...rawFiles].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
    );

    setIsUploadingNewChapter(true);
    setError("");
    setMessage("");
    try {
      const urls = [];
      for (const file of files) {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });

        const res = await axios.post(
          `${API_BASE_URL}/api/comic/upload-image`,
          { base64, filename: file.name },
          getHeaders()
        );

        if (res.data.success) {
          urls.push(`${API_BASE_URL}${res.data.url}`);
        }
      }
      setNewChapterUploadedImages((prev) => [...prev, ...urls]);
      setMessage(`Đã tải lên thành công thêm ${urls.length} ảnh cho chương mới! 🎉`);
    } catch (err) {
      console.error(err);
      setError("Lỗi khi tải ảnh chương lên.");
    } finally {
      setIsUploadingNewChapter(false);
      if (e?.target) e.target.value = "";
    }
  };

  const handleLocalFileUpload = async (e) => {
    const rawFiles = Array.from(e.target?.files || e || []).filter((f) =>
      f.type ? f.type.startsWith("image/") : /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(f.name)
    );
    if (!rawFiles.length) return;

    const files = [...rawFiles].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
    );

    setLoadingImages(true);
    setError("");
    setMessage("");

    try {
      const urls = [];
      for (const file of files) {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });

        const res = await axios.post(
          `${API_BASE_URL}/api/comic/upload-image`,
          { base64, filename: file.name },
          getHeaders()
        );

        if (res.data.success) {
          const imageUrl = `${API_BASE_URL}${res.data.url}`;
          urls.push(imageUrl);
        }
      }
      setChapterImages((prev) => [
        ...prev,
        ...urls.map((url) => ({ url, visible: true })),
      ]);
      setMessage(`Đã tải lên thêm ${urls.length} ảnh thành công! 🎉`);
    } catch (err) {
      console.error("Lỗi upload ảnh:", err);
      setError("Lỗi khi tải ảnh lên từ máy tính.");
    } finally {
      setLoadingImages(false);
      if (e?.target) e.target.value = "";
    }
  };

  // Thêm chương mới
  const handleAddChapter = async (e) => {
    e.preventDefault();
    if (!newChapterNumber) return alert("Vui lòng nhập số chương!");
    if (newChapterUploadedImages.length === 0) {
      return alert("Vui lòng chọn tải lên ít nhất 1 ảnh cho chương!");
    }

    setIsAdding(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/comic/comics/${comicSlug}/chapters`,
        {
          chapterNumber: newChapterNumber,
          name: newChapterName,
          images: newChapterUploadedImages,
          unlockType: newChapterUnlockType,
          unlockPrice: newChapterUnlockType === "CRYSTAL" ? Number(newChapterUnlockPrice || 30) : 0,
          freeAt: newChapterFreeAt || null,
        },
        getHeaders()
      );

      if (res.data.success) {
        setMessage(`Đã thêm chương ${newChapterNumber} thành công!`);
        setNewChapterNumber("");
        setNewChapterName("");
        setNewChapterUnlockType("FREE");
        setNewChapterUnlockPrice(30);
        setNewChapterFreeAt("");
        setNewChapterUploadedImages([]);
        setShowAddForm(false);
        fetchChapters();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Lỗi khi thêm chương.");
    } finally {
      setIsAdding(false);
    }
  };

  // Cập nhật nhanh chế độ khóa chương (FREE / CRYSTAL / VIP)
  const handleUpdateChapterLock = async (chapter, nextUnlockType) => {
    let nextPrice = chapter.unlockPrice || 30;
    if (nextUnlockType === "CRYSTAL") {
      const inputPrice = window.prompt(
        `Nhập số World Crystal để mở khóa Chương ${chapter.chapterNumber}:`,
        String(nextPrice > 0 ? nextPrice : 30)
      );
      if (inputPrice === null) return;
      nextPrice = Math.max(1, parseInt(inputPrice, 10) || 30);
    } else {
      nextPrice = 0;
    }

    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/comic/comics/${comicSlug}/chapters/${chapter.id}`,
        {
          unlockType: nextUnlockType,
          unlockPrice: nextPrice,
        },
        getHeaders()
      );
      if (res.data.success) {
        setChapters(
          chapters.map((c) =>
            c.id === chapter.id
              ? { ...c, unlockType: nextUnlockType, unlockPrice: nextPrice }
              : c
          )
        );
        setMessage(
          `Đã cập nhật Chương ${chapter.chapterNumber} sang chế độ ${
            nextUnlockType === "FREE"
              ? "Miễn phí"
              : nextUnlockType === "VIP"
              ? "Đặc quyền VIP"
              : `Khóa (${nextPrice} Linh Thạch)`
          }!`
        );
      }
    } catch (err) {
      console.error(err);
      alert("Không thể cập nhật chế độ khóa chương.");
    }
  };

  // Toggle trạng thái ẩn/hiện chương
  const handleToggleChapterStatus = async (chapter) => {
    const nextStatus = chapter.status === "active" ? "hidden" : "active";
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/comic/comics/${comicSlug}/chapters/${chapter.id}`,
        { status: nextStatus },
        getHeaders()
      );
      if (res.data.success) {
        setChapters(
          chapters.map((c) =>
            c.id === chapter.id ? { ...c, status: nextStatus } : c
          )
        );
      }
    } catch (err) {
      console.error(err);
      alert("Không thể cập nhật trạng thái chương.");
    }
  };

  // Xóa chương truyện
  const handleDeleteChapter = async (chapterId, chapterNum) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa Chương ${chapterNum}? Hành động này không thể hoàn tác!`
      )
    ) {
      return;
    }

    try {
      const res = await axios.delete(
        `${API_BASE_URL}/api/comic/comics/${comicSlug}/chapters/${chapterId}`,
        getHeaders()
      );
      if (res.data.success) {
        setMessage(`Đã xóa Chương ${chapterNum} thành công.`);
        setChapters(chapters.filter((c) => c.id !== chapterId));
        if (editingChapter?.id === chapterId) {
          setEditingChapter(null);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Không thể xóa chương.");
    }
  };

  // Mở trình quản lý ảnh chương
  const handleOpenImageEditor = async (chapter) => {
    setEditingChapter(chapter);
    setLoadingImages(true);
    setChapterImages([]);
    setError("");
    setMessage("");
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/comic/comics/${comicSlug}/admin-chapters/${chapter.id}`,
        getHeaders()
      );
      if (res.data.success) {
        setChapterImages(res.data.images || []);
      }
    } catch (err) {
      console.error(err);
      setError("Không thể tải ảnh của chương này.");
    } finally {
      setLoadingImages(false);
    }
  };

  // Toggle ẩn/hiện một trang ảnh
  const handleToggleImageVisibility = (idx) => {
    const updated = [...chapterImages];
    updated[idx] = { ...updated[idx], visible: !updated[idx].visible };
    setChapterImages(updated);
  };

  // Thêm một ảnh mới vào chương
  const handleAddImageToChapter = () => {
    if (!newImageUrl.trim()) return alert("Vui lòng nhập URL ảnh!");
    setChapterImages([
      ...chapterImages,
      { url: newImageUrl.trim(), visible: true },
    ]);
    setNewImageUrl("");
  };

  // Xóa ảnh khỏi chương
  const handleDeleteImage = (idx) => {
    setChapterImages(chapterImages.filter((_, i) => i !== idx));
  };

  // Thay đổi thứ tự ảnh (Move Up / Down)
  const handleMoveImage = (idx, direction) => {
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === chapterImages.length - 1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    const updated = [...chapterImages];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setChapterImages(updated);
  };

  // Lưu cấu hình ảnh chương
  const handleSaveChapterImages = async () => {
    setIsSavingImages(true);
    setError("");
    setMessage("");
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/comic/comics/${comicSlug}/chapters/${editingChapter.id}/images`,
        { images: chapterImages },
        getHeaders()
      );
      if (res.data.success) {
        setMessage(
          `Đã lưu thay đổi ảnh Chương ${editingChapter.chapterNumber} thành công!`
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi khi lưu danh sách ảnh chương.");
    } finally {
      setIsSavingImages(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-emerald-50 pb-4 mb-6">
        <div>
          <button
            onClick={onBack}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 mb-1 transition-colors"
          >
            <LuArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách truyện
          </button>
          <h2 className="text-xl font-bold text-emerald-955 flex items-center gap-2">
            <LuBookOpen className="w-5 h-5 text-emerald-600" /> Quản lý chương:{" "}
            <span className="text-emerald-700">{comicName}</span>
          </h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
        >
          {showAddForm ? (
            "Đóng Form"
          ) : (
            <>
              <LuPlus className="w-4 h-4" /> Thêm chương mới
            </>
          )}
        </button>
      </div>

      {/* Thông báo */}
      {message && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold shadow-inner">
          ✨ {message}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold shadow-inner">
          ⚠️ {error}
        </div>
      )}

      {/* Modal thêm chương mới */}
      <AddChapterModal
        showAddForm={showAddForm}
        setShowAddForm={setShowAddForm}
        handleAddChapter={handleAddChapter}
        newChapterNumber={newChapterNumber}
        setNewChapterNumber={setNewChapterNumber}
        newChapterName={newChapterName}
        setNewChapterName={setNewChapterName}
        newChapterUnlockType={newChapterUnlockType}
        setNewChapterUnlockType={setNewChapterUnlockType}
        newChapterUnlockPrice={newChapterUnlockPrice}
        setNewChapterUnlockPrice={setNewChapterUnlockPrice}
        newChapterFreeAt={newChapterFreeAt}
        setNewChapterFreeAt={setNewChapterFreeAt}
        handleNewChapterImagesUpload={handleNewChapterImagesUpload}
        isUploadingNewChapter={isUploadingNewChapter}
        newChapterUploadedImages={newChapterUploadedImages}
        setNewChapterUploadedImages={setNewChapterUploadedImages}
        isAdding={isAdding}
        error={error}
      />

      {/* Main Layout (Split list and image editor) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-black">
        {/* Cột trái: Danh sách chương */}
        <div
          className={`lg:col-span-6 ${
            editingChapter ? "lg:border-r lg:border-emerald-50 lg:pr-6" : "lg:col-span-12"
          }`}
        >
          <h3 className="font-extrabold text-sm text-emerald-950 mb-4 flex items-center gap-1.5">
            📋 Các chương đã lưu ({chapters.length})
          </h3>
          {loading ? (
            <div className="text-center py-10">
              <span className="inline-block animate-spin w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full" />
              <p className="text-xs text-emerald-850 mt-2">
                Đang quét thư viện...
              </p>
            </div>
          ) : chapters.length === 0 ? (
            <p className="text-emerald-850/60 text-xs italic text-center py-10 bg-emerald-50/10 rounded-2xl border border-dashed border-emerald-200">
              Không tìm thấy chương cục bộ nào.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-2">
              {chapters.map((ch) => (
                <div
                  key={ch.id}
                  className={`p-3 rounded-xl border transition-all flex justify-between items-center ${
                    editingChapter?.id === ch.id
                      ? "bg-emerald-50/50 border-emerald-400 shadow-sm"
                      : "bg-white border-emerald-105 hover:bg-emerald-50/20"
                  }`}
                >
                  <div className="min-w-0 flex-1 mr-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-emerald-950">
                        Chương {ch.chapterNumber}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          ch.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-105 text-gray-500"
                        }`}
                      >
                        {ch.status === "active" ? "Đang hiện" : "Đã ẩn"}
                      </span>
                      {ch.unlockType === "VIP" ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                          <LuCrown className="w-2.5 h-2.5" /> VIP
                        </span>
                      ) : ch.unlockType === "CRYSTAL" ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black bg-teal-100 text-teal-800 border border-teal-200">
                          <LuGem className="w-2.5 h-2.5" /> {ch.unlockPrice || 30} LT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-gray-100 text-gray-600">
                          <LuLockOpen className="w-2.5 h-2.5" /> Miễn phí
                        </span>
                      )}
                    </div>
                    {ch.name && (
                      <p className="text-xs text-gray-600 truncate mt-0.5">
                        {ch.name}
                      </p>
                    )}
                  </div>

                  {/* Nhóm nút chức năng */}
                  <div className="flex items-center gap-1.5">
                    <select
                      value={ch.unlockType || "FREE"}
                      onChange={(e) => handleUpdateChapterLock(ch, e.target.value)}
                      className="px-2 py-1 rounded-lg border border-emerald-200 bg-white text-[10px] font-bold text-emerald-900 focus:outline-none"
                      title="Đổi chế độ khóa chương"
                    >
                      <option value="FREE">🔓 Miễn phí</option>
                      <option value="CRYSTAL">💎 Linh Thạch</option>
                      <option value="VIP">👑 VIP</option>
                    </select>
                    <button
                      onClick={() => handleToggleChapterStatus(ch)}
                      className={`p-1.5 rounded-lg border text-xs hover:scale-105 transition-transform ${
                        ch.status === "active"
                          ? "bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          : "bg-white border-gray-200 text-gray-400 hover:bg-gray-50"
                      }`}
                      title={
                        ch.status === "active" ? "Ẩn chương" : "Hiện chương"
                      }
                    >
                      {ch.status === "active" ? <LuEye className="w-4 h-4" /> : <LuEyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleOpenImageEditor(ch)}
                      className="px-2 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-150 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <LuSettings className="w-3.5 h-3.5" /> Sửa ảnh
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteChapter(ch.id, ch.chapterNumber)
                      }
                      className="p-1.5 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white rounded-lg text-xs transition"
                      title="Xóa chương"
                    >
                      <LuTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cột phải: Biên tập ảnh của chương */}
        {editingChapter && (
          <ImageGridEditor
            editingChapter={editingChapter}
            setEditingChapter={setEditingChapter}
            loadingImages={loadingImages}
            chapterImages={chapterImages}
            newImageUrl={newImageUrl}
            setNewImageUrl={setNewImageUrl}
            handleAddImageToChapter={handleAddImageToChapter}
            handleLocalFileUpload={handleLocalFileUpload}
            handleToggleImageVisibility={handleToggleImageVisibility}
            handleMoveImage={handleMoveImage}
            handleDeleteImage={handleDeleteImage}
            handleSaveChapterImages={handleSaveChapterImages}
            isSavingImages={isSavingImages}
          />
        )}
      </div>
    </div>
  );
};

export default ChaptersManager;
