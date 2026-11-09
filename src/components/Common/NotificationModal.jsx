import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * 🌳 BẢNG THÔNG BÁO CHUNG TÙY BIẾN (Notification & Toast Modal)
 * ================================================================
 * Cho phép hiển thị thông báo với nội dung tùy biến theo từng hành động:
 * - Types: 'success' | 'error' | 'warning' | 'info'
 * - Modes: 'toast' (nổi góc trên cùng, fixed z-99999) | 'modal' (hộp thoại giữa màn hình)
 * ================================================================
 */
const NotificationModal = ({
  isOpen = false,
  onClose,
  type = "success",
  title = "Thông Báo Hệ Thống",
  message = "",
  details = null,
  autoClose = 4000,
  mode = "toast", // "toast" hoặc "modal"
  confirmText = "Đã Hiểu",
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isOpen || autoClose <= 0 || mode === "modal") return;

    setProgress(100);
    const intervalTime = 50;
    const step = (intervalTime / autoClose) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          if (onClose) onClose();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isOpen, autoClose, mode, onClose]);

  if (!isOpen) return null;

  // Icon và Style theo loại thông báo
  const config = {
    success: {
      icon: "✨",
      badge: "Thành công",
      bgGradient: "from-emerald-500 to-teal-600",
      borderColor: "border-emerald-200",
      shadowColor: "shadow-emerald-500/20",
      textColor: "text-emerald-950",
      progressBg: "bg-emerald-500",
      iconBg: "bg-emerald-100 text-emerald-700",
    },
    error: {
      icon: "❌",
      badge: "Lỗi thao tác",
      bgGradient: "from-rose-500 to-red-600",
      borderColor: "border-rose-200",
      shadowColor: "shadow-rose-500/20",
      textColor: "text-rose-950",
      progressBg: "bg-rose-500",
      iconBg: "bg-rose-100 text-rose-700",
    },
    warning: {
      icon: "⚠️",
      badge: "Cảnh báo",
      bgGradient: "from-amber-500 to-orange-600",
      borderColor: "border-amber-200",
      shadowColor: "shadow-amber-500/20",
      textColor: "text-amber-950",
      progressBg: "bg-amber-500",
      iconBg: "bg-amber-100 text-amber-700",
    },
    info: {
      icon: "💡",
      badge: "Ghi chú",
      bgGradient: "from-blue-500 to-cyan-600",
      borderColor: "border-blue-200",
      shadowColor: "shadow-blue-500/20",
      textColor: "text-blue-950",
      progressBg: "bg-blue-500",
      iconBg: "bg-blue-100 text-blue-700",
    },
  }[type] || {
    icon: "🔔",
    badge: "Thông báo",
    bgGradient: "from-emerald-500 to-teal-600",
    borderColor: "border-emerald-200",
    shadowColor: "shadow-emerald-500/20",
    textColor: "text-emerald-950",
    progressBg: "bg-emerald-500",
    iconBg: "bg-emerald-100 text-emerald-700",
  };

  // 1. Dạng MODAL (Hộp thoại nổi giữa màn hình)
  if (mode === "modal") {
    const modalContent = (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div
          className={`bg-white rounded-3xl border ${config.borderColor} shadow-2xl ${config.shadowColor} max-w-md w-full overflow-hidden animate-scale-up relative`}
        >
          {/* Header strip */}
          <div className={`h-2.5 w-full bg-gradient-to-r ${config.bgGradient}`} />

          <div className="p-6">
            <div className="flex items-center gap-3.5 mb-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${config.iconBg} shadow-inner shrink-0`}
              >
                {config.icon}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-gray-400">
                  {config.badge}
                </span>
                <h3 className={`text-base font-extrabold ${config.textColor} truncate`}>
                  {title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-650 font-medium leading-relaxed mb-4">
              {message}
            </p>

            {details && (
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-[11px] text-gray-600 font-mono mb-4 overflow-x-auto max-h-32">
                {typeof details === "string" ? details : JSON.stringify(details, null, 2)}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-5 py-2.5 bg-gradient-to-r ${config.bgGradient} text-white font-extrabold text-xs rounded-xl shadow-md transition active:scale-95 cursor-pointer`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
  }

  // 2. Dạng TOAST (Thông báo trôi nổi cố định ở góc trên, cuộn tới đâu cũng luôn thấy)
  const toastContent = (
    <div className="fixed top-6 right-6 z-[99999] max-w-sm w-full animate-slide-down pointer-events-auto">
      <div
        className={`bg-white/95 backdrop-blur-md rounded-2xl border ${config.borderColor} shadow-xl ${config.shadowColor} overflow-hidden`}
      >
        <div className="p-4 flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${config.iconBg} shrink-0 shadow-inner`}
          >
            {config.icon}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <h4 className={`text-xs font-black ${config.textColor} truncate`}>
                {title}
              </h4>
              <span className="text-[9px] uppercase font-bold text-gray-400 px-1.5 py-0.2 rounded bg-gray-50 border border-gray-100">
                {config.badge}
              </span>
            </div>
            <p className="text-[11px] text-gray-600 font-medium leading-snug">
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 text-xs transition cursor-pointer"
            title="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Thanh đếm ngược thời gian tự đóng */}
        {autoClose > 0 && (
          <div className="w-full bg-gray-100 h-1">
            <div
              className={`h-full transition-all duration-75 ${config.progressBg}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(toastContent, document.body) : null;
};

export default NotificationModal;
