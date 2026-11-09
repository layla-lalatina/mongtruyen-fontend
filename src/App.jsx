import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AppRoutes from "./components/AppRoutes";
import { API_BASE_URL } from "../config";
import AIChatWidget from "./components/AI/AIChatWidget";

function AppContent({
  categories,
  selectedCategory,
  setSelectedCategory,
  user,
  handleLogin,
  handleLogout,
  toasts
}) {
  const location = useLocation();

  // 🚀 Tự động lướt lên trên cùng trang mỗi lần chuyển trang (trừ khi đang chuyển tab nội bộ trong /profile hoặc đọc truyện)
  useEffect(() => {
    if (location.pathname.startsWith("/doc/")) return;
    if (location.pathname === "/profile" && location.search.includes("tab=")) return;
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    if (!window.location.pathname.startsWith("/doc/")) {
      window.scrollTo(0, 0);
    }
  }, []);

  const hideLayoutRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
  const isHideLayout = hideLayoutRoutes.includes(location.pathname);
  const isHideFooter = isHideLayout || location.pathname.startsWith("/admin");

  return (
    <div className={`min-h-screen ${isHideLayout ? "" : "flex flex-col"} bg-[#f3fbf8]`}>
      {!isHideLayout && (
        <Navbar
          categories={categories}
          onSelectCategory={setSelectedCategory}
          user={user}
          onLogout={handleLogout}
        />
      )}

      <main className="flex-1 bg-[#f3fbf8]">
        <AppRoutes
          user={user}
          handleLogin={handleLogin}
          handleLogout={handleLogout}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </main>

      {!isHideFooter && <Footer />}
      <AIChatWidget user={user} />

      {/* Toast Manager hiển thị rớt vật phẩm ở góc trên bên phải */}
      <div className="fixed top-16 sm:top-20 right-4 sm:right-6 z-[100000] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-emerald-950/95 text-white border border-emerald-500/30 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-in pointer-events-auto max-w-sm"
          >
            <span className="text-2xl animate-bounce">{toast.icon || "🎁"}</span>
            <div>
              <div className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">
                Cây Irminsul Ban Tặng!
              </div>
              <div className="text-xs font-bold text-emerald-50">
                {toast.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [toasts, setToasts] = useState([]);

  const [user, setUser] = useState(() => {
    const userStr = localStorage.getItem("user");
    let parsed = null;
    try {
      parsed = userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;
    } catch (e) {
      parsed = null;
    }
    return parsed;
  });

  // Lắng nghe sự kiện nhận vật phẩm khi đọc truyện (chỉ hiện nếu đang không ở trang đọc có sẵn LootDropPopup)
  useEffect(() => {
    const handleLootDrop = (e) => {
      if (window.location.pathname.startsWith("/doc/")) return;
      const drop = e.detail;
      const id = Date.now() + Math.random().toString();
      setToasts((prev) => [...prev, { id, ...drop }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 2500);
    };

    window.addEventListener("loot-drop-received", handleLootDrop);
    return () => window.removeEventListener("loot-drop-received", handleLootDrop);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/comic/categories`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data?.data?.items || data?.data || []);
      })
      .catch((err) => console.error("Fetch categories error:", err));
  }, []);


  const handleLogin = (userData) => {
    const newUser = {
      id: userData.id,
      token: userData.token,
      username: userData.username,
      role: userData.role,
      isVip: Boolean(userData.isVip),
      vipTier: Number(userData.vipTier || 0),
      vipPlanName: userData.vipPlanName || null,
    };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <Router>
      <AppContent
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        user={user}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        toasts={toasts}
      />
    </Router>
  );
}

export default App;
