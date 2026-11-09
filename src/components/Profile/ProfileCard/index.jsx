import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../../config";
import { getRealmStyle } from "../../../utils/rpgHelpers";
import WorldTree from "./WorldTree";
import BreakthroughModal from "./BreakthroughModal";
import EditProfileForm from "./EditProfileForm";
import AvatarWithFrame from "../../Common/AvatarFrame";

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

const getBadgeClass = (badge) => {
  if (!badge) return "";
  const b = badge.toLowerCase();
  if (b.includes("thư viện trưởng") || b.includes("đại thủ thư") || b.includes("người khai thiên")) return "badge-vip-legendary text-white";
  if (b.includes("thủ thư") || b.includes("hiền giả") || b.includes("học giả") || b.includes("diễn thuyết")) return "badge-vip-rare text-white";
  if (b.includes("đại hiền giả") || b.includes("chứng witness")) return "badge-vip-epic text-white";
  if (b.includes("gìn giữ") || b.includes("thủ hộ") || b.includes("canh giữ")) return "badge-vip-divine text-emerald-950 font-black";
  return "badge-vip-common text-emerald-700 bg-emerald-50 border border-emerald-100";
};

const POTION_NAMES = {
  20: "Thuốc Phù Thủy Bậc 1",
  40: "Thuốc Phù Thủy Bậc 2",
  60: "Thuốc Phù Thủy Bậc 3",
  80: "Thuốc Phù Thủy Bậc 4",
  100: "Thuốc Phù Thủy Bậc 5",
  120: "Thuốc Phù Thủy Bậc 6",
  140: "Thuốc Phù Thủy Bậc 7",
  160: "Thuốc Phù Thủy Bậc 8",
  180: "Thuốc Phù Thủy Bậc 9",
  200: "Thuốc Phù Thủy Bậc 10",
  250: "Thuốc Phù Thủy Bậc 11",
  300: "Thuốc Phù Thủy Bậc 12"
};

const getPotionId = (lvl) => {
  if (lvl === 250) return "witch_potion_t11";
  if (lvl === 300) return "witch_potion_t12";
  return `witch_potion_t${lvl / 20}`;
};

