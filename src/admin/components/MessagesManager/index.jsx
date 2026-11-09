import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../../config";
import ReportQueue from "./ReportQueue";
import UserHistoryModal from "./UserHistoryModal";

const MessagesManager = ({ comments, onDeleteComment, onModerateComment }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [warningText, setWarningText] = useState("");
  const [isBannedState, setIsBannedState] = useState(false);

  const token = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).token
    : "";

  // Lọc các bình luận bị báo cáo vi phạm
  const reportedComments = comments.filter((c) => c.isReported === true);

  // Mở modal lịch sử bình luận và load data từ backend
  const handleOpenUserHistory = async (userObj) => {
    if (!userObj || !userObj.id) return;
    setSelectedUser(userObj);
    setUserHistory([]);
    setLoadingHistory(true);
    setWarningText("");
    setIsBannedState(userObj.isBanned === true || userObj.isBanned === 1);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/comment/user-history/${userObj.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        setUserHistory(res.data.comments || []);
      }
    } catch (err) {
      console.error("Lỗi lấy lịch sử bình luận:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Cấm hoặc gỡ cấm người dùng trực tiếp từ modal
  const handleToggleBanUser = async () => {
    if (!selectedUser) return;
    const nextBanState = !isBannedState;
    const confirmMsg = nextBanState
      ? `Bạn có chắc chắn muốn CẤM tài khoản "${selectedUser.username}" không?`
      : `Bạn có muốn GỠ CẤM tài khoản "${selectedUser.username}" không?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/user/admin/user/${selectedUser.id}`,
        { isBanned: nextBanState },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setIsBannedState(nextBanState);
        alert(
          nextBanState
            ? "Đã cấm tài khoản thành công! 🚫"
            : "Đã gỡ cấm tài khoản! ✅"
        );
      }
    } catch (err) {
      console.error("Lỗi thay đổi trạng thái ban:", err);
      alert("Không thể thay đổi trạng thái cấm người dùng.");
    }
  };

  // Gửi nhắc nhở cảnh cáo từ Admin
  const handleSendWarning = async (e) => {
    e.preventDefault();
    if (!selectedUser || !warningText.trim()) return;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/user/admin/warn/${selectedUser.id}`,
        { content: warningText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert(
          `Đã gửi nhắc nhở đến "${selectedUser.username}" thành công! 🔔`
        );
        setWarningText("");
      }
    } catch (err) {
      console.error("Lỗi gửi nhắc nhở:", err);
      alert(err.response?.data?.message || "Lỗi khi gửi nhắc nhở.");
    }
  };

  // Ẩn/Hiện nhanh bình luận trong modal lịch sử
  const handleQuickModerate = async (commentId, nextStatus) => {
    try {
      await onModerateComment(commentId, nextStatus);
      // Cập nhật local state lịch sử
      setUserHistory((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                status: nextStatus,
                isReported: nextStatus === "active" ? false : c.isReported,
              }
            : c
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="text-black space-y-6">
      {/* Hàng Đợi Báo Cáo Vi Phạm (Report Queue) */}
      <ReportQueue
        reportedComments={reportedComments}
        handleOpenUserHistory={handleOpenUserHistory}
        onModerateComment={onModerateComment}
        onDeleteComment={onDeleteComment}
      />

      {/* Tất cả bình luận trên hệ thống */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-emerald-950 flex items-center gap-2">
          <span className="inline-block w-2.5 h-6 bg-emerald-500 rounded-full"></span>
          Tất cả bình luận hệ thống
        </h2>

        {comments.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
            <p className="text-gray-400 italic text-xs">
              Chưa có bình luận nào được ghi nhận.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs uppercase tracking-wider font-extrabold border-b border-emerald-500/20">
                    <th className="p-4 text-left">Tài khoản</th>
                    <th className="p-4 text-left">Nguồn (Slug)</th>
                    <th className="p-4 text-left">Nội dung bình luận</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-center">Báo cáo</th>
                    <th className="p-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {comments.map((comment) => {
                    const isReported = comment.isReported === true;
                    const isHidden = comment.status === "hidden";

                    return (
                      <tr
                        key={comment.id}
                        className={`hover:bg-emerald-50/20 border-b border-emerald-50/60 transition-colors last:border-b-0 ${
                          isReported ? "bg-amber-50/20 hover:bg-amber-50/30" : ""
                        }`}
                      >
                        {/* Tài khoản */}
                        <td className="p-4 font-extrabold text-emerald-950">
                          <button
                            onClick={() =>
                              handleOpenUserHistory(
                                comment.User || {
                                  id: comment.userId,
                                  username: comment.displayName || "Ẩn danh",
                                }
                              )
                            }
                            className="text-left text-indigo-700 hover:underline font-extrabold flex flex-col gap-0.5"
                            title="Xem lịch sử bình luận"
                          >
                            <span>
                              {comment.User?.username ||
                                comment.displayName ||
                                "Ẩn danh"}
                            </span>
                            <span className="text-[9px] text-emerald-800/40 font-semibold block">
                              {new Date(comment.createdAt).toLocaleString(
                                "vi-VN"
                              )}
                            </span>
                          </button>
                        </td>

                        {/* Nguồn Slug */}
                        <td className="p-4 text-emerald-955 font-semibold font-mono">
                          <Link
                            to={`/truyen/${comment.comicSlug}`}
                            className="text-emerald-700 hover:underline"
                            title="Mở trang truyện"
                          >
                            {comment.comicSlug}
                          </Link>
                        </td>

                        {/* Nội dung */}
                        <td className="p-4 text-gray-700 max-w-sm">
                          <div
                            className="break-words line-clamp-3 text-xs leading-relaxed"
                            title={comment.content}
                          >
                            {comment.content}
                          </div>
                        </td>

                        {/* Trạng thái */}
                        <td className="p-4 text-center">
                          {isHidden ? (
                            <span className="inline-block px-2 py-0.5 bg-rose-50 border border-rose-250 text-rose-700 font-extrabold rounded text-[9px] uppercase tracking-wide">
                              Đã ẩn
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 bg-emerald-50 border border-emerald-250 text-emerald-700 font-extrabold rounded text-[9px] uppercase tracking-wide">
                              Hiển thị
                            </span>
                          )}
                        </td>

                        {/* Báo cáo vi phạm */}
                        <td className="p-4 text-center">
                          {isReported ? (
                            <span
                              className="inline-block px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-800 font-black rounded text-[9px] uppercase tracking-wide"
                              title={comment.reportReason}
                            >
                              ⚠️ Có báo cáo
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 bg-gray-50 border border-gray-200 text-gray-450 font-semibold rounded text-[9px] uppercase tracking-wide">
                              Sạch
                            </span>
                          )}
                        </td>

                        {/* Nút tác vụ ngoài */}
                        <td className="p-4 text-center">
                          <div className="flex justify-center items-center gap-1.5 text-black">
                            {isHidden ? (
                              <button
                                onClick={() =>
                                  onModerateComment(comment.id, "active")
                                }
                                className="px-2 py-1 bg-white border border-emerald-500 text-emerald-700 hover:bg-emerald-600 hover:text-white font-extrabold rounded text-[10px] transition-colors"
                              >
                                Hiện
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  onModerateComment(comment.id, "hidden")
                                }
                                className="px-2 py-1 bg-white border border-amber-500 text-amber-700 hover:bg-amber-600 hover:text-white font-extrabold rounded text-[10px] transition-colors"
                              >
                                Ẩn
                              </button>
                            )}
                            <button
                              onClick={() => onDeleteComment(comment.id)}
                              className="px-2 py-1 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded text-[10px] transition-colors"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Lịch sử Bình luận */}
      <UserHistoryModal
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        isBannedState={isBannedState}
        handleToggleBanUser={handleToggleBanUser}
        handleSendWarning={handleSendWarning}
        warningText={warningText}
        setWarningText={setWarningText}
        userHistory={userHistory}
        loadingHistory={loadingHistory}
        handleQuickModerate={handleQuickModerate}
      />
    </div>
  );
};

export default MessagesManager;
