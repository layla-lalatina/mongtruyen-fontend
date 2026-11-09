import React from "react";
import { RatingCard } from "./RatingCard";

export const RatingList = ({ ratings = [] }) => {
  return (
    <div className="space-y-3 pt-2">
      <h4 className="font-extrabold text-xs uppercase text-emerald-950 tracking-wider flex items-center gap-1.5">
        <span>💬</span> Nhận Xét Từ Đạo Hữu ({ratings.length})
      </h4>
      {ratings.length === 0 ? (
        <p className="text-gray-400 italic text-xs py-2 text-center bg-white/50 rounded-xl border border-emerald-50">
          Chưa có nhận xét nào. Hãy là người đầu tiên để lại đánh giá!
        </p>
      ) : (
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {ratings.map((r) => (
            <RatingCard key={r.id} ratingItem={r} />
          ))}
        </div>
      )}
    </div>
  );
};
