import React from "react";
import { Link } from "react-router-dom";

const UserHistoryModal = ({
  selectedUser,
  setSelectedUser,
  isBannedState,
  handleToggleBanUser,
  handleSendWarning,
  warningText,
  setWarningText,
  userHistory,
  loadingHistory,
  handleQuickModerate,
}) => {
  if (!selectedUser) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-emerald-100 animate-slide-in flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-emerald-50 pb-3.5 mb-4 shrink-0">
          <div>
            <h3 className="text-base font-extrabold text-emerald-950 flex items-center gap-1.5">
              👤 Hồ sơ bình luận:{" "}
              <span className="text-indigo-700">@{selectedUser.username}</span>
            </h3>
            <p className="text-[10px] text-gray-450 font-semibold mt-0.5">
              Kiểm tra hoạt động bình luận, cấm tài khoản và gửi nhắc nhở.
            </p>
          </div>
          <button
            onClick={() => setSelectedUser(null)}
            className="text-gray-400 hover:text-gray-650 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Modal Body Container (Cuộn) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-5 text-xs text-black">
          {/* Tác vụ cấm tài khoản & Gửi nhắc nhở cảnh báo */}
          <div className="p-4 bg-emerald-50/10 border border-emerald-100 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
            {/* 1. Trạng thái cấm */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-emerald-950">
                🚫 Trạng thái tài khoản
              </h4>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full font-black uppercase text-[10px] ${
                    isBannedState
                      ? "bg-rose-100 border border-rose-200 text-rose-700 animate-pulse"
                      : "bg-emerald-50 border border-emerald-200 text-emerald-700"
                  }`}
                >
                  {isBannedState ? "Đã Bị Cấm" : "Hoạt Động Bình Thường"}
                </span>
                <button
                  onClick={handleToggleBanUser}
                  className={`px-3.5 py-1.5 font-extrabold rounded-xl transition ${
                    isBannedState
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-rose-600 hover:bg-rose-700 text-white"
                  }`}
                >
                  {isBannedState ? "Gỡ Cấm" : "Cấm Tài Khoản"}
                </button>
              </div>
            </div>

            {/* 2. Form gửi nhắc nhở cảnh cáo */}
            <form onSubmit={handleSendWarning} className="space-y-2">
              <h4 className="font-extrabold text-emerald-950">
                🔔 Gửi nhắc nhở cảnh cáo
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Nhập nội dung nhắc nhở..."
                  value={warningText}
                  onChange={(e) => setWarningText(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-black"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shrink-0"
                >
                  Gửi
                </button>
              </div>
            </form>
          </div>

          {/* Lịch sử comment */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-emerald-950 flex items-center gap-1">
              📖 Lịch sử bình luận ({userHistory.length})
            </h4>

            {loadingHistory ? (
              <p className="text-center text-gray-400 italic py-6">
                Đang tải lịch sử bình luận...
              </p>
            ) : userHistory.length === 0 ? (
              <p className="text-center text-gray-450 italic py-6">
                Người dùng này chưa có bình luận nào.
              </p>
            ) : (
              <div className="space-y-2">
                {userHistory.map((item) => {
                  const isItemHidden = item.status === "hidden";
                  const isItemReported = item.isReported === true;

                  return (
                    <div
                      key={item.id}
                      className={`p-3 border rounded-xl flex justify-between items-start gap-3 transition-colors ${
                        isItemHidden
                          ? "bg-gray-50 border-gray-200 opacity-60"
                          : isItemReported
                          ? "bg-amber-50/20 border-amber-200"
                          : "bg-white border-gray-150"
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 text-[10px] text-gray-450 font-bold">
                          <span>tại</span>
                          <Link
                            to={`/truyen/${item.comicSlug}`}
                            className="text-emerald-700 hover:underline font-mono"
                            onClick={() => setSelectedUser(null)}
                          >
                            {item.comicSlug}
                          </Link>
                          <span>•</span>
                          <span>
                            {new Date(item.createdAt).toLocaleString("vi-VN")}
                          </span>
                          {isItemHidden && (
                            <span className="text-rose-600 font-extrabold uppercase text-[8px] bg-rose-50 border border-rose-150 px-1 rounded">
                              Đã ẩn
                            </span>
                          )}
                          {isItemReported && (
                            <span className="text-amber-700 font-extrabold uppercase text-[8px] bg-amber-50 border border-amber-150 px-1 rounded">
                              ⚠️ Bị báo cáo
                            </span>
                          )}
                        </div>
                        <p className="text-gray-705 break-words leading-relaxed">
                          {item.content}
                        </p>
                        {isItemReported && item.reportReason && (
                          <p className="text-[10px] text-rose-600 font-black">
                            Lý do báo cáo: {item.reportReason}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-1">
                        {isItemHidden ? (
                          <button
                            onClick={() => handleQuickModerate(item.id, "active")}
                            className="px-2 py-1 border border-emerald-500 text-emerald-700 hover:bg-emerald-600 hover:text-white font-extrabold rounded text-[9px] transition-colors"
                          >
                            Hiện
                          </button>
                        ) : (
                          <button
                            onClick={() => handleQuickModerate(item.id, "hidden")}
                            className="px-2 py-1 border border-amber-500 text-amber-700 hover:bg-amber-600 hover:text-white font-extrabold rounded text-[9px] transition-colors"
                          >
                            Ẩn
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-emerald-50 pt-3.5 mt-4 shrink-0 flex justify-end">
          <button
            onClick={() => setSelectedUser(null)}
            className="px-4 py-2 border border-gray-200 text-gray-650 font-bold rounded-xl text-xs hover:bg-gray-50 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserHistoryModal;
