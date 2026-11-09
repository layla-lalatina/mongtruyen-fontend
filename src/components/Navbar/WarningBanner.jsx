import React from "react";
import { LuTriangleAlert, LuCheck } from "react-icons/lu";

const WarningBanner = ({ user, unreadNotifications, handleMarkAsRead }) => {
  if (!user || !unreadNotifications || unreadNotifications.length === 0) return null;

  const warningNotif = unreadNotifications.find(
    (n) =>
      n.type === "warning" ||
      n.isWarning ||
      (n.content && n.content.toLowerCase().includes("cảnh cáo")) ||
      (n.content && n.content.toLowerCase().includes("nhắc nhở từ admin"))
  );

  if (!warningNotif) return null;

  return (
    <div className="bg-gradient-to-r from-rose-600 to-amber-600 text-white font-extrabold text-xs py-2.5 px-4 flex justify-between items-center z-[40] border-b border-rose-500/20 shadow-md">
      <span className="flex items-center gap-2">
        <LuTriangleAlert className="w-4 h-4 shrink-0" />
        <span>Nhắc nhở từ Admin: {warningNotif.content}</span>
      </span>
      <button
        onClick={() => handleMarkAsRead(warningNotif.id)}
        className="px-2.5 py-1 bg-white/20 hover:bg-white/30 hover:scale-105 border border-white/30 rounded-lg text-[10px] tracking-wider transition-all font-black shrink-0 flex items-center gap-1"
      >
        <LuCheck className="w-3.5 h-3.5" />
        <span>Đã đọc</span>
      </button>
    </div>
  );
};

export default WarningBanner;
