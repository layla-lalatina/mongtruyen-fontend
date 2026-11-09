import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../config";

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validateInput = (input, fieldName) => {
    if (/<[^>]*>/g.test(input) || input.includes("<") || input.includes(">")) {
      return `${fieldName} không được chứa thẻ HTML hoặc ký tự <, >`;
    }
    const sqlPatterns = [
      /['";\-#]/,
      /\/\*/,
      /\bselect\b/i,
      /\bunion\b/i,
      /\binsert\b/i,
      /\bupdate\b/i,
      /\bdelete\b/i,
      /\bdrop\b/i,
      /\btruncate\b/i,
      /\bwhere\b/i
    ];
    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        return `${fieldName} chứa ký tự hoặc từ khóa SQL không hợp lệ`;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 4) {
      setError("Mật khẩu phải từ 4 ký tự trở lên");
      return;
    }

    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }

    const usernameErr = validateInput(username, "Tài khoản");
    if (usernameErr) { setError(usernameErr); return; }

    const passwordErr = validateInput(password, "Mật khẩu");
    if (passwordErr) { setError(passwordErr); return; }

    const emailErr = validateInput(email, "Email");
    if (emailErr) { setError(emailErr); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          role: "member",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess("🎉 Đăng ký thành công! Đang tự động chuyển hướng sang trang Đăng nhập...");
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirm("");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.message || "Đăng ký thất bại");
      }
    } catch (err) {
      console.error("Lỗi:", err);
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
        {/* Banner */}
        <div className="bg-gradient-to-br from-emerald-700 to-teal-600 h-40 flex items-center justify-center">
          <div className="text-center text-white px-6">
            <h2 className="text-2xl font-bold mb-2">Bắt đầu hành trình!</h2>
            <p className="text-sm opacity-90">
              Tạo tài khoản để truy cập các tính năng độc quyền
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-emerald-950 mb-6">
            Đăng ký tài khoản
          </h2>

          {error && <div className="mb-4 text-sm text-red-500 font-semibold bg-red-50 border border-red-100 p-3 rounded-xl">⚠️ {error}</div>}
          {success && <div className="mb-4 text-sm text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 p-3 rounded-xl">🎉 {success}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-emerald-900 mb-1">
                Tài khoản
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-black"
                placeholder="NguyenVanA"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-emerald-900 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-black"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-emerald-900 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-black"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-emerald-800/60 mt-1 font-medium">
                Mật khẩu tối thiểu 4 ký tự
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-emerald-900 mb-1">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-black"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-emerald-200 rounded"
                required
              />
              <label
                htmlFor="terms"
                className="ml-2 text-sm text-emerald-800/80 font-medium"
              >
                Tôi đồng ý với{" "}
                <a href="#" className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline">
                  Điều khoản dịch vụ
                </a>{" "}
                và{" "}
                <a href="#" className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline">
                  Chính sách bảo mật
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3 px-4 rounded-xl hover:opacity-95 transition shadow-md shadow-emerald-600/10 disabled:opacity-40"
            >
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>

            <div className="text-center text-sm text-emerald-800/80 font-medium">
              Đã có tài khoản?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
              >
                Đăng nhập ngay
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
