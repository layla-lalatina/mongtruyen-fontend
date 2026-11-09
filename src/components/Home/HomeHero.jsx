import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const QUOTES = [
  "🌟 Hãy giữ nụ cười, vì nó là vũ khí kỳ diệu nhất.",
  "✨ Con đường phiêu lưu không chỉ là nâng cao sức mạnh, mà còn là tích lũy ký ức Cây Thế Giới.",
  "🔥 Kiên trì vượt qua nghịch cảnh chính là chìa khóa mở lối kho tàng Cây Thế Giới.",
  "🍃 Tâm tĩnh như nước, tự khắc nhìn thấu chân lý của thế gian.",
  "🌅 Mỗi bình minh thức dậy là một cơ hội mới để ta đột phá giới hạn của chính mình.",
  "💫 Đi vạn dặm đường học hỏi tốt hơn là chỉ đứng im một chỗ ngắm nhìn bầu trời.",
  "🔮 Khám phá RPG cần kiên trì, tự khắc cơ duyên và phần thưởng sẽ tới.",
];

const HomeHero = ({ user, profile }) => {
  const [time, setTime] = useState(new Date());
  const [quote, setQuote] = useState("");

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getVietnameseDateString = (date) => {
    const days = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    const dayOfWeek = days[date.getDay()];
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${dayOfWeek}, ${day} tháng ${month}, ${year}`;
  };

  const getTimeString = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="relative bg-gradient-to-r from-[#07241d] via-[#0d3b30] to-[#124d3e] text-white py-10 px-6 sm:px-10 mb-6 shadow-md border-b border-emerald-500/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.1)_0%,transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* CỘT TRÁI (6/12): Đồng Hồ & Danh Ngôn Đại Đạo */}
        <div className="lg:col-span-6 flex flex-col justify-center text-center lg:text-left space-y-4">
          <div>
            <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-extrabold uppercase tracking-widest px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-2">
              <span>📅</span> Đại Đạo Thiên Cơ
            </span>
            <div className="text-sm md:text-md text-emerald-100/80 font-bold">
              {getVietnameseDateString(time)}
            </div>
            <div className="text-4xl md:text-5xl font-black text-emerald-400 font-mono tracking-wider mt-1 drop-shadow-md">
              {getTimeString(time)}
            </div>
          </div>
          <p className="text-sm md:text-md italic text-emerald-100 max-w-xl mx-auto lg:mx-0 drop-shadow font-medium border-l-2 border-emerald-400/40 pl-3.5">
            {quote}
          </p>
        </div>

        {/* CỘT PHẢI (6/12): RPG Dashboard / Website Stats */}
        <div className="lg:col-span-6 w-full">
          {user ? (
            <div className="bg-emerald-950/40 backdrop-blur-md border border-emerald-500/20 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-emerald-500/10 pb-2.5">
                <span className="text-xs font-black uppercase text-emerald-300 tracking-wider flex items-center gap-1.5">
                  <span>🔮</span> Linh Căn & Bí Cảnh Tu Luyện
                </span>
                <span className="text-[10px] font-bold text-emerald-100/70">
                  Lữ hành:{" "}
                  <span className="text-white font-extrabold">
                    {profile?.username || user.username}
                  </span>
                </span>
              </div>

              {profile ? (
                <div className="grid grid-cols-2 gap-4">
                  {/* Cấp độ */}
                  <div className="bg-emerald-950/30 border border-emerald-500/10 p-3 rounded-2xl">
                    <div className="text-[10px] font-bold text-emerald-300/80">
                      Cảnh Giới (Cấp)
                    </div>
                    <div className="text-sm font-black text-white flex items-baseline gap-1 mt-0.5">
                      Cấp {profile.level}{" "}
                      <span className="text-[10px] text-emerald-300/80 font-medium">
                        ({profile.levelTitle})
                      </span>
                    </div>
                    <div className="w-full bg-emerald-950/70 h-1.5 rounded-full mt-2 overflow-hidden border border-emerald-500/10">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${profile.levelProgress}%` }}
                      />
                    </div>
                    <div className="text-[9px] text-emerald-100/60 mt-1 flex justify-between">
                      <span>
                        XP: {profile.xpCurrent}/{profile.xpNeeded}
                      </span>
                      <span>{profile.levelProgress}%</span>
                    </div>
                  </div>

                  {/* Danh vọng */}
                  <div className="bg-emerald-950/30 border border-emerald-500/10 p-3 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-emerald-300/80">
                        Danh Vọng Đạo Pháp
                      </div>
                      <div className="text-sm font-black text-emerald-100 mt-0.5">
                        🌟 {profile.danhVongTitle}
                      </div>
                    </div>
                    <div className="text-[9px] text-emerald-300/60 mt-1">
                      Bậc: {profile.danhVong}
                    </div>
                  </div>

                  {/* World Crystal */}
                  <div className="bg-emerald-950/30 border border-emerald-500/10 p-3 rounded-2xl flex items-center justify-between col-span-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl animate-pulse">💎</span>
                      <div>
                        <div className="text-[9px] font-bold text-emerald-300/80">
                          Pha Lê Thế Giới (World Crystals)
                        </div>
                        <div className="text-sm font-black text-amber-400">
                          {profile.crystals || 0} Crystals
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/profile?tab=shop"
                      className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-350 text-emerald-950 text-xs font-black rounded-xl shadow-md transition-all active:scale-95 shrink-0"
                    >
                      🏪 Vào Tiệm Kỳ Trân
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-emerald-300/70 font-semibold animate-pulse">
                  🌀 Đang mở kết nối với thần cách...
                </div>
              )}
            </div>
          ) : (
            /* Chưa Đăng Nhập - Hiển Thị Thống Kê & Nút Đăng Ký Nhận Thưởng */
            <div className="bg-emerald-950/40 backdrop-blur-md border border-emerald-500/20 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-center">
              <div>
                <h3 className="text-base font-extrabold text-emerald-300">
                  🌳 Chào Mừng Lữ Hành Đến Mộng Truyện
                </h3>
                <p className="text-xs text-emerald-100/70 mt-1 max-w-md mx-auto">
                  Hãy đăng nhập để lưu trữ ký ức, làm nhiệm vụ tích lũy linh thạch
                  và đột phá tu vi cảnh giới.
                </p>
              </div>
              <div className="flex justify-center gap-3 mt-1">
                <Link
                  to="/login"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
                >
                  🔑 Khởi Động Đăng Nhập
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
                >
                  ✨ Đăng Ký Nhận Cốt Tủy
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeHero;
