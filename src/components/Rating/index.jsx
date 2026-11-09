import React, { useState, useEffect } from "react";
import { RatingStars } from "./RatingStars";
import { RatingForm } from "./RatingForm";
import { RatingList } from "./RatingList";
import { API_BASE_URL } from "../../../config";

/**
 * 🌳 SYSTEM: IRMINSUL FANTASY RPG - COMIC RATING CONTAINER
 * @file index.jsx
 * @path fontend/src/components/Rating/index.jsx
 */
const Rating = ({ comicSlug, user }) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hover, setHover] = useState(null);

  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [allRatings, setAllRatings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const fetchRatings = async (showLoader = false) => {
    try {
      if (showLoader && !hasLoadedOnce) setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/ratings/${comicSlug}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      const ratings = data.ratings || [];
      setAllRatings(ratings);

      if (ratings.length > 0) {
        const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
        setAverageRating(sum / ratings.length);
        setRatingCount(ratings.length);

        if (user) {
          const my = ratings.find((r) => r.userId === user.id);
          if (my) {
            setSelectedRating(my.rating);
            setComment(my.comment || "");
          }
        }
      } else {
        setAverageRating(0);
        setRatingCount(0);
      }
      setHasLoadedOnce(true);
    } catch (err) {
      console.error("Lỗi khi tải ratings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings(true);
  }, [comicSlug, user?.id]);

  const submitRating = async (e) => {
    e.preventDefault();
    setStatusMessage(null);
    if (!user) {
      setStatusMessage({ type: "error", text: "⚠️ Bạn cần đăng nhập để đánh giá!" });
      return;
    }
    if (selectedRating === 0) {
      setStatusMessage({ type: "error", text: "⚠️ Vui lòng chọn số sao đánh giá!" });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/api/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          comicSlug,
          rating: selectedRating,
          comment: comment.trim() || null,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Lỗi không xác định");

      setStatusMessage({ type: "success", text: resData.message || "✨ Đã gửi đánh giá thành công!" });
      setShowForm(false);
      await fetchRatings(false);
    } catch (err) {
      setStatusMessage({ type: "error", text: `⚠️ Không thể gửi đánh giá: ${err.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full text-xs text-gray-800 space-y-3">
      {statusMessage && (
        <div
          className={`p-3 rounded-2xl border text-xs font-bold transition-all shadow-sm ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {loading ? (
        <div className="text-gray-500 text-center py-2 italic">Đang tải đánh giá...</div>
      ) : (
        <div className="space-y-4">
          {/* Điểm trung bình tổng quan */}
          <div className="bg-emerald-50/50 border border-emerald-100/40 p-3 rounded-2xl flex flex-col items-center justify-center">
            <div className="text-2xl font-black text-emerald-700">
              {averageRating.toFixed(1)} <span className="text-xs text-gray-500 font-normal">/ 5</span>
            </div>
            <div className="my-1">
              <RatingStars rating={Math.round(averageRating)} size={14} />
            </div>
            <div className="text-[10px] text-gray-500 font-medium">({ratingCount} lượt đánh giá)</div>
          </div>

          {/* Form đánh giá của tôi */}
          {user ? (
            <div className="border-b border-emerald-100/40 pb-3">
              {!showForm ? (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-xl transition duration-200 text-[11px] shadow-sm shadow-emerald-600/10"
                >
                  ✍️ VIẾT ĐÁNH GIÁ CỦA BẠN
                </button>
              ) : (
                <RatingForm
                  selectedRating={selectedRating}
                  setSelectedRating={setSelectedRating}
                  comment={comment}
                  setComment={setComment}
                  hover={hover}
                  setHover={setHover}
                  submitting={submitting}
                  onSubmit={submitRating}
                  onCancel={() => setShowForm(false)}
                />
              )}
            </div>
          ) : (
            <div className="text-[10px] text-gray-500 text-center border border-dashed border-emerald-100 rounded-xl p-2 bg-emerald-50/10">
              Vui lòng đăng nhập để gửi đánh giá truyện.
            </div>
          )}

          {/* Danh sách các review */}
          <RatingList ratings={allRatings} />
        </div>
      )}
    </div>
  );
};

export default Rating;
