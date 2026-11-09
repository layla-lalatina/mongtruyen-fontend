import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaCrown, FaTimes, FaUserPlus, FaSignInAlt, FaGift } from "react-icons/fa";

/**
 * 🌳 GuestBanner Component
 * Floating CTA banner inviting guest readers to log in and gain RPG rewards.
 */
const GuestBanner = ({ readCount = 3, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Tự động ẩn banner sau 8 giây
    const timer = setTimeout(() => {
      handleClose();
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl animate-bounce-short">
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-emerald-500/40 p-4 sm:p-5 shadow-2xl shadow-emerald-950/50">
        {/* Glow accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          title="Đóng thông báo"
        >
          <FaTimes size={16} />
        </button>

        <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 pr-6">
          <div className="shrink-0 w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FaGift className="w-6 h-6 animate-pulse" />
          </div>

          <div className="flex-1 text-left">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Ưu đãi Khách Vãng Lai
              </span>
              <span className="text-xs text-slate-400">Đã đọc {readCount} chương</span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white mt-1">
              Đăng nhập để nhận XP & Mở khóa Cây Thế Giới! 🌳
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed hidden sm:block">
              Đăng nhập ngay để lưu lịch sử đọc không giới hạn, tăng cấp độ RPG, nhận danh hiệu và rơi vật phẩm hiếm khi đọc!
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-2.5 mt-3 pt-2 border-t border-slate-800/60">
          <button
            onClick={handleClose}
            className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Đọc tiếp
          </button>
          <Link
            to="/register"
            onClick={handleClose}
            className="text-xs font-semibold text-emerald-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-all flex items-center space-x-1.5"
          >
            <FaUserPlus size={12} />
            <span>Đăng ký</span>
          </Link>
          <Link
            to="/login"
            onClick={handleClose}
            className="text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 px-4 py-1.5 rounded-lg shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-1.5"
          >
            <FaSignInAlt size={12} />
            <span>Đăng nhập ngay</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GuestBanner;
