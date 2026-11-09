import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../../config";
import { getBadgeClass } from "../../../utils/rpgHelpers";
import UserEditPanel, { FAME_RANKS } from "./UserEditPanel";
import NotificationModal from "../../../components/Common/NotificationModal";

const AccountsManager = ({ handleRoleChange }) => {
  const [users, setUsers] = useState([]);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // States hỗ trợ chỉnh sửa chi tiết
  const [editFormData, setEditFormData] = useState({});
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [saveStatusMsg, setSaveStatusMsg] = useState({});

  // Bảng thông báo chung tùy biến
  const [notification, setNotification] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    mode: "toast",
  });

  const showNotice = ({ type = "success", title, message, mode = "toast" }) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message,
      mode,
    });
  };

  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/user/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách người dùng:", err);
      showNotice({
        type: "error",
        title: "Lỗi kết nối Cây Thế Giới",
        message: "Không thể tải danh sách tài khoản từ máy chủ.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRoleChange = async (userId, newRole) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/user/role`,
        { userId, role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        const roleLabel =
          newRole === "ADMIN"
            ? "👑 Quản Trị (Admin)"
            : newRole === "TRANSLATOR"
            ? "✍️ Dịch Giả (Translator)"
            : "Độc Giả (Member)";
        showNotice({
          type: "success",
          title: "Thay đổi quyền hạn thành công! 👑",
          message: `Tài khoản ID #${userId} đã được cập nhật thành: ${roleLabel}`,
        });
      }
    } catch (err) {
      console.error("Lỗi cập nhật quyền:", err);
      showNotice({
        type: "error",
        title: "Lỗi phân quyền! ❌",
        message: err.response?.data?.message || "Không thể thay đổi quyền hạn.",
      });
    }
  };

  const toggleExpand = (userObj) => {
    const userId = userObj.id;
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      setEditFormData({});
      return;
    }

    const currentRole = (userObj.role || "READER").toUpperCase();
    const currentCrystals = userObj.gamification?.worldCrystals ?? userObj.worldCrystal ?? 0;
    const currentLevel = userObj.gamification?.level ?? userObj.level ?? 1;
    const currentMemory = userObj.gamification?.irminsulMemories ?? userObj.irminsulMemory ?? 0;
    const currentXp = userObj.gamification?.currentXp ?? userObj.currentXp ?? 0;
    const nextLevelXp = userObj.gamification?.nextLevelXp ?? userObj.nextLevelXp ?? 100;
    const currentFame = userObj.gamification?.fameRank
      ? userObj.gamification.fameRank.replace("RANK_", "")
      : userObj.danhVong || "F";

    setEditFormData({
      username: userObj.username || "",
      email: userObj.email || "",
      worldCrystal: currentCrystals,
      level: currentLevel,
      currentXp,
      nextLevelXp,
      irminsulMemory: currentMemory,
      triThuc:
        userObj.gamification?.triThuc ??
        userObj.gamification?.tri_thuc ??
        (userObj.triThuc || (FAME_RANKS.find((r) => r.rank === currentFame)?.minTriThuc ?? 0)),
      danhTieng:
        userObj.gamification?.danhTieng ??
        userObj.gamification?.danh_tieng ??
        (userObj.danhTieng || (FAME_RANKS.find((r) => r.rank === currentFame)?.minDanhTieng ?? 0)),
      uyTin:
        userObj.gamification?.uyTin ??
        userObj.gamification?.uy_tin ??
        (userObj.uyTin || (FAME_RANKS.find((r) => r.rank === currentFame)?.minUyTin ?? 0)),
      danhVong: currentFame,
      khuVuc: userObj.khuVuc || "",
      titles: userObj.titles || "[]",
      role: currentRole,
      nameColor: userObj.nameColor || "",
      nameEffect: userObj.nameEffect || "",
      avatarFrame: userObj.avatarFrame || "",
      avatarUrl: userObj.avatarUrl || "",
      badge: userObj.badge || "",
      isBanned: userObj.status === "BANNED" || userObj.isBanned || false,
    });

    setExpandedUserId(userId);
  };

  const handleInputChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveUser = async (userId) => {
    try {
      setUpdatingUserId(userId);
      setSaveStatusMsg((prev) => ({ ...prev, [userId]: "⏳ Đang lưu dữ liệu..." }));

      let finalData = { ...editFormData };
      if (typeof finalData.titles !== "string") {
        finalData.titles = JSON.stringify(finalData.titles);
      }

      const res = await axios.put(
        `${API_BASE_URL}/api/user/admin/user/${userId}`,
        finalData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, ...res.data.user } : u))
        );
        setSaveStatusMsg((prev) => ({ ...prev, [userId]: "✅ Đã lưu thành công!" }));
        setTimeout(() => {
          setSaveStatusMsg((prev) => ({ ...prev, [userId]: "" }));
        }, 4000);

        showNotice({
          type: "success",
          title: "Cập nhật thành công! ✨",
          message: `Đã lưu toàn bộ thông số cho Lữ Hành [${editFormData.username || userId}] (Cấp độ: ${editFormData.level || 1}, 💎 ${editFormData.worldCrystal || 0} Crystal, Quyền: ${editFormData.role || "READER"}).`,
          mode: "toast",
        });
      }
    } catch (err) {
      console.error("Lỗi cập nhật người dùng:", err);
      const errMsg = err.response?.data?.message || "Lỗi khi lưu thông tin chỉnh sửa.";
      setSaveStatusMsg((prev) => ({ ...prev, [userId]: "❌ Lưu thất bại!" }));
      setTimeout(() => {
        setSaveStatusMsg((prev) => ({ ...prev, [userId]: "" }));
      }, 4000);

      showNotice({
        type: "error",
        title: "Lưu thất bại! ❌",
        message: errMsg,
        mode: "toast",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-emerald-950 flex items-center gap-2">
          <span className="inline-block w-2 h-5 bg-emerald-500 rounded-full"></span>
          Quản lý tài khoản
        </h2>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-emerald-800 font-bold py-4 animate-pulse">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-emerald-600"></div>
          <span>Đang tải thông tin tài khoản...</span>
        </div>
      ) : users.length === 0 ? (
        <p className="text-emerald-800/60 text-sm italic py-4">
          Không có tài khoản nào trên hệ thống.
        </p>
      ) : (
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs sm:text-sm uppercase tracking-wider font-bold">
                  <th className="p-3 text-left">Tên Lữ Hành</th>
                  <th className="p-3 text-left">World Crystal</th>
                  <th className="p-3 text-left">Cấp độ</th>
                  <th className="p-3 text-left">Trạng thái</th>
                  <th className="p-3 text-left">Quyền hạn</th>
                </tr>
              </thead>
              <tbody className="text-xs sm:text-sm text-black">
                {users.map((user) => {
                  const userCrystals = user.gamification?.worldCrystals ?? user.worldCrystal ?? 0;
                  const userLevel = user.gamification?.level ?? user.level ?? 1;
                  const isUserBanned = user.status === "BANNED" || user.isBanned;
                  const currentRole = (user.role || "READER").toUpperCase();
                  const roleSelectVal = currentRole === "MEMBER" ? "READER" : currentRole;

                  return (
                    <React.Fragment key={user.id}>
                      <tr
                        className="hover:bg-emerald-50/30 cursor-pointer transition border-b border-emerald-50"
                        onClick={() => toggleExpand(user)}
                      >
                        <td className="p-3 font-semibold text-emerald-950 flex items-center gap-2">
                          {user.avatarUrl && (
                            <img
                              src={user.avatarUrl}
                              alt=""
                              className={`w-7 h-7 rounded-full object-cover border border-emerald-100 shrink-0 ${
                                user.avatarFrame === "gold"
                                  ? "avatar-frame-gold"
                                  : user.avatarFrame === "emerald"
                                  ? "avatar-frame-emerald"
                                  : user.avatarFrame === "rainbow"
                                  ? "avatar-frame-rainbow"
                                  : user.avatarFrame
                                  ? `avatar-frame-${user.avatarFrame}`
                                  : ""
                              }`}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                          <span
                            className={`font-bold ${
                              user.nameEffect === "rainbow"
                                ? "animate-rainbow-text"
                                : user.nameEffect === "glow"
                                ? "name-glow"
                                : user.nameEffect
                                ? `name-effect-${user.nameEffect}`
                                : ""
                            }`}
                            style={
                              user.nameColor &&
                              ![
                                "rainbow",
                                "thien_ha",
                                "tinh_hai_effect",
                                "dong_chay_van_menh",
                              ].includes(user.nameEffect)
                                ? { color: user.nameColor }
                                : undefined
                            }
                          >
                            {user.username}
                          </span>
                          {user.danhVong && (
                            <span className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-[9px] font-extrabold px-1 rounded shadow-sm scale-90">
                              {user.danhVong}
                            </span>
                          )}
                          {user.badge && (
                            <span
                              className={`text-[8px] font-bold px-1 rounded scale-90 shadow-sm ${getBadgeClass(
                                user.badge
                              )}`}
                            >
                              {user.badge}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-emerald-700 font-bold">
                          💎 {userCrystals}
                        </td>
                        <td className="p-3 text-emerald-950 font-bold">
                          Cấp {userLevel}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isUserBanned
                                ? "bg-rose-50 text-rose-600 border border-rose-100"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            }`}
                          >
                            {isUserBanned ? "Đã khóa" : "Hoạt động"}
                          </span>
                        </td>
                        <td
                          className="p-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={roleSelectVal}
                            onChange={(e) =>
                              onRoleChange(user.id, e.target.value)
                            }
                            className="border border-emerald-100 rounded-xl px-2 py-1 text-xs font-bold text-emerald-900 focus:ring-emerald-300 bg-white"
                          >
                            <option value="READER">Độc Giả (Member)</option>
                            <option value="TRANSLATOR">✍️ Dịch Giả (Translator)</option>
                            <option value="ADMIN">👑 Quản Trị (Admin)</option>
                          </select>
                        </td>
                      </tr>
                      {expandedUserId === user.id && (
                        <tr key={`${user.id}-expanded`}>
                          <td
                            colSpan="5"
                            className="p-4 bg-emerald-50/10 border-b border-emerald-100/30"
                          >
                            {/* Form Chỉnh sửa User */}
                            <UserEditPanel
                              user={user}
                              editFormData={editFormData}
                              handleInputChange={handleInputChange}
                              handleSaveUser={handleSaveUser}
                              toggleExpand={toggleExpand}
                              updatingUserId={updatingUserId}
                              saveStatusMsg={saveStatusMsg[user.id] || ""}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bảng thông báo chung tùy biến theo từng hành động */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        mode={notification.mode}
      />
    </div>
  );
};

export default AccountsManager;
