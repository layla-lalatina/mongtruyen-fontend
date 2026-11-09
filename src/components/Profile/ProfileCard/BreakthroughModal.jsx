import React, { useState, useEffect } from "react";

// Danh mục Danh Hiệu Cảnh Giới
const LEVEL_TITLES = [
  { min: 1, max: 20, title: "Người Mới Thức Tỉnh" },
  { min: 21, max: 40, title: "Kẻ Tìm Đường" },
  { min: 41, max: 60, title: "Lữ Hành Giả" },
  { min: 61, max: 80, title: "Nhà Thám Hiểm" },
  { min: 81, max: 100, title: "Người Gìn Giữ Tri Thức" },
  { min: 101, max: 120, title: "Người Ghi Chép Ký Ức" },
  { min: 121, max: 140, title: "Học Giả Cổ Đại" },
  { min: 141, max: 160, title: "Hiền Giả" },
  { min: 161, max: 180, title: "Đại Hiền Giả" },
  { min: 181, max: 200, title: "Thủ Hộ Cổ Thụ" },
  { min: 201, max: 250, title: "Người Canh Giữ Irminsul" },
  { min: 251, max: 300, title: "Người Viết Lại Lịch Sử" },
  { min: 301, max: 9999, title: "Hóa Thân Irminsul" },
];

// Tỉ lệ đột phá cơ bản (Cấp đầu 90%, mỗi cấp giảm 10% xuống 10%, 1%, 0.1%, 0.01%)
const BREAKTHROUGH_BASE_RATES = {
  20: 90,
  40: 80,
  60: 70,
  80: 60,
  100: 50,
  120: 40,
  140: 30,
  160: 20,
  180: 10,
  200: 1,
  250: 0.1,
  300: 0.01,
};

function getLevelTitle(level) {
  const entry = LEVEL_TITLES.find((e) => level >= e.min && level <= e.max);
  return entry ? entry.title : "Người Mới Thức Tỉnh";
}

// Âm thanh Web Audio API
function playMagicSound(type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === "charge") {
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(65, ctx.currentTime);
      subOsc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 3.2);
      subGain.gain.setValueAtTime(0.01, ctx.currentTime);
      subGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 2.5);
      subGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 3.3);
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start();
      subOsc.stop(ctx.currentTime + 3.3);

      const leadOsc = ctx.createOscillator();
      const leadGain = ctx.createGain();
      leadOsc.type = "triangle";
      leadOsc.frequency.setValueAtTime(160, ctx.currentTime);
      leadOsc.frequency.exponentialRampToValueAtTime(920, ctx.currentTime + 3.2);
      leadGain.gain.setValueAtTime(0.01, ctx.currentTime);
      leadGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 2.8);
      leadGain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 3.3);
      leadOsc.connect(leadGain);
      leadGain.connect(ctx.destination);
      leadOsc.start();
      leadOsc.stop(ctx.currentTime + 3.3);
    } else if (type === "success") {
      const notes = [
        { f: 261.63, t: 0.0, d: 0.6 },
        { f: 329.63, t: 0.08, d: 0.6 },
        { f: 392.0, t: 0.16, d: 0.6 },
        { f: 523.25, t: 0.24, d: 0.8 },
        { f: 659.25, t: 0.32, d: 0.8 },
        { f: 783.99, t: 0.40, d: 0.9 },
        { f: 1046.5, t: 0.48, d: 1.4 },
        { f: 1318.5, t: 0.56, d: 1.6 },
      ];

      notes.forEach(({ f, t, d }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, ctx.currentTime + t);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + d + 0.1);
      });
    } else if (type === "fail") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.85);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.9);
    }
  } catch (e) {}
}

