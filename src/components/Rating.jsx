/**
 * 🌳 SYSTEM: IRMINSUL FANTASY RPG — COMIC RATING COMPONENT
 * ============================================================
 * @file Rating.jsx
 * @description Component đánh giá sao truyện tranh. Hiển thị bình quân rating,
 *   form chọn 1-5 sao + viết review, gọi POST /api/ratings để lưu.
 *   Chỉ cho phép khi đã đăng nhập; Guest thấy tổng đánh giá chỉ xem.
 * ============================================================
 */

import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";

const StarIcon = ({ filled, half }) => (
  <svg
    viewBox="0 0 24 24"
    className="w-5 h-5 inline-block"
    fill={filled ? "#f59e0b" : half ? "url(#half)" : "none"}
    stroke={filled || half ? "#f59e0b" : "#d1d5db"}
    strokeWidth={1.5}
  >
    {half && (
      <defs>
        <linearGradient id="half">
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
    )}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
    />
  </svg>
);

const RatingStars = ({ value, max = 5 }) => {
  const stars = [];
  for (let i = 1; i <= max; i++) {
    if (i <= Math.floor(value)) stars.push(<StarIcon key={i} filled />);
    else if (i - 0.5 <= value) stars.push(<StarIcon key={i} half />);
    else stars.push(<StarIcon key={i} />);
  }
  return <span className="flex gap-0.5 items-center">{stars}</span>;
};

const Rating = ({ comicSlug, user }) => {
  const [ratings, setRatings] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Fetch danh sách rating
  useEffect(() => {
    if (!comicSlug) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/ratings/${comicSlug}`)
      .then((r) => r.json())
      .then((data) => {
        const list = data.ratings || [];
        setRatings(list);
        if (list.length > 0) {
          const avg = list.reduce((s, r) => s + (r.rating || 0), 0) / list.length;
          setAvgRating(Math.round(avg * 10) / 10);
        }
        // Tìm đánh giá của mình nếu đã đăng nhập
        if (user?.id) {
          const mine = list.find((r) => r.user?.id === user.id || r.User?.id === user.id);
          if (mine) {
            setMyRating(mine.rating || 0);
            setComment(mine.comment || "");
            setSubmitted(true);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [comicSlug, user]);

  const handleSubmit = async () => {
    if (!myRating) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ comicSlug, rating: myRating, comment }),
      });
      const data = await res.json();
      if (data.success) {
        setAvgRating(parseFloat(data.ratingAvg) || avgRating);
        setSubmitted(true);
        setShowForm(false);
        // Cập nhật lại danh sách
        fetch(`${API_BASE_URL}/api/ratings/${comicSlug}`)
          .then((r) => r.json())
          .then((d) => setRatings(d.ratings || []));
      }
    } catch (e) {
      console.error("Lỗi gửi đánh giá:", e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400 animate-pulse">
        <span>Đang tải đánh giá...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Tổng quan rating */}
      <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-600 leading-none">
            {avgRating > 0 ? avgRating.toFixed(1) : "—"}
          </div>
          <div className="text-xs text-amber-500 mt-0.5">/ 5.0</div>
        </div>
        <div className="flex-1">
          <RatingStars value={avgRating} />
          <div className="text-xs text-gray-500 mt-1">
            {ratings.length > 0
              ? `${ratings.length} lượt đánh giá`
              : "Chưa có đánh giá"}
          </div>
        </div>
        {user?.token && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="text-xs px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold transition"
          >
            {submitted ? "✏️ Sửa" : "⭐ Đánh giá"}
          </button>
        )}
      </div>

      {/* Form đánh giá (toggle) */}
      {showForm && user?.token && (
        <div className="bg-white border border-amber-100 rounded-xl p-4 shadow-sm space-y-3 animate-fadeIn">
          <div className="text-xs font-semibold text-emerald-700 mb-1">
            Chọn số sao:
          </div>
          <div className="flex gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setMyRating(star)}
                className="transition-transform hover:scale-110"
                title={["Tệ", "Kém", "Ổn", "Tốt", "Tuyệt vời"][star - 1]}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-7 h-7"
                  fill={(hoverRating || myRating) >= star ? "#f59e0b" : "none"}
                  stroke={(hoverRating || myRating) >= star ? "#f59e0b" : "#d1d5db"}
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                  />
                </svg>
              </button>
            ))}
            {myRating > 0 && (
              <span className="text-sm text-amber-600 font-bold ml-2 self-center">
                {["Tệ lắm", "Khá kém", "Ổn", "Tốt", "Xuất sắc!"][myRating - 1]}
              </span>
            )}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Nhận xét thêm (không bắt buộc)..."
            className="w-full text-xs p-2.5 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-300"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!myRating || submitting}
              className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition disabled:opacity-50"
            >
              {submitting ? "Đang gửi..." : submitted ? "Cập nhật" : "Gửi đánh giá"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm transition"
            >
              Huỷ
            </button>
          </div>
        </div>
      )}

      {/* Danh sách đánh giá gần nhất (tối đa 3) */}
      {ratings.length > 0 && (
        <div className="space-y-2">
          {ratings.slice(0, 3).map((r) => (
            <div
              key={r.id}
              className="flex gap-2 p-2.5 bg-white rounded-lg border border-gray-100 text-xs"
            >
              <img
                src={r.user?.avatarUrl || r.User?.avatarUrl || "/default-avatar.png"}
                alt="avatar"
                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-avatar.png";
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-gray-700 truncate">
                    {r.user?.username || r.User?.username || "Ẩn danh"}
                  </span>
                  <RatingStars value={r.rating} />
                </div>
                {r.comment && (
                  <p className="text-gray-500 mt-0.5 line-clamp-2">{r.comment}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!user?.token && (
        <p className="text-xs text-gray-400 italic">
          Đăng nhập để đánh giá bộ truyện này.
        </p>
      )}
    </div>
  );
};

export default Rating;
