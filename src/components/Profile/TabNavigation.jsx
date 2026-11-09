import React from "react";
import {
  LuBookMarked,
  LuHistory,
  LuMessageSquare,
  LuScrollText,
  LuSparkles,
  LuBackpack,
  LuStore,
  LuCrown,
  LuBookOpen,
} from "react-icons/lu";

const TABS = [
  { id: "followed", label: "Theo dõi", Icon: LuBookMarked },
  { id: "history", label: "Lịch sử đọc", Icon: LuHistory },
  { id: "quests", label: "Nhiệm Vụ & Điểm Danh", Icon: LuScrollText },
  { id: "vip", label: "VIP & Nạp Tự Động", Icon: LuCrown, highlight: true },
  { id: "inventory", label: "Balo & Chế Tạo", Icon: LuBackpack },
  { id: "shop", label: "Tiệm Ký Ức", Icon: LuStore },
  { id: "xpHistory", label: "Nhật ký tu hành", Icon: LuSparkles },
  { id: "comments", label: "Bình luận", Icon: LuMessageSquare },
  { id: "guide", label: "Hướng dẫn sử dụng", Icon: LuBookOpen },
];

const TabNavigation = ({ tab, setTab }) => (
  <div className="flex gap-2.5 mb-2 flex-wrap">
    {TABS.map(({ id, label, Icon, highlight }) => {
      const isActive = tab === id;
      return (
        <button
          key={id}
          type="button"
          onClick={() => setTab(id)}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-sm transition-all duration-200 border flex items-center gap-2 ${
            isActive
              ? highlight
                ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-amber-400 shadow-sm"
                : "bg-gradient-to-r from-emerald-600 to-teal-500 text-white border-emerald-500/10 shadow-sm"
              : highlight
              ? "bg-amber-50/90 border-amber-200 text-amber-900 hover:bg-amber-100"
              : "bg-white/85 border-emerald-100/60 text-emerald-800 hover:bg-emerald-50/70"
          }`}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span>{label}</span>
        </button>
      );
    })}
  </div>
);

export default TabNavigation;
