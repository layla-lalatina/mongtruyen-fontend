import React, { useState } from "react";
import axios from "axios";
import {
  LuStore,
  LuShoppingBag,
  LuSparkles,
  LuCheck,
  LuCrown,
  LuLayers,
  LuShield,
} from "react-icons/lu";
import { API_BASE_URL } from "../../../config";
import RpgItemIcon, { CrystalGemIcon } from "../Common/RpgItemIcon";
import AvatarWithFrame from "../Common/AvatarFrame";

const getAvatarUrl = (url) => {
  const s = String(url || "").toLowerCase();
  if (
    !url ||
    s.includes("dicebear.com") ||
    s.includes("robohash.org") ||
    s.includes("enka.network") ||
    s.includes("default_newbie.png")
  ) {
    return `${API_BASE_URL}/Images/avatars/default-avatar.png`;
  }
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

// 🌿 1. Danh mục Nguyên Liệu
const MATERIAL_ITEMS = [
  { id: "world_tree_leaf", category: "materials", name: "Lá Cây Thế Giới", desc: "Tăng +50% tỷ lệ thành công khi Đột phá Cảnh giới.", price: 100 },
  { id: "material_sun_clover", category: "materials", name: "Cỏ Ba Lá Mặt Trời", desc: "Nguyên liệu chế tạo Thuốc Phù Thủy.", price: 10 },
  { id: "material_moon_mushroom", category: "materials", name: "Nấm Trăng Tròn", desc: "Nguyên liệu chế tạo Thuốc Phù Thủy.", price: 10 },
  { id: "material_star_dust", category: "materials", name: "Bột Bụi Sao", desc: "Nguyên liệu chế tạo Thuốc Phù Thủy.", price: 10 },
  { id: "material_dream_drop", category: "materials", name: "Giọt Nước Ước Mơ", desc: "Nguyên liệu chế tạo Thuốc Phù Thủy.", price: 10 },
  { id: "material_memory_crystal", category: "materials", name: "Pha Lê Ký Ức", desc: "Nguyên liệu chế tạo Thuốc Phù Thủy.", price: 15 },
];

// 🧪 2. Danh mục Thuốc Phù Thủy
const POTION_ITEMS = [
  { id: "witch_potion_t1", category: "potions", name: "Thuốc Phù Thủy Bậc 1", desc: "Tăng +15% tỷ lệ Đột phá Cấp 20.", price: 50 },
  { id: "witch_potion_t2", category: "potions", name: "Thuốc Phù Thủy Bậc 2", desc: "Tăng +15% tỷ lệ Đột phá Cấp 40.", price: 75 },
  { id: "witch_potion_t3", category: "potions", name: "Thuốc Phù Thủy Bậc 3", desc: "Tăng +15% tỷ lệ Đột phá Cấp 60.", price: 100 },
  { id: "witch_potion_t4", category: "potions", name: "Thuốc Phù Thủy Bậc 4", desc: "Tăng +15% tỷ lệ Đột phá Cấp 80.", price: 150 },
  { id: "witch_potion_t5", category: "potions", name: "Thuốc Phù Thủy Bậc 5", desc: "Tăng +15% tỷ lệ Đột phá Cấp 100.", price: 200 },
  { id: "witch_potion_t6", category: "potions", name: "Thuốc Phù Thủy Bậc 6", desc: "Tăng +15% tỷ lệ Đột phá Cấp 120.", price: 300 },
  { id: "witch_potion_t7", category: "potions", name: "Thuốc Phù Thủy Bậc 7", desc: "Tăng +15% tỷ lệ Đột phá Cấp 140.", price: 400 },
  { id: "witch_potion_t8", category: "potions", name: "Thuốc Phù Thủy Bậc 8", desc: "Tăng +15% tỷ lệ Đột phá Cấp 160.", price: 500 },
  { id: "witch_potion_t9", category: "potions", name: "Thuốc Phù Thủy Bậc 9", desc: "Tăng +15% tỷ lệ Đột phá Cấp 180.", price: 600 },
  { id: "witch_potion_t10", category: "potions", name: "Thuốc Phù Thủy Bậc 10", desc: "Tăng +15% tỷ lệ Đột phá Cấp 200.", price: 700 },
  { id: "witch_potion_t11", category: "potions", name: "Thuốc Phù Thủy Bậc 11", desc: "Tăng +15% tỷ lệ Đột phá Cấp 250.", price: 800 },
  { id: "witch_potion_t12", category: "potions", name: "Thuốc Phù Thủy Bậc 12", desc: "Tăng +15% tỷ lệ Đột phá Cấp 300.", price: 1000 },
];

// 👑 3. Danh mục Danh Hiệu
const TITLE_ITEMS = [
  {
    id: 6,
    key: "title_scholar",
    category: "titles",
    name: "Học Giả Tri Thức",
    icon: "📚",
    desc: "Danh hiệu danh giá dành cho lữ khách thông tuệ say mê khám phá chân lý.",
    price: 100,
    badgeBg: "from-amber-400 via-yellow-500 to-orange-500 text-amber-950 border-yellow-200",
    titleClass: "shiny-gold-title",
  },
  {
    id: 11,
    key: "title_guardian",
    category: "titles",
    name: "Thủ Hộ Thần Mộc",
    icon: "🌿",
    desc: "Hộ vệ trung kiên của cội nguồn thần thụ Irminsul qua ngàn năm dâu bể.",
    price: 300,
    badgeBg: "from-emerald-600 via-teal-500 to-green-600 text-white border-emerald-200",
    titleClass: "shiny-gold-title",
  },
  {
    id: 12,
    key: "title_sage",
    category: "titles",
    name: "Hiền Giả Tinh Hà",
    icon: "🌌",
    desc: "Trí giả đắc đạo, ngưng tụ tinh hoa vạn thiên tinh tú dẫn dắt lữ khách.",
    price: 600,
    badgeBg: "from-sky-500 via-cyan-400 to-indigo-600 text-white border-cyan-100",
    titleClass: "shiny-diamond-title",
  },
  {
    id: 7,
    key: "title_irminsul_lord",
    category: "titles",
    name: "Chúa Tể Cây Thế Giới",
    icon: "🌳",
    desc: "Danh xưng tối thượng của người nắm giữ quy luật và vận mệnh Cây Thế Giới.",
    price: 1000,
    badgeBg: "from-emerald-700 via-teal-600 to-amber-500 text-white border-amber-300",
    titleClass: "shiny-mythic-title",
  },
  {
    id: 13,
    key: "title_dragon",
    category: "titles",
    name: "Rồng Quấn Thần Thoại",
    icon: "🐉",
    desc: "Khí tức chân long uy chấn vạn giới, chí tôn thần thoại giáng lâm.",
    price: 1500,
    badgeBg: "from-amber-500 via-rose-500 to-purple-600 text-white border-amber-200",
    titleClass: "shiny-mythic-title",
  },
];

// 🛡️ 4. Danh mục Khung Viền Avatar (Fantasy RPG UI Borders)
const FRAME_ITEMS = [
  {
    id: 1,
    key: "frame_wood",
    category: "frames",
    name: "Khung Linh Mộc Sơ Khởi",
    desc: "Khung viền chạm khắc từ linh mộc cổ thụ, dây leo xanh biếc và bụi phấn tiên thảo.",
    price: 50,
    rarity: "Phổ Biến",
    rarityColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  {
    id: 2,
    key: "frame_silver",
    category: "frames",
    name: "Khung Bạc Tinh Quang",
    desc: "Bạc ròng tôi luyện dưới ánh trăng, chạm khắc phù văn cổ ngữ và đính ngọc lam bảo.",
    price: 200,
    rarity: "Hiếm",
    rarityColor: "text-blue-700 bg-blue-50 border-blue-200",
  },
  {
    id: 3,
    key: "frame_gold",
    category: "frames",
    name: "Khung Hoàng Kim Linh Mộc",
    desc: "Hoàng kim đế vương uy nghiêm, hoa văn long phụng cẩm tú cùng hồng ngọc rực rỡ.",
    price: 500,
    rarity: "Sử Thi",
    rarityColor: "text-amber-800 bg-amber-50 border-amber-200",
  },
  {
    id: 9,
    key: "frame_diamond",
    category: "frames",
    name: "Khung Kim Cương Tinh Hà",
    desc: "Đúc từ tinh thể kim cương vũ trụ vĩnh cửu, ngưng tụ ánh sáng muôn ngàn tinh tú.",
    price: 800,
    rarity: "Truyền Thuyết",
    rarityColor: "text-cyan-800 bg-cyan-50 border-cyan-200",
  },
  {
    id: 10,
    key: "frame_dragon",
    category: "frames",
    name: "Khung Rồng Quấn Thần Thoại",
    desc: "Chân long cổ đại ngự trị, vảy rồng phát sáng thần uy cùng ngọn lửa thái sơ cuồn cuộn.",
    price: 1500,
    rarity: "Thần Thoại",
    rarityColor: "text-rose-800 bg-rose-50 border-rose-200",
  },
];

// Bộ lọc danh mục (Tất cả | Nguyên liệu | Thuốc | Khung viền | Danh hiệu)
const CATEGORY_TABS = [
  { id: "all", label: "Tất cả", icon: LuLayers, count: 28 },
  { id: "materials", label: "Nguyên liệu", icon: LuSparkles, count: 6 },
  { id: "potions", label: "Thuốc", icon: LuShoppingBag, count: 12 },
  { id: "frames", label: "Khung viền", icon: LuShield, count: 5 },
  { id: "titles", label: "Danh hiệu", icon: LuCrown, count: 5 },
];

const Shop = ({ user, profile, refetchProfile }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [buyingItemId, setBuyingItemId] = useState(null);
  const [equippingItemId, setEquippingItemId] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const userCrystals = profile?.worldCrystals ?? profile?.worldCrystal ?? 0;
  const userInventory = profile?.inventory || {};
  const ownedItemIds = profile?.ownedItemIds || [];
  const equippedTitleId = profile?.equippedTitle?.id;
  const equippedFrameId = profile?.equippedFrame?.id || profile?.equippedAvatarFrameId;

  const getQty = (itemId) => quantities[itemId] || 1;
  const setQty = (itemId, val) => {
    setQuantities((prev) => ({ ...prev, [itemId]: Math.max(1, val) }));
  };

  const showToast = (type, msg) => {
    if (type === "success") {
      setSuccessMsg(msg);
      setErrorMsg("");
      setTimeout(() => setSuccessMsg(""), 4500);
    } else {
      setErrorMsg(msg);
      setSuccessMsg("");
      setTimeout(() => setErrorMsg(""), 4500);
    }
  };

  // Mua vật phẩm (Nguyên liệu, Thuốc, Danh hiệu)
  const handleBuy = async (item) => {
    if (!user?.token) return;
    const isRpgItem = item.category === "materials" || item.category === "potions";
    const qty = isRpgItem ? getQty(item.id) : 1;

    setBuyingItemId(item.id);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/user/buy-item`,
        { itemId: item.id, quantity: qty },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (res.data.success) {
        showToast("success", res.data.message || `Đã mua thành công ${item.name}!`);
        if (refetchProfile) refetchProfile();
      }
    } catch (err) {
      console.error(err);
      showToast("error", err.response?.data?.message || "Lỗi khi mua vật phẩm");
    } finally {
      setBuyingItemId(null);
      if (isRpgItem) setQty(item.id, 1);
    }
  };

  // Trang bị hoặc Tháo Danh hiệu
  const handleToggleEquip = async (item, shouldEquip) => {
    if (!user?.token) return;
    setEquippingItemId(item.id);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/user/equip-item`,
        { itemId: item.id, isEquipped: shouldEquip },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (res.data.success) {
        showToast(
          "success",
          res.data.message || (shouldEquip ? `Đã trang bị ${item.name}!` : `Đã tháo ${item.name}!`)
        );
        if (refetchProfile) refetchProfile();
      }
    } catch (err) {
      console.error(err);
      showToast("error", err.response?.data?.message || "Lỗi khi đổi danh hiệu");
    } finally {
      setEquippingItemId(null);
    }
  };

  return (
    <div className="bg-transparent space-y-6">
      {/* Header Tiệm Ký Ức */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-emerald-100/70 pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-100/70 text-emerald-700 rounded-xl">
              <LuStore className="w-6 h-6" />
            </span>
            <div>
              <h2 className="font-black text-xl sm:text-2xl text-emerald-950">
                Tiệm Ký Ức Irminsul
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                Sử dụng Tinh Thạch để trao đổi nguyên liệu, linh dược đột phá & danh hiệu độc quyền
              </p>
            </div>
          </div>
        </div>

        {/* Số dư Tinh Thạch */}
        <div className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-200/80 px-4 py-2 rounded-2xl shadow-xs self-start md:self-auto">
          <span className="text-xs font-bold text-gray-600">Số dư hiện có:</span>
          <div className="flex items-center gap-1.5 font-black text-emerald-800 text-base">
            <CrystalGemIcon className="w-5 h-5 text-cyan-500 animate-pulse" />
            <span>{userCrystals.toLocaleString()}</span>
            <span className="text-xs text-emerald-600 font-semibold">Tinh Thạch</span>
          </div>
        </div>
      </div>

      {/* Thông báo Toast UI */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300/80 text-emerald-900 px-4 py-3 rounded-2xl text-sm font-extrabold flex items-center gap-2 shadow-xs animate-fade-in">
          <span>✅</span>
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-300/80 text-rose-900 px-4 py-3 rounded-2xl text-sm font-extrabold flex items-center gap-2 shadow-xs animate-fade-in">
          <span>❌</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Thanh chuyển tab phân loại: Tất cả | Nguyên liệu | Thuốc | Danh hiệu */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_TABS.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              className={`px-4 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shrink-0 border ${
                isActive
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                  : "bg-white/90 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/60 border-emerald-100/70"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800 font-extrabold"
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 🌿 PHẦN 1: NGUYÊN LIỆU CHẾ TẠO                                */}
      {/* ─────────────────────────────────────────────────────────── */}
      {(activeTab === "all" || activeTab === "materials") && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-black text-emerald-900 text-base border-l-4 border-emerald-600 pl-2.5">
            <span>🌿</span>
            <span>Nguyên Liệu Chế Tạo Dược Phẩm</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MATERIAL_ITEMS.map((item) => {
              const itemQty = getQty(item.id);
              const ownedCount = userInventory[item.id] || 0;
              const isBuying = buyingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-white border border-emerald-100 hover:border-emerald-300 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <RpgItemIcon itemId={item.id} size="md" />
                        <div className="min-w-0">
                          <h4 className="font-black text-emerald-950 text-sm truncate" title={item.name}>
                            {item.name}
                          </h4>
                          <span className="text-[11px] text-gray-400 font-semibold block">
                            Đang có trong balo:{" "}
                            <strong className="text-emerald-700 font-bold">{ownedCount}</strong>
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-xl text-emerald-800 font-black text-xs flex items-center gap-1">
                        <CrystalGemIcon className="w-3.5 h-3.5 text-cyan-500" />
                        <span>{item.price}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed min-h-[32px]">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-emerald-100/60 flex gap-2 items-center justify-between">
                    <div className="flex items-center gap-1 border border-emerald-200/70 rounded-xl p-0.5 bg-emerald-50/40">
                      <button
                        type="button"
                        onClick={() => setQty(item.id, itemQty - 1)}
                        className="w-6 h-6 flex items-center justify-center font-black text-xs text-emerald-700 hover:bg-emerald-100 rounded-lg"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={itemQty}
                        onChange={(e) => setQty(item.id, parseInt(e.target.value, 10) || 1)}
                        className="w-8 text-center text-xs font-black bg-transparent text-emerald-950 outline-none"
                        min="1"
                      />
                      <button
                        type="button"
                        onClick={() => setQty(item.id, itemQty + 1)}
                        className="w-6 h-6 flex items-center justify-center font-black text-xs text-emerald-700 hover:bg-emerald-100 rounded-lg"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBuy(item)}
                      disabled={isBuying}
                      className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <LuShoppingBag className="w-3.5 h-3.5" />
                      <span>{isBuying ? "Đang mua..." : "MUA NGAY"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 🧪 PHẦN 2: THUỐC PHÙ THỦY ĐỘT PHÁ                           */}
      {/* ─────────────────────────────────────────────────────────── */}
      {(activeTab === "all" || activeTab === "potions") && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 font-black text-emerald-900 text-base border-l-4 border-teal-600 pl-2.5">
            <span>🧪</span>
            <span>Thuốc Phù Thủy Đột Phá Cảnh Giới</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {POTION_ITEMS.map((item) => {
              const itemQty = getQty(item.id);
              const ownedCount = userInventory[item.id] || 0;
              const isBuying = buyingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-white border border-teal-100 hover:border-teal-300 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <RpgItemIcon itemId={item.id} size="md" />
                        <div className="min-w-0">
                          <h4 className="font-black text-emerald-950 text-sm truncate" title={item.name}>
                            {item.name}
                          </h4>
                          <span className="text-[11px] text-gray-400 font-semibold block">
                            Đang có:{" "}
                            <strong className="text-teal-700 font-bold">{ownedCount} bình</strong>
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 bg-teal-50 border border-teal-200/70 px-2.5 py-1 rounded-xl text-teal-800 font-black text-xs flex items-center gap-1">
                        <CrystalGemIcon className="w-3.5 h-3.5 text-cyan-500" />
                        <span>{item.price}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed min-h-[32px]">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-teal-100/60 flex gap-2 items-center justify-between">
                    <div className="flex items-center gap-1 border border-teal-200/70 rounded-xl p-0.5 bg-teal-50/40">
                      <button
                        type="button"
                        onClick={() => setQty(item.id, itemQty - 1)}
                        className="w-6 h-6 flex items-center justify-center font-black text-xs text-teal-700 hover:bg-teal-100 rounded-lg"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={itemQty}
                        onChange={(e) => setQty(item.id, parseInt(e.target.value, 10) || 1)}
                        className="w-8 text-center text-xs font-black bg-transparent text-teal-950 outline-none"
                        min="1"
                      />
                      <button
                        type="button"
                        onClick={() => setQty(item.id, itemQty + 1)}
                        className="w-6 h-6 flex items-center justify-center font-black text-xs text-teal-700 hover:bg-teal-100 rounded-lg"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBuy(item)}
                      disabled={isBuying}
                      className="flex-1 py-2 px-3 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <LuShoppingBag className="w-3.5 h-3.5" />
                      <span>{isBuying ? "Đang mua..." : "MUA NGAY"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 🛡️ PHẦN 3: KHUNG VIỀN AVATAR HUYỀN THOẠI                    */}
      {/* ─────────────────────────────────────────────────────────── */}
      {(activeTab === "all" || activeTab === "frames") && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-emerald-900 text-base border-l-4 border-amber-500 pl-2.5">
              <span>🛡️</span>
              <span>Khung Viền Avatar (Fantasy Game UI Borders)</span>
            </div>
            <span className="text-xs text-gray-400 font-semibold italic hidden sm:inline">
              Khung viền chạm khắc tinh xảo bao quanh avatar hồ sơ lữ hành & bình luận
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FRAME_ITEMS.map((frameItem) => {
              const isOwned = ownedItemIds.includes(frameItem.id);
              const isEquipped = equippedFrameId === frameItem.id;
              const isBusy = buyingItemId === frameItem.id || equippingItemId === frameItem.id;

              return (
                <div
                  key={frameItem.id}
                  className={`bg-white border rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden ${
                    isEquipped
                      ? "border-amber-500 ring-2 ring-amber-400/30"
                      : isOwned
                      ? "border-emerald-300"
                      : "border-gray-200 hover:border-amber-300"
                  }`}
                >
                  {/* Nhãn trạng thái góc trên */}
                  {isEquipped ? (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-xs">
                      🛡️ ĐANG TRANG BỊ
                    </span>
                  ) : isOwned ? (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                      ✓ ĐÃ SỞ HỮU
                    </span>
                  ) : (
                    <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${frameItem.rarityColor}`}>
                      {frameItem.rarity}
                    </span>
                  )}

                  {/* Xem trước Avatar kèm Khung Viền trực tiếp */}
                  <div className="flex flex-col items-center pt-2 pb-1">
                    <div className="p-3 relative flex items-center justify-center">
                      <AvatarWithFrame
                        avatarUrl={getAvatarUrl(profile?.avatarUrl)}
                        frameKey={frameItem.key}
                        size="md"
                        alt={frameItem.name}
                      />
                    </div>
                    <h4 className="font-black text-sm text-gray-800 text-center mt-2">
                      {frameItem.name}
                    </h4>
                    <div className="mt-1">
                      <span className="text-xs font-black text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                        <CrystalGemIcon className="w-3.5 h-3.5 text-cyan-500" />
                        <span>{frameItem.price} Tinh Thạch</span>
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs text-center mt-2 leading-relaxed min-h-[34px] px-1">
                      {frameItem.desc}
                    </p>
                  </div>

                  {/* Nút hành động */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                    {isOwned ? (
                      isEquipped ? (
                        <div className="flex gap-2 w-full">
                          <button
                            type="button"
                            disabled
                            className="flex-1 py-2 px-3 bg-amber-500 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-default"
                          >
                            <LuCheck className="w-4 h-4" />
                            <span>Đang Sử Dụng</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleEquip(frameItem, false)}
                            disabled={isBusy}
                            className="py-2 px-3 bg-gray-100 hover:bg-rose-50 text-gray-600 hover:text-rose-700 font-bold text-xs rounded-xl border border-gray-200 transition cursor-pointer"
                          >
                            Tháo
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleEquip(frameItem, true)}
                          disabled={isBusy}
                          className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <LuShield className="w-4 h-4" />
                          <span>{isBusy ? "Đang xử lý..." : "Trang Bị Khung Này"}</span>
                        </button>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleBuy(frameItem)}
                        disabled={isBusy}
                        className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs rounded-xl shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CrystalGemIcon className="w-4 h-4 text-white" />
                        <span>{isBusy ? "Đang mua..." : `MUA NGAY (${frameItem.price} 💎)`}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 👑 PHẦN 4: DANH HIỆU LỮ HÀNH                                */}
      {/* ─────────────────────────────────────────────────────────── */}
      {(activeTab === "all" || activeTab === "titles") && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-emerald-900 text-base border-l-4 border-purple-600 pl-2.5">
              <span>👑</span>
              <span>Danh Hiệu Lữ Hành (Hiển Thị Cạnh Tên & Khung Bình Luận)</span>
            </div>
            <span className="text-xs text-gray-400 font-semibold italic hidden sm:inline">
              Danh hiệu tỏa sáng lộng lẫy cạnh tên lữ hành & bình luận
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TITLE_ITEMS.map((titleItem) => {
              const isOwned = ownedItemIds.includes(titleItem.id);
              const isEquipped = equippedTitleId === titleItem.id;
              const isBusy = buyingItemId === titleItem.id || equippingItemId === titleItem.id;

              return (
                <div
                  key={titleItem.id}
                  className={`bg-white border rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden ${
                    isEquipped
                      ? "border-purple-400 ring-2 ring-purple-400/30"
                      : isOwned
                      ? "border-emerald-300"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  {/* Nhãn trạng thái góc trên */}
                  {isEquipped ? (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-600 text-white shadow-xs">
                      👑 ĐANG ĐỘI
                    </span>
                  ) : isOwned ? (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                      ✓ ĐÃ SỞ HỮU
                    </span>
                  ) : null}

                  {/* Xem trước Badge Danh Hiệu */}
                  <div className="space-y-3">
                    <div className="pt-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r ${titleItem.badgeBg} border shadow-sm`}
                      >
                        <span>{titleItem.icon}</span>
                        <span className={`tracking-wider uppercase ${titleItem.titleClass}`}>
                          {titleItem.name}
                        </span>
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <CrystalGemIcon className="w-3.5 h-3.5 text-cyan-500" />
                          <span>{titleItem.price} Tinh Thạch</span>
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-xs leading-relaxed min-h-[36px]">
                      {titleItem.desc}
                    </p>
                  </div>

                  {/* Nút hành động */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                    {isOwned ? (
                      isEquipped ? (
                        <div className="flex gap-2 w-full">
                          <button
                            type="button"
                            disabled
                            className="flex-1 py-2 px-3 bg-purple-600 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-default"
                          >
                            <LuCheck className="w-4 h-4" />
                            <span>Đang Sử Dụng</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleEquip(titleItem, false)}
                            disabled={isBusy}
                            className="py-2 px-3 bg-gray-100 hover:bg-rose-50 text-gray-600 hover:text-rose-700 font-bold text-xs rounded-xl border border-gray-200 transition cursor-pointer"
                          >
                            Tháo
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleEquip(titleItem, true)}
                          disabled={isBusy}
                          className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <LuCrown className="w-4 h-4" />
                          <span>{isBusy ? "Đang xử lý..." : "Trang Bị Danh Hiệu Này"}</span>
                        </button>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleBuy(titleItem)}
                        disabled={isBusy}
                        className="w-full py-2.5 px-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CrystalGemIcon className="w-4 h-4 text-white" />
                        <span>{isBusy ? "Đang mua..." : `MUA NGAY (${titleItem.price} 💎)`}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
