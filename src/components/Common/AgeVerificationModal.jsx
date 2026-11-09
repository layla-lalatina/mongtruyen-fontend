import React, { useState } from "react";
import { LuShieldAlert, LuCalendar, LuCheck, LuArrowLeft } from "react-icons/lu";
import { API_BASE_URL } from "../../../config";

export default function AgeVerificationModal({
  isOpen,
  minAge = 18,
  comicTitle = "",
  user,
  onVerified,
  onCancel,
}) {
  const currentYear = new Date().getFullYear();
  const [birthYear, setBirthYear] = useState(currentYear - 20);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError("");
    const year = parseInt(birthYear, 10);
    const age = currentYear - year;

    if (!year || year < 1930 || year > currentYear) {
      setError("Vui lòng nhập năm sinh hợp lệ.");
      return;
    }

    if (age < minAge) {
      setError(`Truyện này giới hạn cho độc giả từ ${minAge} tuổi trở lên (bạn hiện ${age} tuổi).`);
      return;
    }

    setSaving(true);
    try {
      if (user?.token) {
        await fetch(`${API_BASE_URL}/api/user/verify-age`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ birthYear: year }),
        });
      }
      localStorage.setItem("irminsul_birth_year", String(year));
      localStorage.setItem("irminsul_age_verified", "1");
      onVerified(year);
    } catch (err) {
      localStorage.setItem("irminsul_birth_year", String(year));
      localStorage.setItem("irminsul_age_verified", "1");
      onVerified(year);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-rose-200 shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
        <div className="bg-gradient-to-r from-rose-600 to-amber-600 p-5 text-white flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-sm">
            <LuShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-rose-100">
              Cảnh báo giới hạn độ tuổi ({minAge}+)
            </div>
            <h3 className="text-lg font-black leading-snug">Xác nhận độ tuổi lữ khách</h3>
          </div>
        </div>

        <form onSubmit={handleConfirm} className="p-6 space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            Bộ truyện <strong className="text-slate-900">{comicTitle || "này"}</strong> được gắn nhãn{" "}
            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-xs">
              {minAge}+
            </span>{" "}
            do có thể chứa hình ảnh hoặc tình tiết dành cho người trưởng thành. Vui lòng xác nhận năm sinh của bạn để tiếp tục.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <LuCalendar className="w-4 h-4 text-rose-600" />
              Năm sinh của bạn
            </label>
            <input
              type="number"
              min="1930"
              max={currentYear}
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 text-base font-bold text-slate-900"
              placeholder="Ví dụ: 2002"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center gap-1.5 transition"
            >
              <LuArrowLeft className="w-4 h-4" />
              Quay lại
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-extrabold text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/20 transition disabled:opacity-50"
            >
              <LuCheck className="w-4 h-4" />
              {saving ? "Đang xác nhận..." : `Tôi đã đủ ${minAge} tuổi`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

