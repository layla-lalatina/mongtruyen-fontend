import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import NotificationModal from "../../components/Common/NotificationModal";

// Danh sách 13 Tầng Cảnh Giới của Cây Thế Giới Irminsul
export const REALMS = [
  { tier: 0, id: "ALL", name: "Tất cả (Mọi cảnh giới)", minLevel: 1, maxLevel: 999, color: "text-gray-600" },
  { tier: 1, id: "REALM_1", name: "Người Mới Thức Tỉnh", minLevel: 1, maxLevel: 20, color: "text-emerald-700" },
  { tier: 2, id: "REALM_2", name: "Kẻ Tìm Đường", minLevel: 21, maxLevel: 40, color: "text-teal-700" },
  { tier: 3, id: "REALM_3", name: "Lữ Hành Giả", minLevel: 41, maxLevel: 60, color: "text-cyan-700" },
  { tier: 4, id: "REALM_4", name: "Nhà Thám Hiểm", minLevel: 61, maxLevel: 80, color: "text-blue-700" },
  { tier: 5, id: "REALM_5", name: "Người Gìn Giữ Tri Thức", minLevel: 81, maxLevel: 100, color: "text-indigo-700" },
  { tier: 6, id: "REALM_6", name: "Người Ghi Chép Ký Ức", minLevel: 101, maxLevel: 120, color: "text-violet-700" },
  { tier: 7, id: "REALM_7", name: "Học Giả Cổ Đại", minLevel: 121, maxLevel: 140, color: "text-purple-700" },
  { tier: 8, id: "REALM_8", name: "Hiền Giả", minLevel: 141, maxLevel: 160, color: "text-fuchsia-700" },
  { tier: 9, id: "REALM_9", name: "Đại Hiền Giả", minLevel: 161, maxLevel: 180, color: "text-pink-700" },
  { tier: 10, id: "REALM_10", name: "Thủ Hộ Cổ Thụ", minLevel: 181, maxLevel: 200, color: "text-rose-700" },
  { tier: 11, id: "REALM_11", name: "Người Canh Giữ Irminsul", minLevel: 201, maxLevel: 250, color: "text-amber-700" },
  { tier: 12, id: "REALM_12", name: "Người Viết Lại Lịch Sử", minLevel: 251, maxLevel: 300, color: "text-orange-700" },
  { tier: 13, id: "REALM_13", name: "Hóa Thân Irminsul", minLevel: 301, maxLevel: 9999, color: "text-yellow-600" },
];

// Danh sách 10 Bậc Rank & Hạng Danh Xưng Danh Vọng
export const FAME_RANKS = [
  { tier: 0, id: "ALL", rank: "Mọi Rank", title: "Mọi Hạng", recommendedRealmTier: 0 },
  { tier: 1, id: "RANK_F", rank: "F", title: "Người Mới", recommendedRealmTier: 1 },
  { tier: 2, id: "RANK_E", rank: "E", title: "Lữ Hành Giả", recommendedRealmTier: 2 },
  { tier: 3, id: "RANK_D", rank: "D", title: "Nhà Thám Hiểm", recommendedRealmTier: 3 },
  { tier: 4, id: "RANK_C", rank: "C", title: "Học Giả", recommendedRealmTier: 4 },
  { tier: 5, id: "RANK_B", rank: "B", title: "Hiền Giả", recommendedRealmTier: 5 },
  { tier: 6, id: "RANK_A", rank: "A", title: "Đại Hiền Giả", recommendedRealmTier: 7 },
  { tier: 7, id: "RANK_S", rank: "S", title: "Người Gìn Giữ Ký Ức", recommendedRealmTier: 9 },
  { tier: 8, id: "RANK_SS", rank: "SS", title: "Thủ Hộ Irminsul", recommendedRealmTier: 10 },
  { tier: 9, id: "RANK_SSS", rank: "SSS", title: "Người Viết Lại Lịch Sử", recommendedRealmTier: 12 },
  { tier: 10, id: "RANK_EX", rank: "EX", title: "Hóa Thân Irminsul", recommendedRealmTier: 13 },
];

