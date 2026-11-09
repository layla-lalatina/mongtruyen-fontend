import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../config";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.success) {
        const payload = JSON.parse(atob(data.token.split(".")[1]));
        const user = {
          id: data.user?.id || payload.id,
          token: data.token,
          username: payload.username,
          role: payload.role,
          isVip: Boolean(data.user?.isVip ?? data.isVip),
          vipTier: Number(data.user?.vipTier ?? data.vipTier ?? 0),
          vipPlanName: data.user?.vipPlanName || data.vipPlanName || null,
        };
        onLogin(user);
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/", { replace: true });

      } else {
        setError(data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f3fbf8] relative overflow-hidden font-['Inter']">
      {/* Hiệu ứng các hạt sáng bay Irminsul ở nền */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(8)].map((_, i) => {
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

      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl shadow-emerald-100/40 border border-emerald-100/50 max-w-md w-full overflow-hidden relative z-10 animate-fade-in">
        {/* Phần banner */}
        <div className="bg-gradient-to-br from-emerald-700 to-teal-600 h-40 flex items-center justify-center">
          <div className="text-center text-white px-6">
            <h2 className="text-2xl font-bold mb-2">Chào mừng trở lại!</h2>
            <p className="text-sm opacity-90">Đăng nhập để tiếp tục với tài khoản của bạn</p>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-emerald-950 mb-6">Đăng nhập</h2>

          {error && (
            <div className="mb-4 text-sm text-red-500 font-semibold bg-red-50 border border-red-100 p-3 rounded-xl">⚠️ {error}</div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-emerald-900 mb-1">Tài khoản</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-black border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Tên đăng nhập"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-emerald-900 mb-1">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-black border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="••••••••"
              />
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center">
                  <input type="checkbox" className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-emerald-200 rounded" />
                  <label className="ml-2 text-sm text-emerald-800/80 font-medium">Ghi nhớ tôi</label>
                </div>
                <button
                  type="button"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold hover:underline"
                  onClick={() => navigate("/forgot-password")}
                >
                  Quên mật khẩu?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 transition shadow-md shadow-emerald-600/10 disabled:opacity-40"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <div className="text-center text-sm text-emerald-800/80 font-medium">
              Chưa có tài khoản?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
              >
                Đăng ký ngay
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
