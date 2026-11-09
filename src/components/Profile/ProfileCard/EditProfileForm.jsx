import React from "react";

// 12 mốc cấp độ đột phá cảnh giới và tổng XP cần thiết để full 100% sẵn sàng đột phá
const BREAKPOINT_MILESTONES = [
  { level: 20, name: "Cấp 20 (Bậc 1)", fullXp: 5800 },
  { level: 40, name: "Cấp 40 (Bậc 2)", fullXp: 19600 },
  { level: 60, name: "Cấp 60 (Bậc 3)", fullXp: 41400 },
  { level: 80, name: "Cấp 80 (Bậc 4)", fullXp: 71200 },
  { level: 100, name: "Cấp 100 (Bậc 5)", fullXp: 109000 },
  { level: 120, name: "Cấp 120 (Bậc 6)", fullXp: 154800 },
  { level: 140, name: "Cấp 140 (Bậc 7)", fullXp: 208600 },
  { level: 160, name: "Cấp 160 (Bậc 8)", fullXp: 270400 },
  { level: 180, name: "Cấp 180 (Bậc 9)", fullXp: 340200 },
  { level: 200, name: "Cấp 200 (Bậc 10)", fullXp: 418000 },
  { level: 250, name: "Cấp 250 (Bậc 11)", fullXp: 647500 },
  { level: 300, name: "Cấp 300 (Bậc 12)", fullXp: 927000 },
];

const xpForLevel = (lvl) => {
  if (lvl <= 1) return 0;
  return 100 + 20 * (lvl - 2);
};

const calcLevelFromXp = (memory) => {
  const mem = Math.max(0, parseInt(memory, 10) || 0);
  let lvl = 1;
  let xpUsed = 0;
  while (lvl < 350) {
    const nextReq = xpForLevel(lvl + 1);
    if (xpUsed + nextReq > mem) break;
    xpUsed += nextReq;
    lvl++;
  }
  return lvl;
};