export const getRealmByLevel = (level = 1) => {
  const num = Number(level) || 1;
  const match = REALMS.slice(1).find(r => num >= r.minLevel && num <= r.maxLevel);
  return match || REALMS[1];
};

export const getRealmById = (realmId) => {
  return REALMS.find(r => r.id === realmId) || REALMS[0];
};

export const getFameRankInfo = (rankId) => {
  return FAME_RANKS.find(r => r.id === rankId) || FAME_RANKS[0];
};

const AdminTasksManager = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Bảng thông báo chung tùy biến
  const [notice, setNotice] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    mode: "toast",
  });

  const showNotice = ({ type = "success", title, message, mode = "toast" }) => {
    setNotice({ isOpen: true, type, title, message, mode });
  };

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [actionType, setActionType] = useState("READ_CHAPTER");
  const [targetValue, setTargetValue] = useState(1);
  const [rewardXp, setRewardXp] = useState(10);
  const [rewardCrystal, setRewardCrystal] = useState(5);
  const [type, setType] = useState("daily");
  
  // 3 tiêu chí phân chia RPG
  const [minRealmId, setMinRealmId] = useState("ALL");
  const [minFameRank, setMinFameRank] = useState("ALL");

  const [showFormModal, setShowFormModal] = useState(false);

  // Khóa cuộn trang nền khi mở modal để không bị trôi/lệch giao diện
  useEffect(() => {
    if (showFormModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showFormModal]);

  const getHeaders = () => {
    const storedUser = localStorage.getItem("user");
    const token = storedUser ? JSON.parse(storedUser).token : null;
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/tasks`, getHeaders());
      if (response.data.success) {
        setTasks(response.data.tasks || []);
      }
    } catch (err) {
      console.error("Lỗi fetch tasks:", err);
      setError(err.response?.data?.message || "Lỗi server khi lấy danh sách nhiệm vụ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const clearForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setCode("");
    setTitle("");
    setDescription("");
    setActionType("READ_CHAPTER");
    setTargetValue(1);
    setMinRealmId("ALL");
    setMinFameRank("ALL");
    setRewardXp(10);
    setRewardCrystal(5);
    setType("daily");
  };

  const handleOpenCreateModal = () => {
    clearForm();
    setShowFormModal(true);
  };

  const handleOpenEditModal = (task) => {
    setIsEditing(true);
    setEditingId(task.id);
    setCode(task.code);
    setTitle(task.title);
    setDescription(task.description);
    setActionType(task.actionType);
    setTargetValue(task.targetValue);
    
    // Tìm realm tương ứng từ minLevel
    if (!task.minLevel || task.minLevel <= 1) {
      setMinRealmId("ALL");
    } else {
      const realm = getRealmByLevel(task.minLevel);
      setMinRealmId(realm.id);
    }
    
    setMinFameRank(task.minFameRank || "ALL");
    setRewardXp(task.rewardXp);
    setRewardCrystal(task.rewardCrystal);
    setType(task.type);
    setShowFormModal(true);
  };

  // Tính toán cảnh báo mâu thuẫn giữa Cảnh Giới và Rank
  const selectedRealm = getRealmById(minRealmId);
  const selectedRankInfo = getFameRankInfo(minFameRank);
  
  // Các mốc đặc biệt tối thượng Irminsul:
  // - Rank Tối Thượng: SS (tier 8), SSS (tier 9), EX (tier 10)
  // - Cảnh Giới Tối Thượng: Tầng 11, 12, 13
  const isUltimateRank = selectedRankInfo.tier >= 8;
  const isUltimateRealm = selectedRealm.tier >= 11;

  // CHỈ hiển thị cảnh báo ở các MỐC ĐẶC BIỆT khi có sự chênh lệch lớn giữa Tu Vi và Danh Vọng:
  // (ví dụ đòi Rank EX/SSS nhưng Cảnh giới lại để Tầng 1 tân thủ, hoặc ngược lại)
  // Còn lại tất cả các mốc thông thường (Tầng 1-10, Rank F-S) đều tạo hoàn toàn bình thường, không hiện cảnh báo.
  const hasMismatch = 
    (isUltimateRank && selectedRealm.tier < 7) ||
    (isUltimateRealm && selectedRankInfo.tier > 0 && selectedRankInfo.tier < 5);
  
  // Hàm tự động cân bằng Cảnh Giới tương ứng với Rank đã chọn
  const handleAutoAlignRealm = () => {
    const recommendedRealm = REALMS.find(r => r.tier === selectedRankInfo.recommendedRealmTier);
    if (recommendedRealm) {
      setMinRealmId(recommendedRealm.id);
    }
  };

  // Hàm tự động cân bằng Rank tương ứng với Cảnh Giới đã chọn
  const handleAutoAlignRank = () => {
    // Tìm rank cao nhất phù hợp với cảnh giới này
    const suitableRanks = FAME_RANKS.filter(r => r.recommendedRealmTier <= selectedRealm.tier);
    const bestRank = suitableRanks[suitableRanks.length - 1];
    if (bestRank) {
      setMinFameRank(bestRank.id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // minLevel được tính tự động từ Cảnh Giới
    const calculatedMinLevel = selectedRealm.minLevel;

    const payload = {
      code,
      title,
      description,
      actionType,
      targetValue: Number(targetValue),
      minLevel: calculatedMinLevel,
      minFameRank: minFameRank || "ALL",
      rewardXp: Number(rewardXp),
      rewardCrystal: Number(rewardCrystal),
      type
    };

    try {
      if (isEditing) {
        const response = await axios.put(`${API_BASE_URL}/api/admin/tasks/${editingId}`, payload, getHeaders());
        if (response.data.success) {
          setSuccessMessage(response.data.message || "Cập nhật nhiệm vụ thành công!");
          showNotice({
            type: "success",
            title: "Cập nhật thành công! 📜",
            message: `Đã cập nhật cấu hình cho nhiệm vụ [${title}].`,
          });
          fetchTasks();
          setShowFormModal(false);
        }
      } else {
        const response = await axios.post(`${API_BASE_URL}/api/admin/tasks`, payload, getHeaders());
        if (response.data.success) {
          setSuccessMessage(response.data.message || "Tạo nhiệm vụ thành công!");
          showNotice({
            type: "success",
            title: "Tạo nhiệm vụ thành công! ✨",
            message: `Đã kích hoạt nhiệm vụ mới [${title}] (+${rewardXp} XP, 💎 +${rewardCrystal} Crystal).`,
          });
          fetchTasks();
          setShowFormModal(false);
        }
      }
    } catch (err) {
      console.error("Lỗi submit form:", err);
      const msg = err.response?.data?.message || "Lỗi xử lý yêu cầu.";
      setError(msg);
      showNotice({
        type: "error",
        title: "Thao tác thất bại! ❌",
        message: msg,
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhiệm vụ này? Hành động này không thể hoàn tác.")) return;
    setError("");
    setSuccessMessage("");
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/admin/tasks/${id}`, getHeaders());
      if (response.data.success) {
        setSuccessMessage("Xóa nhiệm vụ thành công!");
        showNotice({
          type: "success",
          title: "Đã xóa nhiệm vụ! 🗑️",
          message: "Nhiệm vụ đã được gỡ bỏ an toàn khỏi Cây Thế Giới.",
        });
        fetchTasks();
      }
    } catch (err) {
      console.error("Lỗi xóa task:", err);
      const msg = err.response?.data?.message || "Lỗi xóa nhiệm vụ.";
      setError(msg);
      showNotice({
        type: "error",
        title: "Xóa thất bại! ❌",
        message: msg,
      });
    }
  };

  const getActionTypeLabel = (val) => {
    switch (val) {
      case "CHECK_IN": return "📅 Điểm danh Cây Thế Giới";
      case "READ_CHAPTER": return "📖 Đọc chương truyện";
      case "POST_COMMENT":
      case "COMMENT": return "💬 Viết bình luận";
      case "BOOKMARK_COMIC":
      case "FOLLOW_COMIC": return "⭐ Theo dõi truyện";
      case "READ_FIRST": return "🌱 Đọc chương đầu";
      case "READ_100": return "👑 Đọc tích lũy chương";
      case "RECEIVE_LIKE":
      case "RECEIVE_100_LIKES": return "❤️ Nhận lượt thích (Like)";
      case "DAILY_LOGIN": return "🔑 Đăng nhập ngày";
      default: return val;
    }
  };

  const getTypeLabel = (val) => {
    const lower = (val || "").toLowerCase();
    switch (lower) {
      case "daily": return "Hằng ngày";
      case "weekly": return "Hằng tuần";
      case "achievement": return "Thành tích";
      case "ai_dynamic": return "AI Nhiệm vụ";
      default: return val;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Nút thêm mới */}
      <div className="flex justify-between items-center border-b border-emerald-100 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-emerald-950">Quản Lý Nhiệm Vụ 📜</h2>
          <p className="text-xs text-gray-500 mt-1">Cấu hình bảng nhiệm vụ RPG cho người dùng làm nhiệm vụ tích lũy tu vi.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
        >
          ➕ Thêm Nhiệm Vụ Mới
        </button>
      </div>

      {/* Thông báo lỗi/thành công */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-xs px-4 py-3.5 rounded-xl shadow-inner font-bold">
          ⚠️ {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs px-4 py-3.5 rounded-xl shadow-inner font-bold">
          ✨ {successMessage}
        </div>
      )}

      {/* Bảng danh sách nhiệm vụ */}
      {loading ? (
        <div className="text-center py-12 text-emerald-850 font-bold animate-pulse">
          🔄 Đang tải dữ liệu bảng nhiệm vụ thế giới...
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-emerald-50/5 rounded-3xl border border-dashed border-emerald-100">
          Chưa có nhiệm vụ nào được cấu hình trong bí cảnh này. Hãy bấm nút phía trên để tạo nhiệm vụ đầu tiên!
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-emerald-100/60 shadow-sm bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-emerald-950 text-white text-xs font-bold uppercase tracking-wider">
                <th className="p-4 rounded-tl-2xl">Mã</th>
                <th className="p-4">Tên nhiệm vụ</th>
                <th className="p-4">Loại nhiệm vụ</th>
                <th className="p-4">Hành động</th>
                <th className="p-4 text-center">Điều kiện RPG (Cảnh Giới / Rank / Hạng)</th>
                <th className="p-4 text-center">Mục tiêu</th>
                <th className="p-4 text-center">Phần thưởng (XP/Crys)</th>
                <th className="p-4 rounded-tr-2xl text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50 text-xs font-medium">
              {tasks.map((task) => {
                const realm = getRealmByLevel(task.minLevel);
                const fameInfo = getFameRankInfo(task.minFameRank);
                const hasRealmReq = task.minLevel && task.minLevel > 1;
                const hasRankReq = task.minFameRank && task.minFameRank !== "ALL";

                return (
                  <tr key={task.id} className="hover:bg-emerald-50/20 transition">
                    <td className="p-4 text-emerald-800 font-bold font-mono">{task.code}</td>
                    <td className="p-4">
                      <p className="font-bold text-gray-800">{task.title}</p>
                      <p className="text-[10px] text-gray-400 font-normal">{task.description}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                        task.type === "daily" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                        task.type === "weekly" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                        "bg-purple-50 text-purple-700 border border-purple-100"
                      }`}>
                        {getTypeLabel(task.type)}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 font-bold">{getActionTypeLabel(task.actionType)}</td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {/* Cảnh Giới */}
                        {hasRealmReq ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 border border-emerald-200 ${realm.color}`}>
                            ⚔️ Tầng {realm.tier}: {realm.name}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-gray-400 bg-gray-50 border border-gray-150">
                            🌟 Mọi Cảnh Giới
                          </span>
                        )}

                        {/* Rank & Hạng */}
                        {hasRankReq ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200">
                            🎖️ Rank {fameInfo.rank} • Hạng {fameInfo.title}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium text-gray-400 bg-gray-50 border border-gray-100">
                            🏷️ Mọi Rank & Hạng
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center font-bold text-emerald-700">{task.targetValue} lần</td>
                    <td className="p-4 text-center">
                      <span className="font-bold text-emerald-600">+{task.rewardXp} XP</span>
                      <span className="mx-1 text-gray-300">/</span>
                      <span className="font-bold text-teal-600">+{task.rewardCrystal} 💎</span>
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(task)}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-100/50 font-bold"
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-100/50 font-bold"
                      >
                        🗑️ Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form Thêm/Sửa - Render qua createPortal vào document.body để cố định chính giữa màn hình (tránh lỗi backdrop-blur containing block) */}
      {showFormModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[99999] p-3 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xl max-w-3xl w-full relative animate-scale-up max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header (Cố định ở đỉnh) */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 shrink-0 bg-gradient-to-r from-emerald-50/80 to-teal-50/40">
              <h3 className="text-base font-extrabold text-emerald-950 flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs">
                  {isEditing ? "✏️" : "➕"}
                </span>
                {isEditing ? "Chỉnh Sửa Nhiệm Vụ" : "Thêm Nhiệm Vụ Mới"}
              </h3>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-emerald-100 text-gray-500 hover:text-emerald-800 flex items-center justify-center text-sm font-bold transition active:scale-95"
              >
                ✕
              </button>
            </div>

            {/* Form Body (Scrollable độc lập, không bị cắt viền) */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
                {/* Hàng 1: Mã và Tên nhiệm vụ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Mã Nhiệm Vụ (Unique Code)</label>
                    <input
                      type="text"
                      required
                      disabled={isEditing}
                      placeholder="Ví dụ: READ_10_CHAPTERS, LIKE_200"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="w-full p-2.5 border border-emerald-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Tên Nhiệm Vụ</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Siêu Cấp Đọc Giả, Thần Tượng Giới Tu Tiên"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-2.5 border border-emerald-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Hàng 2: Mô tả */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Mô tả chi tiết</label>
                  <textarea
                    placeholder="Ví dụ: Đọc hết các chương truyện để tích lũy kiến thức hoặc nhận được nhiều lượt thích từ cộng đồng..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 border border-emerald-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 h-16 resize-none"
                  />
                </div>

                {/* Hàng 3: Chu kỳ, Hành động và Mục tiêu linh hoạt */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50/70 p-3.5 rounded-2xl border border-gray-150">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Chu kỳ hạn</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="daily">Hằng ngày</option>
                      <option value="weekly">Hằng tuần</option>
                      <option value="achievement">Thành tích (Dài hạn)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Hành động kích hoạt</label>
                    <select
                      value={actionType}
                      onChange={(e) => {
                        const val = e.target.value;
                        setActionType(val);
                        // Đề xuất mục tiêu mặc định hợp lý
                        if (val === "RECEIVE_LIKE" || val === "RECEIVE_100_LIKES") setTargetValue(100);
                        else if (val === "READ_CHAPTER" || val === "READ_100") setTargetValue(10);
                        else if (val === "POST_COMMENT") setTargetValue(3);
                        else if (val === "BOOKMARK_COMIC") setTargetValue(1);
                        else if (val === "CHECK_IN" || val === "DAILY_LOGIN") setTargetValue(1);
                      }}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 bg-white text-emerald-950"
                    >
                      <option value="READ_CHAPTER">📖 Đọc chương truyện</option>
                      <option value="RECEIVE_LIKE">❤️ Nhận lượt thích (Like)</option>
                      <option value="POST_COMMENT">💬 Viết bình luận</option>
                      <option value="BOOKMARK_COMIC">⭐ Theo dõi truyện</option>
                      <option value="CHECK_IN">📅 Điểm danh Cây Thế Giới</option>
                      <option value="DAILY_LOGIN">🔑 Đăng nhập ngày</option>
                      <option value="READ_FIRST">🌱 Đọc chương đầu tiên</option>
                      <option value="READ_100">👑 Đọc tích lũy chương</option>
                      <option value="RECEIVE_100_LIKES">❤️ Nhận lượt like (legacy)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                      <span>Mục tiêu (Số lần)</span>
                      <span className="text-[10px] text-emerald-700 font-bold">{targetValue} lần</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={targetValue}
                      onChange={(e) => setTargetValue(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full p-2 border border-gray-200 rounded-xl text-xs font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                    {/* Nút quick-pick mục tiêu nhanh */}
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      <span className="text-[9px] text-gray-400">Nhanh:</span>
                      {[1, 5, 10, 50, 100, 200, 500, 1000].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setTargetValue(num)}
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition ${
                            Number(targetValue) === num
                              ? "bg-emerald-600 text-white"
                              : "bg-gray-200/80 hover:bg-emerald-100 text-gray-600 hover:text-emerald-800"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* KHU VỰC PHÂN CHIA NHIỆM VỤ THEO CẢNH GIỚI, RANK, HẠNG */}
                <div className="bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white p-4 rounded-2xl border border-emerald-200/80 shadow-inner space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                    <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                      <span>⚔️</span> Phân Chia Điều Kiện Nhiệm Vụ (Cảnh Giới • Rank • Hạng)
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full font-bold">
                      Chuẩn RPG Irminsul
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* 1. Chọn Cảnh Giới */}
                    <div>
                      <label className="block text-xs font-bold text-emerald-950 mb-1 flex items-center justify-between">
                        <span>1. Yêu Cầu Cảnh Giới (Tu Vi Cày Cấp)</span>
                        {selectedRealm.tier > 0 && (
                          <span className="text-[10px] font-extrabold text-emerald-700">
                            Tầng {selectedRealm.tier}/13
                          </span>
                        )}
                      </label>
                      <select
                        value={minRealmId}
                        onChange={(e) => setMinRealmId(e.target.value)}
                        className="w-full p-2.5 border border-emerald-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 bg-white text-emerald-900 shadow-sm"
                      >
                        {REALMS.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.tier === 0
                              ? "🌟 Tất cả (Mọi cảnh giới)"
                              : `Tầng ${r.tier}: ${r.name} (Lv.${r.minLevel}+)`}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {selectedRealm.tier === 0
                          ? "Mọi cảnh giới đều có thể tham gia nhiệm vụ này."
                          : `Người tu tiên phải đạt từ Tầng ${selectedRealm.tier} (${selectedRealm.name}) trở lên.`}
                      </p>
                    </div>

                    {/* 2. Chọn Rank & Hiển thị Hạng */}
                    <div>
                      <label className="block text-xs font-bold text-emerald-950 mb-1 flex items-center justify-between">
                        <span>2. Yêu Cầu Rank & Hạng (Đóng Góp Cộng Đồng)</span>
                        {selectedRankInfo.tier > 0 && (
                          <span className="text-[10px] font-extrabold text-amber-700">
                            Hạng: {selectedRankInfo.title}
                          </span>
                        )}
                      </label>
                      <select
                        value={minFameRank}
                        onChange={(e) => setMinFameRank(e.target.value)}
                        className="w-full p-2.5 border border-emerald-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 bg-white text-amber-900 shadow-sm"
                      >
                        {FAME_RANKS.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.tier === 0
                              ? "🌟 Tất cả (Mọi rank & hạng)"
                              : `🎖️ Rank ${f.rank} — Hạng ${f.title}`}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {selectedRankInfo.tier === 0
                          ? "Mọi người dùng không phân biệt danh vọng đều nhận được."
                          : `Yêu cầu đạt từ Rank ${selectedRankInfo.rank} (Hạng ${selectedRankInfo.title}) trở lên.`}
                      </p>
                    </div>
                  </div>

                  {/* Gợi ý chỉ xuất hiện ở các Mốc Đặc Biệt Tối Thượng (Vẫn cho phép giao nhiệm vụ bình thường) */}
                  {hasMismatch && (
                    <div className="bg-amber-50/95 border border-amber-300 rounded-2xl p-3.5 text-xs text-amber-900 space-y-2 animate-fade-in shadow-sm">
                      <div className="flex items-start gap-2.5">
                        <span className="text-xl leading-none">⚠️</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-extrabold text-amber-950 text-xs">
                              Lưu ý Mốc Đặc Biệt (Cấp Tối Thượng Thần Thoại Irminsul)
                            </p>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-200">
                              ✓ Vẫn giao được bình thường
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-900 mt-1 leading-relaxed">
                            {isUltimateRank ? (
                              <>
                                Nhiệm vụ đang yêu cầu mốc tối thượng <strong>Rank {selectedRankInfo.rank} — {selectedRankInfo.title}</strong> (cần hàng ngàn điểm Tri Thức, Danh Tiếng, Uy Tín) trong khi Cảnh Giới lại là <strong>Tầng {selectedRealm.tier}</strong>. Thông thường các nhiệm vụ đỉnh cao này yêu cầu người dùng đạt cấp độ cao ở cả 2 nhánh (Tu Vi lẫn Danh Vọng).
                              </>
                            ) : (
                              <>
                                Nhiệm vụ đang yêu cầu Cảnh Giới tối thượng <strong>Tầng {selectedRealm.tier} — {selectedRealm.name}</strong> trong khi Rank Danh Vọng lại chỉ là <strong>Rank {selectedRankInfo.rank}</strong>.
                              </>
                            )}
                            <br />
                            <span className="text-emerald-900 font-semibold">
                              💡 Bạn vẫn có thể bấm nút "Tạo mới" hoặc "Lưu thay đổi" bên dưới để giao bình thường, hoặc bấm nút đồng bộ nhanh:
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1 pl-7">
                        {isUltimateRank && selectedRankInfo.recommendedRealmTier > 0 && (
                          <button
                            type="button"
                            onClick={handleAutoAlignRealm}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-black text-[11px] rounded-lg shadow-sm transition active:scale-95 flex items-center gap-1"
                          >
                            ⚡ Đồng bộ Cảnh Giới lên Tầng {selectedRankInfo.recommendedRealmTier} ({REALMS.find(r => r.tier === selectedRankInfo.recommendedRealmTier)?.name})
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleAutoAlignRank}
                          className="px-3 py-1 bg-white hover:bg-amber-100 text-amber-900 font-bold text-[11px] rounded-lg border border-amber-300 shadow-sm transition active:scale-95"
                        >
                          🔄 Hạ Rank về phù hợp với Cảnh Giới
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Huy hiệu xem trước điều kiện nhiệm vụ */}
                  <div className="bg-white/90 border border-emerald-100 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-600 text-[11px]">Điều kiện tổng hợp:</span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <span className={`px-2.5 py-0.5 rounded-lg font-extrabold text-[11px] bg-emerald-50 border border-emerald-200 ${selectedRealm.color}`}>
                        ⚔️ {selectedRealm.name} {selectedRealm.tier > 0 ? `(Tầng ${selectedRealm.tier})` : ""}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="px-2.5 py-0.5 rounded-lg font-extrabold text-[11px] bg-amber-50 text-amber-900 border border-amber-200">
                        🎖️ Rank {selectedRankInfo.rank} {selectedRankInfo.tier > 0 ? `(${selectedRankInfo.title})` : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hàng 4: Phần thưởng */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Phần thưởng XP</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={rewardXp}
                      onChange={(e) => setRewardXp(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full p-2.5 border border-emerald-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Phần thưởng Pha Lê (Crystal)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={rewardCrystal}
                      onChange={(e) => setRewardCrystal(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full p-2.5 border border-emerald-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Sticky Footer (Luôn hiển thị cố định ở đáy, không bao giờ bị cắt) */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-emerald-100 bg-gray-50/95 shrink-0 z-10">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-xl transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95"
                >
                  {isEditing ? "Lưu thay đổi" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Bảng thông báo chung tùy biến theo từng hành động */}
      <NotificationModal
        isOpen={notice.isOpen}
        onClose={() => setNotice((prev) => ({ ...prev, isOpen: false }))}
        type={notice.type}
        title={notice.title}
        message={notice.message}
        mode={notice.mode}
      />
    </div>
  );
};

export default AdminTasksManager;
