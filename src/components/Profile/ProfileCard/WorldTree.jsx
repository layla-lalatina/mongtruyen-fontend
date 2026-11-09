import React from "react";

const BREAKPOINTS = [20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 250, 300];

// 13 Bậc Tiến Hóa Sinh Mệnh Cây Thế Giới (Mỗi lần Đột Phá cây lớn hơn & tiến hóa hình thái mới)
// Toàn bộ ảnh được lưu trực tiếp trong d:\AI\truyentranh-tong\Images\items\trees\
export const WORLD_TREE_STAGES = [
  {
    tier: 0,
    minLevel: 1,
    maxLevel: 20,
    name: "Mầm Linh Thảo Irminsul",
    subtitle: "Gieo mình tại Đại Đạo — Hấp thụ sương mai khởi nguyên",
    sizePx: 82,
    sizePercent: 60,
    glowColor: "rgba(52, 211, 153, 0.35)",
    badgeBg: "from-emerald-500 to-teal-600",
    localPath: "/Images/items/trees/tree_stage_0.png",
  },
  {
    tier: 1,
    minLevel: 21,
    maxLevel: 40,
    name: "Linh Hoa Khởi Nguyên",
    subtitle: "Đột phá Bậc 1 — Chồi non hé nở ánh sáng tri thức",
    sizePx: 94,
    sizePercent: 70,
    glowColor: "rgba(16, 185, 129, 0.4)",
    badgeBg: "from-emerald-500 to-green-600",
    localPath: "/Images/items/trees/tree_stage_1.png",
  },
  {
    tier: 2,
    minLevel: 41,
    maxLevel: 60,
    name: "Nhánh Tử Đằng Cổ Ngữ",
    subtitle: "Đột phá Bậc 2 — Thân gỗ uốn lượn kết tụ mạch nguyên tố",
    sizePx: 106,
    sizePercent: 80,
    glowColor: "rgba(139, 92, 246, 0.38)",
    badgeBg: "from-teal-500 to-emerald-600",
    localPath: "/Images/items/trees/tree_stage_2.png",
  },
  {
    tier: 3,
    minLevel: 61,
    maxLevel: 80,
    name: "Tiểu Thụ Bích Lục",
    subtitle: "Đột phá Bậc 3 — Tán lá xanh biếc vươn mình đón gió",
    sizePx: 118,
    sizePercent: 90,
    glowColor: "rgba(34, 197, 94, 0.42)",
    badgeBg: "from-emerald-600 to-teal-700",
    localPath: "/Images/items/trees/tree_stage_3.png",
  },
  {
    tier: 4,
    minLevel: 81,
    maxLevel: 100,
    name: "Thanh Tùng Tụ Linh",
    subtitle: "Đột phá Bậc 4 — Rễ cắm sâu vào mạch ngầm ký ức",
    sizePx: 128,
    sizePercent: 100,
    glowColor: "rgba(20, 184, 166, 0.45)",
    badgeBg: "from-teal-600 to-cyan-700",
    localPath: "/Images/items/trees/tree_stage_4.png",
  },
  {
    tier: 5,
    minLevel: 101,
    maxLevel: 120,
    name: "Linh Thụ Rừng Sâu",
    subtitle: "Đột phá Bậc 5 — Tán cây rộng lớn che chở lữ khách",
    sizePx: 138,
    sizePercent: 112,
    glowColor: "rgba(16, 185, 129, 0.5)",
    badgeBg: "from-emerald-600 to-cyan-600",
    localPath: "/Images/items/trees/tree_stage_5.png",
  },
  {
    tier: 6,
    minLevel: 121,
    maxLevel: 140,
    name: "Cổ Thụ Kim Diệp",
    subtitle: "Đột phá Bậc 6 — Lá ánh kim ngân vang tiếng vọng cổ đại",
    sizePx: 148,
    sizePercent: 125,
    glowColor: "rgba(234, 179, 8, 0.45)",
    badgeBg: "from-amber-500 to-emerald-600",
    localPath: "/Images/items/trees/tree_stage_6.png",
  },
  {
    tier: 7,
    minLevel: 141,
    maxLevel: 160,
    name: "Ngọc Thụ Trầm Hương",
    subtitle: "Đột phá Bậc 7 — Linh khí Trầm Ngọc Cốc bao phủ bốn phương",
    sizePx: 158,
    sizePercent: 138,
    glowColor: "rgba(16, 185, 129, 0.55)",
    badgeBg: "from-teal-500 to-indigo-600",
    localPath: "/Images/items/trees/tree_stage_7.png",
  },
  {
    tier: 8,
    minLevel: 161,
    maxLevel: 180,
    name: "Bạch Ngân Cổ Thụ",
    subtitle: "Đột phá Bậc 8 — Tán lá ngân hà lấp lánh sương tinh tú",
    sizePx: 168,
    sizePercent: 150,
    glowColor: "rgba(56, 189, 248, 0.55)",
    badgeBg: "from-cyan-500 to-blue-600",
    localPath: "/Images/items/trees/tree_stage_8.png",
  },
  {
    tier: 9,
    minLevel: 181,
    maxLevel: 200,
    name: "Thần Mộc Mộng Cảnh Sumeru",
    subtitle: "Đột phá Bậc 9 — Hoa đăng trí tuệ soi sáng cõi mộng",
    sizePx: 180,
    sizePercent: 165,
    glowColor: "rgba(52, 211, 153, 0.65)",
    badgeBg: "from-emerald-500 via-teal-500 to-cyan-500",
    localPath: "/Images/items/trees/tree_stage_9.png",
  },
  {
    tier: 10,
    minLevel: 201,
    maxLevel: 250,
    name: "Anh Đào Thần Thụ (Sacred Sakura)",
    subtitle: "Đột phá Bậc 10 — Thần thụ vĩnh hằng rợp bóng lôi anh",
    sizePx: 190,
    sizePercent: 180,
    glowColor: "rgba(192, 132, 252, 0.65)",
    badgeBg: "from-purple-600 via-fuchsia-500 to-indigo-600",
    localPath: "/Images/items/trees/tree_stage_10.png",
  },
  {
    tier: 11,
    minLevel: 251,
    maxLevel: 300,
    name: "Lưu Ly Tinh Hải Thụ",
    subtitle: "Đột phá Bậc 11 — Cành lá kết tinh từ ánh sáng biển sao",
    sizePx: 202,
    sizePercent: 195,
    glowColor: "rgba(34, 211, 238, 0.72)",
    badgeBg: "from-cyan-500 via-sky-500 to-indigo-600",
    localPath: "/Images/items/trees/tree_stage_11.png",
  },
  {
    tier: 12,
    minLevel: 301,
    maxLevel: 9999,
    name: "Thế Giới Thần Mộc Irminsul",
    subtitle: "Đột phá Viên Mãn (Bậc 12) — Vô lượng ký ức, xoay vần thiên địa",
    sizePx: 216,
    sizePercent: 215,
    glowColor: "rgba(56, 189, 248, 0.85)",
    badgeBg: "from-amber-500 via-cyan-500 to-purple-600",
    localPath: "/Images/items/trees/tree_stage_12.png",
    isCompleteIrminsul: true,
  },
];

