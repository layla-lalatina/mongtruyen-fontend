import React, { useState } from "react";
import {
  LuTriangleAlert,
  LuInfo,
  LuEyeOff,
  LuEye,
  LuClock,
  LuShieldAlert,
} from "react-icons/lu";

const SEVERITY_MAP = {
  INFO: {
    box: "bg-emerald-50/90 border-emerald-200 text-emerald-950",
    badge: "bg-emerald-600 text-white",
    iconColor: "text-emerald-600",
  },
  WARN: {
    box: "bg-amber-50/95 border-amber-300 text-amber-950",
    badge: "bg-amber-600 text-white",
    iconColor: "text-amber-600",
  },
  DANGER: {
    box: "bg-rose-50/95 border-rose-300 text-rose-950",
    badge: "bg-rose-600 text-white",
    iconColor: "text-rose-600",
  },
};

const TYPE_META = {
  WARNING: { label: "Cảnh báo nội dung", Icon: LuTriangleAlert },
  NOTE: { label: "Ghi chú từ Admin / Nhóm dịch", Icon: LuInfo },
  SPOILER: { label: "Cảnh báo Spoiler", Icon: LuEyeOff },
  HIATUS: { label: "Thông báo lịch ra chương", Icon: LuClock },
};

export default function ComicNoticeBanner({ notices = [], className = "" }) {
  const [revealedIds, setRevealedIds] = useState({});

  if (!Array.isArray(notices) || notices.length === 0) return null;

  const toggleReveal = (id) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {notices.map((n) => {
        const sev = SEVERITY_MAP[(n.severity || "INFO").toUpperCase()] || SEVERITY_MAP.INFO;
        const typeCfg = TYPE_META[(n.type || "NOTE").toUpperCase()] || TYPE_META.NOTE;
        const Icon = n.severity === "DANGER" ? LuShieldAlert : typeCfg.Icon;
        const isSpoiler = (n.type || "").toUpperCase() === "SPOILER";
        const isRevealed = Boolean(revealedIds[n.id]);

        return (
          <div
            key={n.id}
            className={`rounded-2xl border p-3.5 shadow-sm flex items-start gap-3 transition-all ${sev.box}`}
          >
            <div className={`p-2 rounded-xl bg-white/80 border border-black/5 shrink-0 ${sev.iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${sev.badge}`}>
                  {typeCfg.label}
                </span>
                {n.createdAt && (
                  <span className="text-[11px] opacity-60 font-medium">
                    {new Date(n.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                )}
              </div>

              {isSpoiler && !isRevealed ? (
                <button
                  type="button"
                  onClick={() => toggleReveal(n.id)}
                  className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/80 hover:bg-white text-xs font-bold border border-black/10 transition"
                >
                  <LuEye className="w-3.5 h-3.5" />
                  Nhấn để xem nội dung Spoiler
                </button>
              ) : (
                <p className="text-sm font-medium leading-relaxed whitespace-pre-line">
                  {n.content}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

