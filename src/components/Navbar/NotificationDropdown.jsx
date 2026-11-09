import React from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../config";

function formatTimeAgo(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diffSec < 60) return "Vừa xong";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
    if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)} ngày trước`;
    return d.toLocaleDateString("vi-VN");
  } catch (e) {
    return "";
  }
}

const getThumb = (url) => {
  if (!url) return `${API_BASE_URL}/Images/default-cover.jpg`;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function NotificationDropdown({
  notifications = [],
  notifMenuOpen,
  unreadNotifications = [],
  setNotifMenuOpen,
  handleMarkAsRead,
  handleMarkAllAsRead,
  notifMenuRef,
  isMobile = false,
}) {
  const navigate = useNavigate();

  const resolveNotificationTarget = (notif) => {
    if (!notif) return null;
    if (
      notif.comicSlug &&
      notif.chapterNumber !== undefined &&
      notif.chapterNumber !== null &&
      String(notif.chapterNumber).trim() !== ""
    ) {
      return `/doc/${notif.comicSlug}/${encodeURIComponent(notif.chapterNumber)}`;
    }
    if (notif.comicSlug) {
      return `/truyen/${notif.comicSlug}`;
    }
    if (notif.link) {
      const legacyMatch = String(notif.link).match(
        /^\/truyen-tranh\/([^/]+)\/chuong-(.+)$/
      );
      if (legacyMatch) {
        return `/doc/${legacyMatch[1]}/${encodeURIComponent(legacyMatch[2])}`;
      }
      return notif.link;
    }
    return null;
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead && handleMarkAsRead) {
      handleMarkAsRead(notif.id);
    }
    const targetUrl = resolveNotificationTarget(notif);
    setNotifMenuOpen(false);
    if (targetUrl) {
      navigate(targetUrl);
    }
  };

  const unreadCount = unreadNotifications.length;

  return (
    <div className="relative" ref={notifMenuRef}>
      {/* Icon Chuông */}
      <button
        type="button"
        onClick={() => setNotifMenuOpen((prev) => !prev)}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-800/40 hover:bg-emerald-800/80 border border-emerald-500/20 text-white text-base transition-all relative select-none cursor-pointer"
        title="Thông báo truyện theo dõi"
      >
        <span>🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[9px] font-black rounded-full min-w-4 h-4 px-1 flex items-center justify-center animate-pulse shadow-md border border-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Menu Dropdown Popup */}
      {notifMenuOpen && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className={`absolute right-0 mt-2 bg-white dark:bg-[#07241d] border border-emerald-100 dark:border-emerald-700/80 rounded-2xl shadow-2xl z-50 p-3 text-black dark:text-white animate-scale-up ${
            isMobile ? "w-72 sm:w-80" : "w-80 sm:w-96"
          }`}
        >
          {/* Header với nút 'Đã đọc' làm sạch chấm đỏ */}
          <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-800/80 pb-2 mb-2">
            <h4 className="font-extrabold text-xs text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
              <span>🔔</span>
              <span>Thông Báo Truyện Theo Dõi</span>
            </h4>

            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAllAsRead();
                }}
                className="text-[10px] font-black text-emerald-800 dark:text-emerald-200 hover:text-emerald-950 bg-emerald-100 dark:bg-emerald-900/80 hover:bg-emerald-200 px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-700 transition flex items-center gap-1 cursor-pointer active:scale-95"
                title="Đánh dấu tất cả thông báo là đã đọc để xóa chấm đỏ"
              >
                <span>✓</span>
                <span>Đã đọc</span>
              </button>
            ) : (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ Đã đọc hết
              </span>
            )}
          </div>

          {/* Danh sách thông báo */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-gray-400 dark:text-gray-500">
                <span className="text-2xl block mb-1">📭</span>
                <p className="text-[11px] font-medium">Hộp thư thông báo đang trống...</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-2 rounded-xl border text-xs transition flex gap-2.5 items-start cursor-pointer group ${
                    notif.isRead
                      ? "bg-gray-50/60 dark:bg-emerald-950/20 border-gray-200/60 dark:border-emerald-900/40 text-gray-600 dark:text-gray-300 hover:bg-emerald-50/50"
                      : "bg-emerald-50/80 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100 font-semibold shadow-xs hover:bg-emerald-100/60"
                  }`}
                >
                  {/* Thumbnail truyện */}
                  {notif.thumbUrl ? (
                    <img
                      src={getThumb(notif.thumbUrl)}
                      alt={notif.comicTitle || ""}
                      className="w-10 h-13 rounded-lg object-cover border border-emerald-200/80 dark:border-emerald-700 shrink-0 shadow-xs"
                      onError={(e) => {
                        e.target.src = `${API_BASE_URL}/Images/default-cover.jpg`;
                      }}
                    />
                  ) : (
                    <div className="w-10 h-13 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-lg shrink-0 border border-emerald-200">
                      📖
                    </div>
                  )}

                  {/* Nội dung thông báo */}
                  <div className="min-w-0 flex-1">
                    {notif.comicTitle ? (
                      <h5 className="font-black text-xs text-emerald-900 dark:text-emerald-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 truncate">
                        {notif.comicTitle}
                      </h5>
                    ) : (
                      <h5 className="font-black text-xs text-emerald-900 dark:text-emerald-200 truncate">
                        {notif.title || "Thông báo"}
                      </h5>
                    )}

                    <p className="text-[11px] leading-tight text-gray-700 dark:text-gray-200 line-clamp-2 mt-0.5">
                      {notif.content}
                    </p>

                    <div className="flex items-center justify-between mt-1 text-[9px] text-gray-400 dark:text-gray-400 font-medium">
                      <span>{formatTimeAgo(notif.createdAt)}</span>
                      {!notif.isRead && (
                        <span className="text-[9px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-1 rounded">
                          Mới
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nút Đọc đơn lẻ */}
                  {!notif.isRead && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notif.id);
                      }}
                      className="text-[9px] font-black text-emerald-700 dark:text-emerald-300 bg-white dark:bg-emerald-950 hover:bg-emerald-100 px-1.5 py-0.5 rounded shrink-0 border border-emerald-300 dark:border-emerald-700 mt-1 cursor-pointer"
                      title="Đánh dấu đã đọc"
                    >
                      ✓
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
