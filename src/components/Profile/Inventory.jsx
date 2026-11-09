import React, { useState } from "react";
import { LuBackpack, LuFlame, LuSparkles, LuCheck } from "react-icons/lu";
import { API_BASE_URL } from "../../../config";
import RpgItemIcon, { AlchemyCauldronIcon } from "../Common/RpgItemIcon";

const ITEM_DETAILS = {
  world_tree_leaf: { name: "Lá Cây Thế Giới", shortName: "Lá Thế Giới", desc: "Tăng +50% tỉ lệ thành công khi Đột phá Cảnh giới." },
  material_sun_clover: { name: "Cỏ Ba Lá Mặt Trời", shortName: "Cỏ Mặt Trời", desc: "Nguyên liệu chế tạo Thuốc Phù Thủy." },
  material_moon_mushroom: { name: "Nấm Trăng Tròn", shortName: "Nấm Trăng", desc: "Nguyên liệu chế tạo Thuốc Phù Thủy." },
  material_star_dust: { name: "Bột Bụi Sao", shortName: "Bụi Sao", desc: "Nguyên liệu chế tạo Thuốc Phù Thủy." },
  material_dream_drop: { name: "Giọt Nước Ước Mơ", shortName: "Giọt Ước Mơ", desc: "Nguyên liệu chế tạo Thuốc Phù Thủy." },
  material_memory_crystal: { name: "Pha Lê Ký Ức", shortName: "Pha Lê", desc: "Nguyên liệu chế tạo Thuốc Phù Thủy." },

  witch_potion_t1: { name: "Thuốc Phù Thủy Bậc 1", desc: "Tăng +15% tỉ lệ Đột phá Cấp 20." },
  witch_potion_t2: { name: "Thuốc Phù Thủy Bậc 2", desc: "Tăng +15% tỉ lệ Đột phá Cấp 40." },
  witch_potion_t3: { name: "Thuốc Phù Thủy Bậc 3", desc: "Tăng +15% tỉ lệ Đột phá Cấp 60." },
  witch_potion_t4: { name: "Thuốc Phù Thủy Bậc 4", desc: "Tăng +15% tỉ lệ Đột phá Cấp 80." },
  witch_potion_t5: { name: "Thuốc Phù Thủy Bậc 5", desc: "Tăng +15% tỉ lệ Đột phá Cấp 100." },
  witch_potion_t6: { name: "Thuốc Phù Thủy Bậc 6", desc: "Tăng +15% tỉ lệ Đột phá Cấp 120." },
  witch_potion_t7: { name: "Thuốc Phù Thủy Bậc 7", desc: "Tăng +15% tỉ lệ Đột phá Cấp 140." },
  witch_potion_t8: { name: "Thuốc Phù Thủy Bậc 8", desc: "Tăng +15% tỉ lệ Đột phá Cấp 160." },
  witch_potion_t9: { name: "Thuốc Phù Thủy Bậc 9", desc: "Tăng +15% tỉ lệ Đột phá Cấp 180." },
  witch_potion_t10: { name: "Thuốc Phù Thủy Bậc 10", desc: "Tăng +15% tỉ lệ Đột phá Cấp 200." },
  witch_potion_t11: { name: "Thuốc Phù Thủy Bậc 11", desc: "Tăng +15% tỉ lệ Đột phá Cấp 250." },
  witch_potion_t12: { name: "Thuốc Phù Thủy Bậc 12", desc: "Tăng +15% tỉ lệ Đột phá Cấp 300." },
};

// Hiệu ứng âm thanh giả kim bằng Web Audio API
function playBrewSound(phase) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (phase === "drop") {
      // Tiếng nguyên liệu rơi tõm vào vạc
      [0, 0.18, 0.36, 0.54, 0.72].forEach((offset, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(320 + i * 70, now + offset);
        osc.frequency.exponentialRampToValueAtTime(580 + i * 80, now + offset + 0.12);
        gain.gain.setValueAtTime(0.08, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.15);
      });
    } else if (phase === "stir") {
      // Tiếng muôi khuấy nước sôi huyền ảo
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(440, now + 0.8);
      osc.frequency.linearRampToValueAtTime(330, now + 1.5);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.65);
    } else if (phase === "done") {
      // Tiếng leng keng thần dược xuất thế
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);
        gain.gain.setValueAtTime(0.12, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.48);
      });
    }
  } catch (e) {}
}

