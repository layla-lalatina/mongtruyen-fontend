import React, { useEffect, useState, useRef } from "react";
import {
  LuCrown,
  LuSparkles,
  LuWallet,
  LuQrCode,
  LuCheck,
  LuClock,
  LuZap,
  LuShieldCheck,
  LuHistory,
  LuCopy,
  LuRefreshCw,
  LuCircleAlert,
} from "react-icons/lu";
import { API_BASE_URL } from "../../../config";

export default function VipAndDeposit({ onBalanceChanged }) {
  const [loading, setLoading] = useState(true);
  const [vipPlans, setVipPlans] = useState([]);
  const [depositPackages, setDepositPackages] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [vndPerCrystal, setVndPerCrystal] = useState(100);
  const [userStatus, setUserStatus] = useState(null);
  const [orders, setOrders] = useState([]);

  const [selectedPkgId, setSelectedPkgId] = useState("pkg_50k");
  const [customVnd, setCustomVnd] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("BANK");
  const [activeOrder, setActiveOrder] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [simulatingWebhook, setSimulatingWebhook] = useState(false);
  const [subscribingTier, setSubscribingTier] = useState(null);
  const [vipFeedback, setVipFeedback] = useState(null);
  const [depositFeedback, setDepositFeedback] = useState(null);
  const qrSectionRef = useRef(null);

  const getToken = () => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw)?.token : null;
    } catch {
      return null;
    }
  };

  const fetchAll = async () => {
    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const [plansRes, histRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/vip/plans`, { headers }),
        token
          ? fetch(`${API_BASE_URL}/api/vip/payment/history`, { headers })
          : Promise.resolve(null),
      ]);
      const plansData = await plansRes.json();
      if (plansData.success) {
        setVipPlans(plansData.vipPlans || []);
        setDepositPackages(plansData.depositPackages || []);
        setPaymentMethods(plansData.paymentMethods || []);
        setVndPerCrystal(plansData.vndPerCrystal || 100);
        setUserStatus(plansData.userStatus || null);
        if (plansData.userStatus) {
          try {
            const raw = localStorage.getItem("user");
            if (raw) {
              const parsed = JSON.parse(raw);
              parsed.isVip = Boolean(plansData.userStatus.isVip);
              parsed.vipTier = Number(plansData.userStatus.vipTier || 0);
              parsed.vipPlanName = plansData.userStatus.plan?.name || null;
              localStorage.setItem("user", JSON.stringify(parsed));
              window.dispatchEvent(
                new CustomEvent("vip-updated", { detail: plansData.userStatus })
              );
            }
          } catch (e) {}
        }
      }
      if (histRes && histRes.ok) {
        const histData = await histRes.json();
        setOrders(histData.orders || []);
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu VIP & Nạp:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Tự động kiểm tra trạng thái đơn nạp đang chờ (auto-polling mỗi 3 giây)
  useEffect(() => {
    if (!activeOrder || activeOrder.status !== "PENDING") return;
    const token = getToken();
    if (!token) return;

    const timer = setInterval(async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/vip/payment/order/${activeOrder.orderCode}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success && data.order && data.order.status === "PAID") {
          setActiveOrder((prev) => ({ ...prev, status: "PAID" }));
          setDepositFeedback({
            type: "success",
            text: `Hệ thống đã nhận thanh toán đơn #${activeOrder.orderCode}! Số dư mới: ${Number(
              data.worldCrystals || 0
            ).toLocaleString()} Tinh Thạch.`,
          });
          fetchAll();
          if (onBalanceChanged) onBalanceChanged(data.worldCrystals);
        }
      } catch (e) {}
    }, 3000);

    return () => clearInterval(timer);
  }, [activeOrder]);

  const handleSubscribeVip = async (tier) => {
    const token = getToken();
    if (!token) return;
    if (userStatus?.isVip && Number(userStatus?.vipTier) > Number(tier)) {
      setVipFeedback({
        type: "error",
        text: "Bạn đang sở hữu gói VIP Vàng cao hơn nên không thể mua gói VIP Xanh thấp hơn khi gói hiện tại vẫn còn hạn!",
      });
      return;
    }
    setSubscribingTier(tier);
    setVipFeedback(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/vip/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setVipFeedback({ type: "error", text: data.message || "Không thể đăng ký VIP" });
      } else {
        setVipFeedback({ type: "success", text: data.message });
        if (data.vip) {
          try {
            const raw = localStorage.getItem("user");
            if (raw) {
              const parsed = JSON.parse(raw);
              parsed.isVip = Boolean(data.vip.isVip);
              parsed.vipTier = Number(data.vip.vipTier || 0);
              parsed.vipPlanName = data.vip.plan?.name || null;
              localStorage.setItem("user", JSON.stringify(parsed));
            }
          } catch (e) {}
          window.dispatchEvent(new CustomEvent("vip-updated", { detail: data.vip }));
        }
        await fetchAll();
        if (onBalanceChanged) onBalanceChanged(data.worldCrystals);
      }
    } catch (err) {
      setVipFeedback({ type: "error", text: "Lỗi kết nối máy chủ khi đăng ký VIP" });
    } finally {
      setSubscribingTier(null);
    }
  };

  const handleCreateOrder = async () => {
    const token = getToken();
    if (!token) return;
    setDepositFeedback(null);

    if (selectedPkgId === "CUSTOM") {
      const parsedAmount = parseInt(String(customVnd).replace(/\D/g, ""), 10) || 0;
      if (parsedAmount < 10000 || parsedAmount > 5000000) {
        setDepositFeedback({
          type: "error",
          text: "⚠️ Số tiền nạp tùy chỉnh phải từ 10.000đ đến 5.000.000đ. Vui lòng nhập số tiền hợp lệ ở ô bên trên!",
        });
        return;
      }
    }

    setCreatingOrder(true);
    try {
      const payload =
        selectedPkgId === "CUSTOM"
          ? { customAmountVnd: parseInt(String(customVnd).replace(/\D/g, ""), 10) || 0, method: selectedMethod }
          : { packageId: selectedPkgId, method: selectedMethod };

      const res = await fetch(`${API_BASE_URL}/api/vip/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setDepositFeedback({ type: "error", text: data.message || "Không thể tạo đơn nạp" });
      } else {
        setActiveOrder(data.order);
        setDepositFeedback({
          type: "success",
          text: `Đã khởi tạo mã QR cho đơn nạp #${data.order.orderCode} (${Number(
            data.order.amountVnd
          ).toLocaleString()}đ). Quét mã hoặc bấm xác nhận bên dưới!`,
        });
        await fetchAll();
        setTimeout(() => {
          qrSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 100);
      }
    } catch (err) {
      setDepositFeedback({ type: "error", text: "Lỗi kết nối máy chủ khi tạo đơn nạp" });
    } finally {
      setCreatingOrder(false);
    }
  };

  // Nút giả lập Webhook ngân hàng báo có tiền về -> tự động cộng Tinh Thạch ngay lập tức
  const handleSimulateWebhook = async (orderCode) => {
    setSimulatingWebhook(true);
    setDepositFeedback(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/vip/payment/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderCode,
          providerTxnId: "AUTO_BANK_" + Date.now(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setDepositFeedback({ type: "error", text: data.message || "Lỗi xử lý thanh toán tự động" });
      } else {
        setActiveOrder((prev) => (prev ? { ...prev, status: "PAID" } : null));
        setDepositFeedback({ type: "success", text: data.message });
        await fetchAll();
        if (onBalanceChanged) onBalanceChanged(data.worldCrystals);
      }
    } catch (err) {
      setDepositFeedback({ type: "error", text: "Lỗi kết nối webhook thanh toán" });
    } finally {
      setSimulatingWebhook(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-emerald-700 font-bold animate-pulse">
        Đang kết nối Kho Báu Tinh Thạch & Điện Thờ VIP...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner tổng quan số dư & trạng thái VIP hiện tại */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 shadow-xl border border-emerald-700/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-300">
            <LuCrown className="w-4 h-4" />
            {userStatus?.isVip
              ? `Đang kích hoạt: ${userStatus?.plan?.name || `VIP Bậc ${userStatus.vipTier}`}`
              : "Tài khoản: Thành viên tiêu chuẩn"}
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            Đặc Quyền VIP & Nạp Tinh Thạch Tự Động
          </h2>
          {userStatus?.isVip && userStatus?.vipExpiresAt ? (
            <p className="text-xs text-emerald-200 flex items-center gap-1.5">
              <LuClock className="w-3.5 h-3.5 text-amber-300" />
              Hiệu lực đến: <strong>{new Date(userStatus.vipExpiresAt).toLocaleString("vi-VN")}</strong> • Hạn mức AI:{" "}
              <strong>{userStatus.aiDailyLimit} lượt/ngày</strong>
            </p>
          ) : (
            <p className="text-xs text-emerald-100/80">
              Nạp Tinh Thạch tự động (1.000đ = 10 Tinh Thạch) để mở khóa chương và kích hoạt đặc quyền VIP.
            </p>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3.5 border border-white/15 shrink-0 text-right">
          <div className="text-[11px] uppercase tracking-wider text-emerald-200 font-bold">
            Số dư Tinh Thạch
          </div>
          <div className="text-2xl font-black text-amber-300 flex items-center justify-end gap-1.5">
            <LuSparkles className="w-5 h-5" />
            {Number(userStatus?.worldCrystals || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* PHẦN 1: CÁC GÓI ĐẶC QUYỀN VIP */}
      <div className="bg-white/95 rounded-3xl border border-emerald-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-lg font-black text-emerald-950 flex items-center gap-2">
            <LuCrown className="w-5 h-5 text-amber-500" />
            1. Gói Đặc Quyền VIP (Đổi bằng Tinh Thạch)
          </h3>
          <span className="text-xs text-emerald-700 font-semibold">
            Cộng dồn thời hạn nếu đăng ký tiếp khi vẫn còn hạn VIP
          </span>
        </div>

        {vipFeedback && (
          <div
            className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-between gap-3 animate-fade-in ${
              vipFeedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <span className="flex items-center gap-2">
              {vipFeedback.type === "success" ? (
                <LuCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <LuCircleAlert className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{vipFeedback.text}</span>
            </span>
            <button
              type="button"
              onClick={() => setVipFeedback(null)}
              className="text-xs underline opacity-75 hover:opacity-100 shrink-0"
            >
              Đóng
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vipPlans.map((plan) => {
            const isGuardian = plan.tier === 2;
            const isLowerThanActiveVip = Boolean(
              userStatus?.isVip && Number(userStatus?.vipTier) > Number(plan.tier)
            );
            const isSameAsActiveVip = Boolean(
              userStatus?.isVip && Number(userStatus?.vipTier) === Number(plan.tier)
            );
            const isUpgradeFromActiveVip = Boolean(
              userStatus?.isVip && Number(userStatus?.vipTier) < Number(plan.tier)
            );

            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                  isGuardian
                    ? "bg-gradient-to-br from-amber-50/90 via-white to-emerald-50/60 border-amber-300 shadow-md"
                    : "bg-emerald-50/40 border-emerald-200/80"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                        isGuardian
                          ? "bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 border border-amber-300"
                          : "bg-gradient-to-r from-emerald-600 to-teal-500 text-white border border-emerald-400"
                      }`}
                    >
                      <LuCrown
                        className={`w-3.5 h-3.5 ${
                          isGuardian
                            ? "text-amber-900 fill-amber-600"
                            : "text-emerald-100 fill-emerald-300"
                        }`}
                      />
                      {isGuardian ? "VIP Vàng • Bậc 2" : "VIP Xanh • Bậc 1"}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Thời hạn: {plan.durationDays} ngày
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xl font-black text-slate-900">{plan.name}</h4>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-emerald-700">
                        {plan.priceCrystals.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-emerald-800/70">
                        Tinh Thạch / {plan.durationDays} ngày
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-700 font-semibold pt-2 border-t border-slate-200/60">
                    {(plan.perks || []).map((perk, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <LuShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleSubscribeVip(plan.tier)}
                  disabled={subscribingTier === plan.tier || isLowerThanActiveVip}
                  title={
                    isLowerThanActiveVip
                      ? "Bạn đã sở hữu gói VIP Vàng cao cấp hơn nên không thể mua gói VIP Xanh thấp hơn"
                      : ""
                  }
                  className={`mt-5 w-full py-2.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition shadow-sm ${
                    isLowerThanActiveVip
                      ? "bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed"
                      : isGuardian
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 cursor-pointer"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  } disabled:opacity-70`}
                >
                  <LuCrown
                    className={`w-4 h-4 ${
                      isLowerThanActiveVip
                        ? "text-slate-400"
                        : isGuardian
                        ? "text-amber-950 fill-amber-700"
                        : "text-emerald-100 fill-emerald-300"
                    }`}
                  />
                  {subscribingTier === plan.tier
                    ? "Đang kích hoạt..."
                    : isLowerThanActiveVip
                    ? "Đã sở hữu gói VIP Vàng cao hơn"
                    : isUpgradeFromActiveVip
                    ? `Nâng cấp ${plan.name} (${plan.priceCrystals} Tinh Thạch)`
                    : isSameAsActiveVip
                    ? `Gia hạn ${plan.name} (${plan.priceCrystals} Tinh Thạch)`
                    : `Kích hoạt ${plan.name} (${plan.priceCrystals} Tinh Thạch)`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* PHẦN 2: NẠP TINH THẠCH TỰ ĐỘNG */}
      <div className="bg-white/95 rounded-3xl border border-emerald-100 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-lg font-black text-emerald-950 flex items-center gap-2">
            <LuWallet className="w-5 h-5 text-emerald-600" />
            2. Nạp Tinh Thạch Tự Động (VietQR / MoMo / ZaloPay)
          </h3>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Tỉ giá: {(vndPerCrystal * 10).toLocaleString()}đ = 10 Tinh Thạch
          </span>
        </div>

        {/* Chọn gói nạp */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {depositPackages.map((pkg) => {
            const active = selectedPkgId === pkg.id;
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setSelectedPkgId(pkg.id)}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  active
                    ? "bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-sm"
                    : "bg-white hover:bg-emerald-50/40 border-slate-200"
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                    Phổ biến
                  </span>
                )}
                <div className="text-lg font-black text-emerald-900 flex items-center gap-1">
                  <LuSparkles className="w-4 h-4 text-amber-500" />
                  {pkg.crystals.toLocaleString()} Tinh Thạch
                </div>
                {pkg.bonus > 0 ? (
                  <div className="text-xs font-extrabold text-amber-600 mt-0.5">
                    + Tặng thêm {pkg.bonus.toLocaleString()} Tinh Thạch
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 mt-0.5">Gói cơ bản</div>
                )}
                <div className="mt-2 pt-2 border-t border-slate-100 text-sm font-black text-slate-800">
                  {pkg.amountVnd.toLocaleString()}đ
                </div>
              </button>
            );
          })}

          {/* Gói tùy chỉnh */}
          <div
            onClick={() => setSelectedPkgId("CUSTOM")}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              selectedPkgId === "CUSTOM"
                ? "bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/30"
                : "bg-slate-50/70 border-slate-200"
            }`}
          >
            <div className="text-xs font-extrabold uppercase text-emerald-800 mb-1.5">
              Số tiền tùy chỉnh (10.000đ – 5.000.000đ)
            </div>
            <input
              type="number"
              min="10000"
              max="5000000"
              step="1000"
              value={customVnd}
              onChange={(e) => {
                setSelectedPkgId("CUSTOM");
                setCustomVnd(e.target.value);
                if (depositFeedback?.type === "error") setDepositFeedback(null);
              }}
              placeholder="Nhập từ 10000 trở lên..."
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <div className="mt-1.5 flex items-center justify-between text-xs font-bold">
              <span className="text-emerald-700">
                Nhận: {Math.floor((parseInt(customVnd, 10) || 0) / vndPerCrystal).toLocaleString()} Tinh Thạch
              </span>
              {selectedPkgId === "CUSTOM" &&
                customVnd !== "" &&
                (parseInt(customVnd, 10) < 10000 || parseInt(customVnd, 10) > 5000000) && (
                  <span className="text-[11px] text-rose-600 font-extrabold">
                    Tối thiểu 10.000đ
                  </span>
                )}
            </div>
          </div>
        </div>

        {/* Thông báo lỗi / thành công hiển thị NGAY TẠI CHỖ BẤM NẠP */}
        {depositFeedback && (
          <div
            className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-between gap-3 animate-fade-in ${
              depositFeedback.type === "success"
                ? "bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs"
                : "bg-rose-50 border-rose-300 text-rose-800 shadow-xs"
            }`}
          >
            <span className="flex items-center gap-2">
              {depositFeedback.type === "success" ? (
                <LuCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <LuCircleAlert className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{depositFeedback.text}</span>
            </span>
            <button
              type="button"
              onClick={() => setDepositFeedback(null)}
              className="text-xs underline opacity-75 hover:opacity-100 shrink-0"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Chọn phương thức & tạo mã QR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMethod(m.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                  selectedMethod === m.id
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-emerald-50"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCreateOrder}
            disabled={creatingOrder}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
          >
            <LuQrCode className="w-4 h-4" />
            {creatingOrder ? "Đang khởi tạo mã QR..." : "Tạo Mã QR Nạp Tự Động"}
          </button>
        </div>

        {/* Hộp hiển thị mã QR & nút Giả lập Webhook tự động 1-chạm */}
        {activeOrder && (
          <div
            ref={qrSectionRef}
            className="mt-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 p-5 flex flex-col md:flex-row items-center gap-6"
          >
            <div className="bg-white p-3 rounded-2xl border border-emerald-200 shadow-sm shrink-0">
              <img
                src={activeOrder.qrUrl}
                alt="QR Nạp Tự Động"
                className="w-44 h-44 object-contain"
              />
            </div>

            <div className="flex-1 space-y-2.5 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-700 text-white text-xs font-black">
                  Mã đơn: #{activeOrder.orderCode}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-xs font-black ${
                    activeOrder.status === "PAID"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}
                >
                  {activeOrder.status === "PAID" ? "ĐÃ THANH TOÁN TỰ ĐỘNG" : "ĐANG CHỜ QUÉT MÃ..."}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white/90 p-3 rounded-xl border border-emerald-200/80">
                <div>
                  <span className="text-slate-500 block">Ngân hàng / Ví:</span>
                  <strong className="text-slate-900">
                    {activeOrder.bankInfo?.bankName} ({activeOrder.method})
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Số tài khoản nhận:</span>
                  <strong className="text-slate-900">{activeOrder.bankInfo?.accountNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Số tiền chuyển:</span>
                  <strong className="text-emerald-700 text-sm">
                    {Number(activeOrder.amountVnd || 0).toLocaleString()}đ
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Nội dung chuyển khoản (Tự động):</span>
                  <strong className="text-rose-600 font-mono text-sm">
                    {activeOrder.transferContent}
                  </strong>
                </div>
              </div>

              <p className="text-xs text-emerald-900/80">
                Tổng nhận:{" "}
                <strong className="text-emerald-800">
                  +{Number(activeOrder.totalCrystals || 0).toLocaleString()} Tinh Thạch
                </strong>{" "}
                (gồm {activeOrder.crystals} gốc + {activeOrder.bonusCrystals} thưởng).
              </p>

              {activeOrder.status === "PENDING" && (
                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSimulateWebhook(activeOrder.orderCode)}
                    disabled={simulatingWebhook}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md transition disabled:opacity-50"
                  >
                    <LuZap className="w-4 h-4" />
                    {simulatingWebhook
                      ? "Đang xử lý Webhook..."
                      : "Xác Nhận Đã Chuyển Khoản (Tự Động Cộng Ngay)"}
                  </button>
                  <span className="text-[11px] text-emerald-800/70 italic">
                    (Cổng giả lập Demo: bấm nút trên để mô phỏng ngân hàng báo có tiền về & cộng Tinh Thạch tức thì)
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* PHẦN 3: LỊCH SỬ ĐƠN NẠP TỰ ĐỘNG */}
      <div className="bg-white/95 rounded-3xl border border-emerald-100 p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-emerald-950 flex items-center gap-2">
            <LuHistory className="w-5 h-5 text-emerald-600" />
            Lịch sử giao dịch nạp Tinh Thạch
          </h3>
          <button
            type="button"
            onClick={fetchAll}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            <LuRefreshCw className="w-3.5 h-3.5" /> Làm mới
          </button>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            Bạn chưa có đơn nạp Tinh Thạch nào.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-emerald-100 text-slate-500 uppercase">
                  <th className="py-2 pr-3">Mã đơn</th>
                  <th className="py-2 pr-3">Kênh</th>
                  <th className="py-2 pr-3">Số tiền</th>
                  <th className="py-2 pr-3">Tinh Thạch</th>
                  <th className="py-2 pr-3">Trạng thái</th>
                  <th className="py-2">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((o) => (
                  <tr key={o.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2.5 pr-3 font-mono font-bold text-slate-800">
                      #{o.orderCode}
                    </td>
                    <td className="py-2.5 pr-3 font-semibold text-slate-600">{o.method}</td>
                    <td className="py-2.5 pr-3 font-bold text-slate-800">
                      {Number(o.amountVnd || 0).toLocaleString()}đ
                    </td>
                    <td className="py-2.5 pr-3 font-extrabold text-emerald-700">
                      +{(Number(o.crystals) + Number(o.bonusCrystals || 0)).toLocaleString()}
                    </td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          o.status === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : o.status === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {o.status === "PAID"
                          ? "Hoàn tất"
                          : o.status === "PENDING"
                          ? "Đang chờ"
                          : o.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-500">
                      {new Date(o.createdAt || o.created_at).toLocaleString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

