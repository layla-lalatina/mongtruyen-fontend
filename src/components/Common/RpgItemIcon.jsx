/**
 * 🌳 SYSTEM: IRMINSUL FANTASY RPG - ITEM ARTWORK ICON BADGE
 * ==========================================================
 * Sử dụng bộ ảnh vật phẩm RPG lưu cục bộ tại /Images/items/materials/ và /Images/items/potions/
 * kết hợp khung phẩm chất (Rarity Frame) phong cách Genshin / RPG.
 */

import React, { useState } from "react";
import {
  GiLeafSwirl,
  GiCloverSpiked,
  GiSpottedMushroom,
  GiFallingStar,
  GiDropletSplash,
  GiCrystalCluster,
  GiVial,
  GiRoundBottomFlask,
  GiStandingPotion,
  GiBubblingFlask,
  GiFizzingFlask,
  GiPotionBall,
  GiHealthPotion,
  GiMagicPotion,
  GiSpiralBottle,
  GiHeartBottle,
  GiBottleVapors,
  GiPotionOfMadness,
  GiCrystalShine,
  GiCauldron,
  GiChest,
} from "react-icons/gi";
import { API_BASE_URL } from "../../../config";

export const RPG_ITEM_VISUALS = {
  world_tree_leaf: {
    name: "Lá Cây Thế Giới",
    rarity: "divine",
    imagePath: "/Images/items/materials/world_tree_leaf.png",
    Icon: GiLeafSwirl,
    bgGradient: "from-emerald-500 via-teal-500 to-green-700",
    ringColor: "ring-emerald-300/70 border-emerald-200/80",
    iconColor: "text-emerald-50 drop-shadow-[0_2px_6px_rgba(16,185,129,0.9)]",
    glowColor: "bg-emerald-300/35",
    badge: "SSR",
  },
  material_sun_clover: {
    name: "Cỏ Ba Lá Mặt Trời",
    rarity: "rare",
    imagePath: "/Images/items/materials/material_sun_clover.png",
    Icon: GiCloverSpiked,
    bgGradient: "from-amber-400 via-orange-500 to-yellow-600",
    ringColor: "ring-amber-300/70 border-amber-200/80",
    iconColor: "text-amber-50 drop-shadow-[0_2px_6px_rgba(245,158,11,0.9)]",
    glowColor: "bg-amber-300/35",
  },
  material_moon_mushroom: {
    name: "Nấm Trăng Tròn",
    rarity: "rare",
    imagePath: "/Images/items/materials/material_moon_mushroom.png",
    Icon: GiSpottedMushroom,
    bgGradient: "from-indigo-500 via-blue-600 to-slate-800",
    ringColor: "ring-indigo-300/70 border-indigo-200/80",
    iconColor: "text-indigo-50 drop-shadow-[0_2px_6px_rgba(99,102,241,0.9)]",
    glowColor: "bg-indigo-300/35",
  },
  material_star_dust: {
    name: "Bột Bụi Sao",
    rarity: "epic",
    imagePath: "/Images/items/materials/material_star_dust.png",
    Icon: GiFallingStar,
    bgGradient: "from-fuchsia-500 via-purple-600 to-indigo-800",
    ringColor: "ring-fuchsia-300/70 border-fuchsia-200/80",
    iconColor: "text-fuchsia-50 drop-shadow-[0_2px_6px_rgba(217,70,239,0.9)]",
    glowColor: "bg-fuchsia-300/35",
  },
  material_dream_drop: {
    name: "Giọt Nước Ước Mơ",
    rarity: "rare",
    imagePath: "/Images/items/materials/material_dream_drop.png",
    Icon: GiDropletSplash,
    bgGradient: "from-cyan-400 via-sky-500 to-blue-700",
    ringColor: "ring-cyan-300/70 border-cyan-200/80",
    iconColor: "text-cyan-50 drop-shadow-[0_2px_6px_rgba(6,182,212,0.9)]",
    glowColor: "bg-cyan-300/35",
  },
  material_memory_crystal: {
    name: "Pha Lê Ký Ức",
    rarity: "epic",
    imagePath: "/Images/items/materials/material_memory_crystal.png",
    Icon: GiCrystalCluster,
    bgGradient: "from-teal-400 via-emerald-500 to-cyan-700",
    ringColor: "ring-teal-200/80 border-teal-100/80",
    iconColor: "text-teal-50 drop-shadow-[0_2px_6px_rgba(20,184,166,0.9)]",
    glowColor: "bg-teal-300/35",
  },

  // 12 Bậc Thuốc Phù Thủy với ảnh bình giả kim lưu tại /Images/items/potions/
  witch_potion_t1: {
    name: "Thuốc Phù Thủy Bậc 1",
    imagePath: "/Images/items/potions/witch_potion_t1.png",
    Icon: GiVial,
    bgGradient: "from-emerald-500 via-teal-600 to-slate-800",
    ringColor: "ring-emerald-300/60 border-emerald-200/70",
    iconColor: "text-emerald-100 drop-shadow-[0_2px_5px_rgba(16,185,129,0.85)]",
    glowColor: "bg-emerald-300/30",
    badge: "T1",
  },
  witch_potion_t2: {
    name: "Thuốc Phù Thủy Bậc 2",
    imagePath: "/Images/items/potions/witch_potion_t2.png",
    Icon: GiRoundBottomFlask,
    bgGradient: "from-teal-500 via-cyan-600 to-slate-800",
    ringColor: "ring-cyan-300/60 border-cyan-200/70",
    iconColor: "text-cyan-100 drop-shadow-[0_2px_5px_rgba(6,182,212,0.85)]",
    glowColor: "bg-cyan-300/30",
    badge: "T2",
  },
  witch_potion_t3: {
    name: "Thuốc Phù Thủy Bậc 3",
    imagePath: "/Images/items/potions/witch_potion_t3.png",
    Icon: GiStandingPotion,
    bgGradient: "from-sky-500 via-blue-600 to-indigo-900",
    ringColor: "ring-sky-300/60 border-sky-200/70",
    iconColor: "text-sky-100 drop-shadow-[0_2px_5px_rgba(14,165,233,0.85)]",
    glowColor: "bg-sky-300/30",
    badge: "T3",
  },
  witch_potion_t4: {
    name: "Thuốc Phù Thủy Bậc 4",
    imagePath: "/Images/items/potions/witch_potion_t4.png",
    Icon: GiBubblingFlask,
    bgGradient: "from-indigo-500 via-violet-600 to-slate-900",
    ringColor: "ring-indigo-300/60 border-indigo-200/70",
    iconColor: "text-indigo-100 drop-shadow-[0_2px_5px_rgba(99,102,241,0.85)]",
    glowColor: "bg-indigo-300/30",
    badge: "T4",
  },
  witch_potion_t5: {
    name: "Thuốc Phù Thủy Bậc 5",
    imagePath: "/Images/items/potions/witch_potion_t5.png",
    Icon: GiFizzingFlask,
    bgGradient: "from-violet-500 via-purple-600 to-indigo-950",
    ringColor: "ring-violet-300/70 border-violet-200/75",
    iconColor: "text-violet-100 drop-shadow-[0_2px_6px_rgba(139,92,246,0.9)]",
    glowColor: "bg-violet-300/35",
    badge: "T5",
  },
  witch_potion_t6: {
    name: "Thuốc Phù Thủy Bậc 6",
    imagePath: "/Images/items/potions/witch_potion_t6.png",
    Icon: GiPotionBall,
    bgGradient: "from-purple-500 via-fuchsia-600 to-purple-950",
    ringColor: "ring-fuchsia-300/70 border-fuchsia-200/75",
    iconColor: "text-fuchsia-100 drop-shadow-[0_2px_6px_rgba(217,70,239,0.9)]",
    glowColor: "bg-fuchsia-300/35",
    badge: "T6",
  },
  witch_potion_t7: {
    name: "Thuốc Phù Thủy Bậc 7",
    imagePath: "/Images/items/potions/witch_potion_t7.png",
    Icon: GiHealthPotion,
    bgGradient: "from-rose-500 via-pink-600 to-rose-950",
    ringColor: "ring-rose-300/70 border-rose-200/75",
    iconColor: "text-rose-100 drop-shadow-[0_2px_6px_rgba(244,63,94,0.9)]",
    glowColor: "bg-rose-300/35",
    badge: "T7",
  },
  witch_potion_t8: {
    name: "Thuốc Phù Thủy Bậc 8",
    imagePath: "/Images/items/potions/witch_potion_t8.png",
    Icon: GiMagicPotion,
    bgGradient: "from-orange-500 via-red-600 to-amber-950",
    ringColor: "ring-orange-300/70 border-orange-200/75",
    iconColor: "text-orange-100 drop-shadow-[0_2px_6px_rgba(249,115,22,0.9)]",
    glowColor: "bg-orange-300/35",
    badge: "T8",
  },
  witch_potion_t9: {
    name: "Thuốc Phù Thủy Bậc 9",
    imagePath: "/Images/items/potions/witch_potion_t9.png",
    Icon: GiSpiralBottle,
    bgGradient: "from-amber-400 via-orange-500 to-red-900",
    ringColor: "ring-amber-300/80 border-amber-200/80",
    iconColor: "text-amber-50 drop-shadow-[0_2px_6px_rgba(245,158,11,0.95)]",
    glowColor: "bg-amber-300/40",
    badge: "T9",
  },
  witch_potion_t10: {
    name: "Thuốc Phù Thủy Bậc 10",
    imagePath: "/Images/items/potions/witch_potion_t10.png",
    Icon: GiHeartBottle,
    bgGradient: "from-yellow-400 via-amber-500 to-purple-900",
    ringColor: "ring-yellow-200/80 border-yellow-100/85",
    iconColor: "text-yellow-50 drop-shadow-[0_2px_8px_rgba(250,204,21,0.95)]",
    glowColor: "bg-yellow-300/40",
    badge: "T10",
  },
  witch_potion_t11: {
    name: "Thuốc Phù Thủy Bậc 11",
    imagePath: "/Images/items/potions/witch_potion_t11.png",
    Icon: GiBottleVapors,
    bgGradient: "from-emerald-400 via-cyan-500 to-indigo-900",
    ringColor: "ring-emerald-200/85 border-cyan-100/85",
    iconColor: "text-white drop-shadow-[0_2px_8px_rgba(52,211,153,0.95)]",
    glowColor: "bg-emerald-300/45",
    badge: "T11",
  },
  witch_potion_t12: {
    name: "Thuốc Phù Thủy Bậc 12",
    imagePath: "/Images/items/potions/witch_potion_t12.png",
    Icon: GiPotionOfMadness,
    bgGradient: "from-amber-300 via-emerald-500 to-fuchsia-700",
    ringColor: "ring-amber-200/90 border-white/80",
    iconColor: "text-white drop-shadow-[0_2px_10px_rgba(253,224,71,1)]",
    glowColor: "bg-amber-200/50",
    badge: "T12",
  },
};

