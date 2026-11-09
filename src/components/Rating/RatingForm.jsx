import React from "react";
import { RatingStars } from "./RatingStars";

export const RatingForm = ({
  selectedRating,
  setSelectedRating,
  comment,
  setComment,
  hover,
  setHover,
  submitting,
  onSubmit,
  onCancel,
}) => {
  return (
    <form onSubmit={onSubmit} className="bg-emerald-50/30 border border-emerald-100 p-3 rounded-2xl space-y-3">
      <div className="flex justify-between items-center">
        <span className="font-extrabold text-[10px] uppercase text-emerald-900">Đánh giá sao:</span>
        <RatingStars
          rating={selectedRating}
          hover={hover}
          onSelect={setSelectedRating}
          onHover={setHover}
          size={20}
          interactive={true}
        />
      </div>

      <div className="space-y-1">
        <span className="font-extrabold text-[10px] uppercase text-emerald-900">Bình luận cảm nhận:</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ cảm nhận của bạn về cốt truyện, nét vẽ..."
          className="w-full p-2 border border-emerald-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-200 resize-none text-[11px] h-16 text-black bg-white"
          maxLength={200}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] shadow transition"
        >
          {submitting ? "Đang gửi..." : "Gửi Đánh Giá"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-2.5 py-1.5 border border-emerald-200 hover:bg-emerald-50 text-emerald-800 rounded-lg text-[10px] transition"
        >
          Hủy
        </button>
      </div>
    </form>
  );
};
