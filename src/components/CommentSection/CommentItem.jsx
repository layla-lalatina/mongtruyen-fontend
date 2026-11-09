import React, { useState } from "react";
import { getBadgeClass, getRealmStyle } from "../../utils/rpgHelpers";
import { API_BASE_URL } from "../../../config";
import AvatarWithFrame from "../Common/AvatarFrame";

const TITLE_MAP = {
  6: { name: "Học Giả Tri Thức", icon: "📚", badgeBg: "from-amber-400 via-yellow-500 to-orange-500 text-amber-950 border-yellow-200", titleClass: "shiny-gold-title" },
  7: { name: "Chúa Tể Cây Thế Giới", icon: "🌳", badgeBg: "from-emerald-700 via-teal-600 to-amber-500 text-white border-amber-300", titleClass: "shiny-mythic-title" },
  11: { name: "Thủ Hộ Thần Mộc", icon: "🌿", badgeBg: "from-emerald-600 via-teal-500 to-green-600 text-white border-emerald-200", titleClass: "shiny-gold-title" },
  12: { name: "Hiền Giả Tinh Hà", icon: "🌌", badgeBg: "from-sky-500 via-cyan-400 to-indigo-600 text-white border-cyan-100", titleClass: "shiny-diamond-title" },
  13: { name: "Rồng Quấn Thần Thoại", icon: "🐉", badgeBg: "from-amber-500 via-rose-500 to-purple-600 text-white border-amber-200", titleClass: "shiny-mythic-title" },
  title_scholar: { name: "Học Giả Tri Thức", icon: "📚", badgeBg: "from-amber-400 via-yellow-500 to-orange-500 text-amber-950 border-yellow-200", titleClass: "shiny-gold-title" },
  title_guardian: { name: "Thủ Hộ Thần Mộc", icon: "🌿", badgeBg: "from-emerald-600 via-teal-500 to-green-600 text-white border-emerald-200", titleClass: "shiny-gold-title" },
  title_sage: { name: "Hiền Giả Tinh Hà", icon: "🌌", badgeBg: "from-sky-500 via-cyan-400 to-indigo-600 text-white border-cyan-100", titleClass: "shiny-diamond-title" },
  title_irminsul_lord: { name: "Chúa Tể Cây Thế Giới", icon: "🌳", badgeBg: "from-emerald-700 via-teal-600 to-amber-500 text-white border-amber-300", titleClass: "shiny-mythic-title" },
  title_dragon: { name: "Rồng Quấn Thần Thoại", icon: "🐉", badgeBg: "from-amber-500 via-rose-500 to-purple-600 text-white border-amber-200", titleClass: "shiny-mythic-title" },
};

