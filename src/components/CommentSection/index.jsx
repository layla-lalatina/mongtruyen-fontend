import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../../config";
import CommentItem from "./CommentItem";
import ReportModal from "./ReportModal";

const COMMENTS_PER_PAGE = 10;

const CommentSection = ({ comicSlug, user }) => {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // States cho Modal báo cáo vi phạm
  const [reportingCommentId, setReportingCommentId] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [otherReasonText, setOtherReasonText] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Tự động tắt Toast thông báo sau 4 giây
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage("");
    }, 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const fetchComments = async () => {
    if (!comicSlug) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/comment?comicSlug=${comicSlug}`
      );
      setComments(Array.isArray(res.data.comments) ? res.data.comments : []);
      setError(null);
    } catch (err) {
      console.error("Lỗi khi tải bình luận:", err);
      setError("Lỗi khi tải bình luận");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [comicSlug]);

  useEffect(() => {
    setCurrentPage(1);
  }, [comicSlug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.token) {
      setError("Vui lòng đăng nhập để bình luận");
      return;
    }
    if (!content.trim()) {
      setError("Nội dung bình luận không được để trống");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/comment`,
        { comicSlug, content },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setContent("");
      setError(null);
      setCurrentPage(1);
      fetchComments();
    } catch (err) {
      console.error("Lỗi khi gửi bình luận:", err);
      setError("Lỗi khi gửi bình luận");
    }
  };

  const handleReplySubmit = async (replyContent, parentId) => {
    if (!user?.token) return;
    try {
      await axios.post(
        `${API_BASE_URL}/api/comment`,
        { comicSlug, content: replyContent, replyTo: parentId },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      fetchComments();
    } catch (err) {
      console.error("Lỗi khi gửi phản hồi:", err);
    }
  };

  const handleLike = async (commentId) => {
    if (!user?.token) {
      alert("Vui lòng đăng nhập để thích bình luận");
      return;
    }
    try {
      await axios.post(
        `${API_BASE_URL}/api/comment/like/${commentId}`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      fetchComments();
    } catch (err) {
      console.error("Lỗi khi thích bình luận:", err);
    }
  };

  const handleReport = (commentId) => {
    if (!user?.token) {
      setToastMessage("Vui lòng đăng nhập để báo cáo bình luận! ⚠️");
      return;
    }
    setReportingCommentId(commentId);
    setSelectedReasons([]);
    setOtherReasonText("");
    setShowReportModal(true);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (selectedReasons.length === 0 && !otherReasonText.trim()) {
      setToastMessage(
        "Vui lòng chọn ít nhất 1 lý do vi phạm hoặc mô tả lý do khác! ⚠️"
      );
      return;
    }
    try {
      await axios.post(
        `${API_BASE_URL}/api/comment/report/${reportingCommentId}`,
        {
          reasons: selectedReasons,
          otherReason: otherReasonText,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setToastMessage(
        "Báo cáo vi phạm thành công! Cảm ơn lữ hành giả đã góp phần bảo vệ Cây Thế Giới. 🌱"
      );
      setShowReportModal(false);
      setReportingCommentId(null);
    } catch (err) {
      console.error("Lỗi khi báo cáo bình luận:", err);
      setToastMessage("Gửi báo cáo vi phạm thất bại. ❌");
    }
  };

  const toggleReason = (reason) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  };

  // Chỉ thực hiện phân trang cho các bình luận gốc (parent)
  const parentComments = comments.filter((c) => !c.replyTo);
  const totalPages = Math.ceil(parentComments.length / COMMENTS_PER_PAGE);
  const paginatedParents = parentComments.slice(
    (currentPage - 1) * COMMENTS_PER_PAGE,
    currentPage * COMMENTS_PER_PAGE
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="w-full bg-white/90 backdrop-blur-md text-gray-800 p-6 md:p-8 mt-8 rounded-3xl shadow-xl shadow-emerald-100/20 border border-emerald-100/50">
      <h2 className="text-xl font-bold text-emerald-950 mb-6 flex items-center gap-2">
        <span className="inline-block w-2.5 h-6 bg-emerald-500 rounded-full"></span>
        Bình luận ({comments.length})
      </h2>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Hãy để lại vài lời dịu dàng..."
            className="w-full p-4 bg-white border border-emerald-100 focus:border-emerald-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-250 resize-y min-h-[120px] text-sm text-black shadow-inner"
            maxLength={500}
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button
            type="submit"
            className="mt-3 px-5 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/10 transition-all"
          >
            Gửi bình luận
          </button>
        </form>
      ) : (
        <p className="text-gray-600 mb-6 bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/50 text-sm">
          Vui lòng{" "}
          <Link
            to="/login"
            className="text-emerald-600 font-bold hover:underline"
          >
            đăng nhập
          </Link>{" "}
          để tham gia chia sẻ.
        </p>
      )}

      {loading && (
        <p className="text-emerald-800/60 text-sm italic">
          Đang tải bình luận...
        </p>
      )}
      {!loading && parentComments.length === 0 && (
        <p className="text-emerald-800/60 text-sm italic py-4">
          Chưa có ai mở lời...
        </p>
      )}

      {!loading && parentComments.length > 0 && (
        <ul className="space-y-4">
          {paginatedParents.map((c) => {
            const childReplies = comments.filter((r) => r.replyTo === c.id);
            return (
              <CommentItem
                key={c.id}
                c={c}
                replies={childReplies}
                handleLike={handleLike}
                handleReplySubmit={handleReplySubmit}
                handleReport={handleReport}
                currentUser={user}
              />
            );
          })}
        </ul>
      )}

      {!loading && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3.5 py-2 rounded-xl border border-emerald-100 bg-white/80 backdrop-blur-sm text-emerald-950 font-bold text-xs shadow-sm transition-all hover:bg-emerald-50 disabled:opacity-40 disabled:hover:bg-white"
          >
            ◀ Trước
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition ${
                page === currentPage
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white border-emerald-100 text-emerald-800 hover:bg-emerald-50"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3.5 py-2 rounded-xl border border-emerald-100 bg-white/80 backdrop-blur-sm text-emerald-950 font-bold text-xs shadow-sm transition-all hover:bg-emerald-50 disabled:opacity-40 disabled:hover:bg-white"
          >
            Sau ▶
          </button>
        </div>
      )}

      {/* Modal Báo cáo Vi phạm */}
      <ReportModal
        showReportModal={showReportModal}
        setShowReportModal={setShowReportModal}
        handleReportSubmit={handleReportSubmit}
        selectedReasons={selectedReasons}
        toggleReason={toggleReason}
        otherReasonText={otherReasonText}
        setOtherReasonText={setOtherReasonText}
      />

      {/* Toast thông báo tùy chỉnh không dùng alert mặc định */}
      {toastMessage &&
        createPortal(
          <div className="fixed bottom-6 right-6 z-[9999] bg-emerald-950/95 text-white border border-emerald-500/20 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-in max-w-sm backdrop-blur-sm">
            <span className="text-xl animate-bounce">🌱</span>
            <div>
              <div className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">
                Thông báo Cây Thế Giới
              </div>
              <div className="text-xs font-bold text-emerald-50 leading-relaxed">
                {toastMessage}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default CommentSection;
