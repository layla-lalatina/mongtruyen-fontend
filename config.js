// config.js — Cấu hình kết nối API
// 💡 Chạy local: Đổi thành "localhost"
// 💡 Chia sẻ mạng Internet: Sử dụng IP Public trực tiếp
const HOST = typeof window !== "undefined" && window.location.hostname
  ? window.location.hostname
  : "116.102.243.122";

const port = (import.meta.env.VITE_API_LOCAL_PORT || "3001").trim();

export const API_BASE_URL = HOST.startsWith("http")
  ? HOST
  : `http://${HOST}:${port}`;
