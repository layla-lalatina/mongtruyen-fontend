import React from "react";
import { LuShieldCheck, LuShieldAlert, LuFlame } from "react-icons/lu";

const AGE_STYLES = {
  ALL: {
    label: "Mọi lứa tuổi",
    short: "ALL",
    className: "bg-emerald-500/90 text-white border-emerald-300/60",
    Icon: LuShieldCheck,
  },
  "13+": {
    label: "13+ Thiếu niên",
    short: "13+",
    className: "bg-sky-500/95 text-white border-sky-300/60",
    Icon: LuShieldCheck,
  },
  "16+": {
    label: "16+ Trưởng thành",
    short: "16+",
    className: "bg-amber-500/95 text-white border-amber-300/60",
    Icon: LuShieldAlert,
  },
  "18+": {
    label: "18+ Giới hạn tuổi",
    short: "18+",
    className: "bg-rose-600 text-white border-rose-300/70 shadow-sm shadow-rose-600/30",
    Icon: LuFlame,
  },
};

export default function AgeBadge({ rating = "ALL", size = "sm", showLabel = false, className = "" }) {
  const clean = String(rating || "ALL").toUpperCase();
  const cfg = AGE_STYLES[clean] || AGE_STYLES.ALL;
  const Icon = cfg.Icon;

  const sizeClasses =
    size === "lg"
      ? "px-3 py-1 text-xs gap-1.5 rounded-xl"
      : size === "xs"
      ? "px-1.5 py-0.5 text-[10px] gap-1 rounded-md"
      : "px-2 py-0.5 text-[11px] gap-1 rounded-lg";

  return (
    <span
      title={`Giới hạn độ tuổi: ${cfg.label}`}
      className={`inline-flex items-center font-extrabold border tracking-wide select-none ${sizeClasses} ${cfg.className} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{showLabel ? cfg.label : cfg.short}</span>
    </span>
  );
}

