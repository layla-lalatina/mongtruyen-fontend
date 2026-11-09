import React from "react";

/**
 * 👑 FANTASY RPG AVATAR FRAMES (Itch.io / Freepik / Vecteezy High-Fantasy Style)
 * 5 Tiers:
 * 1. frame_wood (Khung Linh Mộc Sơ Khởi) - Gỗ cổ thụ, dây leo xanh, lá thần thụ
 * 2. frame_silver (Khung Bạc Tinh Quang) - Bạc ròng chạm khắc phù văn, ngọc lam bảo
 * 3. frame_gold (Khung Hoàng Kim Linh Mộc) - Hoàng kim hoàng gia, cánh phượng, hồng ngọc
 * 4. frame_diamond (Khung Kim Cương Tinh Hà) - Tinh thể kim cương vũ trụ, sao băng tinh tú
 * 5. frame_dragon (Khung Rồng Quấn Thần Thoại) - Chân long thái sơ cuộn quanh viền, đầu rồng uy vũ
 */

export const FRAME_CONFIGS = {
  frame_wood: {
    id: 1,
    key: "frame_wood",
    name: "Khung Linh Mộc Sơ Khởi",
    rarity: "Phổ Biến",
    price: 50,
  },
  frame_silver: {
    id: 2,
    key: "frame_silver",
    name: "Khung Bạc Tinh Quang",
    rarity: "Hiếm",
    price: 200,
  },
  frame_gold: {
    id: 3,
    key: "frame_gold",
    name: "Khung Hoàng Kim Linh Mộc",
    rarity: "Sử Thi",
    price: 500,
  },
  frame_diamond: {
    id: 9,
    key: "frame_diamond",
    name: "Khung Kim Cương Tinh Hà",
    rarity: "Truyền Thuyết",
    price: 800,
  },
  frame_dragon: {
    id: 10,
    key: "frame_dragon",
    name: "Khung Rồng Quấn Thần Thoại",
    rarity: "Thần Thoại",
    price: 1500,
  },
};

export const normalizeFrameKey = (frameInput) => {
  if (!frameInput) return null;
  if (typeof frameInput === "string") {
    if (FRAME_CONFIGS[frameInput]) return frameInput;
    if (frameInput.includes("wood") || frameInput === "1") return "frame_wood";
    if (frameInput.includes("silver") || frameInput === "2") return "frame_silver";
    if (frameInput.includes("gold") || frameInput === "3") return "frame_gold";
    if (frameInput.includes("diamond") || frameInput === "9") return "frame_diamond";
    if (frameInput.includes("dragon") || frameInput === "10") return "frame_dragon";
    return frameInput;
  }
  if (typeof frameInput === "number") {
    if (frameInput === 1) return "frame_wood";
    if (frameInput === 2) return "frame_silver";
    if (frameInput === 3) return "frame_gold";
    if (frameInput === 9) return "frame_diamond";
    if (frameInput === 10) return "frame_dragon";
  }
  if (typeof frameInput === "object") {
    const key = frameInput.assetResource || frameInput.key || frameInput.id;
    return normalizeFrameKey(key);
  }
  return null;
};

