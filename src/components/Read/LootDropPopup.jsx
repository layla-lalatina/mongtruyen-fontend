/**
 * 🌳 SYSTEM: IRMINSUL FANTASY RPG — LOOT DROP POPUP
 * ============================================================
 * @file LootDropPopup.jsx
 * @description Popup hiển thị vật phẩm rớt ra khi đọc truyện (10s/lần, tối đa 5 lần/chương, 100 lần/ngày).
 */

import React, { useState, useEffect, useRef } from "react";
import { LuSparkles } from "react-icons/lu";
import RpgItemIcon, { CrystalGemIcon } from "../Common/RpgItemIcon";

const LootDropPopup = () => {
  const [drops, setDrops] = useState([]);
  const counterRef = useRef(0);

  useEffect(() => {
    const handleDrop = (e) => {
      const drop = e.detail;
      if (!drop) return;

      const id = ++counterRef.current;
      const name = drop.name || "Phần thưởng bí ẩn";

      setDrops((prev) => [
        ...prev.slice(-3),
        {
          id,
          name,
          type: drop.type,
          item: drop.item,
          chapterDrops: drop.chapterDrops,
          maxChapterDrops: drop.maxChapterDrops || 5,
          dailyDrops: drop.dailyDrops,
          maxDailyDrops: drop.maxDailyDrops || 100,
        },
      ]);

      setTimeout(() => {
        setDrops((prev) => prev.filter((d) => d.id !== id));
      }, 3800);
    };

    window.addEventListener("loot-drop-received", handleDrop);
    return () => window.removeEventListener("loot-drop-received", handleDrop);
  }, []);

  if (drops.length === 0) return null;

  return (
    <div className="fixed top-16 sm:top-20 right-4 sm:right-6 z-[100000] flex flex-col gap-2.5 pointer-events-none">
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="loot-drop-popup flex items-center gap-3 bg-emerald-950/95 text-white backdrop-blur-md border border-emerald-400/40 shadow-xl rounded-2xl px-4 py-3 min-w-[240px] max-w-[310px]"
          style={{
            animation: "lootDropIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
          }}
        >
          {drop.item ? (
            <RpgItemIcon itemId={drop.item} size="sm" showBadge={false} />
          ) : drop.type === "crystal" ? (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 border border-cyan-200 flex items-center justify-center shrink-0 shadow">
              <CrystalGemIcon className="w-5 h-5 text-white" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 border border-emerald-200 flex items-center justify-center shrink-0 shadow">
              <LuSparkles className="w-5 h-5 text-amber-200" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider">
              ✨ Cây Irminsul ban tặng
            </div>
            <div className="text-sm font-black text-white truncate">{drop.name}</div>
            {drop.chapterDrops ? (
              <div className="text-[11px] text-emerald-200/90 font-semibold mt-0.5">
                Chương: {drop.chapterDrops}/{drop.maxChapterDrops} • Ngày: {drop.dailyDrops}/{drop.maxDailyDrops}
              </div>
            ) : null}
          </div>
        </div>
      ))}
      <style>{`
        @keyframes lootDropIn {
          0% { opacity: 0; transform: translateY(-20px) translateX(20px) scale(0.88); }
          60% { opacity: 1; transform: translateY(3px) translateX(0) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default LootDropPopup;
