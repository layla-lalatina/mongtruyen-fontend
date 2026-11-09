import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../../config";

const AVAILABLE_TITLES = [
  "Độc Giả Mới",
  "Người Yêu Truyện",
  "Nhà Sưu Tầm",
  "Thủ Thư",
  "Đại Thủ Thư",
  "Thư Viện Trưởng",
  "Người Kể Chuyện",
  "Nhà Diễn Thuyết",
  "Học Giả",
  "Hiền Giả",
  "Đại Hiền Giả",
  "Nhà Khảo Cổ",
  "Người Lưu Trữ",
  "Người Gìn Giữ Ký Ức",
  "Người Khai Thiên",
  "Người Chứng Witness Alpha",
  "Người Đặt Viên Gạch Đầu Tiên",
];

export const REALMS = [
  { tier: 1, minLevel: 1, maxLevel: 20, name: "Người Mới Thức Tỉnh" },
  { tier: 2, minLevel: 21, maxLevel: 40, name: "Kẻ Tìm Đường" },
  { tier: 3, minLevel: 41, maxLevel: 60, name: "Lữ Hành Giả" },
  { tier: 4, minLevel: 61, maxLevel: 80, name: "Nhà Thám Hiểm" },
  { tier: 5, minLevel: 81, maxLevel: 100, name: "Người Gìn Giữ Tri Thức" },
  { tier: 6, minLevel: 101, maxLevel: 120, name: "Người Ghi Chép Ký Ức" },
  { tier: 7, minLevel: 121, maxLevel: 140, name: "Học Giả Cổ Đại" },
  { tier: 8, minLevel: 141, maxLevel: 160, name: "Hiền Giả" },
  { tier: 9, minLevel: 161, maxLevel: 180, name: "Đại Hiền Giả" },
  { tier: 10, minLevel: 181, maxLevel: 200, name: "Thủ Hộ Cổ Thụ" },
  { tier: 11, minLevel: 201, maxLevel: 250, name: "Người Canh Giữ Irminsul" },
  { tier: 12, minLevel: 251, maxLevel: 300, name: "Người Viết Lại Lịch Sử" },
  { tier: 13, minLevel: 301, maxLevel: 9999, name: "Hóa Thân Irminsul" },
];

export const FAME_RANKS = [
  { rank: "F", name: "Người Mới", minScore: 0, minTriThuc: 0, minDanhTieng: 0, minUyTin: 0, minMemory: 0 },
  { rank: "E", name: "Lữ Hành Giả", minScore: 300, minTriThuc: 50, minDanhTieng: 10, minUyTin: 5, minMemory: 500 },
  { rank: "D", name: "Nhà Thám Hiểm", minScore: 1200, minTriThuc: 150, minDanhTieng: 40, minUyTin: 15, minMemory: 2000 },
  { rank: "C", name: "Học Giả", minScore: 3500, minTriThuc: 400, minDanhTieng: 120, minUyTin: 40, minMemory: 5000 },
  { rank: "B", name: "Hiền Giả", minScore: 8500, minTriThuc: 1000, minDanhTieng: 300, minUyTin: 100, minMemory: 12000 },
  { rank: "A", name: "Đại Hiền Giả", minScore: 22000, minTriThuc: 2500, minDanhTieng: 800, minUyTin: 300, minMemory: 30000 },
  { rank: "S", name: "Người Gìn Giữ Ký Ức", minScore: 55000, minTriThuc: 6000, minDanhTieng: 2000, minUyTin: 800, minMemory: 80000 },
  { rank: "SS", name: "Thủ Hộ Irminsul", minScore: 140000, minTriThuc: 15000, minDanhTieng: 5000, minUyTin: 2000, minMemory: 200000 },
  { rank: "SSS", name: "Người Viết Lại Lịch Sử", minScore: 350000, minTriThuc: 35000, minDanhTieng: 12000, minUyTin: 5000, minMemory: 500000 },
  { rank: "EX", name: "Hóa Thân Irminsul", minScore: 750000, minTriThuc: 80000, minDanhTieng: 25000, minUyTin: 10000, minMemory: 1000000 },
];