export const AvatarFrameSvg = ({ frameKey }) => {
  const normKey = normalizeFrameKey(frameKey);
  if (!normKey) return null;

  switch (normKey) {
    // 🌿 BẬC 1: KHUNG LINH MỘC SƠ KHỞI (Fantasy Forest Wood & Ivy)
    case "frame_wood":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-[0_2px_8px_rgba(16,185,129,0.35)]">
          <defs>
            <linearGradient id="woodBarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#854d0e" />
              <stop offset="35%" stopColor="#b45309" />
              <stop offset="70%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
            <linearGradient id="ivyLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <filter id="woodGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#059669" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Vòng gỗ nền chính */}
          <circle cx="50" cy="50" r="43.5" fill="none" stroke="url(#woodBarkGrad)" strokeWidth="4.5" />
          <circle cx="50" cy="50" r="45.5" fill="none" stroke="#451a03" strokeWidth="0.8" opacity="0.6" />
          <circle cx="50" cy="50" r="41.2" fill="none" stroke="#78350f" strokeWidth="0.8" />

          {/* Dây leo quấn quanh vòng gỗ */}
          <path
            d="M 50,6 A 44,44 0 0,1 94,50 A 44,44 0 0,1 50,94 A 44,44 0 0,1 6,50 A 44,44 0 0,1 50,6"
            fill="none"
            stroke="#059669"
            strokeWidth="1.8"
            strokeDasharray="18 10"
            strokeLinecap="round"
          />

          {/* Cụm lá & mầm thần thụ đỉnh (12h) */}
          <g transform="translate(50, 6) scale(0.9)" filter="url(#woodGlow)">
            <ellipse cx="0" cy="0" rx="4" ry="2" fill="#fef08a" />
            <path d="M 0,-6 C -4,-1 -4,3 0,4 C 4,3 4,-1 0,-6 Z" fill="url(#ivyLeafGrad)" />
            <path d="M -5,-3 C -8,0 -7,4 -3,4 C 0,4 -1,0 -5,-3 Z" fill="url(#ivyLeafGrad)" />
            <path d="M 5,-3 C 8,0 7,4 3,4 C 0,4 1,0 5,-3 Z" fill="url(#ivyLeafGrad)" />
            <circle cx="0" cy="0" r="1.5" fill="#fde047" />
          </g>

          {/* Cụm lá đáy (6h) */}
          <g transform="translate(50, 94) scale(0.85)">
            <path d="M 0,6 C -4,1 -4,-3 0,-4 C 4,-3 4,1 0,6 Z" fill="url(#ivyLeafGrad)" />
            <path d="M -4,3 C -7,0 -6,-3 -2,-3 C 0,-3 0,0 -4,3 Z" fill="url(#ivyLeafGrad)" />
            <path d="M 4,3 C 7,0 6,-3 2,-3 C 0,-3 0,0 4,3 Z" fill="url(#ivyLeafGrad)" />
          </g>

          {/* Lá điểm xuyết mạn sườn trái & phải */}
          <g transform="translate(6, 50) rotate(-90) scale(0.7)">
            <path d="M 0,-5 C -3,-1 -3,2 0,3 C 3,2 3,-1 0,-5 Z" fill="url(#ivyLeafGrad)" />
          </g>
          <g transform="translate(94, 50) rotate(90) scale(0.7)">
            <path d="M 0,-5 C -3,-1 -3,2 0,3 C 3,2 3,-1 0,-5 Z" fill="url(#ivyLeafGrad)" />
          </g>

          {/* Bụi phấn tiên linh lấp lánh */}
          <circle cx="28" cy="14" r="1" fill="#fef08a" opacity="0.8" />
          <circle cx="72" cy="14" r="1.2" fill="#a7f3d0" opacity="0.9" />
          <circle cx="16" cy="74" r="1" fill="#6ee7b7" opacity="0.8" />
          <circle cx="84" cy="74" r="1.1" fill="#fef08a" opacity="0.9" />
        </svg>
      );

    // ⚔️ BẬC 2: KHUNG BẠC TINH QUANG (Elven Ornate Silver & Rune Gem)
    case "frame_silver":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-[0_2px_10px_rgba(56,189,248,0.4)]">
          <defs>
            <linearGradient id="silverRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#64748b" />
              <stop offset="75%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="blueGemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="40%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <filter id="silverGemGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#38bdf8" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Vòng bạc kép thanh lịch */}
          <circle cx="50" cy="50" r="44" fill="none" stroke="url(#silverRingGrad)" strokeWidth="3.5" />
          <circle cx="50" cy="50" r="41.5" fill="none" stroke="#94a3b8" strokeWidth="0.7" />
          <circle cx="50" cy="50" r="46.2" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />

          {/* Vòng phù văn cổ chạy quanh viền */}
          <circle cx="50" cy="50" r="43.8" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 5 8 5" opacity="0.6" />

          {/* 4 Khóa Ngọc Lam Bảo tại 4 phương (12h, 3h, 6h, 9h) */}
          {/* Đỉnh 12h */}
          <g transform="translate(50, 5)" filter="url(#silverGemGlow)">
            <path d="M -6,0 L 0,-6 L 6,0 L 0,6 Z" fill="url(#silverRingGrad)" stroke="#334155" strokeWidth="0.5" />
            <polygon points="0,-4 3,0 0,4 -3,0" fill="url(#blueGemGrad)" />
            <circle cx="0" cy="0" r="1" fill="#ffffff" />
          </g>

          {/* Đáy 6h */}
          <g transform="translate(50, 95)" filter="url(#silverGemGlow)">
            <path d="M -5,0 L 0,-5 L 5,0 L 0,5 Z" fill="url(#silverRingGrad)" stroke="#334155" strokeWidth="0.5" />
            <polygon points="0,-3 2.5,0 0,3 -2.5,0" fill="url(#blueGemGrad)" />
          </g>

          {/* Trái 9h */}
          <g transform="translate(5, 50)" filter="url(#silverGemGlow)">
            <path d="M 0,-5 L 5,0 L 0,5 L -5,0 Z" fill="url(#silverRingGrad)" stroke="#334155" strokeWidth="0.5" />
            <polygon points="-3,0 0,-2.5 3,0 0,2.5" fill="url(#blueGemGrad)" />
          </g>

          {/* Phải 3h */}
          <g transform="translate(95, 50)" filter="url(#silverGemGlow)">
            <path d="M 0,-5 L 5,0 L 0,5 L -5,0 Z" fill="url(#silverRingGrad)" stroke="#334155" strokeWidth="0.5" />
            <polygon points="-3,0 0,-2.5 3,0 0,2.5" fill="url(#blueGemGrad)" />
          </g>

          {/* Chốt cánh hoa tuyết 4 góc chéo */}
          <circle cx="19" cy="19" r="1.5" fill="#e2e8f0" stroke="#0ea5e9" strokeWidth="0.6" />
          <circle cx="81" cy="19" r="1.5" fill="#e2e8f0" stroke="#0ea5e9" strokeWidth="0.6" />
          <circle cx="19" cy="81" r="1.5" fill="#e2e8f0" stroke="#0ea5e9" strokeWidth="0.6" />
          <circle cx="81" cy="81" r="1.5" fill="#e2e8f0" stroke="#0ea5e9" strokeWidth="0.6" />
        </svg>
      );

    // 👑 BẬC 3: KHUNG HOÀNG KIM LINH MỘC (Royal Gold & Phoenix Wings)
    case "frame_gold":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-[0_4px_12px_rgba(245,158,11,0.45)]">
          <defs>
            <linearGradient id="goldMetallicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="25%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#b45309" />
              <stop offset="75%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="rubyGemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="40%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
            <filter id="goldShine" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodColor="#f59e0b" floodOpacity="0.7" />
            </filter>
          </defs>

          {/* Vòng viền vàng hoàng kim dập nổi */}
          <circle cx="50" cy="50" r="44" fill="none" stroke="url(#goldMetallicGrad)" strokeWidth="4.5" />
          <circle cx="50" cy="50" r="46.5" fill="none" stroke="#fef08a" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="41.5" fill="none" stroke="#78350f" strokeWidth="1" />

          {/* Vành hoa văn Baroque xoắn hạt ngọc */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="#fef08a"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            strokeLinecap="round"
          />

          {/* Vương miện cánh vàng đỉnh (12h) */}
          <g transform="translate(50, 4)" filter="url(#goldShine)">
            {/* Cánh phượng trái */}
            <path
              d="M 0,2 C -6,-4 -14,-3 -18,-7 C -14,-1 -10,3 -2,4 Z"
              fill="url(#goldMetallicGrad)"
              stroke="#78350f"
              strokeWidth="0.5"
            />
            {/* Cánh phượng phải */}
            <path
              d="M 0,2 C 6,-4 14,-3 18,-7 C 14,-1 10,3 2,4 Z"
              fill="url(#goldMetallicGrad)"
              stroke="#78350f"
              strokeWidth="0.5"
            />
            {/* Đỉnh vương miện */}
            <path
              d="M 0,-8 L 3,-2 L 7,-3 L 4,2 L 0,1 L -4,2 L -7,-3 L -3,-2 Z"
              fill="url(#goldMetallicGrad)"
              stroke="#78350f"
              strokeWidth="0.6"
            />
            {/* Viên Hồng Ngọc hoàng gia ngự giữa đỉnh */}
            <polygon points="0,-4 3,0 0,4 -3,0" fill="url(#rubyGemGrad)" stroke="#fef08a" strokeWidth="0.6" />
            <circle cx="-0.8" cy="-1" r="0.8" fill="#ffffff" opacity="0.9" />
          </g>

          {/* Họa tiết hoa văn đế đáy (6h) */}
          <g transform="translate(50, 96)" filter="url(#goldShine)">
            <path
              d="M -12,-1 C -8,5 0,6 0,6 C 0,6 8,5 12,-1 C 6,2 0,3 0,3 C 0,3 -6,2 -12,-1 Z"
              fill="url(#goldMetallicGrad)"
              stroke="#78350f"
              strokeWidth="0.5"
            />
            <circle cx="0" cy="4" r="2.2" fill="url(#rubyGemGrad)" stroke="#fef08a" strokeWidth="0.5" />
          </g>

          {/* Tai vách hoàng kim 2 bên */}
          <g transform="translate(4, 50)">
            <polygon points="0,-4 3,-1 2,4 -1,3" fill="url(#goldMetallicGrad)" />
          </g>
          <g transform="translate(96, 50)">
            <polygon points="0,-4 -3,-1 -2,4 1,3" fill="url(#goldMetallicGrad)" />
          </g>
        </svg>
      );

    // 💎 BẬC 4: KHUNG KIM CƯƠNG TINH HÀ (Celestial Astral Diamond)
    case "frame_diamond":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-[0_4px_16px_rgba(6,182,212,0.55)]">
          <defs>
            <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#a5f3fc" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="75%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="crystalShine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
            </linearGradient>
            <filter id="astralGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#38bdf8" floodOpacity="0.9" />
            </filter>
          </defs>

          {/* Vòng hào quang kim cương giác cắt lục lăng */}
          <circle cx="50" cy="50" r="44" fill="none" stroke="url(#diamondGrad)" strokeWidth="4.2" />
          <circle cx="50" cy="50" r="46.5" fill="none" stroke="#67e8f9" strokeWidth="0.9" opacity="0.8" />
          <circle cx="50" cy="50" r="41.6" fill="none" stroke="#0369a1" strokeWidth="0.9" />

          {/* Vòng chòm sao tinh tú */}
          <circle cx="50" cy="50" r="44" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="1 7" strokeLinecap="round" opacity="0.9" />

          {/* Ngôi sao Bắc Đẩu 8 cánh lộng lẫy đỉnh đầu (12h) */}
          <g transform="translate(50, 4)" filter="url(#astralGlow)">
            {/* Tinh thể kim cương chính */}
            <polygon points="0,-8 2.5,-2 8,0 2.5,2 0,8 -2.5,2 -8,0 -2.5,-2" fill="url(#diamondGrad)" />
            <polygon points="0,-5 1.5,-1 5,0 1.5,1 0,5 -1.5,1 -5,0 -1.5,-1" fill="#ffffff" />
            {/* Tia sáng chéo */}
            <line x1="-4" y1="-4" x2="4" y2="4" stroke="#ffffff" strokeWidth="0.7" opacity="0.8" />
            <line x1="4" y1="-4" x2="-4" y2="4" stroke="#ffffff" strokeWidth="0.7" opacity="0.8" />
          </g>

          {/* Tinh thể pha lê sắc cạnh mạn sườn trái & phải */}
          <g transform="translate(5, 50)" filter="url(#astralGlow)">
            <polygon points="0,-5 4,0 0,5 -4,0" fill="url(#diamondGrad)" />
            <polygon points="0,-3 2,0 0,3 -2,0" fill="#ffffff" />
          </g>
          <g transform="translate(95, 50)" filter="url(#astralGlow)">
            <polygon points="0,-5 4,0 0,5 -4,0" fill="url(#diamondGrad)" />
            <polygon points="0,-3 2,0 0,3 -2,0" fill="#ffffff" />
          </g>

          {/* Tinh thể đáy 6h */}
          <g transform="translate(50, 96)" filter="url(#astralGlow)">
            <polygon points="0,-4 3,0 0,4 -3,0" fill="url(#diamondGrad)" />
          </g>

          {/* Tinh cầu lơ lửng xung quanh */}
          <circle cx="20" cy="20" r="1.3" fill="#ffffff" opacity="0.9" />
          <circle cx="80" cy="20" r="1.3" fill="#a5f3fc" opacity="0.9" />
          <circle cx="18" cy="80" r="1.1" fill="#bae6fd" opacity="0.8" />
          <circle cx="82" cy="80" r="1.1" fill="#ffffff" opacity="0.8" />
        </svg>
      );

    // 🐉 BẬC 5: KHUNG RỒNG QUẤN THẦN THOẠI (Mythic Coiled Dragon)
    case "frame_dragon":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-[0_4px_18px_rgba(239,68,68,0.55)]">
          <defs>
            <linearGradient id="dragonScaleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="25%" stopColor="#f97316" />
              <stop offset="55%" stopColor="#dc2626" />
              <stop offset="85%" stopColor="#991b1b" />
              <stop offset="100%" stopColor="#450a0a" />
            </linearGradient>
            <linearGradient id="dragonFireGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <filter id="dragonAura" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#f97316" floodOpacity="0.85" />
            </filter>
          </defs>

          {/* Vòng nền rực lửa thần thánh */}
          <circle cx="50" cy="50" r="44" fill="none" stroke="url(#dragonScaleGrad)" strokeWidth="5" />
          <circle cx="50" cy="50" r="47" fill="none" stroke="#fef08a" strokeWidth="0.9" opacity="0.8" />
          <circle cx="50" cy="50" r="41.2" fill="none" stroke="#7f1d1d" strokeWidth="1.2" />

          {/* Vảy Rồng dập nổi uốn lượn quanh viền tròn */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="#fef08a"
            strokeWidth="2.2"
            strokeDasharray="2.5 5.5"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* 🐉 ĐẦU THẦN LONG UY DŨNG NGỰ GÓC TRÊN BÊN TRÁI (10h - 12h) */}
          <g transform="translate(32, 5) scale(0.9)" filter="url(#dragonAura)">
            {/* Sừng Rồng Vàng vươn cao */}
            <path
              d="M -2,0 C -6,-8 -12,-11 -16,-13 C -13,-9 -8,-5 -3,-2 Z"
              fill="#fde047"
              stroke="#78350f"
              strokeWidth="0.6"
            />
            <path
              d="M 3,-2 C 8,-10 14,-13 18,-15 C 14,-10 9,-6 4,-2 Z"
              fill="#fef08a"
              stroke="#78350f"
              strokeWidth="0.6"
            />

            {/* Khối đầu & trán rồng */}
            <path
              d="M -8,2 C -10,-4 0,-7 6,-5 C 12,-3 14,3 12,8 C 10,13 3,14 -2,12 C -6,10 -8,6 -8,2 Z"
              fill="url(#dragonScaleGrad)"
              stroke="#450a0a"
              strokeWidth="0.7"
            />

            {/* Mõm rồng & hàm há rộng uy phong */}
            <path
              d="M 8,3 C 14,2 19,4 20,7 C 18,9 13,8 9,7 Z"
              fill="#f97316"
              stroke="#7f1d1d"
              strokeWidth="0.5"
            />

            {/* Râu rồng mềm mại bay lượn */}
            <path
              d="M 16,6 C 22,7 26,12 28,18"
              fill="none"
              stroke="#fef08a"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <path
              d="M 12,8 C 16,13 17,20 18,25"
              fill="none"
              stroke="#fde047"
              strokeWidth="0.8"
              strokeLinecap="round"
            />

            {/* Mắt Rồng Thần Thoại đỏ rực phát sáng */}
            <ellipse cx="2" cy="1" rx="2.5" ry="1.5" fill="#fef08a" />
            <polygon points="1,-0.5 3,1 1,1.8" fill="#dc2626" />
            <circle cx="2" cy="0.8" r="0.6" fill="#ffffff" />

            {/* Bờm lửa đỏ quấn quanh gáy rồng */}
            <path
              d="M -7,0 C -12,2 -16,8 -14,14 C -12,10 -8,6 -4,4 Z"
              fill="url(#dragonFireGrad)"
            />
          </g>

          {/* 爪 MÓNG VUỐT RỒNG BÁM VIỀN TẠI GÓC DƯỚI (5h) */}
          <g transform="translate(79, 78) rotate(45) scale(0.8)" filter="url(#dragonAura)">
            <path d="M 0,-4 L 3,4 L -3,4 Z" fill="#fde047" stroke="#78350f" strokeWidth="0.5" />
            <path d="M 4,-2 L 7,5 L 2,5 Z" fill="#fde047" stroke="#78350f" strokeWidth="0.5" />
            <path d="M -4,-2 L -2,5 L -7,5 Z" fill="#fde047" stroke="#78350f" strokeWidth="0.5" />
          </g>

          {/* ĐUÔI RỒNG QUẤN QUANH ĐÁY (6h - 7h) */}
          <g transform="translate(48, 95)" filter="url(#dragonAura)">
            <path
              d="M -15,0 C -8,5 4,5 12,1 C 8,4 -2,4 -10,1 Z"
              fill="url(#dragonScaleGrad)"
              stroke="#450a0a"
              strokeWidth="0.5"
            />
            {/* Lửa đuôi */}
            <polygon points="12,1 17,4 14,6 18,8 10,7" fill="url(#dragonFireGrad)" />
          </g>

          {/* Đốm linh hỏa cháy rực lơ lửng */}
          <circle cx="15" cy="40" r="1.3" fill="#fde047" opacity="0.9" />
          <circle cx="88" cy="35" r="1.5" fill="#f97316" opacity="0.9" />
          <circle cx="24" cy="78" r="1.2" fill="#ef4444" opacity="0.8" />
        </svg>
      );

    default:
      return null;
  }
};

