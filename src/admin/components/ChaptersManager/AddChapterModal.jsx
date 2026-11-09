import React from "react";
import { LuPlus, LuX, LuLock, LuGem, LuCrown, LuLockOpen, LuCalendarClock } from "react-icons/lu";

const AddChapterModal = ({
  showAddForm,
  setShowAddForm,
  handleAddChapter,
  newChapterNumber,
  setNewChapterNumber,
  newChapterName,
  setNewChapterName,
  newChapterUnlockType = "FREE",
  setNewChapterUnlockType,
  newChapterUnlockPrice = 30,
  setNewChapterUnlockPrice,
  newChapterFreeAt = "",
  setNewChapterFreeAt,
  handleNewChapterImagesUpload,
  isUploadingNewChapter,
  newChapterUploadedImages,
  setNewChapterUploadedImages,
  isAdding,
  error,
}) => {
  if (!showAddForm) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-emerald-100 animate-slide-in flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center border-b border-emerald-50 pb-3.5 mb-4 shrink-0">
          <h3 className="text-base font-extrabold text-emerald-950 flex items-center gap-1.5">
            <LuPlus className="w-5 h-5 text-emerald-600" /> Thêm Chương Truyện Mới
          </h3>
          <button
            onClick={() => setShowAddForm(false)}
            className="text-gray-400 hover:text-gray-600 font-bold text-lg p-1 rounded-lg hover:bg-gray-100"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleAddChapter}
          className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs text-black"
        >
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl font-bold">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                Số chương (Chapter ID) *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: 1 hoặc 12.5"
                value={newChapterNumber}
                onChange={(e) => setNewChapterNumber(e.target.value)}
                className="w-full px-3 py-2 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                Tên chương (Tùy chọn)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Khởi đầu mới"
                value={newChapterName}
                onChange={(e) => setNewChapterName(e.target.value)}
                className="w-full px-3 py-2 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Thiết lập Khóa Chương / VIP */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
            <label className="block text-[11px] font-extrabold text-emerald-950 flex items-center gap-1.5">
              <LuLock className="w-3.5 h-3.5 text-emerald-600" /> Chế độ Mở Khóa Chương (VIP / Linh Thạch)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "FREE", label: "Miễn phí", icon: LuLockOpen },
                { id: "CRYSTAL", label: "Khóa Linh Thạch", icon: LuGem },
                { id: "VIP", label: "Đặc quyền VIP", icon: LuCrown },
              ].map((opt) => {
                const Icon = opt.icon;
                const active = newChapterUnlockType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setNewChapterUnlockType && setNewChapterUnlockType(opt.id)}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition ${
                      active
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-white text-emerald-900 border-emerald-100 hover:bg-emerald-50"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {newChapterUnlockType !== "FREE" && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                {newChapterUnlockType === "CRYSTAL" && (
                  <div>
                    <label className="block text-[10px] font-bold text-emerald-900 mb-1">
                      Giá mở khóa (World Crystal)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5000"
                      value={newChapterUnlockPrice}
                      onChange={(e) =>
                        setNewChapterUnlockPrice && setNewChapterUnlockPrice(Number(e.target.value))
                      }
                      className="w-full px-3 py-1.5 border border-emerald-200 rounded-xl bg-white text-xs font-bold"
                    />
                  </div>
                )}
                <div className={newChapterUnlockType === "VIP" ? "col-span-2" : ""}>
                  <label className="block text-[10px] font-bold text-emerald-900 mb-1 flex items-center gap-1">
                    <LuCalendarClock className="w-3 h-3 text-emerald-600" /> Tự động mở miễn phí lúc (Tùy chọn)
                  </label>
                  <input
                    type="datetime-local"
                    value={newChapterFreeAt}
                    onChange={(e) => setNewChapterFreeAt && setNewChapterFreeAt(e.target.value)}
                    className="w-full px-3 py-1.5 border border-emerald-200 rounded-xl bg-white text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-emerald-900 mb-1.5">
              Tải ảnh chương lên từ máy tính (Chọn nhiều ảnh hoặc cả thư mục) *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-dashed border-emerald-300 rounded-xl text-xs font-bold cursor-pointer transition">
                🖼️ Chọn Nhiều Ảnh (Ctrl+A)
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleNewChapterImagesUpload}
                  className="hidden"
                />
              </label>
              <label className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-dashed border-teal-300 rounded-xl text-xs font-bold cursor-pointer transition">
                📁 Chọn Cả Thư Mục (1 Click)
                <input
                  type="file"
                  webkitdirectory=""
                  directory=""
                  multiple
                  onChange={handleNewChapterImagesUpload}
                  className="hidden"
                />
              </label>
            </div>
            {isUploadingNewChapter && (
              <p className="text-[10px] text-emerald-600 mt-1.5 animate-pulse font-semibold">
                🔄 Đang tải ảnh lên bí cảnh... vui lòng chờ...
              </p>
            )}
          </div>

          {newChapterUploadedImages.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] font-bold text-emerald-900">
                  Danh sách ảnh chương ({newChapterUploadedImages.length} ảnh)
                </label>
                <button
                  type="button"
                  onClick={() => setNewChapterUploadedImages([])}
                  className="text-[10px] text-red-500 hover:underline font-bold"
                >
                  Xóa tất cả ảnh
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 border border-emerald-100 rounded-xl p-2.5 max-h-48 overflow-y-auto bg-emerald-50/5">
                {newChapterUploadedImages.map((url, i) => (
                  <div
                    key={i}
                    className="relative aspect-[3/4] rounded-lg border border-emerald-100 overflow-hidden shadow-sm bg-white"
                  >
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1 left-1 bg-black/60 text-white text-[8px] font-bold px-1 rounded">
                      {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-emerald-50 shrink-0">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-200 text-gray-600 font-bold rounded-xl text-xs hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isAdding || isUploadingNewChapter}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition disabled:opacity-40"
            >
              {isAdding ? "Đang lưu..." : "Thêm chương"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChapterModal;