export function getTreeStageByLevel(levelVal = 1) {
  const lvl = Math.max(1, Number(levelVal) || 1);
  const breakthroughCount = BREAKPOINTS.filter((bp) => lvl > bp).length;
  const stageObj = WORLD_TREE_STAGES[Math.min(breakthroughCount, WORLD_TREE_STAGES.length - 1)];
  return {
    ...stageObj,
    breakthroughCount,
  };
}

export default function WorldTree({ levelVal = 1, API_BASE_URL }) {
  const activeStage = getTreeStageByLevel(levelVal);

  // Mỗi lần đột phá cây lớn hơn rõ rệt + cộng thêm chút ít theo từng cấp trong bậc
  const extraLevelPx = Math.min(8, Math.max(0, ((Number(levelVal) || 1) - activeStage.minLevel) * 0.35));
  const computedSizePx = Math.round(activeStage.sizePx + extraLevelPx);

  const imgSrc = `${API_BASE_URL}${activeStage.localPath}`;

  return (
    <div className="flex flex-col items-center p-5 bg-gradient-to-b from-emerald-50/60 via-teal-50/30 to-emerald-100/20 rounded-2xl border border-emerald-200/70 mt-4 max-w-md w-full relative overflow-hidden shadow-inner">
      {/* Hào quang linh khí nền lớn dần theo mỗi lần đột phá */}
      <div
        className="absolute rounded-full blur-2xl pointer-events-none transition-all duration-700"
        style={{
          width: `${Math.round(computedSizePx * 0.95)}px`,
          height: `${Math.round(computedSizePx * 0.95)}px`,
          background: activeStage.glowColor,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -52%)",
        }}
      />

      {/* Tiêu đề & Huy hiệu Bậc Đột Phá */}
      <div className="w-full flex flex-wrap items-center justify-between gap-1.5 mb-2 z-10">
        <span className="text-[11px] font-extrabold text-emerald-900 uppercase tracking-wider select-none flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          Sinh Mệnh Cây Thế Giới (Lv.{levelVal})
        </span>

        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black text-white bg-gradient-to-r ${activeStage.badgeBg} shadow-xs`}
        >
          🌱 Đột phá: Bậc {activeStage.tier}/12 ({activeStage.sizePercent}%)
        </span>
      </div>

      {/* Khung hiển thị Cây Thế Giới */}
      <div className="relative w-full h-[215px] flex flex-col items-center justify-end py-2 z-10 select-none">
        <div
          className="absolute bottom-2 rounded-full blur-md transition-all duration-500 pointer-events-none"
          style={{
            width: `${Math.min(200, Math.round(computedSizePx * 0.75))}px`,
            height: "18px",
            background:
              "radial-gradient(circle, rgba(16,185,129,0.55) 0%, rgba(20,184,166,0.2) 65%, transparent 100%)",
          }}
        />

        {activeStage.isCompleteIrminsul ? (
          <div
            style={{ width: `${computedSizePx}px`, height: `${computedSizePx}px` }}
            className="relative rounded-full overflow-hidden border-2 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.7)] transition-all duration-500 flex items-center justify-center bg-slate-950"
          >
            <img
              src={imgSrc}
              alt={activeStage.name}
              className="w-full h-full object-cover scale-105"
            />
          </div>
        ) : (
          <img
            src={imgSrc}
            alt={activeStage.name}
            style={{
              width: `${computedSizePx}px`,
              height: `${computedSizePx}px`,
              filter: `drop-shadow(0 8px 18px ${activeStage.glowColor})`,
            }}
            className="object-contain object-bottom transition-all duration-500 hover:scale-105"
          />
        )}
      </div>

      {/* Tên hình thái & Mô tả */}
      <div className="text-center z-10 mt-1">
        <div className="text-sm font-black text-emerald-950 tracking-tight">
          🌳 {activeStage.name}
        </div>
        <div className="text-[11px] text-emerald-800/90 font-semibold italic mt-0.5">
          {activeStage.subtitle}
        </div>
      </div>
    </div>
  );
}