const getAvatarUrl = (url) => {
  if (!url) return `${API_BASE_URL}/public/uploads/avatars/default_newbie.png`;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

const CommentItem = ({
  c,
  replies = [],
  handleLike,
  handleReplySubmit,
  handleReport,
  currentUser,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const maxLength = 240;
  const shouldTruncate = c.content && c.content.length > maxLength;
  const displayText =
    shouldTruncate && !isExpanded
      ? `${c.content.slice(0, maxLength)}...`
      : c.content;

  const onReplySubmit = (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    handleReplySubmit(replyContent, c.id);
    setReplyContent("");
    setShowReplyForm(false);
  };

  const userLevel = c.User?.level || c.user?.level || 1;
  const realmStyle = getRealmStyle(userLevel);

  const equippedTitle =
    c.User?.equippedTitle ||
    c.user?.equippedTitle ||
    TITLE_MAP[c.User?.equippedTitleId] ||
    TITLE_MAP[c.User?.gamification?.equippedTitleId] ||
    TITLE_MAP[c.User?.title] ||
    null;

  return (
    <li
      className={`pb-4 border-b border-emerald-100/40 last:border-b-0 ${
        c.isPinned
          ? "bg-amber-50/50 rounded-2xl px-4 py-3 border border-amber-100/50"
          : ""
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Avatar hiển thị khung viền nếu đã trang bị */}
        <AvatarWithFrame
          avatarUrl={getAvatarUrl(c.User?.avatarUrl || c.user?.avatarUrl)}
          frameKey={c.User?.equippedFrame || c.user?.equippedFrame || c.User?.equippedAvatarFrameId}
          size="sm"
          alt={c.displayName || c.User?.username || "Ẩn danh"}
        />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 border-b border-emerald-50/20 pb-1">
            {/* Tên người dùng với màu và ánh sáng hào quang theo Cảnh Giới */}
            <span
              className="font-black text-sm tracking-wide transition-all"
              style={{
                color: realmStyle.color,
                textShadow: realmStyle.glow,
              }}
            >
              {c.displayName || c.User?.username || "Ẩn danh"}
            </span>

            {/* Huy hiệu Cảnh Giới (như Trúc Cơ, Nguyên Anh trong ảnh mẫu) */}
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${realmStyle.badgeStyle} leading-tight`}
              title={`Cảnh giới: ${realmStyle.realm} (Cấp ${userLevel})`}
            >
              {realmStyle.realm}
            </span>

            {/* Danh hiệu nằm cạnh tên */}
            {equippedTitle && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-black bg-gradient-to-r ${equippedTitle.badgeBg} border shadow-2xs leading-tight whitespace-nowrap`}
                title={`Danh hiệu: ${equippedTitle.name}`}
              >
                <span>{equippedTitle.icon}</span>
                <span className={`tracking-wide uppercase text-[9.5px] ${equippedTitle.titleClass}`}>
                  {equippedTitle.name}
                </span>
              </span>
            )}

            {/* Huy hiệu Admin (nếu là admin) */}
            {c.User?.role?.toLowerCase() === "admin" && (
              <span className="bg-red-50 text-red-600 text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-red-200 uppercase">
                Admin
              </span>
            )}

            {/* Huy hiệu VIP (nếu đang kích hoạt VIP) */}
            {(c.User?.isVip || c.user?.isVip) && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black border leading-tight shadow-xs ${
                  (c.User?.vipTier || c.user?.vipTier) >= 2
                    ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 border-amber-300 ring-1 ring-amber-400/40 shiny-gold-title"
                    : "bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500 text-blue-950 border-sky-300 ring-1 ring-cyan-400/40 shiny-blue-title"
                }`}
                title={`Đặc quyền VIP: ${c.User?.vipPlanName || c.user?.vipPlanName || "VIP"}`}
              >
                <span>{(c.User?.vipTier || c.user?.vipTier) >= 2 ? "👑" : "✨"}</span>
                <span>{(c.User?.vipTier || c.user?.vipTier) >= 2 ? "VIP VÀNG" : "VIP 1"}</span>
              </span>
            )}
            {c.User?.danhVong && (
              <span className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded shadow-sm tracking-wider uppercase scale-90">
                Rank {c.User.danhVong}
              </span>
            )}
            {c.User?.badge && (
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded scale-90 shadow-sm ${getBadgeClass(
                  c.User.badge
                )}`}
              >
                {c.User.badge}
              </span>
            )}
            {c.User?.level && (
              <span className="bg-teal-50 text-teal-700 border border-teal-100 text-[9px] font-bold px-1.5 py-0.2 rounded scale-90">
                Cấp {c.User.level}
              </span>
            )}
            <span className="text-[10px] text-emerald-800/50 font-semibold ml-1">
              {new Date(c.createdAt).toLocaleString("vi-VN")}
            </span>
            {c.isPinned && (
              <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold shadow-sm">
                📌 Được ghim
              </span>
            )}
          </div>

          <p className="text-gray-700 mt-2 text-sm leading-relaxed break-words whitespace-pre-wrap">
            {displayText}
            {shouldTruncate && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors inline-block"
              >
                {isExpanded ? "[ Thu gọn ]" : "[ Xem thêm ]"}
              </button>
            )}
          </p>

          <div className="text-xs text-gray-500 mt-2 flex gap-4 items-center">
            {/* Nút Thích */}
            <button
              onClick={() => handleLike(c.id)}
              className="hover:text-amber-500 transition-colors duration-200 flex items-center gap-1 font-semibold text-emerald-800/60"
              title="Thích"
            >
              <span>👍</span>
              <span>{c.likeCount || 0}</span>
            </button>

            {/* Nút Trả lời */}
            {currentUser && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="hover:text-emerald-600 transition-colors duration-200 flex items-center gap-1 font-semibold text-emerald-800/60"
                title="Trả lời bình luận này"
              >
                <span>💬</span>
                <span>Trả lời</span>
              </button>
            )}

            {/* Nút Báo cáo */}
            {currentUser && (
              <button
                onClick={() => handleReport(c.id)}
                className="hover:text-red-500 transition-colors duration-200 flex items-center gap-1 font-semibold text-emerald-800/60"
                title="Báo cáo vi phạm"
              >
                <span>⚠️</span>
                <span>Báo cáo</span>
              </button>
            )}
          </div>

          {/* Form phản hồi bình luận */}
          {showReplyForm && currentUser && (
            <form
              onSubmit={onReplySubmit}
              className="mt-3 flex gap-2 items-end max-w-lg"
            >
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Nhập câu trả lời..."
                className="flex-1 px-3 py-2 bg-emerald-50/10 border border-emerald-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-100 text-black"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                Gửi
              </button>
            </form>
          )}

          {/* Hiển thị các phản hồi đệ quy */}
          {replies && replies.length > 0 && (
            <ul className="mt-4 space-y-4 border-l-2 border-emerald-100/60 pl-4 ml-2 bg-emerald-50/5 rounded-r-2xl py-2 px-1">
              {replies.map((reply) => (
                <li key={reply.id} className="text-xs">
                  <div className="flex items-start gap-3">
                    <img
                      src={
                        reply.User?.avatarUrl ||
                        "https://placehold.co/32x32?text=User"
                      }
                      alt={
                        reply.displayName || reply.User?.username || "Ẩn danh"
                      }
                      className={`w-8 h-8 rounded-full object-cover border border-emerald-100 shadow-sm shrink-0 ${
                        reply.User?.avatarFrame === "gold"
                          ? "avatar-frame-gold"
                          : reply.User?.avatarFrame === "emerald"
                          ? "avatar-frame-emerald"
                          : reply.User?.avatarFrame === "rainbow"
                          ? "avatar-frame-rainbow"
                          : reply.User?.avatarFrame
                          ? `avatar-frame-${reply.User.avatarFrame}`
                          : ""
                      }`}
                      onError={(e) => {
                        e.target.src = "https://placehold.co/32x32?text=User";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1 border-b border-emerald-50/10 pb-0.5">
                        <span
                          className={`font-bold text-xs ${
                            reply.User?.nameEffect === "rainbow"
                              ? "animate-rainbow-text"
                              : reply.User?.nameEffect === "glow"
                              ? "name-glow"
                              : reply.User?.nameEffect
                              ? `name-effect-${reply.User.nameEffect}`
                              : ""
                          } ${
                            !reply.User?.nameColor &&
                            reply.User?.role?.toLowerCase() === "admin"
                              ? "text-red-500"
                              : !reply.User?.nameColor
                              ? "text-emerald-950"
                              : ""
                          }`}
                          style={
                            reply.User?.nameColor &&
                            ![
                              "rainbow",
                              "thien_ha",
                              "tinh_hai_effect",
                              "dong_chay_van_menh",
                            ].includes(reply.User?.nameEffect)
                              ? { color: reply.User.nameColor }
                              : undefined
                          }
                        >
                          {reply.displayName ||
                            reply.User?.username ||
                            "Ẩn danh"}
                        </span>
                        {reply.User?.role?.toLowerCase() === "admin" && (
                          <span className="bg-red-50 text-red-600 text-[8px] font-extrabold px-1 py-0.1 rounded border border-red-100 scale-90">
                            Admin
                          </span>
                        )}
                        {reply.realm && (
                          <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black px-1 py-0.1 rounded border border-emerald-100/50 scale-90">
                            {reply.realm}
                          </span>
                        )}
                        {reply.User?.level && (
                          <span className="bg-teal-50 text-teal-700 border border-teal-100 text-[8px] font-bold px-1 py-0.1 rounded scale-90">
                            Cấp {reply.User.level}
                          </span>
                        )}
                        <span className="text-[9px] text-emerald-800/40 font-semibold ml-1">
                          {new Date(reply.createdAt).toLocaleString("vi-VN")}
                        </span>
                      </div>

                      <p className="text-gray-700 mt-1.5 break-words whitespace-pre-wrap leading-relaxed">
                        {reply.content}
                      </p>

                      <div className="text-[10px] text-gray-500 mt-1 flex gap-4 items-center">
                        <button
                          onClick={() => handleLike(reply.id)}
                          className="hover:text-amber-500 transition-colors duration-200 flex items-center gap-1 font-semibold text-emerald-800/60"
                          title="Thích"
                        >
                          <span>👍</span>
                          <span>{reply.likeCount || 0}</span>
                        </button>

                        {/* Nút Báo cáo phản hồi */}
                        {currentUser && (
                          <button
                            onClick={() => handleReport(reply.id)}
                            className="hover:text-red-500 transition-colors duration-200 flex items-center gap-1 font-semibold text-emerald-800/60 ml-2"
                            title="Báo cáo vi phạm"
                          >
                            <span>⚠️</span>
                            <span>Báo cáo</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
};

export default CommentItem;