const SIZE_MAP = {
  xs: { box: "w-7 h-7 rounded-lg", icon: "w-5 h-5", badge: "text-[8px] px-1" },
  sm: { box: "w-9 h-9 rounded-xl", icon: "w-7 h-7", badge: "text-[9px] px-1" },
  md: { box: "w-12 h-12 rounded-2xl", icon: "w-9 h-9", badge: "text-[9px] px-1.5" },
  lg: { box: "w-14 h-14 rounded-2xl", icon: "w-11 h-11", badge: "text-[10px] px-1.5" },
};

const RpgItemIcon = ({ itemId, size = "md", imageUrl, showBadge = true, className = "" }) => {
  const [imgErr, setImgErr] = useState(false);
  const cfg = RPG_ITEM_VISUALS[itemId] || {
    Icon: GiChest,
    imagePath: "/Images/items/materials/material_memory_crystal.png",
    bgGradient: "from-emerald-500 to-teal-700",
    ringColor: "ring-emerald-300/60 border-emerald-200/70",
    iconColor: "text-white",
    glowColor: "bg-emerald-300/30",
  };
  const sz = SIZE_MAP[size] || SIZE_MAP.md;
  const IconComp = cfg.Icon;
  const resolvedSrc = imageUrl || (cfg.imagePath ? `${API_BASE_URL}${cfg.imagePath}?v=2` : null);

  return (
    <div
      className={`relative shrink-0 inline-flex items-center justify-center bg-gradient-to-br ${cfg.bgGradient} border ${cfg.ringColor} ring-1 shadow-md overflow-hidden select-none ${sz.box} ${className}`}
    >
      {/* Hào quang tâm */}
      <div className={`absolute inset-1 rounded-full blur-md pointer-events-none ${cfg.glowColor}`} />
      {/* Đường viền sáng góc trên */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/15 via-transparent to-white/25 pointer-events-none" />

      {resolvedSrc && !imgErr ? (
        <img
          src={resolvedSrc}
          alt={cfg.name || itemId}
          onError={() => setImgErr(true)}
          className={`relative z-10 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)] ${sz.icon}`}
        />
      ) : (
        <IconComp className={`relative z-10 ${sz.icon} ${cfg.iconColor}`} />
      )}

      {showBadge && cfg.badge && (
        <span
          className={`absolute bottom-0.5 right-0.5 z-20 font-black leading-none rounded bg-slate-950/80 text-amber-300 border border-amber-300/40 ${sz.badge}`}
        >
          {cfg.badge}
        </span>
      )}
    </div>
  );
};

export const CrystalGemIcon = ({ className = "w-4 h-4 text-cyan-500" }) => {
  const [err, setErr] = useState(false);
  if (err) return <GiCrystalShine className={className} />;
  return (
    <img
      src={`${API_BASE_URL}/Images/items/materials/word_crystal.png?v=2`}
      alt="Tinh Thạch"
      onError={() => setErr(true)}
      className={`inline-block object-contain shrink-0 ${className}`}
    />
  );
};

export const AlchemyCauldronIcon = ({ className = "w-6 h-6 text-emerald-300" }) => {
  const [err, setErr] = useState(false);
  if (err) return <GiCauldron className={className} />;
  return (
    <img
      src={`${API_BASE_URL}/Images/items/materials/alchemy_cauldron.png?v=2`}
      alt="Vạc Giả Kim"
      onError={() => setErr(true)}
      className={`inline-block object-contain shrink-0 ${className}`}
    />
  );
};

export default RpgItemIcon;