export default function EditProfileForm({
  email,
  showEmailForm,
  setShowEmailForm,
  emailInput,
  setEmailInput,
  handleUpdateEmail,
  showPasswordForm,
  setShowPasswordForm,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  handleUpdatePassword,
  showAdminForm,
  setShowAdminForm,
  role,
  adminLevelInput,
  setAdminLevelInput,
  adminMemoryInput,
  setAdminMemoryInput,
  handleAdminUpdateUser,
  profile,
  navigate
}) {
  return (
    <div className="space-y-3.5 pt-2 border-t border-emerald-100/30 text-black">
      {/* Email */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center">
          <span className="font-bold text-gray-500 w-24">Địa chỉ Email:</span>
          <span className="text-gray-800 font-semibold">{email}</span>
        </div>
        <button
          className="text-xs text-emerald-600 hover:text-emerald-700 font-black hover:underline"
          onClick={() => setShowEmailForm(v => !v)}
        >
          Thay đổi
        </button>
      </div>

      {showEmailForm && (
        <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl">
          <h3 className="font-extrabold text-emerald-950 mb-2.5 text-xs">Cập nhật địa chỉ email</h3>
          <input
            type="email"
            className="w-full p-2.5 mb-2.5 border border-emerald-200 rounded-xl text-xs text-black bg-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            placeholder="Nhập email mới của anh..."
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <button
              className="px-3.5 py-2 text-xs bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition"
              onClick={() => setShowEmailForm(false)}
            >
              Hủy
            </button>
            <button
              className="px-3.5 py-2 text-xs bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition"
              onClick={handleUpdateEmail}
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}

      {/* Password */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center">
          <span className="font-bold text-gray-500 w-24">Mật khẩu:</span>
          <span className="text-gray-800 font-semibold">••••••••</span>
        </div>
        <button
          className="text-xs text-emerald-600 hover:text-emerald-700 font-black hover:underline"
          onClick={() => setShowPasswordForm(v => !v)}
        >
          Đổi mật khẩu
        </button>
      </div>

      {showPasswordForm && (
        <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl space-y-2">
          <h3 className="font-extrabold text-emerald-950 mb-2 text-xs">Thay đổi mật khẩu tài khoản</h3>
          <input
            type="password"
            className="w-full p-2.5 border border-emerald-200 rounded-xl text-xs text-black bg-white outline-none focus:border-emerald-500"
            placeholder="Mật khẩu hiện tại"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
          />
          <input
            type="password"
            className="w-full p-2.5 border border-emerald-200 rounded-xl text-xs text-black bg-white outline-none focus:border-emerald-500"
            placeholder="Mật khẩu mới (tối thiểu 8 ký tự)"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            className="w-full p-2.5 border border-emerald-200 rounded-xl text-xs text-black bg-white outline-none focus:border-emerald-500"
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
          <div className="flex justify-end space-x-2 pt-1">
            <button
              className="px-3.5 py-2 text-xs bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition"
              onClick={() => setShowPasswordForm(false)}
            >
              Hủy
            </button>
            <button
              className="px-3.5 py-2 text-xs bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition"
              onClick={handleUpdatePassword}
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}

      {/* Tinh Thể Thế Giới (World Crystal) */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center">
          <span className="font-bold text-gray-500 w-24">World Crystal:</span>
          <span className="text-base text-emerald-600 font-extrabold flex items-center gap-1 shadow-sm px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-100">
            💎 {profile.worldCrystal.toLocaleString()}
          </span>
        </div>
        <span className="text-[10px] text-emerald-700 bg-emerald-50 font-bold px-2.5 py-1 rounded-lg border border-emerald-100">
          ✨ Tích lũy qua nhiệm vụ
        </span>
      </div>

      {/* Quyền Hạn Hệ Thống */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center">
          <span className="font-bold text-gray-500 w-24">Quyền Hạn:</span>
          <span className="px-2.5 py-0.5 bg-emerald-800 text-white text-[10px] font-black rounded capitalize tracking-wide shadow-sm">
            {profile.role}
          </span>
        </div>
        <div className="flex gap-2 items-center">
          {(role?.toLowerCase() === "admin" || profile?.role?.toLowerCase() === "admin") && (
            <>
              <button
                className="text-xs text-emerald-600 hover:underline font-bold"
                onClick={() => setShowAdminForm((v) => !v)}
              >
                [Chỉnh sửa Irminsul]
              </button>
              <button
                type="button"
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-amber-300 font-black rounded-xl transition-all shadow-md text-xs flex items-center gap-1.5 border border-amber-400/30 active:scale-95"
                onClick={() => navigate("/admin/users")}
              >
                <span>👑</span> Bí Cảnh Quản Trị
              </button>
            </>
          )}
        </div>
      </div>

      {showAdminForm && (role?.toLowerCase() === "admin" || profile?.role?.toLowerCase() === "admin") && (
        <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2 shadow-xs text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-purple-950 text-xs flex items-center gap-1.5">
              <span>🔮</span> Tùy Chỉnh Ký Ức Irminsul (Admin)
            </h3>
            <span className="text-[10px] text-purple-700 bg-purple-100/80 font-bold px-2 py-0.5 rounded-md">
              Ký Ức = Kinh Nghiệm (XP)
            </span>
          </div>

          {/* Hàng chọn mốc & nhập liệu thu gọn */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
            {/* 1. Chọn mốc cấp đột phá */}
            <div className="sm:col-span-5">
              <label className="block text-[10px] font-bold text-purple-900 mb-1">
                ⚡ Chọn mốc đột phá:
              </label>
              <select
                className="w-full h-8 px-2 text-xs border border-purple-200 rounded-lg text-purple-950 bg-white font-bold outline-none focus:border-purple-500 shadow-2xs"
                onChange={(e) => {
                  const selected = BREAKPOINT_MILESTONES.find(m => m.level === parseInt(e.target.value, 10));
                  if (selected) {
                    setAdminMemoryInput(selected.fullXp);
                    setAdminLevelInput(selected.level);
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>-- Chọn mốc cấp (20 đến 300) --</option>
                {BREAKPOINT_MILESTONES.map((m) => (
                  <option key={m.level} value={m.level}>
                    {m.name} ({m.fullXp.toLocaleString()} XP)
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Ô nhập XP (Ký Ức) */}
            <div className="sm:col-span-4">
              <label className="block text-[10px] font-bold text-purple-900 mb-1">
                Ký Ức (XP):
              </label>
              <input
                type="number"
                min="0"
                className="w-full h-8 px-2 text-xs border border-purple-200 rounded-lg text-black bg-white font-bold outline-none focus:border-purple-500 shadow-2xs"
                placeholder="Nhập số XP..."
                value={adminMemoryInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setAdminMemoryInput(val);
                  setAdminLevelInput(calcLevelFromXp(val));
                }}
              />
            </div>

            {/* 3. Ô Cấp độ (Chỉ đọc - Tự động cập nhật theo XP) */}
            <div className="sm:col-span-3">
              <label className="block text-[10px] font-bold text-purple-900 mb-1">
                Cấp độ:
              </label>
              <div className="w-full h-8 px-2 text-xs bg-purple-100/80 border border-purple-300 rounded-lg text-purple-950 font-black flex items-center justify-between select-none">
                <span>Cấp {adminLevelInput || 1}</span>
                <span className="text-[9px] text-purple-700 font-extrabold bg-white/80 px-1.5 py-0.2 rounded shadow-2xs">
                  Tự động
                </span>
              </div>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex justify-end space-x-2 pt-1 border-t border-purple-100">
            <button
              type="button"
              className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition"
              onClick={() => setShowAdminForm(false)}
            >
              Hủy
            </button>
            <button
              type="button"
              className="px-3.5 py-1 text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-black transition shadow-xs active:scale-95"
              onClick={handleAdminUpdateUser}
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      )}

      {/* Ngày Đồng Hành */}
      <div className="flex items-center text-xs text-gray-500 font-medium">
        <span className="font-bold text-gray-500 w-24">Đồng hành từ:</span>
        <span>
          {profile.createdAt
            ? new Date(profile.createdAt).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })
            : ""}
        </span>
      </div>
    </div>
  );
}