export default function ProfileCard({ user, profile, email, setEmail, role, refetchProfile, onOpenGuide }) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);

  const [emailInput, setEmailInput] = useState(email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [adminLevelInput, setAdminLevelInput] = useState(profile?.level || 1);
  const [adminMemoryInput, setAdminMemoryInput] = useState(profile?.irminsulMemory || 0);

  useEffect(() => {
    if (profile) {
      setAdminLevelInput(profile.level || 1);
      setAdminMemoryInput(profile.irminsulMemory || 0);
    }
  }, [profile?.level, profile?.irminsulMemory]);

  // Trạng thái Đột phá Cảnh giới
  const [useLeaf, setUseLeaf] = useState(true);
  const [usePotion, setUsePotion] = useState(true);
  const [rolling, setRolling] = useState(false);
  const [rollResult, setRollResult] = useState(null);

  // Tự động bật checkbox dược liệu khi đủ điều kiện
  useEffect(() => {
    if (profile?.inventory && !rolling && !rollResult) {
      const inv = profile.inventory;
      const pId = getPotionId ? getPotionId(profile.level) : `witch_potion_t${Math.floor(profile.level / 20)}`;
      setUseLeaf((inv.world_tree_leaf || 0) > 0);
      setUsePotion((inv[pId] || 0) > 0);
    }
  }, [profile?.inventory, profile?.level]);

  // Trạng thái Upload Avatar & Toast
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const navigate = useNavigate();

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setUploadingAvatar(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/upload-avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showToast("✨ Đã cập nhật ảnh đại diện thành công! ✨", "success");
        if (refetchProfile) refetchProfile();
      } else {
        showToast(data.message || "Lỗi khi cập nhật ảnh đại diện.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Lỗi kết nối khi tải ảnh đại diện.", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBreakthrough = async () => {
    if (rolling) return;
    setRolling(true);
    setRollResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/breakthrough`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ useLeaf, usePotion })
      });
      const data = await res.json();
      
      setTimeout(() => {
        setRolling(false);
        setRollResult({
          success: data.success,
          message: data.message,
          roll: data.roll,
          chance: data.chance
        });
        refetchProfile();
      }, 3400);
    } catch (err) {
      console.error(err);
      setRolling(false);
      showToast("Lỗi kết nối server.", "error");
    }
  };

  useEffect(() => {
    setEmailInput(email);
  }, [email]);

  useEffect(() => {
    if (profile) {
      setAdminLevelInput(profile.level);
      setAdminMemoryInput(profile.irminsulMemory);
    }
  }, [profile]);

  const handleUpdateEmail = async () => {
    if (!emailInput.trim()) return showToast("Vui lòng nhập email hợp lệ!", "warning");
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/update-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ email: emailInput })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Cập nhật email thành công! 🌿", "success");
        setEmail(data.email);
        setShowEmailForm(false);
        refetchProfile();
      } else {
        showToast(data.message || "Cập nhật email thất bại.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Lỗi kết nối server.", "error");
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return showToast("Vui lòng nhập đầy đủ thông tin!", "warning");
    }
    if (newPassword !== confirmPassword) {
      return showToast("Mật khẩu mới không khớp!", "warning");
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/update-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Đổi mật khẩu thành công! 🌱", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordForm(false);
      } else {
        showToast(data.message || "Đổi mật khẩu thất bại.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Lỗi kết nối server.", "error");
    }
  };

  const handleAdminUpdateUser = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/admin/user/${profile.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          level: parseInt(adminLevelInput, 10),
          irminsulMemory: parseInt(adminMemoryInput, 10)
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Cập nhật dữ liệu Irminsul thành công! 🌳", "success");
        setShowAdminForm(false);
        refetchProfile();
      } else {
        showToast(data.message || "Cập nhật thất bại.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Lỗi kết nối server.", "error");
    }
  };

  if (!profile || !profile.username) return null;

  const xpCur = profile.xpCurrent ?? profile.currentXp ?? 0;
  const xpNeed = profile.xpNeeded ?? profile.nextLevelXp ?? 100;
  const lvlProg = profile.levelProgress ?? (xpNeed > 0 ? Math.min(100, Math.round((xpCur / xpNeed) * 100)) : 100);

  const BREAKPOINTS = [20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 250, 300];
  const isAtBreakpoint = BREAKPOINTS.includes(profile.level);
  const canBreakthrough = isAtBreakpoint && (xpCur >= xpNeed || lvlProg >= 100);
  const nextBreakpoint = BREAKPOINTS.find((b) => b > profile.level) || 300;

  // Danh Hiệu (Title): Hiển thị nằm trên ảnh Avatar & Thẻ danh vọng
  const getAvatarTitle = () => {
    if (!profile.equippedTitle) return null;
    const titleKey = profile.equippedTitle.assetResource || profile.equippedTitle.name;

    if (titleKey === "title_dragon" || titleKey === "Rồng Quấn Thần Thoại") {
      return {
        name: "Rồng Quấn Thần Thoại",
        icon: "🐉",
        badgeBg: "from-amber-500 via-rose-500 to-purple-600 text-white border-amber-200",
        titleClass: "shiny-mythic-title",
      };
    }
    if (titleKey === "title_irminsul_lord" || titleKey === "Chúa Tể Cây Thế Giới") {
      return {
        name: "Chúa Tể Cây Thế Giới",
        icon: "🌳",
        badgeBg: "from-emerald-700 via-teal-600 to-amber-500 text-white border-amber-300",
        titleClass: "shiny-mythic-title",
      };
    }
    if (titleKey === "title_sage" || titleKey === "Hiền Giả Tinh Hà") {
      return {
        name: "Hiền Giả Tinh Hà",
        icon: "🌌",
        badgeBg: "from-sky-500 via-cyan-400 to-indigo-600 text-white border-cyan-100",
        titleClass: "shiny-diamond-title",
      };
    }
    if (titleKey === "title_guardian" || titleKey === "Thủ Hộ Thần Mộc") {
      return {
        name: "Thủ Hộ Thần Mộc",
        icon: "🌿",
        badgeBg: "from-emerald-600 via-teal-500 to-green-600 text-white border-emerald-200",
        titleClass: "shiny-gold-title",
      };
    }
    if (titleKey === "title_scholar" || titleKey === "Học Giả Tri Thức") {
      return {
        name: "Học Giả Tri Thức",
        icon: "📚",
        badgeBg: "from-amber-400 via-yellow-500 to-orange-500 text-amber-950 border-yellow-200",
        titleClass: "shiny-gold-title",
      };
    }
    return {
      name: profile.equippedTitle.name || "Danh Hiệu Đặc Biệt",
      icon: "👑",
      badgeBg: "from-amber-500 via-yellow-500 to-emerald-600 text-white border-yellow-200",
      titleClass: "shiny-mythic-title",
    };
  };

  const avatarTitle = getAvatarTitle();
  const realmStyle = getRealmStyle(profile.level);

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-100/60 shadow-xl shadow-emerald-950/5 overflow-hidden mb-8 relative">
      {/* Khung viền gradient trên đỉnh (đổi sang vàng hoàng gia nếu là VIP) */}
      <div
        className={`h-2.5 transition-all duration-300 ${
          profile.isVip
            ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-600 shadow-sm shadow-amber-500/20"
            : "bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700"
        }`}
      />

      <div className="md:flex">
        {/* Cột 1: Avatar & Cây Irminsul */}
        <div className="md:w-5/12 p-6 flex flex-col items-center border-r border-emerald-50 bg-emerald-50/5">
          <div className="relative mb-5 group flex items-center justify-center">
            {/* Ảnh đại diện tròn thanh lịch kèm Khung Viền nếu đã trang bị */}
            <AvatarWithFrame
              avatarUrl={getAvatarUrl(profile.avatarUrl)}
              frameKey={profile.equippedFrame || profile.equippedAvatarFrameId}
              size="lg"
              alt="Avatar Lữ Hành"
            />
          </div>

          <div className="text-center mb-4 z-10 w-full px-4 space-y-1.5">
            {profile.isVip && (
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 font-black text-xs rounded-full shadow-md border ${
                    profile.vipTier >= 2
                      ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 border-amber-300 ring-2 ring-amber-400/30 shiny-gold-title"
                      : "bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500 text-blue-950 border-sky-300 ring-2 ring-cyan-400/30 shiny-blue-title"
                  }`}
                >
                  <span>{profile.vipTier >= 2 ? "👑" : "✨"}</span>
                  <span>{profile.vipPlanName || (profile.vipTier >= 2 ? "Hộ Vệ Irminsul" : "Lữ Khách Ánh Sao")}</span>
                </span>
              </div>
            )}
            {/* Huy hiệu đặc biệt */}
            {profile.badge && (
              <span className={`inline-block px-3 py-1 font-extrabold text-[10px] tracking-wide rounded-full shadow-md ${getBadgeClass(profile.badge)}`}>
                🏆 {profile.badge}
              </span>
            )}
            <div className="text-xs text-emerald-800 font-semibold italic">
              Quốc Tịch: {profile.khuVuc}
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition shadow-md shadow-emerald-600/10 border border-emerald-500/20 text-xs tracking-wider uppercase mb-2 disabled:opacity-50 cursor-pointer"
          >
            {uploadingAvatar ? "⏳ Đang tải ảnh..." : "🖼️ Đổi ảnh đại diện"}
          </button>

          {/* Vẽ Cây thần tiến hóa */}
          <WorldTree levelVal={profile.level} API_BASE_URL={API_BASE_URL} />
        </div>

        {/* Cột 2: Thông tin & Chỉ số RPG */}
        <div className="md:w-7/12 p-6 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Username, Cảnh Giới & Danh Hiệu */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                    <span>Tên Lữ Hành:</span>{" "}
                    <span
                      className="font-black transition-all"
                      style={{
                        color: realmStyle.color,
                        textShadow: realmStyle.glow,
                        ...(profile.nameColor && !['rainbow', 'thien_ha', 'tinh_hai_effect', 'dong_chay_van_menh'].includes(profile.nameEffect) ? { color: profile.nameColor } : {})
                      }}
                    >
                      {profile.username}
                    </span>
                  </h2>

                  <span className="px-2.5 py-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-extrabold rounded-full shadow-sm">
                    Cấp {profile.level}
                  </span>
                  <span className="px-2.5 py-0.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white text-[10px] font-black rounded-full shadow-sm tracking-wide">
                    ⭐ Rank {profile.danhVong}
                  </span>

                  {/* Huy hiệu VIP Hoàng Gia cạnh Tên */}
                  {profile.isVip && (
                    <span
                      className={`px-3 py-0.5 text-[11px] font-black rounded-full shadow-sm flex items-center gap-1 border ${
                        profile.vipTier >= 2
                          ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 border-amber-300 ring-2 ring-amber-400/30 shiny-gold-title"
                          : "bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500 text-blue-950 border-sky-300 ring-2 ring-cyan-400/30 shadow-sky-500/20 shiny-blue-title"
                      }`}
                      title={`Đặc quyền VIP: ${profile.vipPlanName || "VIP"} (Hạn đến: ${new Date(profile.vipExpiresAt).toLocaleString("vi-VN")})`}
                    >
                      <span>{profile.vipTier >= 2 ? "👑" : "✨"}</span>
                      <span>{profile.vipPlanName || (profile.vipTier >= 2 ? "VIP 2: Hộ Vệ Irminsul" : "VIP 1: Lữ Khách Ánh Sao")}</span>
                    </span>
                  )}
                </div>

                {/* Thẻ Danh Hiệu & Cảnh Giới Phát Sáng (Uiverse Glow Card + Shiny Text Title Effect) */}
                <div className="uiverse-title-card inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-xl shadow-sm mt-1">
                  <span className="text-xs font-extrabold text-gray-600 flex items-center gap-1">
                    ⚔️ Cảnh Giới:
                    <strong className="text-sm font-black tracking-wide shiny-emerald-title">
                      {profile.levelTitle || realmStyle.realm}
                    </strong>
                  </span>
                  <span className="text-gray-300 font-bold">|</span>
                  <span className="text-xs font-extrabold text-gray-600 flex items-center gap-1">
                    👑 Danh Hiệu:
                    <strong className={`text-sm font-black tracking-wide ${avatarTitle ? avatarTitle.titleClass : "text-emerald-800"}`}>
                      {avatarTitle ? avatarTitle.name : profile.danhVongTitle}
                    </strong>
                  </span>
                  {profile.isVip && (
                    <>
                      <span className="text-gray-300 font-bold">|</span>
                      <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1 bg-amber-50/80 px-2.5 py-0.5 rounded-lg border border-amber-200/60">
                        <span>👑 Đặc Quyền VIP:</span>
                        <strong className="text-amber-800 font-black">
                          {profile.vipTier >= 2 ? "Giảm 50% mở chương • +20% XP • 200 Chat AI" : "Giảm 20% mở chương • +10% XP • 60 Chat AI"}
                        </strong>
                        <span className="text-[10px] text-amber-600 font-semibold ml-0.5">
                          (Hạn: {new Date(profile.vipExpiresAt).toLocaleDateString("vi-VN")})
                        </span>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {onOpenGuide && (
                <button
                  type="button"
                  onClick={onOpenGuide}
                  className="shrink-0 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-200 font-extrabold text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <span>📘</span>
                  <span>Hướng dẫn sử dụng</span>
                </button>
              )}
            </div>

            {/* Thanh Kinh Nghiệm Cấp (XP) */}
            <div className="p-4 bg-emerald-50/20 rounded-2xl border border-emerald-100/40">
              <div className="flex justify-between items-center text-xs font-bold text-emerald-950 mb-1.5">
                <span className="flex items-center gap-1">⚡ Kinh Nghiệm Cấp (XP)</span>
                <span className="font-extrabold text-emerald-800">{xpCur.toLocaleString()} / {xpNeed.toLocaleString()} XP</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-emerald-950/10 rounded-full h-4 overflow-hidden relative border border-emerald-100/50">
                <div
                  className={`h-full rounded-full transition-all duration-500 relative ${
                    isAtBreakpoint && canBreakthrough
                      ? "bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-500 animate-pulse"
                      : "bg-gradient-to-r from-emerald-400 to-teal-500"
                  }`}
                  style={{ width: `${Math.min(100, lvlProg)}%` }}
                >
                  <div className="absolute inset-0 bg-xp-shimmer bg-[length:40px_100%] animate-shimmer opacity-40" />
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-semibold">
                <span>
                  🌳 Ký ức Irminsul: <strong className="text-emerald-800">{Number(profile.irminsulMemory || profile.irminsulMemories || 0).toLocaleString()}</strong> Điểm
                </span>
                <span>Tiến độ cấp: <strong className="text-emerald-700">{lvlProg}%</strong></span>
              </div>

              {/* Thông tin Cảnh giới giới hạn & Bảng Đột phá Inline */}
              {isAtBreakpoint ? (
                canBreakthrough ? (
                  <BreakthroughModal
                    profile={profile}
                    rolling={rolling}
                    rollResult={rollResult}
                    setRollResult={setRollResult}
                    useLeaf={useLeaf}
                    setUseLeaf={setUseLeaf}
                    usePotion={usePotion}
                    setUsePotion={setUsePotion}
                    handleBreakthrough={handleBreakthrough}
                    getPotionId={getPotionId}
                    POTION_NAMES={POTION_NAMES}
                    refetchProfile={refetchProfile}
                  />
                ) : (
                  <div className="mt-3 p-3.5 rounded-xl border bg-emerald-50/50 border-emerald-200 text-emerald-900">
                    <div className="flex items-center justify-between text-xs font-extrabold mb-1">
                      <span className="flex items-center gap-1.5">
                        🔒 CẢNH GIỚI GIỚI HẠN: Cấp {profile.level}
                      </span>
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-black border border-amber-200">
                        Cần {POTION_NAMES[profile.level] || "Thuốc Phù Thủy"}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 font-medium leading-relaxed">
                      Cấp độ sẽ tạm dừng tại Cấp {profile.level} khi tích lũy đủ {xpNeed.toLocaleString()} XP. Cần chế tạo thuốc phù thủy tương ứng trong Vạc Thuốc để đột phá vượt qua bình cảnh.
                    </p>
                  </div>
                )
              ) : (
                <div className="mt-2 text-[10px] text-gray-500 font-semibold flex items-center justify-between border-t border-emerald-50/60 pt-1.5">
                  <span>Mốc đột phá cảnh giới kế tiếp:</span>
                  <span className="font-bold text-emerald-800">
                    Cấp {nextBreakpoint} ({POTION_NAMES[nextBreakpoint] || "Thuốc Phù Thủy"})
                  </span>
                </div>
              )}
            </div>

            {/* Bảng Chỉ Số Thuộc Tính RPG */}
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">🛡️ Chỉ Số Lữ Hành (RPG Stats)</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-white border border-gray-100 rounded-2xl text-center shadow-sm hover:border-emerald-200 transition-colors">
                  <div className="text-xl mb-1">📚</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tri Thức</div>
                  <div className="text-lg font-black text-emerald-950 font-mono tracking-tight my-0.5">
                    {(profile.triThuc ?? 0).toLocaleString()}
                  </div>
                  <span className="text-[8px] text-gray-400 block">(Tăng khi đọc truyện)</span>
                </div>
                <div className="p-3 bg-white border border-gray-100 rounded-2xl text-center shadow-sm hover:border-emerald-200 transition-colors">
                  <div className="text-xl mb-1">💬</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Danh Tiếng</div>
                  <div className="text-lg font-black text-emerald-950 font-mono tracking-tight my-0.5">
                    {(profile.danhTieng ?? 0).toLocaleString()}
                  </div>
                  <span className="text-[8px] text-gray-400 block">(Tăng khi bình luận)</span>
                </div>
                <div className="p-3 bg-white border border-gray-100 rounded-2xl text-center shadow-sm hover:border-emerald-200 transition-colors">
                  <div className="text-xl mb-1">❤️</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Uy Tín</div>
                  <div className="text-lg font-black text-emerald-950 font-mono tracking-tight my-0.5">
                    {(profile.uyTin ?? 0).toLocaleString()}
                  </div>
                  <span className="text-[8px] text-gray-400 block">(Tăng khi nhận thích)</span>
                </div>
              </div>
            </div>

            {/* Email & Bảo mật */}
            <EditProfileForm
              email={email}
              showEmailForm={showEmailForm}
              setShowEmailForm={setShowEmailForm}
              emailInput={emailInput}
              setEmailInput={setEmailInput}
              handleUpdateEmail={handleUpdateEmail}
              showPasswordForm={showPasswordForm}
              setShowPasswordForm={setShowPasswordForm}
              currentPassword={currentPassword}
              setCurrentPassword={setCurrentPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              handleUpdatePassword={handleUpdatePassword}
              showAdminForm={showAdminForm}
              setShowAdminForm={setShowAdminForm}
              role={role}
              adminLevelInput={adminLevelInput}
              setAdminLevelInput={setAdminLevelInput}
              adminMemoryInput={adminMemoryInput}
              setAdminMemoryInput={setAdminMemoryInput}
              handleAdminUpdateUser={handleAdminUpdateUser}
              profile={profile}
              navigate={navigate}
            />
          </div>
        </div>
      </div>

      {/* 🌿 THÔNG BÁO TOAST THAY THẾ ALERT MẶC ĐỊNH */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999999] max-w-md w-[92vw] sm:w-auto animate-fade-in select-none">
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md border ${
              toast.type === "error"
                ? "bg-rose-950/90 border-rose-500/60 text-rose-100 shadow-rose-900/40"
                : toast.type === "warning"
                ? "bg-amber-950/90 border-amber-500/60 text-amber-100 shadow-amber-900/40"
                : "bg-emerald-950/90 border-emerald-500/60 text-emerald-100 shadow-emerald-900/40"
            }`}
          >
            <div className="text-xl shrink-0">
              {toast.type === "error" ? "⚠️" : toast.type === "warning" ? "⚡" : "✨"}
            </div>
            <div className="text-xs sm:text-sm font-black leading-snug">
              {toast.message}
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-auto text-white/60 hover:text-white text-xs font-black p-1 hover:bg-white/10 rounded-lg cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