/**
 * AvatarWithFrame component:
 * Bọc avatar người dùng và hiển thị Khung Viền đã trang bị bao quanh một cách chính xác.
 */
const AvatarWithFrame = ({
  avatarUrl,
  frameKey,
  size = "md", // "sm" (comments), "md" (shop preview), "lg" (profile main)
  alt = "Avatar",
  className = "",
  onClick,
}) => {
  const normKey = normalizeFrameKey(frameKey);

  // Kích thước chuẩn
  const sizeMap = {
    xs: "w-8 h-8",
    sm: "w-10 h-10 sm:w-11 sm:h-11",
    md: "w-16 h-16 sm:w-20 sm:h-20",
    lg: "w-32 h-32 sm:w-36 sm:h-36",
    xl: "w-40 h-40",
  };

  const containerSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${containerSize} ${className}`}
    >
      {/* Ảnh Avatar bên trong (Luôn tròn hoàn hảo) */}
      <img
        src={avatarUrl}
        alt={alt}
        className="rounded-full w-full h-full object-cover bg-emerald-950/20 border border-emerald-500/20 shadow-xs"
        onError={(e) => {
          e.target.src = "https://placehold.co/100x100?text=User";
        }}
      />

      {/* Lớp phủ Khung Viền Vector SVG (Vừa khít bao quanh viền tròn, không che mặt) */}
      {normKey && (
        <div className="absolute inset-[-14%] w-[128%] h-[128%] pointer-events-none z-10 flex items-center justify-center transition-all duration-300">
          <AvatarFrameSvg frameKey={normKey} />
        </div>
      )}
    </div>
  );
};

export default AvatarWithFrame;
