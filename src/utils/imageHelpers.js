import { API_BASE_URL } from "../../config";

/**
 * 🖼️ Helper chuẩn hóa đường dẫn ảnh bìa truyện
 * Hỗ trợ ảnh từ máy chủ local (/Images/..., /uploads/...) và link ngoài (http/https)
 */
export function getComicThumbUrl(thumbUrl) {
  if (!thumbUrl) return `${API_BASE_URL}/Images/default-cover.jpg`;
  const str = String(thumbUrl).trim();
  if (str.startsWith("http://") || str.startsWith("https://")) {
    return str;
  }
  if (str.startsWith("/Images/") || str.startsWith("Images/")) {
    const cleanPath = str.startsWith("/") ? str : `/${str}`;
    return `${API_BASE_URL}${cleanPath}`;
  }
  if (str.startsWith("/uploads/") || str.startsWith("uploads/") || str.startsWith("/public/") || str.startsWith("public/")) {
    const cleanPath = str.startsWith("/") ? str : `/${str}`;
    return `${API_BASE_URL}${cleanPath}`;
  }
  // Nếu là tên file ảnh cục bộ nằm trong Images/truyen
  return `${API_BASE_URL}/Images/truyen/${str}`;
}

