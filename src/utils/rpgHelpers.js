/**
 * 🌳 SYSTEM: IRMINSUL FANTASY RPG - SHARED HELPERS
 * ==========================================================
 * @file rpgHelpers.js
 * @path fontend/src/utils/rpgHelpers.js
 * @description Centralized helper functions for user avatars, badges, titles, and RPG formatting.
 * ==========================================================
 */

import { API_BASE_URL } from "../../config";

/**
 * Normalizes user avatar URLs (handles full URLs, local uploads, or default avatar fallback)
 */
export const getAvatarUrl = (userObj) => {
  const avatar = userObj?.avatar;
  if (!avatar) return "/default-avatar.png";
  if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
    return avatar;
  }
  if (avatar.startsWith("/uploads/") || avatar.startsWith("uploads/")) {
    const cleanPath = avatar.startsWith("/") ? avatar : `/${avatar}`;
    return `${API_BASE_URL}${cleanPath}`;
  }
  return avatar;
};

/**
 * Parses user titles (json string or array) into a clean array of title strings.
 */
export const parseUserTitles = (titles) => {
  if (!titles) return [];
  if (Array.isArray(titles)) return titles;
  try {
    const parsed = JSON.parse(titles);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return typeof titles === "string" ? [titles] : [];
  }
};

/**
 * Returns CSS classes for user VIP/achievement badges based on their title.
 */
export const getBadgeClass = (badge) => {
  if (!badge) return "badge-vip-common text-emerald-700 bg-emerald-50 border border-emerald-100";
  const b = String(badge).toLowerCase();
  if (
    b.includes("thư viện trưởng") ||
    b.includes("đại thủ thư") ||
    b.includes("người khai thiên")
  ) {
    return "badge-vip-legendary text-white";
  }
  if (
    b.includes("thủ thư") ||
    b.includes("hiền giả") ||
    b.includes("học giả") ||
    b.includes("diễn thuyết")
  ) {
    return "badge-vip-rare text-white";
  }
  if (b.includes("đại hiền giả") || b.includes("chứng witness")) {
    return "badge-vip-epic text-white";
  }
  if (
    b.includes("gìn giữ") ||
    b.includes("thủ hộ") ||
    b.includes("canh giữ")
  ) {
    return "badge-vip-divine text-emerald-950 font-black";
  }
  return "badge-vip-common text-emerald-700 bg-emerald-50 border border-emerald-100";
};

/**
 * Hệ thống Cảnh Giới & Mã màu hào quang cho Tên theo Cảnh Giới
 * Chuẩn phong cách web tiên hiệp / tu chân
 */
export const getRealmStyle = (level = 1) => {
  const lvl = Number(level || 1);

  if (lvl <= 20) {
    return {
      realm: "Người Mới Thức Tỉnh",
      color: "#10b981", // Emerald
      glow: "0 0 8px rgba(16, 185, 129, 0.45)",
      badgeStyle: "border-emerald-400 text-emerald-700 bg-emerald-50/70",
    };
  }
  if (lvl <= 40) {
    return {
      realm: "Kẻ Tìm Đường",
      color: "#0284c7", // Sky Blue (như Trúc Cơ)
      glow: "0 0 8px rgba(2, 132, 199, 0.5)",
      badgeStyle: "border-sky-400 text-sky-700 bg-sky-50/70",
    };
  }
  if (lvl <= 60) {
    return {
      realm: "Lữ Hành Giả",
      color: "#0d9488", // Teal Jade (như Kim Đan)
      glow: "0 0 9px rgba(13, 148, 136, 0.5)",
      badgeStyle: "border-teal-400 text-teal-700 bg-teal-50/70",
    };
  }
  if (lvl <= 80) {
    return {
      realm: "Nhà Thám Hiểm",
      color: "#8b5cf6", // Purple / Violet (như Nguyên Anh)
      glow: "0 0 10px rgba(139, 92, 246, 0.55)",
      badgeStyle: "border-purple-400 text-purple-700 bg-purple-50/70",
    };
  }
  if (lvl <= 100) {
    return {
      realm: "Người Gìn Giữ Tri Thức",
      color: "#f59e0b", // Amber Gold (như Hóa Thần)
      glow: "0 0 10px rgba(245, 158, 11, 0.6)",
      badgeStyle: "border-amber-400 text-amber-800 bg-amber-50/70",
    };
  }
  if (lvl <= 120) {
    return {
      realm: "Người Ghi Chép Ký Ức",
      color: "#16a34a", // Emerald Lime (như Luyện Hư)
      glow: "0 0 11px rgba(22, 163, 74, 0.6)",
      badgeStyle: "border-green-400 text-green-700 bg-green-50/70",
    };
  }
  if (lvl <= 140) {
    return {
      realm: "Học Giả Cổ Đại",
      color: "#06b6d4", // Cyan Ice Diamond (như Hợp Thể)
      glow: "0 0 12px rgba(6, 182, 212, 0.65)",
      badgeStyle: "border-cyan-400 text-cyan-700 bg-cyan-50/70",
    };
  }
  if (lvl <= 160) {
    return {
      realm: "Hiền Giả",
      color: "#ec4899", // Ruby Pink (như Đại Thừa)
      glow: "0 0 13px rgba(236, 72, 153, 0.7)",
      badgeStyle: "border-pink-400 text-pink-700 bg-pink-50/70",
    };
  }
  if (lvl <= 180) {
    return {
      realm: "Đại Hiền Giả",
      color: "#eab308", // Hoàng Kim Rực Rỡ (như Độ Kiếp)
      glow: "0 0 14px rgba(234, 179, 8, 0.75)",
      badgeStyle: "border-yellow-400 text-yellow-800 bg-yellow-50/80 font-extrabold",
    };
  }
  if (lvl <= 200) {
    return {
      realm: "Thủ Hộ Cổ Thụ",
      color: "#e11d48", // Crimson Flame (như Chân Tiên)
      glow: "0 0 15px rgba(225, 29, 72, 0.8)",
      badgeStyle: "border-rose-400 text-rose-700 bg-rose-50/70 font-extrabold",
    };
  }
  if (lvl <= 250) {
    return {
      realm: "Người Canh Giữ Irminsul",
      color: "#9333ea", // Cosmic Void Purple (như Kim Tiên)
      glow: "0 0 16px rgba(147, 51, 234, 0.85)",
      badgeStyle: "border-purple-500 text-purple-800 bg-purple-50/80 font-black",
    };
  }
  return {
    realm: "Hóa Thân Irminsul",
    color: "#f43f5e", // Tối Thượng Thần Thoại
    glow: "0 0 18px rgba(244, 63, 94, 0.9), 0 0 8px rgba(251, 191, 36, 0.8)",
    badgeStyle: "border-amber-500 text-amber-900 bg-gradient-to-r from-amber-100 to-rose-100 font-black shadow-xs",
  };
};

/**
 * Formats ISO date string to Vietnamese date time
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) +
      " " +
      d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  } catch (e) {
    return dateStr;
  }
};
