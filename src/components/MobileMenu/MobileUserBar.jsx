import React from "react";
import { Link } from "react-router-dom";

export const MobileUserBar = ({ user, onLogout, onClose }) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Thông tin tài khoản & Vai trò */}
      <div className="border-b border-emerald-100/30 pb-3 space-y-2">
        <Link
          to="/profile"
          className="font-bold text-emerald-800 hover:text-emerald-950 hover:underline flex items-center gap-2 text-sm"
          onClick={onClose}
        >
          <span>🏠 Hồ Sơ Lữ Hành</span>
        </Link>

        {user && (user.role?.toLowerCase() === "translator" || user.role?.toLowerCase() === "admin") && (
          <Link
            to="/translator"
            className="font-bold text-emerald-800 hover:text-emerald-950 hover:underline flex items-center gap-2 text-sm"
            onClick={onClose}
          >
            <span>✍️ Khu Vực Dịch Giả</span>
          </Link>
        )}

        {user && user.role?.toLowerCase() === "admin" && (
          <Link
            to="/admin/users"
            className="font-bold text-purple-800 hover:text-purple-950 hover:underline flex items-center gap-2 text-sm"
            onClick={onClose}
          >
            <span>👑 Quản Trị Admin</span>
          </Link>
        )}
      </div>

      {/* Đăng nhập / Đăng ký / Đăng xuất */}
      <div className="mt-1">
        {user ? (
          <button
            onClick={() => {
              onLogout();
              onClose();
              window.location.href = "/";
            }}
            className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-500/10 text-white rounded-xl font-bold text-sm transition-all"
          >
            Đăng xuất
          </button>
        ) : (
          <div className="flex gap-2">
            <Link
              to="/login"
              className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-center font-bold text-sm hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/10 transition-all"
              onClick={onClose}
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="flex-1 py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-center font-bold text-sm hover:bg-emerald-100 transition-all"
              onClick={onClose}
            >
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
