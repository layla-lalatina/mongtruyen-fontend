import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  LuLock,
  LuCrown,
  LuSparkles,
  LuClock,
  LuLogIn,
  LuWallet,
  LuCheck,
} from "react-icons/lu";
import { API_BASE_URL } from "../../../config";

export default function LockedChapterGate({
  lockInfo,
  chapterName,
  comicName,
  user,
  onUnlocked,
}) {
  const [unlocking, setUnlocking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!lockInfo) return null;

  const {
    reason,
    unlockType = "CRYSTAL",
    basePrice = 30,
    finalPrice = 30,
    discountPercent = 0,
    freeAt,
    userCrystals = 0,
    chapter,
  } = lockInfo;

  const handleUnlock = async () => {
    if (!user?.token) return;
    if (!chapter?.id) {
      setErrorMsg("Không xác định được ID chương để mở khóa.");
      return;
    }

    setUnlocking(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/comic/chapters/${chapter.id}/unlock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Không thể mở khóa chương này.");
      } else {
        if (onUnlocked) onUnlocked(data);
      }
    } catch (err) {
      setErrorMsg("Lỗi kết nối máy chủ khi mở khóa chương.");
    } finally {
      setUnlocking(false);
    }
  };

  const isVipOnly = unlockType === "VIP" || reason === "VIP_REQUIRED";
  const isLoginRequired = !user?.token || reason === "LOGIN_REQUIRED";

  return (
    <div className="my-6 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 text-white p-6 sm:p-10 shadow-2xl relative overflow-hidden">
      <div className="max-w-xl mx-auto text-center space-y-5 relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30 mx-auto">
          {isVipOnly ? <LuCrown className="w-8 h-8" /> : <LuLock className="w-8 h-8" />}
        </div>

        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
            {isVipOnly ? (
              <>
                <LuCrown className="w-3.5 h-3.5" /> Chương Đặc Quyền VIP
              </>
            ) : (
              <>
                <LuSparkles className="w-3.5 h-3.5" /> Chương Khóa Tinh Thạch
              </>
            )}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {comicName} – Chương {chapterName}
          </h2>
          <p className="text-sm text-emerald-100/80">
            {isVipOnly
              ? "Chương này dành riêng cho thành viên VIP của Cây Thế Giới Irminsul."
              : "Mở khóa một lần bằng Tinh Thạch (World Crystal) để đọc vĩnh viễn và ủng hộ Dịch giả."}
          </p>
        </div>

        {freeAt && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-emerald-200 font-semibold">
            <LuClock className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              Tự động mở miễn phí vào:{" "}
              <strong className="text-white">
                {new Date(freeAt).toLocaleString("vi-VN")}
              </strong>
            </span>
          </div>
        )}

        {!isVipOnly && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 max-w-md mx-auto space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-emerald-200">Chi phí mở khóa:</span>
              <div className="flex items-center gap-2">
                {discountPercent > 0 && (
                  <span className="line-through text-xs text-slate-400">
                    {basePrice} Tinh Thạch
                  </span>
                )}
                <span className="text-lg font-black text-amber-300">
                  {finalPrice} Tinh Thạch
                </span>
                {discountPercent > 0 && (
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black">
                    VIP -{discountPercent}%
                  </span>
                )}
              </div>
            </div>

            {!isLoginRequired && (
              <div className="flex items-center justify-between text-xs border-t border-white/10 pt-2">
                <span className="text-emerald-200/80">Số dư hiện tại của bạn:</span>
                <span className="font-bold text-white">
                  {Number(userCrystals || 0).toLocaleString()} Tinh Thạch
                </span>
              </div>
            )}
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-xs font-bold text-rose-200 max-w-md mx-auto">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {isLoginRequired ? (
            <Link
              to="/login"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition"
            >
              <LuLogIn className="w-4 h-4" />
              Đăng nhập để mở khóa chương
            </Link>
          ) : isVipOnly ? (
            <Link
              to="/profile?tab=vip"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-500/30 transition"
            >
              <LuCrown className="w-4 h-4" />
              Kích hoạt VIP ngay
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={handleUnlock}
                disabled={unlocking}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-500/30 transition disabled:opacity-50"
              >
                <LuCheck className="w-4 h-4" />
                {unlocking ? "Đang mở khóa..." : `Mở khóa ngay (${finalPrice} Tinh Thạch)`}
              </button>
              <Link
                to="/profile?tab=vip"
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm flex items-center gap-2 transition"
              >
                <LuWallet className="w-4 h-4 text-amber-300" />
                Nạp Tinh Thạch / Đăng ký VIP
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