export default function BreakthroughModal({
  profile,
  rolling,
  rollResult,
  setRollResult,
  useLeaf,
  setUseLeaf,
  usePotion,
  setUsePotion,
  handleBreakthrough,
  getPotionId,
  POTION_NAMES,
  refetchProfile,
}) {
  const [channelProgress, setChannelProgress] = useState(0);
  const [channelStageText, setChannelStageText] = useState("");
  const [screenFlash, setScreenFlash] = useState(false);

  const inventory = profile?.inventory || {};
  const leafCount = inventory.world_tree_leaf || 0;

  const [initialLevel, setInitialLevel] = useState(profile?.level || 20);
  useEffect(() => {
    if (!rolling && !rollResult && profile?.level) {
      setInitialLevel(profile.level);
    }
  }, [profile?.level, rolling, rollResult]);

  const currentLevel = initialLevel;
  const nextLevel = initialLevel + 1;
  const currentTitle = getLevelTitle(currentLevel);
  const nextTitle = getLevelTitle(nextLevel);

  const potionId = getPotionId ? getPotionId(currentLevel) : `witch_potion_t${Math.floor(currentLevel / 20)}`;
  const potionCount = inventory[potionId] || 0;
  const potionName = POTION_NAMES?.[currentLevel] || "Thuốc Phù Thủy Bậc 1";

  const BREAKPOINTS = [20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 250, 300];
  const nextBreakpoint = BREAKPOINTS.find((b) => b > currentLevel) || 300;

  const baseChance = BREAKTHROUGH_BASE_RATES[currentLevel] !== undefined ? BREAKTHROUGH_BASE_RATES[currentLevel] : 10;
  let finalChance = baseChance;
  if (useLeaf && leafCount > 0) finalChance += 30;
  const displayChance = Math.min(100, finalChance);

  useEffect(() => {
    if (!rolling) {
      setChannelProgress(0);
      return;
    }

    playMagicSound("charge");
    setChannelProgress(15);
    setChannelStageText("🌿 Tụ khí quy nguyên, dẫn dắt linh mạch Cây Thế Giới Irminsul...");

    const t1 = setTimeout(() => {
      setChannelProgress(45);
      setChannelStageText(
        `🧪 Tiêu hao "${potionName}", dược lực bùng nổ xung kích huyền quan!`
      );
    }, 900);

    const t2 = setTimeout(() => {
      setChannelProgress(75);
      setChannelStageText(
        useLeaf
          ? "🍃 Lá Cây Thế Giới bảo hộ tâm mạch, tỉ lệ tăng vọt +30%!"
          : "⚡ Cảnh giới chấn động kịch liệt, bình cảnh rạn nứt!"
      );
    }, 1900);

    const t3 = setTimeout(() => {
      setChannelProgress(100);
      setChannelStageText("💥 THIÊN ĐỊA DỊ TƯỢNG ĐẠT ĐỈNH ĐIỂM — PHÁ BÌNH CẢNH!");
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [rolling, usePotion, useLeaf, potionName]);

  useEffect(() => {
    if (rollResult) {
      setScreenFlash(true);
      const flashTimer = setTimeout(() => setScreenFlash(false), 700);

      if (rollResult.success) {
        playMagicSound("success");
      } else {
        playMagicSound("fail");
      }

      return () => clearTimeout(flashTimer);
    }
  }, [rollResult]);

  const canBreakthrough = potionCount > 0;

  return (
    <div
      className={`mt-2 bg-gradient-to-br from-emerald-50/95 via-teal-50/95 to-emerald-100/90 text-emerald-950 rounded-2xl border ${
        rollResult?.success
          ? "border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)]"
          : rollResult && !rollResult.success
          ? "border-rose-400 shadow-[0_0_20px_rgba(225,29,72,0.2)]"
          : rolling
          ? "border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
          : "border-emerald-300 shadow-md"
      } p-3 sm:p-3.5 w-full relative z-10 overflow-hidden transition-all duration-300 ${
        rolling ? "animate-tremor" : "animate-fade-in"
      }`}
    >
      {/* Flash effect */}
      {screenFlash && (
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-100 via-white to-emerald-200 animate-flash pointer-events-none z-30" />
      )}

      {/* Sunburst background */}
      {rollResult?.success && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
          <div
            className="w-[450px] h-[450px] rounded-full animate-sunburst opacity-25 blur-sm"
            style={{
              background:
                "conic-gradient(from 0deg, rgba(245,158,11,0.3) 0deg, transparent 30deg, rgba(16,185,129,0.3) 60deg, transparent 90deg, rgba(245,158,11,0.3) 120deg, transparent 150deg, rgba(16,185,129,0.3) 180deg, transparent 210deg, rgba(245,158,11,0.3) 240deg, transparent 270deg, rgba(16,185,129,0.3) 300deg, transparent 330deg, rgba(245,158,11,0.3) 360deg)",
            }}
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          GIAI ĐOẠN 1: CHUẨN BỊ ĐỘT PHÁ (PREPARE) — GỌN GÀNG TỐI ĐA
          ══════════════════════════════════════════════════════ */}
      {!rolling && !rollResult && (
        <div className="relative z-10 space-y-2">
          {/* Hàng 1: Cảnh giới Cũ ➔ Mới + Badge Tỉ Lệ */}
          <div className="flex flex-wrap items-center justify-between gap-1 pb-1.5 border-b border-emerald-200">
            <div className="flex items-center gap-1.5 font-black text-xs">
              <span className="text-emerald-700">⚡</span>
              <span className="text-emerald-900 font-black">Cấp {currentLevel}</span>
              <span className="text-emerald-600 px-0.5">➔</span>
              <span className="text-emerald-800 font-extrabold">Cấp {nextLevel}</span>
              <span className="text-emerald-700/80 text-[10px] font-semibold hidden sm:inline">
                ({nextTitle})
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-100/90 border border-emerald-300 rounded-lg px-2 py-0.5 text-xs font-black">
              <span className="text-[10px] text-emerald-800 font-bold uppercase">Tỉ lệ:</span>
              <span className="text-emerald-900 text-sm font-black">{displayChance}%</span>
              <span className="text-[9px] text-emerald-700 font-semibold hidden md:inline">
                (Gốc {baseChance}%{useLeaf && leafCount > 0 ? " + Lá 30%" : ""})
              </span>
            </div>
          </div>

          {/* Hàng 2: Chọn Dược Liệu Bổ Trợ (Grid 2 cột ngang nhỏ gọn) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* 1. Thuốc Phù Thủy tương ứng bậc (ĐIỀU KIỆN BẮT BUỘC) */}
            <div
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border select-none transition ${
                canBreakthrough
                  ? "bg-emerald-100/70 border-emerald-300 text-emerald-950 shadow-sm"
                  : "bg-rose-50 border-rose-300 text-rose-950"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg shrink-0">🧪</span>
                <div className="truncate">
                  <div className="text-[11px] font-black truncate flex items-center gap-1">
                    <span className="truncate">{potionName}</span>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded shrink-0 ${
                        canBreakthrough
                          ? "bg-emerald-200 text-emerald-800"
                          : "bg-rose-200 text-rose-800"
                      }`}
                    >
                      BẮT BUỘC
                    </span>
                  </div>
                  <div className="text-[9px] font-bold leading-tight truncate">
                    {canBreakthrough ? (
                      <span className="text-emerald-700">✓ Có: {potionCount} bình (Đủ điều kiện)</span>
                    ) : (
                      <span className="text-rose-600 font-extrabold">✕ Chưa có (Cần nấu ở vạc thuốc)</span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-xs font-black shrink-0 ml-1.5">
                {canBreakthrough ? "✅" : "🔒"}
              </span>
            </div>

            {/* 2. Lá Cây Thế Giới (+30% - Tùy chọn) */}
            <div
              onClick={() => leafCount > 0 && setUseLeaf(!useLeaf)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border cursor-pointer transition select-none ${
                useLeaf && leafCount > 0
                  ? "bg-emerald-200/80 border-emerald-400 text-emerald-950 shadow-sm"
                  : leafCount > 0
                  ? "bg-emerald-100/40 border-emerald-200 text-emerald-900"
                  : "bg-emerald-50/50 border-emerald-200/40 opacity-50 cursor-not-allowed text-emerald-800"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg shrink-0">🍃</span>
                <div className="truncate">
                  <div className="text-[11px] font-black truncate flex items-center gap-1">
                    <span>Lá Thế Giới</span>
                    <span className="text-[9px] text-emerald-800 font-extrabold bg-emerald-200 px-1 rounded">
                      +30%
                    </span>
                  </div>
                  <div className="text-[9px] text-emerald-700 font-bold leading-tight">
                    {leafCount > 0 ? `Có: ${leafCount} chiếc` : "Chưa có (rớt khi đọc truyện)"}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={useLeaf && leafCount > 0}
                disabled={leafCount === 0}
                onChange={() => {}}
                className="accent-emerald-600 w-4 h-4 rounded cursor-pointer shrink-0 ml-1.5"
              />
            </div>
          </div>

          {/* Hàng 3: Nút Bắt Đầu Đột Phá */}
          <button
            type="button"
            onClick={canBreakthrough ? handleBreakthrough : undefined}
            disabled={!canBreakthrough || rolling}
            className={`w-full py-2.5 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 ${
              canBreakthrough
                ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white cursor-pointer active:scale-95 border border-emerald-400"
                : "bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed"
            }`}
          >
            {canBreakthrough ? (
              <span>🔥 BẮT ĐẦU ĐỘT PHÁ (LÊN CẤP {nextLevel}) 🔥</span>
            ) : (
              <span>🔒 CẦN CÓ {potionName.toUpperCase()} ĐỂ ĐỘT PHÁ</span>
            )}
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          GIAI ĐOẠN 2: ĐANG TỤ KHÍ (CHANNELING) — NHỎ GỌN
          ══════════════════════════════════════════════════════ */}
      {rolling && (
        <div className="py-2 flex flex-col items-center text-center relative z-10 overflow-hidden space-y-1.5">
          <div className="relative w-16 h-16 flex items-center justify-center my-0.5">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-shockwave" />
            <svg
              className="absolute inset-0 w-full h-full animate-rune-cw text-emerald-600/70"
              viewBox="0 0 100 100"
            >
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 3 2 3" />
              <polygon points="50,6 94,50 50,94 6,50" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            </svg>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse z-10">
              <span className="text-sm animate-spin">🔮</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider animate-pulse">
              Đang Tụ Linh Khí Xung Kích Bình Cảnh!
            </h4>
            <p className="text-[11px] text-emerald-700 font-semibold px-2 leading-tight mt-0.5 line-clamp-1">
              {channelStageText}
            </p>
          </div>

          <div className="w-full max-w-sm bg-emerald-200/80 rounded-full h-2 p-0.5 border border-emerald-300 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${channelProgress}%` }}
            />
          </div>
          <span className="text-[9px] text-emerald-800 font-bold tracking-widest uppercase">
            Tiến trình: {channelProgress}%
          </span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          GIAI ĐOẠN 3: KẾT QUẢ ĐỘT PHÁ (REVEAL) — NHỎ GỌN
          ══════════════════════════════════════════════════════ */}
      {rollResult && (
        <div className="py-1.5 text-center animate-scale-up relative z-10 space-y-2">
          {rollResult.success ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl animate-bounce">👑</span>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-emerald-800 uppercase tracking-wider">
                    ĐỘT PHÁ THÀNH CÔNG!
                  </h3>
                  <div className="text-[11px] font-bold text-emerald-900">
                    Cấp {currentLevel} ➔ <strong className="text-emerald-700 text-xs font-black">Cấp {nextLevel} ({nextTitle})</strong>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-black">
                <span className="px-2 py-0.5 bg-emerald-100 rounded-md border border-emerald-300 text-emerald-800">
                  💎 +50 Crystals
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 rounded-md border border-emerald-300 text-emerald-800">
                  🔓 Mở Cấp {nextBreakpoint}
                </span>
                <span className="px-2 py-0.5 bg-emerald-200/90 rounded-md border border-emerald-300 text-emerald-900 font-black">
                  🎲 Điểm: {rollResult.roll}/{rollResult.chance}%
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setRollResult(null);
                  if (refetchProfile) refetchProfile();
                }}
                className="w-full py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer"
              >
                🌿 TIẾP NHẬN CẢNH GIỚI MỚI 🌿
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl animate-bounce">💥</span>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-rose-700 uppercase tracking-wider">
                    ĐỘT PHÁ THẤT BẠI!
                  </h3>
                  <div className="text-[10px] text-rose-800 font-medium">
                    🎲 Điểm: {rollResult.roll}/{rollResult.chance}% • Bình cảnh quá kiên cố!
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRollResult(null)}
                className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow transition-transform active:scale-95 cursor-pointer"
              >
                Đóng & Thử Lại
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