/**
 * Hình minh họa Vạc Phù Thủy & Cái Muôi Giả Kim (SVG)
 */
const WitchCauldronIllustration = ({ stage = "idle", compact = false }) => {
  const isStirring = stage === "stirring";
  const isDropping = stage === "dropping";
  const isFinished = stage === "finished";

  return (
    <div className={`relative flex items-center justify-center select-none ${compact ? "w-36 h-32" : "w-64 h-60"}`}>
      {/* Hào quang ma pháp dưới đáy vạc */}
      <div
        className={`absolute bottom-2 rounded-full blur-xl transition-all duration-500 ${
          compact ? "w-28 h-8" : "w-48 h-14"
        } ${
          isStirring || isFinished
            ? "bg-gradient-to-r from-emerald-400 via-purple-500 to-amber-400 opacity-90 scale-110"
            : "bg-emerald-500/40 opacity-70"
        }`}
      />

      {/* Bọt khí & hạt sáng bay lên từ miệng vạc */}
      <div className="absolute inset-x-0 top-2 flex justify-center pointer-events-none">
        {[...Array(compact ? 4 : 7)].map((_, i) => (
          <span
            key={i}
            className="cauldron-bubble rounded-full bg-gradient-to-tr from-emerald-300 to-purple-300"
            style={{
              width: `${(i % 3) * 4 + 6}px`,
              height: `${(i % 3) * 4 + 6}px`,
              left: `${28 + i * 7}%`,
              animationDelay: `${i * 0.25}s`,
              animationDuration: isStirring ? "0.9s" : "1.8s",
            }}
          />
        ))}
      </div>

      <svg
        viewBox="0 0 220 200"
        className={`w-full h-full overflow-visible ${isStirring ? "cauldron-pot-shake" : ""}`}
      >
        <defs>
          <radialGradient id="cauldronBodyGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="55%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#090d16" />
          </radialGradient>
          <linearGradient id="potionLiquidGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="ladleWoodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
        </defs>

        {/* Ngọn lửa ma thuật dưới đáy vạc */}
        <g className={isStirring || isDropping ? "cauldron-flames-active" : "opacity-75"}>
          <path
            d="M65,178 Q80,148 92,175 Q110,138 125,175 Q140,148 155,178 Z"
            fill="#10b981"
            opacity="0.75"
          />
          <path
            d="M78,180 Q95,154 110,176 Q125,150 142,180 Z"
            fill="#fbbf24"
            opacity="0.9"
          />
        </g>

        {/* 🥄 CÁI MUÔI GIẢ KIM (LADLE) NẰM TRONG NỒI & XOAY KHI CHẾ */}
        <g className={isStirring ? "cauldron-ladle-stir" : "cauldron-ladle-idle"}>
          {/* Cán muôi */}
          <rect
            x="108"
            y="18"
            width="10"
            height="78"
            rx="5"
            transform="rotate(22 113 55)"
            fill="url(#ladleWoodGrad)"
            stroke="#fde68a"
            strokeWidth="1.5"
          />
          {/* Đầu muôi múc linh dược */}
          <ellipse
            cx="96"
            cy="82"
            rx="16"
            ry="9"
            fill="#92400e"
            stroke="#fbbf24"
            strokeWidth="1.5"
          />
          <ellipse cx="96" cy="82" rx="12" ry="5.5" fill="#34d399" opacity="0.9" />
        </g>

        {/* Chân vạc */}
        <path d="M62,155 L48,182 L66,182 L75,160 Z" fill="#0f172a" stroke="#475569" strokeWidth="2" />
        <path d="M158,155 L172,182 L154,182 L145,160 Z" fill="#0f172a" stroke="#475569" strokeWidth="2" />

        {/* Quai vạc 2 bên */}
        <circle cx="42" cy="108" r="12" fill="none" stroke="#fbbf24" strokeWidth="4" />
        <circle cx="178" cy="108" r="12" fill="none" stroke="#fbbf24" strokeWidth="4" />

        {/* Thân Vạc Phù Thủy */}
        <path
          d="M48,78 C32,125 52,168 110,168 C168,168 188,125 172,78 Z"
          fill="url(#cauldronBodyGrad)"
          stroke="#6ee7b7"
          strokeWidth="2.5"
        />

        {/* Cổ tự Irminsul phát sáng trên thân vạc */}
        <circle
          cx="110"
          cy="124"
          r="20"
          fill="none"
          stroke={isStirring || isFinished ? "#fde047" : "#34d399"}
          strokeWidth="2"
          strokeDasharray="5 4"
        />
        <path
          d="M110,108 L118,124 L110,140 L102,124 Z"
          fill={isStirring || isFinished ? "#fde047" : "#10b981"}
          opacity="0.85"
        />

        {/* Vành miệng vạc */}
        <ellipse
          cx="110"
          cy="76"
          rx="66"
          ry="16"
          fill="#1e293b"
          stroke="#6ee7b7"
          strokeWidth="3"
        />

        {/* Nước thuốc sôi bên trong miệng vạc */}
        <ellipse
          cx="110"
          cy="76"
          rx="57"
          ry="11"
          fill="url(#potionLiquidGrad)"
        />

        {/* Vòng xoáy nước thuốc khi muôi khuấy */}
        <ellipse
          cx="110"
          cy="76"
          rx="36"
          ry="6"
          fill="none"
          stroke="#fef08a"
          strokeWidth="2"
          strokeDasharray="10 6"
          className={isStirring ? "cauldron-swirl-spin" : "opacity-60"}
        />
      </svg>
    </div>
  );
};

