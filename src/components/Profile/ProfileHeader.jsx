import React from "react";
import { LuBookOpen, LuCrown, LuCompass } from "react-icons/lu";

const ProfileHeader = ({ onLogout, onOpenGuide, onOpenVip }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 border-b border-emerald-100 pb-4">
    <h1 className="text-2xl sm:text-3xl font-black text-emerald-900 flex items-center gap-2.5">
      <LuCompass className="w-7 h-7 text-emerald-600" />
      <span>Hồ Sơ Chi Tiết Lữ Hành</span>
    </h1>

    <div className="flex flex-wrap items-center gap-2.5">
      {onOpenGuide && (
        <button
          type="button"
          onClick={onOpenGuide}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-emerald-600/20 transition hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <LuBookOpen className="w-4 h-4 shrink-0" />
          <span>Hướng Dẫn Sử Dụng</span>
        </button>
      )}
      {onOpenVip && (
        <button
          type="button"
          onClick={onOpenVip}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <LuCrown className="w-4 h-4 shrink-0" />
          <span>VIP & Nạp Tự Động</span>
        </button>
      )}
    </div>
  </div>
);

export default ProfileHeader;
