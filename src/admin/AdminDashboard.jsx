// src/admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

import AccountsManager from "./components/AccountsManager";
import ComicsManager from "./components/ComicsManager";
import MessagesManager from "./components/MessagesManager";
import SQLManager from "./components/SQLManager";
import AdminStats from "./components/AdminStats";
import AdminTasksManager from "./components/AdminTasksManager";
import AdminAnomalyDetection from "./components/AdminAnomalyDetection";
import { API_BASE_URL } from "../../config";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("stats");
  const [users, setUsers] = useState([]);
  const [comics, setComics] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComics, setTotalComics] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Chặn đứng người dùng không có quyền admin
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    if (!parsedUser || parsedUser.role?.toLowerCase() !== "admin") {
      navigate("/");
    }
  }, [navigate]);

  const getToken = () => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser).token : null;
  };

  // Đọc trang từ URL
  useEffect(() => {
    const p = parseInt(searchParams.get("page") || "1", 10);
    setPage(isNaN(p) || p < 1 ? 1 : p);
  }, [searchParams]);

  // Cuộn lên đầu trang khi chuyển tab hoặc đổi trang
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab, page]);

  // Fetch dữ liệu theo tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        if (!token) {
          setError("Vui lòng đăng nhập với quyền admin");
          navigate("/login");
          return;
        }

        switch (activeTab) {
          case "accounts":
            {
              const res = await axios.get(`${API_BASE_URL}/api/user/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              setUsers(res.data.users || []);
            }
            break;
          case "comics":
            {
              const res = await axios.get(
                `${API_BASE_URL}/api/comic/comics?page=${page}&limit=24`
              );
              const items = (res.data.comics || res.data.data?.items || []).map(c => ({
                ...c,
                _id: c.slug,
                name: c.name || c.title,
                slug: c.slug,
                thumb_url: c.thumb_url || c.thumbUrl,
              }));
              setComics(items);
              setTotalPages(res.data.totalPages || 1);
              setTotalComics(res.data.totalItems || 0);
            }
            break;
          case "messages":
            {
              const res = await axios.get(`${API_BASE_URL}/api/comment`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              setComments(res.data.comments || []);
            }
            break;
          default:
            break;
        }
      } catch (err) {
        console.error("Lỗi fetch dữ liệu:", err);
        setError(err.response?.data?.message || "Lỗi khi tải dữ liệu.");
      }
      setLoading(false);
    };

    fetchData();
  }, [activeTab, page, navigate]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = getToken();
      if (!token) {
        setError("Vui lòng đăng nhập để thay đổi quyền");
        return;
      }
      await axios.post(
        `${API_BASE_URL}/api/user/role`,
        { userId, role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      setError(null);
    } catch (err) {
      console.error("Lỗi cập nhật quyền:", err);
      setError(err.response?.data?.message || "Lỗi khi cập nhật quyền");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này không?")) return;
    try {
      const token = getToken();
      if (!token) return;
      await axios.delete(`${API_BASE_URL}/api/comment/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setError(null);
    } catch (err) {
      console.error("Lỗi khi xóa bình luận:", err);
      alert(err.response?.data?.message || "Lỗi khi xóa bình luận.");
    }
  };

  const handleModerateComment = async (commentId, status) => {
    try {
      const token = getToken();
      if (!token) return;
      await axios.post(
        `${API_BASE_URL}/api/comment/moderate/${commentId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, status, isReported: status === "active" ? false : c.isReported } : c))
      );
      setError(null);
    } catch (err) {
      console.error("Lỗi khi kiểm duyệt bình luận:", err);
      alert(err.response?.data?.message || "Lỗi khi kiểm duyệt bình luận.");
    }
  };

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) {
      setSearchParams({ page: p });
    }
  };

  return (
    <div className="bg-[#f3fbf8] min-h-screen relative overflow-hidden pt-14 text-black">
      {/* Hiệu ứng các hạt sáng bay Irminsul ở nền */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(12)].map((_, i) => {
          const size = Math.random() * 8 + 4;
          const left = Math.random() * 100;
          const delay = Math.random() * 15;
          const duration = Math.random() * 20 + 10;
          const flyX = (Math.random() * 100 - 50) + "px";
          return (
            <div
              key={i}
              className="irminsul-particle"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                animationDelay: `${delay}s`,
                "--fly-duration": `${duration}s`,
                "--fly-x": flyX,
              }}
            />
          );
        })}
      </div>

      {/* Main Layout */}
      <div className="w-full flex flex-col md:flex-row relative z-10">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-emerald-950 text-white p-5 border-r border-emerald-800 shadow-sm flex flex-col md:fixed md:top-14 md:bottom-0 md:left-0 z-30 overflow-y-auto">
          <h2 className="text-xl font-extrabold mb-6 text-center md:text-left flex items-center gap-2 border-b border-emerald-800 pb-3">
            <span>Bí Cảnh Admin 🌳</span>
          </h2>
          <ul className="grid grid-cols-2 md:block gap-2.5">
            {[
              { key: "stats", label: "📊 Thống kê hệ thống" },
              { key: "accounts", label: "👤 Tài khoản" },
              { key: "messages", label: "💬 Bình luận" },
              { key: "comics", label: "📖 Danh sách truyện" },
              { key: "tasks", label: "📜 Quản lý nhiệm vụ" },
              { key: "anomalies", label: "🛡️ AI Cảnh báo rủi ro" },
              { key: "sql", label: "🗄️ Quản lý SQL" },
            ].map((tab) => (
              <li
                key={tab.key}
                className={`p-3 rounded-xl cursor-pointer text-xs sm:text-sm font-bold text-center md:text-left transition-all ${
                  activeTab === tab.key
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20"
                    : "text-emerald-100 hover:bg-emerald-900/60 hover:text-white"
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 md:pl-64 flex flex-col p-4 md:p-6 w-full min-w-0 min-h-[calc(100vh-56px)]">
          <main className="bg-white/85 backdrop-blur-md rounded-3xl shadow-xl shadow-emerald-100/40 border border-emerald-100/50 p-4 md:p-8 flex-1 w-full overflow-x-auto">
            {loading && (
              <div className="flex items-center gap-2 text-emerald-800 font-bold mb-4 py-4 animate-pulse">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-emerald-600"></div>
                <span>Đang đồng bộ ký ức từ Cây Thế Giới...</span>
              </div>
            )}
            {error && (
              <div className="text-red-500 text-sm font-bold mb-4 bg-red-50 border border-red-100 p-4 rounded-xl shadow-inner">
                ⚠️ {error}
              </div>
            )}

            {!loading && (
              <>
                {activeTab === "stats" && (
                  <AdminStats />
                )}
                {activeTab === "accounts" && (
                  <AccountsManager
                    handleRoleChange={handleRoleChange}
                  />
                )}
                {activeTab === "messages" && (
                  <MessagesManager comments={comments} onDeleteComment={handleDeleteComment} onModerateComment={handleModerateComment} />
                )}
                {activeTab === "comics" && (
                  <ComicsManager
                    comics={comics}
                    totalComics={totalComics}
                    page={page}
                    totalPages={totalPages}
                    goToPage={goToPage}
                  />
                )}
                {activeTab === "tasks" && (
                  <AdminTasksManager />
                )}
                {activeTab === "anomalies" && (
                  <AdminAnomalyDetection />
                )}
                {activeTab === "sql" && (
                  <SQLManager />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>

  );
};

export default AdminDashboard;