const Inventory = ({ user, profile, refetchProfile }) => {
  const [selectedPotionTier, setSelectedPotionTier] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);

  // Trạng thái Nghi thức Nấu Thuốc: null | "dropping" | "stirring" | "finished" | "error"
  const [brewStage, setBrewStage] = useState(null);
  const [brewedPotionId, setBrewedPotionId] = useState("witch_potion_t1");
  const [brewErrorText, setBrewErrorText] = useState("");

  const inventory = profile?.inventory || {};
  const reqQty = selectedPotionTier * 2;
  const materials = [
    { id: "material_sun_clover", name: "Cỏ Ba Lá Mặt Trời", shortName: "Cỏ Mặt Trời" },
    { id: "material_moon_mushroom", name: "Nấm Trăng Tròn", shortName: "Nấm Trăng" },
    { id: "material_star_dust", name: "Bột Bụi Sao", shortName: "Bụi Sao" },
    { id: "material_dream_drop", name: "Giọt Nước Ước Mơ", shortName: "Giọt Mơ" },
    { id: "material_memory_crystal", name: "Pha Lê Ký Ức", shortName: "Pha Lê" },
  ];

  // Kiểm tra xem có đủ nguyên liệu để chế tạo không
  const canCraft = materials.every((mat) => (inventory[mat.id] || 0) >= reqQty);

  const handleCraftPotion = async () => {
    if (!canCraft || brewStage) return;
    const targetPotionId = `witch_potion_t${selectedPotionTier}`;
    setBrewedPotionId(targetPotionId);
    setBrewErrorText("");

    // Giai đoạn 1: Hiện vạc & 5 nguyên liệu nhảy vào nồi (0s -> 1.2s)
    setBrewStage("dropping");
    playBrewSound("drop");

    try {
      const apiPromise = fetch(`${API_BASE_URL}/api/user/craft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ potionTier: selectedPotionTier }),
      }).then((r) => r.json());

      // Sau 1.15s: Chuyển sang giai đoạn 2 — Cái muôi xoay khuấy thuốc trong 1.7s
      setTimeout(() => {
        setBrewStage("stirring");
        playBrewSound("stir");
      }, 1150);

      const data = await apiPromise;

      // Sau 2.85s: Chuyển sang giai đoạn 3 — Bình thuốc nhảy vọt ra giữa màn hình & chờ xác nhận
      setTimeout(() => {
        if (data.success) {
          setBrewStage("finished");
          playBrewSound("done");
          if (refetchProfile) refetchProfile();
        } else {
          setBrewErrorText(data.message || "Lỗi chế tạo thuốc.");
          setBrewStage("error");
        }
      }, 2850);
    } catch (err) {
      console.error(err);
      setBrewErrorText("Lỗi kết nối máy chủ khi chế tạo thuốc.");
      setBrewStage("error");
    }
  };

  const handleConfirmBrewDone = () => {
    setBrewStage(null);
    setBrewErrorText("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* 🎒 HÀNH TRANG LỮ HÀNH */}
      <div className="lg:col-span-7 bg-white/90 backdrop-blur border border-emerald-100 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between min-h-[480px]">
        <div>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-100/70">
            <h3 className="text-xl font-black text-emerald-950 flex items-center gap-2">
              <LuBackpack className="w-6 h-6 text-emerald-600" /> Hành Trang Lữ Hành
            </h3>
            <span className="text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              Bấm vào vật phẩm để xem chi tiết
            </span>
          </div>

          {Object.keys(inventory).length === 0 || Object.values(inventory).every((v) => v === 0) ? (
            <div className="text-center py-16 text-gray-500 text-base italic">
              Balo của bạn đang trống. Hãy đọc truyện hoặc ghé Tiệm Ký Ức để thu thập vật phẩm!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5 max-h-[420px] overflow-y-auto pr-1">
              {Object.entries(inventory)
                .filter(([_, qty]) => qty > 0)
                .map(([itemId, qty]) => {
                  const details = ITEM_DETAILS[itemId] || { name: itemId, desc: "" };
                  const isChosen = selectedItem === itemId;
                  return (
                    <div
                      key={itemId}
                      onClick={() => setSelectedItem(isChosen ? null : itemId)}
                      className={`relative flex flex-col items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer hover:shadow-md aspect-square ${
                        isChosen
                          ? "border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-400/30 scale-[0.98]"
                          : "border-emerald-100/80 bg-white hover:border-emerald-300"
                      }`}
                    >
                      {/* Số lượng */}
                      <span className="absolute top-2 right-2 z-20 px-2 py-0.5 bg-emerald-950 text-white font-extrabold text-xs rounded-full min-w-6 text-center shadow">
                        x{qty}
                      </span>

                      {/* Icon RPG */}
                      <div className="my-auto pt-1">
                        <RpgItemIcon itemId={itemId} size="lg" />
                      </div>

                      {/* Tên vật phẩm */}
                      <span className="text-xs sm:text-sm font-bold text-gray-800 text-center line-clamp-2 leading-tight w-full mt-1">
                        {details.name}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Khung chi tiết vật phẩm khi Click */}
        {selectedItem && (
          <div className="mt-5 p-4 bg-emerald-50/50 border border-emerald-200/70 rounded-2xl animate-fade-in">
            <div className="flex items-center gap-3.5 mb-1.5">
              <RpgItemIcon itemId={selectedItem} size="md" />
              <div>
                <h4 className="text-base font-black text-emerald-950">
                  {ITEM_DETAILS[selectedItem]?.name}
                </h4>
                <span className="text-xs text-emerald-800 font-bold bg-emerald-100/70 px-2.5 py-0.5 rounded-md inline-block mt-0.5">
                  Số lượng sở hữu: {inventory[selectedItem] || 0}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              {ITEM_DETAILS[selectedItem]?.desc}
            </p>
          </div>
        )}
      </div>

      {/* 🔮 VẠC CHẾ TẠO THUỐC PHÙ THỦY — BỐ CỤC HÌNH VUÔNG GỌN GÀNG */}
      <div className="lg:col-span-5 bg-gradient-to-br from-emerald-50/95 via-teal-50/95 to-emerald-100/90 text-emerald-950 rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-300 relative overflow-hidden flex flex-col justify-between">
        {/* Background glow effects */}
        <div className="absolute w-44 h-44 bg-teal-300/20 rounded-full blur-3xl -top-10 -left-10 pointer-events-none" />
        <div className="absolute w-44 h-44 bg-emerald-400/20 rounded-full blur-3xl -bottom-10 -right-10 pointer-events-none" />

        <div className="z-10 space-y-4">
          {/* Header + Chọn bậc thuốc */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 pb-3">
            <div>
              <h3 className="text-lg sm:text-xl font-black flex items-center gap-2 text-emerald-950">
                <AlchemyCauldronIcon className="w-6 h-6 text-emerald-600" /> Vạc Thuốc Phù Thủy
              </h3>
              <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                Chọn bậc linh dược và hội tụ 5 nguyên liệu vào vạc
              </p>
            </div>

            <div className="flex items-center gap-2 bg-emerald-100/90 border border-emerald-300 rounded-2xl px-2.5 py-1.5 shadow-sm">
              <RpgItemIcon itemId={`witch_potion_t${selectedPotionTier}`} size="xs" showBadge={false} />
              <select
                value={selectedPotionTier}
                onChange={(e) => setSelectedPotionTier(parseInt(e.target.value, 10))}
                disabled={Boolean(brewStage)}
                className="bg-transparent text-xs sm:text-sm font-black text-emerald-900 outline-none cursor-pointer"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1} className="bg-emerald-50 text-emerald-950 font-bold">
                    Bậc {i + 1} — {ITEM_DETAILS[`witch_potion_t${i + 1}`]?.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Minh họa Vạc Phù Thủy trung tâm */}
          <div className="flex flex-col items-center justify-center py-1">
            <WitchCauldronIllustration stage="idle" compact />
            <div className="text-xs font-black text-emerald-900 bg-emerald-200/80 border border-emerald-300 px-3.5 py-1 rounded-full -mt-1 shadow-sm">
              🎯 Thành phẩm: {ITEM_DETAILS[`witch_potion_t${selectedPotionTier}`]?.name}
            </div>
          </div>

          {/* BẢNG CÔNG THỨC CHẾ TẠO HÌNH VUÔNG GỌN GÀNG (5 Ô VUÔNG) */}
          <div className="bg-emerald-100/50 border border-emerald-200/80 rounded-2xl p-3 shadow-inner">
            <div className="flex items-center justify-between text-xs font-extrabold text-emerald-800 uppercase tracking-wider mb-2.5">
              <span>Công thức chế tạo</span>
              <span className="text-emerald-950 font-black">Cần {reqQty} mỗi loại</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {materials.map((mat) => {
                const count = inventory[mat.id] || 0;
                const isEnough = count >= reqQty;
                return (
                  <div
                    key={mat.id}
                    title={`${mat.name}: Hiện có ${count} / Cần ${reqQty}`}
                    className={`aspect-square rounded-xl p-1.5 border flex flex-col items-center justify-between text-center transition ${
                      isEnough
                        ? "bg-white/80 border-emerald-400/80 shadow-sm"
                        : "bg-rose-50/90 border-rose-300 shadow-sm opacity-90"
                    }`}
                  >
                    <RpgItemIcon itemId={mat.id} size="sm" showBadge={false} />
                    <span className={`text-[10px] font-extrabold leading-tight line-clamp-1 w-full ${
                      isEnough ? "text-emerald-950" : "text-rose-950"
                    }`}>
                      {mat.shortName}
                    </span>
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded-full leading-tight ${
                        isEnough
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {count}/{reqQty}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Nút Bắt Đầu Nấu Thuốc */}
        <div className="z-10 mt-4">
          <button
            type="button"
            onClick={handleCraftPotion}
            disabled={!canCraft || Boolean(brewStage)}
            className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${
              canCraft
                ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-700/20 hover:scale-[1.01] active:scale-95 cursor-pointer"
                : "bg-emerald-200/50 border border-emerald-300 text-emerald-800/60 cursor-not-allowed"
            }`}
          >
            {canCraft ? (
              <>
                <LuFlame className="w-5 h-5 text-amber-300" /> Bắt Đầu Nấu Thuốc
              </>
            ) : (
              <>
                <LuSparkles className="w-4 h-4 text-emerald-700" /> Chưa Đủ Nguyên Liệu ({reqQty} mỗi loại)
              </>
            )}
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            🔥 HIỆU ỨNG LUYỆN DƯỢC GỌN GÀNG TRONG KHUNG VẠC (KHÔNG CHE TOÀN MÀN HÌNH)
           ═══════════════════════════════════════════════════════════════════════ */}
        {brewStage && (
          <div className="absolute inset-0 z-30 bg-gradient-to-br from-emerald-50/98 via-teal-50/98 to-emerald-100/98 backdrop-blur-md p-4 sm:p-5 flex flex-col justify-between text-center select-none animate-fade-in text-emerald-950">
            {/* Vòng hào quang xoay nền */}
            <div className="absolute -inset-10 bg-[conic-gradient(from_0deg,transparent,rgba(16,185,129,0.15),transparent,rgba(20,184,166,0.15),transparent)] animate-sunburst pointer-events-none" />

            <div className="relative z-10">
              <div className="text-[11px] font-black uppercase tracking-widest text-emerald-700 mb-0.5">
                {brewStage === "dropping" && "🌿 Giai đoạn 1 / 3 — Hội Tụ Linh Dược"}
                {brewStage === "stirring" && "🥄 Giai đoạn 2 / 3 — Khuấy Đều Linh Dịch"}
                {brewStage === "finished" && "✨ Hoàn Tất Luyện Dược Irminsul ✨"}
                {brewStage === "error" && "⚠️ Luyện Dược Gián Đoạn"}
              </div>
              <h4 className="text-base sm:text-lg font-black text-emerald-950">
                {brewStage === "dropping" && "Nguyên liệu đang bay vào Vạc..."}
                {brewStage === "stirring" && "Cái muôi đang khuấy luyện thuốc..."}
                {brewStage === "finished" && "Chế Tạo Linh Dược Thành Công!"}
                {brewStage === "error" && "Không thể hoàn tất chế tạo"}
              </h4>
            </div>

            {/* Sân khấu vạc thuốc & hiệu ứng */}
            <div className="relative z-10 w-full h-48 flex items-center justify-center my-auto">
              {/* 5 Nguyên liệu bay vòng cung vào miệng vạc */}
              {brewStage === "dropping" &&
                materials.map((mat, idx) => {
                  const startX = (idx - 2) * 44;
                  return (
                    <div
                      key={mat.id}
                      className="cauldron-ingredient-drop absolute z-30"
                      style={{
                        "--start-x": `${startX}px`,
                        animationDelay: `${idx * 0.16}s`,
                      }}
                    >
                      <RpgItemIcon itemId={mat.id} size="sm" showBadge={false} />
                    </div>
                  );
                })}

              {/* Vạc và muôi xoay */}
              <div
                className={`transition-all duration-500 ${
                  brewStage === "finished" ? "scale-75 opacity-25 translate-y-6 blur-[1px]" : "scale-95 opacity-100"
                }`}
              >
                <WitchCauldronIllustration stage={brewStage} />
              </div>

              {/* Bình thuốc xuất thế */}
              {brewStage === "finished" && (
                <div className="cauldron-potion-emerge absolute inset-0 z-40 flex flex-col items-center justify-center">
                  <div className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-emerald-400/30 via-teal-300/30 to-amber-300/30 blur-lg animate-pulse" />
                  <div className="relative p-2.5 rounded-2xl bg-gradient-to-br from-emerald-100 via-teal-50 to-white border-2 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                    <RpgItemIcon itemId={brewedPotionId} size="lg" className="w-20 h-20 rounded-2xl" />
                  </div>
                  <span className="mt-2.5 px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-lg">
                    +1 {ITEM_DETAILS[brewedPotionId]?.name}
                  </span>
                </div>
              )}
            </div>

            {/* Chân trang / Nút xác nhận */}
            <div className="relative z-10 w-full">
              {brewStage === "finished" ? (
                <div className="space-y-2 animate-fade-in">
                  <p className="text-xs text-emerald-800 font-semibold">
                    {ITEM_DETAILS[brewedPotionId]?.desc} Đã cất vào Hành trang!
                  </p>
                  <button
                    type="button"
                    onClick={handleConfirmBrewDone}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LuCheck className="w-5 h-5 stroke-[3]" />
                    <span>Xác Nhận Đã Chế Xong</span>
                  </button>
                </div>
              ) : brewStage === "error" ? (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-xs font-bold text-rose-800">
                    {brewErrorText}
                  </div>
                  <button
                    type="button"
                    onClick={handleConfirmBrewDone}
                    className="w-full py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs"
                  >
                    Đóng
                  </button>
                </div>
              ) : (
                <p className="text-xs text-emerald-800 font-bold animate-pulse pb-2">
                  {brewStage === "dropping"
                    ? "5 tinh hoa thiên địa đang hòa quyện vào dòng chảy giả kim..."
                    : "Cái muôi ma thuật đang khuấy đều linh dịch..."}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes cauldronDrop {
          0% {
            opacity: 0;
            transform: translate(var(--start-x, 0px), -95px) scale(0.75) rotate(-15deg);
          }
          25% {
            opacity: 1;
            transform: translate(calc(var(--start-x, 0px) * 0.65), -115px) scale(1.08) rotate(8deg);
          }
          85% {
            opacity: 1;
            transform: translate(0px, -12px) scale(0.65) rotate(180deg);
          }
          100% {
            opacity: 0;
            transform: translate(0px, 8px) scale(0.2) rotate(240deg);
          }
        }
        .cauldron-ingredient-drop {
          animation: cauldronDrop 0.85s cubic-bezier(0.45, 0, 0.55, 1) forwards;
        }

        @keyframes ladleStir {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          25% { transform: translate(-22px, 4px) rotate(-18deg); }
          50% { transform: translate(0px, 8px) rotate(0deg); }
          75% { transform: translate(22px, 4px) rotate(18deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        .cauldron-ladle-stir {
          transform-origin: 110px 76px;
          animation: ladleStir 0.55s ease-in-out infinite;
        }
        .cauldron-ladle-idle {
          transform-origin: 110px 76px;
          transition: transform 0.3s ease;
        }

        @keyframes potShake {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-1.5deg) scale(1.02); }
          75% { transform: rotate(1.5deg) scale(1.02); }
        }
        .cauldron-pot-shake {
          animation: potShake 0.45s ease-in-out infinite;
        }

        @keyframes bubbleRise {
          0% { opacity: 0; transform: translateY(45px) scale(0.4); }
          40% { opacity: 0.95; }
          100% { opacity: 0; transform: translateY(-25px) scale(1.25); }
        }
        .cauldron-bubble {
          position: absolute;
          animation: bubbleRise 1.6s ease-out infinite;
        }

        @keyframes potionEmerge {
          0% {
            opacity: 0;
            transform: translateY(55px) scale(0.2) rotate(-12deg);
          }
          65% {
            opacity: 1;
            transform: translateY(-12px) scale(1.12) rotate(4deg);
          }
          85% {
            transform: translateY(4px) scale(0.96) rotate(-2deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0px) scale(1) rotate(0deg);
          }
        }
        .cauldron-potion-emerge {
          animation: potionEmerge 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Inventory;
