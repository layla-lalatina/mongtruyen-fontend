import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuCrown } from "react-icons/lu";
import { API_BASE_URL } from "../../../config";
import MobileMenu from "../MobileMenu";
import WarningBanner from "./WarningBanner";
import NotificationDropdown from "./NotificationDropdown";
import AdvancedSearchModal from "./AdvancedSearchModal";
import CategoryDropdown from "./CategoryDropdown";

const Navbar = ({ user, onLogout }) => {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [readingHistory, setReadingHistory] = useState([]);
  const [historyComics, setHistoryComics] = useState({});
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryHoverTimeoutRef = useRef(null);
  const categoryDropdownRef = useRef();

  const handleCategoryMouseEnter = () => {
    if (categoryHoverTimeoutRef.current) {
      clearTimeout(categoryHoverTimeoutRef.current);
    }
    setCategoryDropdownOpen(true);
  };

  const handleCategoryMouseLeave = () => {
    categoryHoverTimeoutRef.current = setTimeout(() => {
      setCategoryDropdownOpen(false);
    }, 200);
  };

  const accountMenuRef = useRef(null);
  const desktopNotifMenuRef = useRef(null);
  const mobileNotifMenuRef = useRef(null);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const unreadNotifications = notifications.filter((n) => !n.isRead);

  // Trạng thái VIP đồng bộ theo thời gian thực để hiện vương miện đúng màu gói VIP
  const [vipInfo, setVipInfo] = useState({
    isVip: Boolean(user?.isVip),
    vipTier: Number(user?.vipTier || 0),
    vipPlanName: user?.vipPlanName || null,
  });

  useEffect(() => {
    if (!user?.token) {
      setVipInfo({ isVip: false, vipTier: 0, vipPlanName: null });
      return;
    }
    setVipInfo((prev) => ({
      isVip: Boolean(user.isVip ?? prev.isVip),
      vipTier: Number(user.vipTier ?? prev.vipTier ?? 0),
      vipPlanName: user.vipPlanName || prev.vipPlanName || null,
    }));

    const syncVipFromServer = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json();
        if (data?.success && data.user) {
          const nextVip = {
            isVip: Boolean(data.user.isVip),
            vipTier: Number(data.user.vipTier || 0),
            vipPlanName: data.user.vipPlanName || null,
          };
          setVipInfo(nextVip);
          try {
            const raw = localStorage.getItem("user");
            if (raw) {
              const parsed = JSON.parse(raw);
              parsed.isVip = nextVip.isVip;
              parsed.vipTier = nextVip.vipTier;
              parsed.vipPlanName = nextVip.vipPlanName;
              localStorage.setItem("user", JSON.stringify(parsed));
            }
          } catch (e) {}
        }
      } catch (e) {}
    };

    syncVipFromServer();

    const handleVipUpdated = (e) => {
      const detail = e?.detail;
      if (detail && detail.isVip !== undefined) {
        setVipInfo({
          isVip: Boolean(detail.isVip),
          vipTier: Number(detail.vipTier || 0),
          vipPlanName: detail.plan?.name || detail.vipPlanName || null,
        });
      } else {
        syncVipFromServer();
      }
    };

    window.addEventListener("vip-updated", handleVipUpdated);
    window.addEventListener("agent-state-updated", syncVipFromServer);
    return () => {
      window.removeEventListener("vip-updated", handleVipUpdated);
      window.removeEventListener("agent-state-updated", syncVipFromServer);
    };
  }, [user?.token, user?.isVip, user?.vipTier]);

  // Đồng bộ theme với document class
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Fetch categories
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/comic/categories`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data?.data?.items) ? data.data.items : [];
        setCategories(list.filter((cat) => !!cat.slug));
      })
      .catch((err) => console.error("Fetch categories error:", err));
  }, []);

  // Fetch reading history
  useEffect(() => {
    if (!user?.token) return;
    fetch(`${API_BASE_URL}/api/user/history`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((data) => setReadingHistory(data.readingHistory || []));
  }, [user]);

  // Fetch comic info for history
  useEffect(() => {
    if (!user?.token || !readingHistory.length) return;
    const uniqueSlugs = [...new Set(readingHistory.map((h) => h.slug))];
    Promise.all(
      uniqueSlugs.map((slug) =>
        fetch(`${API_BASE_URL}/api/comic/comics/${slug}`)
          .then((res) => res.json())
          .then((data) => ({
            slug,
            name: data.data?.item?.name || data.data?.item?.title || slug,
            thumb_url: data.data?.item?.thumb_url || "",
          }))
          .catch(() => ({ slug, name: slug, thumb_url: "" }))
      )
    ).then((arr) => {
      const obj = {};
      arr.forEach((item) => {
        obj[item.slug] = item;
      });
      setHistoryComics(obj);
    });
  }, [user, readingHistory]);

  // Close account menu, category dropdown & notification menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(e.target)
      ) {
        setAccountMenuOpen(false);
      }
      const isOutsideDesktopNotif =
        !desktopNotifMenuRef.current ||
        !desktopNotifMenuRef.current.contains(e.target);
      const isOutsideMobileNotif =
        !mobileNotifMenuRef.current ||
        !mobileNotifMenuRef.current.contains(e.target);
      if (isOutsideDesktopNotif && isOutsideMobileNotif) {
        setNotifMenuOpen(false);
      }
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(e.target)
      ) {
        setCategoryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/notifications`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (data.success) {
        const rawList = data.notifications || [];
        const readIds = JSON.parse(
          localStorage.getItem(`irminsul_read_notifs_${user.id}`) || "[]"
        );
        const readAllAt = localStorage.getItem(
          `irminsul_read_all_notifs_${user.id}`
        );

        const list = rawList.map((notif) => {
          const isIdRead = readIds.includes(notif.id);
          const isTimeRead =
            readAllAt && new Date(notif.createdAt) <= new Date(readAllAt);
          return {
            ...notif,
            isRead: notif.isRead || isIdRead || Boolean(isTimeRead),
          };
        });
        setNotifications(list);
      }
    } catch (err) {
      console.error("Lỗi tải thông báo:", err);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    if (!user?.token) return;
    try {
      const savedIds = JSON.parse(
        localStorage.getItem(`irminsul_read_notifs_${user.id}`) || "[]"
      );
      if (!savedIds.includes(notifId)) {
        savedIds.push(notifId);
        localStorage.setItem(
          `irminsul_read_notifs_${user.id}`,
          JSON.stringify(savedIds)
        );
      }
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
      );
      await fetch(
        `${API_BASE_URL}/api/user/notifications/read/${notifId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.token) return;
    try {
      const now = new Date().toISOString();
      localStorage.setItem(`irminsul_read_all_notifs_${user.id}`, now);

      const currentIds = notifications.map((n) => n.id);
      const savedIds = JSON.parse(
        localStorage.getItem(`irminsul_read_notifs_${user.id}`) || "[]"
      );
      const combinedIds = Array.from(new Set([...savedIds, ...currentIds]));
      localStorage.setItem(
        `irminsul_read_notifs_${user.id}`,
        JSON.stringify(combinedIds)
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

      await fetch(`${API_BASE_URL}/api/user/notifications/read-all`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.error("Lỗi mark all read:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    window.addEventListener("agent-state-updated", fetchNotifications);
    return () => {
      clearInterval(interval);
      window.removeEventListener("agent-state-updated", fetchNotifications);
    };
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  const isUserVip = Boolean(vipInfo.isVip);
  const activeVipTier = Number(vipInfo.vipTier || 0);
  const isGoldVip = isUserVip && activeVipTier >= 2;

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-[#0c3a2f] shadow-lg shadow-emerald-950/10 z-50 border-b border-emerald-500/30 font-sans h-14 flex items-center">
        <div className="max-w-[1440px] mx-auto w-full flex items-center justify-between md:justify-center gap-2 lg:gap-2.5 px-3 sm:px-5">
          {/* Logo */}
          <Link to="/" className="flex items-center select-none shrink-0 mr-1 sm:mr-1.5">
            <span
              className="text-xl sm:text-2xl font-extrabold tracking-wide whitespace-nowrap"
              style={{
                fontFamily: "'Baloo 2', cursive",
                color: "#fff",
                letterSpacing: "1px",
                textShadow: "0 1px 2px #000",
              }}
            >
              <span className="text-emerald-400">Mộng</span>
              <span className="text-emerald-100">Truyện</span>
            </span>
          </Link>

          {/* Desktop Navigation: Các nút & thanh tìm kiếm & cụm tài khoản đứng sát nhau đồng nhất như ảnh 4 */}
          <div className="hidden md:flex items-center justify-center gap-2 lg:gap-2.5 min-w-0">
            {/* Nhóm trái: Menu + Ô Tìm Kiếm */}
            <div className="flex items-center gap-2 lg:gap-2.5 min-w-0">
              {/* Nút Thể loại hover dropdown chia theo bảng chữ cái */}
              <div
                className="relative shrink-0"
                onMouseEnter={handleCategoryMouseEnter}
                onMouseLeave={handleCategoryMouseLeave}
              >
                <button
                  type="button"
                  className="text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition-all border border-emerald-500/20 shrink-0 whitespace-nowrap flex items-center gap-1 cursor-pointer shadow-xs"
                  onClick={() => navigate("/the-loai")}
                >
                  <span>Thể loại</span>
                  <span className="text-[9px] opacity-80 transition-transform duration-200">
                    {categoryDropdownOpen ? "▲" : "▼"}
                  </span>
                </button>

                {/* Dropdown danh sách thể loại theo bảng chữ cái */}
                <CategoryDropdown
                  categories={categories}
                  isOpen={categoryDropdownOpen}
                  onClose={() => setCategoryDropdownOpen(false)}
                  dropdownRef={categoryDropdownRef}
                />
              </div>

              <button
                type="button"
                className="text-white bg-amber-700/80 hover:bg-amber-600 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition-all border border-amber-500/30 shrink-0 whitespace-nowrap flex items-center gap-1 cursor-pointer shadow-xs"
                onClick={() => navigate("/hot")}
              >
                <span>🔥</span>
                <span>Truyện Hot</span>
              </button>

              <button
                type="button"
                className="text-white bg-teal-800/80 hover:bg-teal-700 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition-all border border-teal-500/30 shrink-0 whitespace-nowrap flex items-center gap-1 cursor-pointer shadow-xs"
                onClick={() => navigate("/full")}
              >
                <span>📚</span>
                <span>Truyện Full</span>
              </button>

              <button
                type="button"
                className="text-white bg-emerald-800/85 hover:bg-emerald-700 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition-all border border-emerald-500/20 shrink-0 whitespace-nowrap flex items-center gap-1 cursor-pointer shadow-xs"
                onClick={() => setShowAdvancedSearch(true)}
              >
                <span>🔍</span>
                <span>Tìm nâng cao</span>
              </button>

              {/* Ô tìm truyện đứng sát cụm menu và tự co giãn nhẹ để không bao giờ đẩy nút sang 2 hàng */}
              <form
                onSubmit={handleSearch}
                className="relative flex items-center w-48 lg:w-64 xl:w-72 shrink min-w-[165px]"
              >
                <input
                  type="text"
                  placeholder="Tìm truyện từ Cây Thế Giới..."
                  className="w-full pl-3.5 pr-9 py-1.5 rounded-lg bg-white/95 text-emerald-950 placeholder-emerald-700/60 border border-emerald-500/30 outline-none text-xs sm:text-sm focus:border-emerald-400 focus:bg-white focus:ring-1 focus:ring-emerald-400 transition-all shadow-inner"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-2.5 text-emerald-800 text-base bg-transparent border-0 cursor-pointer hover:scale-110 transition-transform"
                  title="Tìm kiếm"
                >
                  🔍
                </button>
              </form>
            </div>

            {/* Nhóm bên phải: Thông Báo, Theme, Hồ Sơ Lữ Hành, Quản Trị đứng sát ngay cạnh ô tìm kiếm */}
            <div className="flex items-center gap-2 lg:gap-2.5 shrink-0">
              {/* Bell Icon Dropdown (Desktop) */}
              {user && (
                <NotificationDropdown
                  notifications={notifications}
                  notifMenuOpen={notifMenuOpen}
                  unreadNotifications={unreadNotifications}
                  setNotifMenuOpen={setNotifMenuOpen}
                  handleMarkAsRead={handleMarkAsRead}
                  handleMarkAllAsRead={handleMarkAllAsRead}
                  notifMenuRef={desktopNotifMenuRef}
                  isMobile={false}
                />
              )}

              <button
                type="button"
                onClick={() =>
                  setTheme((t) => (t === "dark" ? "light" : "dark"))
                }
                className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-emerald-800/40 hover:bg-emerald-800/80 border border-emerald-500/20 text-white text-base transition-all select-none cursor-pointer"
                title={
                  theme === "dark"
                    ? "Chuyển sang chế độ sáng"
                    : "Chuyển sang chế độ tối"
                }
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>

              <div className="relative shrink-0" ref={accountMenuRef}>
                {user ? (
                  <>
                    <button
                      onClick={() => setAccountMenuOpen((prev) => !prev)}
                      title={
                        isUserVip
                          ? isGoldVip
                            ? `Đang kích hoạt VIP Vàng: ${vipInfo.vipPlanName || "Hộ Vệ Irminsul"}`
                            : `Đang kích hoạt VIP Xanh: ${vipInfo.vipPlanName || "Lữ Khách Ánh Sao"}`
                          : "Hồ Sơ Lữ Hành"
                      }
                      className={`text-emerald-50 bg-emerald-800/40 hover:bg-emerald-800/80 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all border shrink-0 whitespace-nowrap flex items-center gap-1.5 cursor-pointer shadow-xs ${
                        isUserVip
                          ? isGoldVip
                            ? "border-amber-400/70 shadow-xs shadow-amber-400/20 text-amber-100 ring-1 ring-amber-400/30"
                            : "border-emerald-300/70 shadow-xs shadow-emerald-400/20 text-emerald-100 ring-1 ring-emerald-300/30"
                          : "border-emerald-500/20"
                      }`}
                    >
                      <span>👤</span>
                      <span>Hồ Sơ Lữ Hành</span>
                      {isUserVip && (
                        <span
                          className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full border shrink-0 ${
                            isGoldVip
                              ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 border-amber-200 text-amber-950 shadow-xs shadow-amber-400/40"
                              : "bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 border-emerald-200 text-emerald-950 shadow-xs shadow-emerald-400/40"
                          }`}
                          title={
                            isGoldVip
                              ? "Vương miện VIP Vàng (Hộ Vệ Irminsul)"
                              : "Vương miện VIP Xanh (Lữ Khách Ánh Sao)"
                          }
                        >
                          <LuCrown
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isGoldVip
                                ? "text-amber-950 fill-amber-600"
                                : "text-emerald-950 fill-emerald-600"
                            }`}
                          />
                        </span>
                      )}
                    </button>
                    {accountMenuOpen && (
                      <div className="absolute right-0 mt-2 bg-white border border-emerald-100 rounded-xl shadow-xl w-44 z-50 py-1 divide-y divide-gray-100 text-black animate-scale-up">
                        <div className="py-1">
                          <Link
                            to="/profile"
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-emerald-950 font-bold hover:bg-emerald-50 transition-colors"
                            onClick={() => setAccountMenuOpen(false)}
                          >
                            <span className="text-base">🧭</span>
                            <span>Chi Tiết Lữ Hành</span>
                          </Link>
                          <Link
                            to="/profile?tab=guide"
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-emerald-800 font-bold hover:bg-emerald-50 transition-colors"
                            onClick={() => setAccountMenuOpen(false)}
                          >
                            <span className="text-base">📘</span>
                            <span>Hướng Dẫn Sử Dụng</span>
                          </Link>
                          {(user.role?.toLowerCase() === "translator" ||
                            user.role?.toLowerCase() === "admin") && (
                            <Link
                              to="/translator"
                              className="flex items-center gap-2.5 px-3 py-2 text-sm text-emerald-950 font-bold hover:bg-emerald-50 transition-colors"
                              onClick={() => setAccountMenuOpen(false)}
                            >
                              <span className="text-base">✍️</span>
                              <span>Khu Vực Dịch Giả</span>
                            </Link>
                          )}
                          {user.role?.toLowerCase() === "admin" && (
                            <Link
                              to="/admin/users"
                              className="flex items-center gap-2.5 px-3 py-2 text-sm text-purple-900 font-bold hover:bg-purple-50 transition-colors"
                              onClick={() => setAccountMenuOpen(false)}
                            >
                              <span className="text-base">👑</span>
                              <span>Quản Trị Admin</span>
                            </Link>
                          )}
                        </div>
                        <div className="py-1">
                          <button
                            onClick={() => {
                              onLogout();
                              setAccountMenuOpen(false);
                              window.location.href = "/";
                            }}
                            className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 font-bold hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <span className="text-base">🚪</span>
                            <span>Đăng xuất</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setAccountMenuOpen((prev) => !prev)}
                      className="text-emerald-50 bg-emerald-800/40 hover:bg-emerald-800/80 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all border border-emerald-500/20 shrink-0 whitespace-nowrap cursor-pointer shadow-xs"
                    >
                      Đăng Nhập Lữ Hành
                    </button>
                    {accountMenuOpen && (
                      <div className="absolute right-0 mt-2 bg-white border border-emerald-100 rounded-lg shadow-lg w-32 z-50 animate-scale-up">
                        <Link
                          to="/login"
                          className="block px-3 py-2 text-sm text-emerald-800 hover:bg-emerald-50 rounded-t-lg transition-colors font-bold"
                          onClick={() => setAccountMenuOpen(false)}
                        >
                          Đăng nhập
                        </Link>
                        <Link
                          to="/register"
                          className="block px-3 py-2 text-sm text-emerald-800 hover:bg-emerald-50 rounded-b-lg transition-colors font-bold"
                          onClick={() => setAccountMenuOpen(false)}
                        >
                          Đăng ký
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Nút Quản Trị nằm ở BÊN PHẢI của Hồ Sơ Lữ Hành */}
              {user && user.role?.toLowerCase() === "admin" && (
                <Link
                  to="/admin/users"
                  className="text-amber-300 bg-emerald-900/90 hover:bg-emerald-950 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black transition-all border border-amber-400/40 shadow-sm flex items-center gap-1.5 shrink-0 whitespace-nowrap hover:scale-105"
                  title="Bí Cảnh Quản Trị Admin"
                >
                  <span>👑</span>
                  <span className="hidden sm:inline">Quản Trị</span>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Bell and Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <NotificationDropdown
                notifications={notifications}
                notifMenuOpen={notifMenuOpen}
                unreadNotifications={unreadNotifications}
                setNotifMenuOpen={setNotifMenuOpen}
                handleMarkAsRead={handleMarkAsRead}
                handleMarkAllAsRead={handleMarkAllAsRead}
                notifMenuRef={mobileNotifMenuRef}
                isMobile={true}
              />
            )}
            <button
              className="flex items-center justify-center text-white text-2xl p-2 cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Mở menu"
            >
              <svg
                width="28"
                height="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Cảnh cáo đỏ cam ở trên đầu trang nếu có thông báo cảnh cáo chưa đọc */}
      <WarningBanner
        user={user}
        unreadNotifications={unreadNotifications}
        handleMarkAsRead={handleMarkAsRead}
      />

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        categories={categories}
        initialKeyword={search}
      />

      {/* Mobile menu */}
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        categories={categories}
        user={user}
        onLogout={onLogout}
        historyComics={historyComics}
        readingHistory={readingHistory}
      />

      {/* Padding */}
      <div className="h-14" />
    </>
  );
};

export default Navbar;