export function calcSuggestedRank(stats = {}) {
  const triThuc = Number(stats.triThuc || 0);
  const danhTieng = Number(stats.danhTieng || 0);
  const uyTin = Number(stats.uyTin || 0);

  // Điểm Danh Vọng tổng hợp trực tiếp từ 3 chỉ số RPG:
  // - Tri Thức x 1.5 (Độ uyên thâm khi đọc truyện)
  // - Danh Tiếng x 3.0 (Tương tác, thảo luận bình luận)
  // - Uy Tín x 5.0 (Được cộng đồng like, đánh giá cao)
  const fameScore = Math.floor(triThuc * 1.5 + danhTieng * 3.0 + uyTin * 5.0);

  let matched = FAME_RANKS[0];
  for (const r of FAME_RANKS) {
    if (fameScore >= r.minScore) {
      matched = r;
    }
  }
  return { ...matched, fameScore };
}

export function getRealmFromLevel(level) {
  const lvl = Number(level) || 1;
  let matched = REALMS[0];
  for (const r of REALMS) {
    if (lvl >= r.minLevel) matched = r;
  }
  return matched;
}

const UserEditPanel = ({
  user,
  editFormData,
  handleInputChange,
  handleSaveUser,
  toggleExpand,
  updatingUserId,
  saveStatusMsg = "",
}) => {
  const [showCurrentPass, setShowCurrentPass] = React.useState(false);
  const [refreshingAI, setRefreshingAI] = useState(false);
  const [aiRefreshMsg, setAiRefreshMsg] = useState("");

  const handleRefreshAIRecommendations = async () => {
    try {
      setRefreshingAI(true);
      setAiRefreshMsg("");
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const res = await axios.post(
        `${API_BASE_URL}/api/ai/admin/refresh-recommendations/${user.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setAiRefreshMsg("✅ Đã làm mới 8 truyện gợi ý AI!");
        setTimeout(() => setAiRefreshMsg(""), 4000);
      }
    } catch (err) {
      console.error("Lỗi làm mới gợi ý AI:", err);
      const msg = err.response?.data?.message || "Lỗi khi làm mới gợi ý AI";
      setAiRefreshMsg(`❌ ${msg}`);
      setTimeout(() => setAiRefreshMsg(""), 4000);
    } finally {
      setRefreshingAI(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-emerald-100 shadow-sm mb-4">
      <h4 className="font-bold text-sm text-emerald-950 uppercase tracking-wider mb-4 flex items-center gap-1.5">
        🔧 Chỉnh sửa chi tiết tài khoản
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Cột 1: Cơ bản */}
        <div className="space-y-3 p-3 bg-emerald-50/20 rounded-xl border border-emerald-50/50">
          <h5 className="font-bold text-xs text-emerald-800 border-b border-emerald-100/50 pb-1.5">
            Thông tin cơ bản
          </h5>
          <div>
            <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
              Tên tài khoản
            </label>
            <input
              type="text"
              value={editFormData.username || ""}
              onChange={(e) => handleInputChange("username", e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-emerald-100 text-xs text-black focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
              Email
            </label>
            <input
              type="email"
              value={editFormData.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-emerald-100 text-xs text-black focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-semibold text-emerald-900">
                Mật khẩu hiện tại
              </label>
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 transition cursor-pointer"
              >
                {showCurrentPass ? "🙈 Ẩn" : "👁️ Hiện MK"}
              </button>
            </div>
            <input
              type={showCurrentPass ? "text" : "password"}
              readOnly
              value={user.plainPassword || (user.id === 1 ? "123456" : "123456")}
              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs text-black font-mono select-all"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-semibold text-emerald-900">
                Đổi mật khẩu mới
              </label>
              <button
                type="button"
                onClick={() => handleInputChange("password", "123456")}
                className="text-[10px] font-extrabold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200 transition cursor-pointer"
                title="Gán nhanh mật khẩu thành 123456"
              >
                ⚡ Gán 123456
              </button>
            </div>
            <input
              type="text"
              placeholder="Để trống nếu không đổi mật khẩu"
              value={editFormData.password || ""}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-emerald-100 text-xs text-black focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
            />
            <p className="text-[9px] text-gray-500 mt-0.5 italic">
              💡 Hệ thống sẽ tự động băm mã hóa Bcrypt khi bấm Lưu.
            </p>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
              Trạng thái khóa
            </label>
            <select
              value={String(editFormData.isBanned)}
              onChange={(e) =>
                handleInputChange("isBanned", e.target.value === "true")
              }
              className="w-full px-3 py-1.5 rounded-lg border border-emerald-100 text-xs text-black focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="false">Hoạt động (Bình thường)</option>
              <option value="true">Khóa tài khoản (Ban)</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
              Quyền hạn (Vai trò)
            </label>
            <select
              value={
                (editFormData.role || "READER").toUpperCase() === "MEMBER"
                  ? "READER"
                  : (editFormData.role || "READER").toUpperCase()
              }
              onChange={(e) => handleInputChange("role", e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-emerald-100 text-xs text-black focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white font-bold"
            >
              <option value="READER">Độc Giả (Member)</option>
              <option value="TRANSLATOR">✍️ Dịch Giả (Translator)</option>
              <option value="ADMIN">👑 Quản Trị (Admin)</option>
            </select>
          </div>
        </div>

        {/* Cột 2: Cấp độ, Cảnh giới & Điểm Ký ức */}
        <div className="space-y-3 p-3 bg-emerald-50/20 rounded-xl border border-emerald-50/50">
          <h5 className="font-bold text-xs text-emerald-800 border-b border-emerald-100/50 pb-1.5 flex items-center justify-between">
            <span>Cấp độ & Cảnh Giới</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Irminsul RPG</span>
          </h5>

          {/* Thẻ Cảnh Giới Hiện Tại */}
          {(() => {
            const currentRealm = getRealmFromLevel(editFormData.level || 1);
            return (
              <div className="p-2.5 bg-emerald-100/60 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-extrabold text-emerald-950">⚔️ Cảnh Giới (Tu Vi):</span>
                  <span className="font-black px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px]">
                    Tầng {currentRealm.tier}/13
                  </span>
                </div>
                <div className="font-black text-xs text-emerald-800">
                  {currentRealm.name}
                </div>
                <p className="text-[10px] text-emerald-700/80 mt-0.5">
                  (Mốc tu vi tương ứng: Cấp {currentRealm.minLevel} - {currentRealm.maxLevel === 9999 ? "∞" : currentRealm.maxLevel})
                </p>
              </div>
            );
          })()}

          {/* Chọn Nhanh Cảnh Giới */}
          <div>
            <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
              Chọn Nhanh Cảnh Giới (Tự đặt Level)
            </label>
            <select
              value={getRealmFromLevel(editFormData.level || 1).tier}
              onChange={(e) => {
                const selectedTier = Number(e.target.value);
                const matched = REALMS.find((r) => r.tier === selectedTier);
                if (matched) {
                  handleInputChange("level", matched.minLevel);
                }
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-emerald-100 text-xs text-black focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
            >
              {REALMS.map((r) => (
                <option key={r.tier} value={r.tier}>
                  Tầng {r.tier}: {r.name} (Lv.{r.minLevel}+)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
              Cấp độ chính xác (Level)
            </label>
            <input
              type="number"
              value={editFormData.level || 1}
              onChange={(e) =>
                handleInputChange("level", parseInt(e.target.value, 10) || 1)
              }
              className="w-full px-3 py-1.5 rounded-lg border border-emerald-100 text-xs text-black focus:ring-1 focus:ring-emerald-500 focus:outline-none font-bold"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-semibold text-emerald-900">
                Kinh nghiệm Cấp (XP Hiện tại / Tối đa)
              </label>
              <span className="text-[10px] text-emerald-700 font-bold">
                {Math.round(((editFormData.currentXp || 0) / (editFormData.nextLevelXp || 1)) * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1/2">
                <input
                  type="number"
                  value={editFormData.currentXp ?? 0}
                  onChange={(e) =>
                    handleInputChange("currentXp", Math.max(0, parseInt(e.target.value, 10) || 0))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-100 text-xs text-black focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  placeholder="XP hiện tại"
                  title="Kinh nghiệm hiện tại"
                />
              </div>
              <span className="text-gray-400 font-extrabold text-xs">/</span>
              <div className="w-1/2">
                <input
                  type="number"
                  value={editFormData.nextLevelXp ?? 100}
                  onChange={(e) =>
                    handleInputChange("nextLevelXp", Math.max(1, parseInt(e.target.value, 10) || 100))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-100 text-xs text-black focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  placeholder="XP tối đa"
                  title="Kinh nghiệm cần để lên cấp"
                />
              </div>
            </div>
            <div className="w-full bg-emerald-950/10 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round(((editFormData.currentXp || 0) / (editFormData.nextLevelXp || 1)) * 100))}%` }}
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-emerald-900 mb-1" title="Tổng điểm ký ức tích lũy Cây Thế Giới (xét Rank Danh Vọng F->EX)">
              Ký ức Irminsul (Memory - Xét Rank)
            </label>
            <input
              type="number"
              value={editFormData.irminsulMemory ?? editFormData.irminsulMemories ?? 0}
              onChange={(e) =>
                handleInputChange(
                  "irminsulMemory",
                  parseInt(e.target.value, 10) || 0
                )
              }
              className="w-full px-3 py-1.5 rounded-lg border border-emerald-100 text-xs text-black focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
              World Crystal (💎)
            </label>
            <input
              type="number"
              value={editFormData.worldCrystal ?? editFormData.worldCrystals ?? 0}
              onChange={(e) =>
                handleInputChange(
                  "worldCrystal",
                  parseInt(e.target.value, 10) || 0
                )
              }
              className="w-full px-3 py-1.5 rounded-lg border border-emerald-100 text-xs text-black focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Cột 3: Rank, Hạng & Thống kê RPG */}
        <div className="space-y-3 p-3 bg-emerald-50/20 rounded-xl border border-emerald-50/50">
          <h5 className="font-bold text-xs text-emerald-800 border-b border-emerald-100/50 pb-1.5 flex items-center justify-between">
            <span>Rank, Hạng & Danh Vọng</span>
            <span className="text-[10px] text-purple-700 font-semibold">Theo 3 Chỉ Số</span>
          </h5>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                🎖️ Rank Danh Vọng
              </label>
              <select
                value={editFormData.danhVong || "F"}
                onChange={(e) => {
                  const newRank = e.target.value;
                  handleInputChange("danhVong", newRank);
                  // Tự động điền mốc chuẩn 3 chỉ số tương ứng theo Rank đã chọn (đổi đối xứng)
                  const matched = FAME_RANKS.find((r) => r.rank === newRank);
                  if (matched) {
                    handleInputChange("triThuc", matched.minTriThuc);
                    handleInputChange("danhTieng", matched.minDanhTieng);
                    handleInputChange("uyTin", matched.minUyTin);
                  }
                }}
                className="w-full px-2 py-1.5 rounded-lg border border-emerald-100 text-xs text-black focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white font-bold"
              >
                {FAME_RANKS.map((r) => (
                  <option key={r.rank} value={r.rank}>
                    Rank {r.rank} ({r.name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                🏷️ Hạng (Danh Xưng)
              </label>
              <div className="px-2 py-1.5 rounded-lg border border-purple-200 bg-purple-50/60 text-purple-900 font-extrabold text-[11px] truncate flex items-center h-[34px]">
                {FAME_RANKS.find((r) => r.rank === (editFormData.danhVong || "F"))?.name || "Người Mới"}
              </div>
            </div>
          </div>

          {/* Hộp 3 Chỉ Số RPG có thể chỉnh trực tiếp & Tự động đổi Rank đối xứng */}
          <div className="p-2.5 bg-white/95 rounded-xl border border-purple-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-purple-950 border-b border-purple-100 pb-1">
              <span>🛡️ 3 Chỉ Số Lữ Hành (Đổi đối xứng)</span>
              <span className="text-[10px] text-purple-700 font-bold">
                Điểm: {calcSuggestedRank(editFormData).fameScore.toLocaleString()}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                  📚 Tri Thức
                </label>
                <input
                  type="number"
                  min="0"
                  value={editFormData.triThuc || 0}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                    handleInputChange("triThuc", val);
                    const updated = { ...editFormData, triThuc: val };
                    const rankResult = calcSuggestedRank(updated);
                    handleInputChange("danhVong", rankResult.rank);
                  }}
                  className="w-full px-2 py-1 rounded-lg border border-purple-200 text-xs font-bold text-emerald-900 bg-emerald-50/30 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                  💬 Danh Tiếng
                </label>
                <input
                  type="number"
                  min="0"
                  value={editFormData.danhTieng || 0}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                    handleInputChange("danhTieng", val);
                    const updated = { ...editFormData, danhTieng: val };
                    const rankResult = calcSuggestedRank(updated);
                    handleInputChange("danhVong", rankResult.rank);
                  }}
                  className="w-full px-2 py-1 rounded-lg border border-purple-200 text-xs font-bold text-purple-900 bg-purple-50/30 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                  ❤️ Uy Tín
                </label>
                <input
                  type="number"
                  min="0"
                  value={editFormData.uyTin || 0}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                    handleInputChange("uyTin", val);
                    const updated = { ...editFormData, uyTin: val };
                    const rankResult = calcSuggestedRank(updated);
                    handleInputChange("danhVong", rankResult.rank);
                  }}
                  className="w-full px-2 py-1 rounded-lg border border-purple-200 text-xs font-bold text-rose-900 bg-rose-50/30 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>
            <p className="text-[9px] text-purple-800/80 italic leading-tight">
              ⚡ Đổi Rank ➔ tự nhảy 3 chỉ số mốc chuẩn. Đổi 3 chỉ số ➔ tự động nhảy Rank đối xứng tương ứng!
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
              Màu tên (Hex)
            </label>
            <div className="flex gap-1.5 items-center">
              <input
                type="text"
                value={editFormData.nameColor || ""}
                onChange={(e) =>
                  handleInputChange("nameColor", e.target.value)
                }
                className="w-full px-2 py-1.5 rounded-lg border border-emerald-100 text-[11px] text-black focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                placeholder="#ff0000"
              />
              <input
                type="color"
                value={
                  editFormData.nameColor?.startsWith("#")
                    ? editFormData.nameColor
                    : "#10b981"
                }
                onChange={(e) =>
                  handleInputChange("nameColor", e.target.value)
                }
                className="w-7 h-7 p-0 border-0 rounded cursor-pointer"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                Hiệu ứng tên
              </label>
              <select
                value={editFormData.nameEffect || ""}
                onChange={(e) =>
                  handleInputChange("nameEffect", e.target.value)
                }
                className="w-full px-2 py-1.5 rounded-lg border border-emerald-100 text-xs text-black focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="">Không có</option>
                <optgroup label="Thường">
                  <option value="anh_xanh_diu">Ánh Xanh Dịu</option>
                  <option value="anh_lam">Ánh Lam</option>
                  <option value="anh_bac">Ánh Bạc</option>
                </optgroup>
                <optgroup label="Hiếm">
                  <option value="ngoc_luc_bao">Ngọc Lục Bảo</option>
                  <option value="huyen_mong">Huyễn Mộng</option>
                  <option value="tinh_tu">Tinh Tú</option>
                </optgroup>
                <optgroup label="Sử Thi">
                  <option value="thien_ha">Thiên Hà</option>
                  <option value="tinh_hai_effect">Tinh Hải</option>
                  <option value="co_thu_effect">Cổ Thụ</option>
                </optgroup>
                <optgroup label="Huyền Thoại">
                  <option value="irminsul_effect">Irminsul</option>
                  <option value="ky_uc_the_gioi">Ký Ức Thế Giới</option>
                  <option value="dong_chay_van_menh">Dòng Chảy Vận Mệnh</option>
                </optgroup>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                Khung Avatar
              </label>
              <select
                value={editFormData.avatarFrame || ""}
                onChange={(e) =>
                  handleInputChange("avatarFrame", e.target.value)
                }
                className="w-full px-2 py-1.5 rounded-lg border border-emerald-100 text-xs text-black focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="">Không có</option>
                <optgroup label="Thường">
                  <option value="la_non">Lá Non 🍃</option>
                  <option value="nhanh_cay">Nhánh Cây 🌿</option>
                  <option value="tinh_thach">Tinh Thạch ✨</option>
                </optgroup>
                <optgroup label="Hiếm">
                  <option value="ngoc_bich">Ngọc Bích 🟢</option>
                  <option value="tinh_van">Tinh Vân 🌌</option>
                  <option value="co_thu">Cổ Thụ 🌳</option>
                </optgroup>
                <optgroup label="Sử Thi">
                  <option value="long_toc">Long Tộc 🐉</option>
                  <option value="phuong_hoang">Phượng Hoàng 🔥</option>
                  <option value="tinh_hai">Tinh Hải 🌟</option>
                </optgroup>
                <optgroup label="Huyền Thoại">
                  <option value="mam_cay_the_gioi">Mầm Cây Thế Giới 🌱</option>
                  <option value="tan_cay_irminsul">Tán Cây Irminsul 🌴</option>
                  <option value="vuong_mien_irminsul">Vương Miện Irminsul 👑</option>
                </optgroup>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
              Danh hiệu (Badge)
            </label>
            <select
              value={editFormData.badge || ""}
              onChange={(e) => handleInputChange("badge", e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-emerald-100 text-xs text-black focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="">Không có</option>
              <optgroup label="Đọc Truyện">
                <option value="Độc Giả Mới">Độc Giả Mới 📖</option>
                <option value="Người Yêu Truyện">Người Yêu Truyện ❤️</option>
                <option value="Nhà Sưu Tầm">Nhà Sưu Tầm 🎒</option>
                <option value="Thủ Thư">Thủ Thư 🗝️</option>
                <option value="Đại Thủ Thư">Đại Thủ Thư 🛡️</option>
                <option value="Thư Viện Trưởng">Thư Viện Trưởng 🏛️</option>
              </optgroup>
              <optgroup label="Bình Luận">
                <option value="Người Kể Chuyện">Người Kể Chuyện 🗣️</option>
                <option value="Nhà Diễn Thuyết">Nhà Diễn Thuyết 🎤</option>
                <option value="Học Giả">Học Giả 🎓</option>
                <option value="Hiền Giả">Hiền Giả 🕯️</option>
                <option value="Đại Hiền Giả">Đại Hiền Giả 🔮</option>
              </optgroup>
              <optgroup label="Theo Dõi">
                <option value="Nhà Khảo Cổ">Nhà Khảo Cổ 🔍</option>
                <option value="Người Lưu Trữ">Người Lưu Trữ 📁</option>
                <option value="Người Gìn Giữ Ký Ức">Người Gìn Giữ Ký Ức 🌳</option>
              </optgroup>
              <optgroup label="Sự Kiện">
                <option value="Người Khai Thiên">Người Khai Thiên 🌟</option>
                <option value="Người Chứng Witness Alpha">Người Chứng Witness Alpha 👁️</option>
                <option value="Người Đặt Viên Gạch Đầu Tiên">Người Đặt Viên Gạch Đầu Tiên 🧱</option>
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* Dòng bổ sung: Thống kê chi tiết & Khu vực */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-emerald-50/20 rounded-xl border border-emerald-50/50 space-y-2.5">
          <div className="flex items-center justify-between border-b border-emerald-100/50 pb-1.5">
            <h5 className="font-bold text-xs text-emerald-800 flex items-center gap-1.5">
              <span>📜</span> Mốc Mở Khóa Quyền Lợi & Đặc Quyền (3 Chỉ Số)
            </h5>
            <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-bold border border-purple-200">
              Đặc Quyền Độc Giả RPG
            </span>
          </div>

          {/* 3 Cột hiển thị các mốc mở khóa và tự động highlight mốc đã đạt */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px]">
            {/* Tri Thức */}
            <div className="p-2 rounded-lg bg-white border border-emerald-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-bold text-emerald-900 border-b border-emerald-50 pb-1 mb-1.5">
                  <span className="flex items-center gap-1">📚 Tri Thức</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-emerald-50 rounded text-emerald-700 font-bold">
                    {(Number(editFormData.triThuc) || 0).toLocaleString()} pt
                  </span>
                </div>
                <div className="space-y-1 text-gray-600">
                  <div className={`p-1 rounded ${(Number(editFormData.triThuc) || 0) >= 100 ? "bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200/60" : "bg-gray-50/50"}`}>
                    <span className="font-bold">≥ 100:</span> +5% World Crystal rơi khi đọc
                  </div>
                  <div className={`p-1 rounded ${(Number(editFormData.triThuc) || 0) >= 500 ? "bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200/60" : "bg-gray-50/50"}`}>
                    <span className="font-bold">≥ 500:</span> +10% Crystal, mở kho Ký Ức
                  </div>
                  <div className={`p-1 rounded ${(Number(editFormData.triThuc) || 0) >= 2500 ? "bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200/60" : "bg-gray-50/50"}`}>
                    <span className="font-bold">≥ 2,500:</span> +2% rơi Lá Cây Thế Giới
                  </div>
                  <div className={`p-1 rounded ${(Number(editFormData.triThuc) || 0) >= 15000 ? "bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200/60" : "bg-gray-50/50"}`}>
                    <span className="font-bold">≥ 15k+:</span> +4% Lá & Đề cử truyện Irminsul
                  </div>
                </div>
              </div>
              <span className="text-[9px] text-gray-400 mt-1 italic block">+5 điểm/chương đọc</span>
            </div>

            {/* Danh Tiếng */}
            <div className="p-2 rounded-lg bg-white border border-purple-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-bold text-purple-900 border-b border-purple-50 pb-1 mb-1.5">
                  <span className="flex items-center gap-1">💬 Danh Tiếng</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-purple-50 rounded text-purple-700 font-bold">
                    {(Number(editFormData.danhTieng) || 0).toLocaleString()} pt
                  </span>
                </div>
                <div className="space-y-1 text-gray-600">
                  <div className={`p-1 rounded ${(Number(editFormData.danhTieng) || 0) >= 100 ? "bg-purple-50 text-purple-900 font-semibold border border-purple-200/60" : "bg-gray-50/50"}`}>
                    <span className="font-bold">≥ 100:</span> Mở danh hiệu [Đạo Sĩ 📜]
                  </div>
                  <div className={`p-1 rounded ${(Number(editFormData.danhTieng) || 0) >= 500 ? "bg-purple-50 text-purple-900 font-semibold border border-purple-200/60" : "bg-gray-50/50"}`}>
                    <span className="font-bold">≥ 500:</span> Danh hiệu [Chân Nhân 🔮] & Ghim cmt
                  </div>
                  <div className={`p-1 rounded ${(Number(editFormData.danhTieng) || 0) >= 2000 ? "bg-purple-50 text-purple-900 font-semibold border border-purple-200/60" : "bg-gray-50/50"}`}>
                    <span className="font-bold">≥ 2,000:</span> [Đại Tông Sư 🎖️] & Khung sáng
                  </div>
                  <div className={`p-1 rounded ${(Number(editFormData.danhTieng) || 0) >= 5000 ? "bg-purple-50 text-purple-900 font-semibold border border-purple-200/60" : "bg-gray-50/50"}`}>
                    <span className="font-bold">≥ 5,000+:</span> [Thần Vương 👑] & Duyệt thảo luận
                  </div>
                </div>
              </div>
              <span className="text-[9px] text-gray-400 mt-1 italic block">+3 điểm/bình luận</span>
            </div>

            {/* Uy Tín */}
            <div className="p-2 rounded-lg bg-white border border-rose-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-bold text-rose-900 border-b border-rose-50 pb-1 mb-1.5">
                  <span className="flex items-center gap-1">❤️ Uy Tín</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-rose-50 rounded text-rose-700 font-bold">
                    {(Number(editFormData.uyTin) || 0).toLocaleString()} pt
                  </span>
                </div>
                <div className="space-y-1 text-gray-600">
                  <div className={`p-1 rounded ${(Number(editFormData.uyTin) || 0) >= 50 ? "bg-rose-50 text-rose-900 font-semibold border border-rose-200/60" : "bg-gray-50/50"}`}>
                    <span className="font-bold">≥ 50:</span> +10% Crystal khi chấm sao truyện
                  </div>
                  <div className={`p-1 rounded ${(Number(editFormData.uyTin) || 0) >= 300 ? "bg-rose-50 text-rose-900 font-semibold border border-rose-200/60" : "bg-gray-50/50"}`}>
                    <span className="font-bold">≥ 300:</span> Nhân đôi quà (x2) khi cmt được like
                  </div>
                  <div className={`p-1 rounded ${(Number(editFormData.uyTin) || 0) >= 1000 ? "bg-rose-50 text-rose-900 font-semibold border border-rose-200/60" : "bg-gray-50/50"}`}>
                    <span className="font-bold">≥ 1,000:</span> Mở nhiệm vụ RPG & Độc Giả Tiêu Biểu
                  </div>
                  <div className={`p-1 rounded ${(Number(editFormData.uyTin) || 0) >= 5000 ? "bg-rose-50 text-rose-900 font-semibold border border-rose-200/60" : "bg-gray-50/50"}`}>
                    <span className="font-bold">≥ 5,000+:</span> Ưu tiên cmt Top 1 nổi bật toàn sàn
                  </div>
                </div>
              </div>
              <span className="text-[9px] text-gray-400 mt-1 italic block">+2 điểm/like nhận được</span>
            </div>
          </div>

          <p className="text-[10px] text-emerald-800/80 bg-emerald-50/50 p-1.5 rounded-lg border border-emerald-100/60 leading-relaxed">
            💡 <strong>Tự động kích hoạt:</strong> Các mốc đặc quyền tự động kích hoạt theo 3 chỉ số lữ hành ở phần trên. Thẻ sáng màu là các mốc tài khoản này <strong>đã đạt được</strong>.
          </p>
        </div>

        <div className="p-3 bg-emerald-50/20 rounded-xl border border-emerald-50/50 space-y-2.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-emerald-100/50 pb-1.5 mb-2.5">
              <h5 className="font-bold text-xs text-emerald-800 flex items-center gap-1.5">
                <span>🗺️</span> Khu vực & Danh hiệu Sở Hữu
              </h5>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                Thiết Lập RPG
              </span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[10px] font-semibold text-emerald-900 mb-1">
                  Khu vực Khám Phá
                </label>
                <select
                  value={editFormData.khuVuc || ""}
                  onChange={(e) => handleInputChange("khuVuc", e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-100 text-xs text-black focus:outline-none bg-white font-medium"
                >
                  <option value="">Chưa có</option>
                  <optgroup label="Khởi Đầu">
                    <option value="Đồng Cỏ Ánh Sao">Đồng Cỏ Ánh Sao</option>
                    <option value="Hồ Nguyệt Quang">Hồ Nguyệt Quang</option>
                    <option value="Thung Lũng Sương Mù">Thung Lũng Sương Mù</option>
                  </optgroup>
                  <optgroup label="Trung Cấp">
                    <option value="Rừng Cổ Ngữ">Rừng Cổ Ngữ</option>
                    <option value="Thành Phố Trên Mây">Thành Phố Trên Mây</option>
                    <option value="Sa Mạc Vĩnh Cửu">Sa Mạc Vĩnh Cửu</option>
                  </optgroup>
                  <optgroup label="Cao Cấp">
                    <option value="Biển Sao">Biển Sao</option>
                    <option value="Thư Viện Vô Tận">Thư Viện Vô Tận</option>
                    <option value="Vùng Đất Ký Ức">Vùng Đất Ký Ức</option>
                  </optgroup>
                  <optgroup label="Đặc Biệt">
                    <option value="Irminsul">Irminsul</option>
                    <option value="Cội Nguồn Thế Giới">Cội Nguồn Thế Giới</option>
                    <option value="Khu Vực Cấm">Khu Vực Cấm</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-emerald-900 mb-1 flex items-center justify-between">
                  <span>Danh hiệu sở hữu (Checklist)</span>
                  <span className="text-[9px] text-emerald-600 font-normal">Chọn nhiều danh hiệu</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5 h-36 overflow-y-auto p-2 border border-emerald-100 rounded-lg bg-white text-black shadow-inner">
                  {(() => {
                    let currentTitles = [];
                    try {
                      currentTitles =
                        typeof editFormData.titles === "string"
                          ? JSON.parse(editFormData.titles || "[]")
                          : editFormData.titles || [];
                    } catch (e) {
                      currentTitles = [];
                    }
                    return AVAILABLE_TITLES.map((title) => {
                      const checked = currentTitles.includes(title);
                      return (
                        <label
                          key={title}
                          className="flex items-center gap-1.5 text-[10px] text-emerald-950 font-medium cursor-pointer hover:bg-emerald-50 p-1 rounded transition"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              let updated = [];
                              if (checked) {
                                updated = currentTitles.filter((t) => t !== title);
                              } else {
                                updated = [...currentTitles, title];
                              }
                              handleInputChange("titles", JSON.stringify(updated));
                            }}
                            className="accent-emerald-600 rounded scale-90"
                          />
                          <span className="truncate">{title}</span>
                        </label>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-emerald-800/80 bg-emerald-50/50 p-1.5 rounded-lg border border-emerald-100/60 leading-relaxed">
            💡 <strong>Quy tắc danh hiệu:</strong> Danh hiệu tích lũy qua cày cuốc & sự kiện. Độc giả có thể tích lũy nhiều danh hiệu và chọn danh hiệu chính trong hồ sơ.
          </p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
          URL ảnh đại diện (avatarUrl)
        </label>
        <input
          type="text"
          value={editFormData.avatarUrl || ""}
          onChange={(e) => handleInputChange("avatarUrl", e.target.value)}
          className="w-full px-3 py-1.5 rounded-lg border border-emerald-100 text-xs text-black focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
          placeholder="https://..."
        />
      </div>

      <div className="flex justify-between items-center gap-3 flex-wrap">
        <div>
          {aiRefreshMsg && (
            <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl shadow-xs animate-fade-in flex items-center gap-1.5">
              {aiRefreshMsg}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {saveStatusMsg && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl shadow-sm animate-fade-in flex items-center gap-1.5">
              {saveStatusMsg}
            </span>
          )}

          {/* Nút bấm làm mới gợi ý AI cho tài khoản này (5 ngày/lần) */}
          <button
            type="button"
            disabled={refreshingAI}
            onClick={handleRefreshAIRecommendations}
            className="px-3.5 py-2 bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Làm mới ngay 5 bộ truyện gợi ý AI (chu kỳ 5 ngày) cho tài khoản này"
          >
            <span className={refreshingAI ? "animate-spin" : ""}>🌿</span>
            <span>{refreshingAI ? "Đang chọn truyện..." : "Làm mới gợi ý AI"}</span>
          </button>

          <button
            type="button"
            onClick={() => toggleExpand(user)}
            className="px-4 py-2 border border-emerald-100 hover:bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Đóng
          </button>
        <button
          type="button"
          disabled={updatingUserId === user.id}
          onClick={() => handleSaveUser(user.id)}
          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-600/15 disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
        >
          {updatingUserId === user.id ? (
            <>
              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Đang lưu...</span>
            </>
          ) : (
            <span>💾 Lưu thay đổi</span>
          )}
        </button>
        </div>
      </div>
    </div>
  );
};

export default UserEditPanel;
