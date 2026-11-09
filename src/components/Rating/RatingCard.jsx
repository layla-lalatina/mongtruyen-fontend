import React from "react";
import { RatingStars } from "./RatingStars";
import { getAvatarUrl, parseUserTitles, formatDateTime } from "../../utils/rpgHelpers";
import { API_BASE_URL } from "../../../config";

export const RatingCard = ({ ratingItem }) => {
  const userObj = ratingItem?.User;
  const avatar = getAvatarUrl(userObj);
  const titles = parseUserTitles(userObj?.titles);
  const userTitle = titles.length > 0 ? titles[0] : "";

  return (
    <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-100/80 shadow-sm hover:shadow-md transition-all space-y-2.5">
      {/* Header thông tin người đánh giá */}
      <div className="flex items-center justify-between gap-2 border-b border-emerald-50 pb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={avatar}
            alt={userObj?.username || "Ẩn danh"}
            className={`w-9 h-9 rounded-full object-cover border border-emerald-200 shadow-sm shrink-0 ${
              userObj?.avatarFrame ? `avatar-frame-${userObj.avatarFrame}` : ""
            }`}
            onError={(e) => {
              e.target.src = `${API_BASE_URL}/public/uploads/avatars/default_newbie.png`;
            }}
          />
          <div className="min-w-0 flex flex-col">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-xs text-gray-900 truncate">
                {userObj?.username || "Ẩn danh"}
              </span>
              {/* Level Badge */}
              <span className="bg-emerald-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-md shadow-xs shrink-0">
                Lv.{userObj?.level || 1}
              </span>
              {/* Role Badge */}
              {userObj?.role?.toLowerCase() === "admin" && (
                <span className="bg-gradient-to-r from-red-500 to-rose-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-md shrink-0">
                  👑 Admin
                </span>
              )}
              {userObj?.role?.toLowerCase() === "translator" && (
                <span className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-md shrink-0">
                  ✍️ Dịch giả
                </span>
              )}
              {/* Danh hiệu Badge */}
              {userTitle && (
                <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[9px] px-1.5 py-0.5 rounded-md shrink-0">
                  🏷️ {userTitle}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sao của đánh giá này */}
        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60 shrink-0">
          <RatingStars rating={ratingItem.rating} size={11} />
          <span className="text-[10px] font-black text-amber-700 ml-1">
            {ratingItem.rating}.0
          </span>
        </div>
      </div>

      {/* Nội dung đánh giá nổi bật */}
      <div className="bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100/60">
        <p className="text-gray-800 text-xs leading-relaxed font-medium break-words">
          {ratingItem.comment ? (
            ratingItem.comment
          ) : (
            <span className="text-gray-400 italic text-[11px]">
              Đạo hữu này không để lại lời bình.
            </span>
          )}
        </p>
      </div>

      {/* Ngày tháng */}
      <div className="text-[10px] text-gray-400 font-semibold text-right">
        🕒 {formatDateTime(ratingItem.createdAt)}
      </div>
    </div>
  );
};
