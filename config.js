// config.js — Cấu hình kết nối API
// 💡 Khi truy cập qua Cloudflare Tunnel hoặc HTTPS: dùng relative path "" để Vite proxy tự chuyển tiếp sang backend 3001
// giúp chống lỗi Mixed Content (HTTPS -> HTTP) và không cần mở port 3001 ra ngoài mạng!
const isBrowser = typeof window !== "undefined";
const isHttpsOrTunnel =
  isBrowser &&
  (window.location.protocol === "https:" ||
    window.location.hostname.includes("trycloudflare.com") ||
    window.location.hostname.includes(".loca.lt"));

const HOST =
  isBrowser && window.location.hostname
    ? window.location.hostname
    : "localhost";

const port = (import.meta.env.VITE_API_LOCAL_PORT || "3001").trim();

export const API_BASE_URL = isHttpsOrTunnel
  ? ""
  : HOST.startsWith("http")
  ? HOST
  : `http://${HOST}:${port}`;
