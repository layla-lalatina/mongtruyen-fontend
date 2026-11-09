import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../config";

const XpHistoryComponent = ({ user }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.token) return;
    fetch(`${API_BASE_URL}/api/user/xp-history`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setHistory(data.history || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi fetch lịch sử XP:", err);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="py-8 text-center text-emerald-800 font-bold animate-pulse">
        🌱 Đang mở cuộn thư ký ức tu hành...
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="py-12 text-center text-emerald-800/60 font-semibold bg-emerald-50/10 rounded-2xl border border-dashed border-emerald-100/50">
        🍃 Bạn chưa tích lũy được điểm tu hành nào. Hãy bắt đầu hành trình đọc truyện và nhận nhiệm vụ!
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 border-b border-emerald-100 pb-3 flex justify-between items-center">
        <h3 className="text-base font-extrabold text-emerald-950 flex items-center gap-1.5">
          <span>⚡</span> Nhật ký tu hành (Lịch sử XP)
        </h3>
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          Tổng cộng {history.length} ký ức
        </span>
      </div>

      <div className="relative border-l border-emerald-100 pl-4 ml-2.5 space-y-5 py-2">
        {history.map((log) => (
          <div key={log.id} className="relative group">
            {/* Timeline node icon */}
            <div className="absolute -left-[24.5px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-emerald-500 bg-white group-hover:bg-emerald-500 group-hover:scale-110 transition-all duration-300" />
            
            <div className="bg-[#fbfcfa]/60 hover:bg-[#f6faf8] border border-emerald-100/30 p-3.5 rounded-2xl transition-all duration-200 shadow-sm flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-bold text-emerald-950 group-hover:text-emerald-800 transition-colors">
                  {log.reason}
                </p>
                <span className="text-[10px] text-gray-400 font-medium">
                  {new Date(log.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 hover:bg-emerald-100/50 px-3 py-1.5 rounded-xl border border-emerald-100 transition-colors">
                <span className="text-xs font-black">+{log.amount}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">XP</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default XpHistoryComponent;
