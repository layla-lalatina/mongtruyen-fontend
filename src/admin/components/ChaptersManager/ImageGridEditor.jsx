import React from "react";

const ImageGridEditor = ({
  editingChapter,
  setEditingChapter,
  loadingImages,
  chapterImages,
  newImageUrl,
  setNewImageUrl,
  handleAddImageToChapter,
  handleLocalFileUpload,
  handleToggleImageVisibility,
  handleMoveImage,
  handleDeleteImage,
  handleSaveChapterImages,
  isSavingImages,
}) => {
  return (
    <div className="lg:col-span-6 space-y-4 text-black">
      <div className="border-b border-emerald-50 pb-2 flex justify-between items-center">
        <h3 className="font-extrabold text-sm text-emerald-950 flex items-center gap-1">
          ⚙️ Sửa ảnh:{" "}
          <span className="text-indigo-700">
            Chương {editingChapter.chapterNumber}
          </span>
        </h3>
        <button
          onClick={() => setEditingChapter(null)}
          className="text-xs font-bold text-gray-400 hover:text-gray-600"
        >
          Đóng ✕
        </button>
      </div>

      {loadingImages ? (
        <div className="text-center py-10">
          <span className="inline-block animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
          <p className="text-xs text-gray-500 mt-2">Đang tải ảnh chương...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Form chèn ảnh nhanh & Tải ảnh từ máy */}
          <div className="p-3 border border-indigo-100 rounded-xl bg-indigo-50/10 flex flex-col gap-2.5">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Dán URL ảnh mới vào đây..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-indigo-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddImageToChapter}
                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition whitespace-nowrap"
              >
                ➕ Chèn URL
              </button>
            </div>
            <div className="flex items-center gap-2 border-t border-indigo-100/50 pt-2">
              <span className="font-bold text-gray-500 text-[11px] whitespace-nowrap">
                Hoặc tải lên từ máy:
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleLocalFileUpload}
                className="text-[11px] text-gray-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[11px] file:font-black file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-150 cursor-pointer"
              />
            </div>
          </div>

          {/* Grid hiển thị danh sách ảnh */}
          {chapterImages.length === 0 ? (
            <p className="text-gray-400 italic text-xs text-center py-10 border border-dashed border-gray-200 rounded-xl">
              Chương này chưa có ảnh nào. Hãy tải ảnh lên hoặc dán URL ảnh.
            </p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {chapterImages.map((img, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                    img.visible
                      ? "bg-white border-gray-150"
                      : "bg-gray-50 border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-gray-400 w-5 text-center">
                      #{idx + 1}
                    </span>
                    <img
                      src={img.url}
                      alt={`page-${idx + 1}`}
                      className="w-12 h-16 object-cover rounded border border-gray-200 bg-gray-50"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/150x220?text=Error";
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <span
                        className={`text-[9px] font-bold px-1 py-0.2 rounded ${
                          img.visible
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {img.visible ? "Hiển thị" : "Đã chặn (Ẩn)"}
                      </span>
                    </div>
                  </div>

                  {/* Nút điều khiển ảnh */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleImageVisibility(idx)}
                      className={`p-1.5 rounded-lg border text-xs ${
                        img.visible
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                          : "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                      }`}
                      title={img.visible ? "Chặn ảnh này" : "Bỏ chặn"}
                    >
                      {img.visible ? "👁️" : "🙈"}
                    </button>
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleMoveImage(idx, "up")}
                        disabled={idx === 0}
                        className="p-0.5 bg-gray-50 text-[8px] hover:bg-gray-200 disabled:opacity-30 border rounded"
                        title="Di chuyển lên"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMoveImage(idx, "down")}
                        disabled={idx === chapterImages.length - 1}
                        className="p-0.5 bg-gray-50 text-[8px] hover:bg-gray-200 disabled:opacity-30 border rounded"
                        title="Di chuyển xuống"
                      >
                        ▼
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteImage(idx)}
                      className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200 rounded-lg text-xs transition"
                      title="Xóa trang"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer nút Lưu */}
          {chapterImages.length > 0 && (
            <div className="flex justify-end pt-3 border-t border-emerald-100">
              <button
                type="button"
                disabled={isSavingImages}
                onClick={handleSaveChapterImages}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-40"
              >
                {isSavingImages ? "Đang lưu ảnh..." : "💾 Lưu danh sách ảnh"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageGridEditor;
