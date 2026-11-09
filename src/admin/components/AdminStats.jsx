import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../config";

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")).token
        : "";
      const res = await axios.get(`${API_BASE_URL}/api/comic/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setStats(res.data.stats);
      } else {
        setError("Không lấy được dữ liệu thống kê.");
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối máy chủ thống kê.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-black">
        <span className="inline-block animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
        <p className="text-sm font-bold text-emerald-800 mt-3 animate-pulse">
          Đang đọc nhật ký từ Thần Cây Irminsul...
        </p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm font-bold shadow-inner text-black">
        ⚠️ {error || "Đã xảy ra lỗi không xác định."}
        <button
          onClick={fetchStats}
          className="mt-3 block px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition font-extrabold text-xs"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // Format currency
  const formatVND = (num) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num || 0);
  };

  const maxViews = stats.topComics && stats.topComics.length > 0 ? stats.topComics[0].views || 1 : 1;
  const maxUsersInLevel = stats.levelDist && stats.levelDist.length > 0
    ? Math.max(...stats.levelDist.map(d => d.count))
    : 1;

  return (
    <div className="space-y-6 text-black">
      {/* Tiêu đề & Nút làm mới */}
      <div className="flex justify-between items-center border-b border-emerald-50 pb-4">
        <h2 className="text-xl font-bold text-emerald-950 flex items-center gap-2">
          <span className="inline-block w-2.5 h-6 bg-emerald-500 rounded-full"></span>
          Thống kê hệ thống
        </h2>
        <button
          onClick={fetchStats}
          className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold border border-emerald-200 text-xs rounded-xl shadow-sm transition-colors"
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Grid thẻ thông tin Tổng quan (Overview Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Người dùng */}
        <div className="p-5 bg-white border border-emerald-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl">
            👥
          </div>
          <div>
            <p className="text-[10px] uppercase font-black text-emerald-800/50 tracking-wider">Lữ Hành Giả</p>
            <h3 className="text-xl font-black text-emerald-950 mt-0.5">{stats.totalUsers}</h3>
            <p className="text-[9px] text-gray-400 mt-0.5">Tài khoản đăng ký</p>
          </div>
        </div>

        {/* Lượt Xem */}
        <div className="p-5 bg-white border border-indigo-50 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl">
            👁️
          </div>
          <div>
            <p className="text-[10px] uppercase font-black text-indigo-800/50 tracking-wider">Tổng Lượt Xem</p>
            <h3 className="text-xl font-black text-indigo-950 mt-0.5">{stats.totalViews}</h3>
            <p className="text-[9px] text-gray-400 mt-0.5">Lượt đọc truyện tranh</p>
          </div>
        </div>

        {/* Bảng Nhiệm Vụ RPG */}
        <div className="p-5 bg-white border border-amber-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl">
            📜
          </div>
          <div>
            <p className="text-[10px] uppercase font-black text-amber-800/50 tracking-wider">Nhiệm Vụ RPG</p>
            <h3 className="text-xl font-black text-amber-950 mt-0.5">{stats.totalQuests || 8} Nhiệm vụ</h3>
            <p className="text-[9px] text-gray-400 mt-0.5">Hệ thống tu vi Cây Thế Giới</p>
          </div>
        </div>

        {/* Tổng số truyện */}
        <div className="p-5 bg-white border border-teal-50 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-2xl">
            📖
          </div>
          <div>
            <p className="text-[10px] uppercase font-black text-teal-800/50 tracking-wider">Truyện & Chương</p>
            <h3 className="text-xl font-black text-teal-950 mt-0.5">{stats.totalComics} Truyện</h3>
            <p className="text-[9px] text-gray-400 mt-0.5">{stats.totalChapters} chương đã lưu</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 truyện đọc nhiều nhất */}
        <div className="p-5 bg-white border border-emerald-100 rounded-3xl shadow-sm flex flex-col">
          <h3 className="font-extrabold text-sm text-emerald-950 border-b border-emerald-50 pb-2 mb-4 flex items-center gap-1.5">
            🔥 Top 5 Truyện Có Lượt Xem Cao Nhất
          </h3>
          <div className="space-y-4 flex-1">
            {stats.topComics && stats.topComics.map((comic, index) => {
              const percentage = Math.round((comic.views / maxViews) * 100);
              return (
                <div key={comic.slug} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-emerald-950 truncate max-w-xs">
                      {index + 1}. {comic.name}
                    </span>
                    <span className="text-emerald-800 shrink-0 font-mono">{Number(comic.views || 0).toLocaleString()} views</span>
                  </div>
                  {/* Thanh phần trăm */}
                  <div className="w-full h-3 bg-emerald-50 rounded-full overflow-hidden border border-emerald-100/55">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {(!stats.topComics || stats.topComics.length === 0) && (
              <p className="text-xs text-gray-400 italic py-6 text-center">Chưa có số liệu truyện đọc.</p>
            )}
          </div>
        </div>

        {/* Top 5 Đại Phú Hào (Nhiều Crystals nhất) */}
        <div className="p-5 bg-white border border-emerald-100 rounded-3xl shadow-sm flex flex-col">
          <h3 className="font-extrabold text-sm text-emerald-950 border-b border-emerald-50 pb-2 mb-4 flex items-center gap-1.5">
            💎 Đại Gia Server (Pha Lê Tích Lũy)
          </h3>
          <div className="space-y-3.5 flex-1">
            {stats.topRichUsers && stats.topRichUsers.map((u, index) => {
              const medals = ["👑", "🥈", "🥉", "🎒", "🌱"];
              return (
                <div
                  key={u.username}
                  className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/20 border border-emerald-100/30 hover:bg-emerald-50/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm shrink-0">{medals[index] || "🌱"}</span>
                    <div>
                      <h4 className="text-xs font-extrabold text-emerald-950">{u.username}</h4>
                      <p className="text-[10px] text-emerald-700/60 font-semibold">Cấp độ: {u.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full shadow-inner">
                      {Number(u.worldCrystal || 0).toLocaleString()} 💎
                    </span>
                  </div>
                </div>
              );
            })}
            {(!stats.topRichUsers || stats.topRichUsers.length === 0) && (
              <p className="text-xs text-gray-400 italic py-6 text-center">Chưa có số liệu người dùng.</p>
            )}
          </div>
        </div>
      </div>

      {/* Phân bố cấp độ thành viên (Level Distribution Graph) */}
      <div className="p-6 bg-white border border-emerald-100 rounded-3xl shadow-sm">
        <h3 className="font-extrabold text-sm text-emerald-950 border-b border-emerald-50 pb-2 mb-6 flex items-center gap-1.5">
          🌳 Biểu Đồ Phân Bố Cấp Độ Lữ Hành Giả (RPG Level Distribution)
        </h3>

        {stats.levelDist && stats.levelDist.length > 0 ? (
          <div className="relative pt-6">
            {/* Trục đồ thị */}
            <div className="flex items-end justify-between h-48 border-b border-emerald-100 px-4 md:px-8">
              {stats.levelDist.map((item) => {
                const heightPercentage = Math.max(10, Math.round((item.count / maxUsersInLevel) * 100));

                return (
                  <div key={item.level} className="flex flex-col items-center group w-1/12 relative">
                    {/* Tooltip số lượng khi hover */}
                    <div className="absolute -top-7 scale-0 group-hover:scale-100 transition-transform bg-emerald-950 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-lg z-10 whitespace-nowrap">
                      {item.count} thành viên
                    </div>
                    {/* Thanh cột */}
                    <div
                      className="w-6 sm:w-8 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg transition-all duration-500 group-hover:from-emerald-600 group-hover:to-teal-500 shadow-md shadow-emerald-500/10 cursor-pointer"
                      style={{ height: `${heightPercentage}%` }}
                    />
                    {/* Level label */}
                    <span className="text-[10px] font-extrabold text-emerald-950 mt-2 block">
                      Lv.{item.level}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Ghi chú */}
            <div className="mt-4 flex items-center gap-1 text-[10px] text-gray-400 italic justify-center">
              <span>* Gợi ý: Rê chuột vào từng cột để xem số lượng chi tiết thành viên ở mỗi Cấp độ.</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic py-10 text-center">Chưa có số liệu phân bố cấp độ.</p>
        )}
      </div>
    </div>
  );
};

export default AdminStats;
