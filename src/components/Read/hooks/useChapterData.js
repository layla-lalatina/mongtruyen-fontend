import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "../../../../config";

export const useChapterData = (slug, chapterParam) => {
  const [comicName, setComicName] = useState("");
  const [ageRating, setAgeRating] = useState("ALL");
  const [notices, setNotices] = useState([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [allChapters, setAllChapters] = useState([]);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(-1);
  const [images, setImages] = useState([]);
  const [lockInfo, setLockInfo] = useState(null);
  const [accessInfo, setAccessInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  const reloadChapter = useCallback(() => {
    setRefreshTick((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!slug || !chapterParam) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      setLockInfo(null);
      setAccessInfo(null);

      let authHeaders = {};
      try {
        const rawUser = localStorage.getItem("user");
        const parsed = rawUser && rawUser !== "undefined" ? JSON.parse(rawUser) : null;
        if (parsed?.token) {
          authHeaders = { Authorization: `Bearer ${parsed.token}` };
        }
      } catch (e) {}

      try {
        const resLocal = await fetch(`${API_BASE_URL}/api/comic/comics/${slug}`, {
          headers: authHeaders,
        });
        if (!resLocal.ok) throw new Error("Lỗi khi tải truyện từ CSDL");
        const localData = await resLocal.json();
        const comic = localData.data?.item;

        if (!comic || !comic.chapters) throw new Error("Không tìm thấy truyện hoặc chương trong CSDL");

        setComicName(comic.name || "");
        setAgeRating(comic.ageRating || comic.age_rating || "ALL");
        setNotices(Array.isArray(comic.notices) ? comic.notices : []);
        setUpdatedAt(comic.updatedAt || "");

        // Flatten chapter list
        let chapters = [];
        comic.chapters.forEach((server) => {
          if (Array.isArray(server.server_data)) {
            chapters = chapters.concat(server.server_data);
          }
        });

        // Sort theo số chương (tăng dần từ chương 1 trở lên)
        chapters.sort((a, b) => {
          const aNum = parseFloat(String(a.chapter_name).replace(/[^\d.]/g, "")) || 0;
          const bNum = parseFloat(String(b.chapter_name).replace(/[^\d.]/g, "")) || 0;
          return aNum - bNum;
        });

        setAllChapters(chapters);

        // Tìm vị trí chương hiện tại
        const normalizedParam = decodeURIComponent(chapterParam).replace(/\s+/g, " ").trim().toLowerCase();
        const paramNum = parseFloat(normalizedParam.replace(/[^\d.]/g, ""));
        let idx = chapters.findIndex(
          (c) => String(c.chapter_name).replace(/\s+/g, " ").trim().toLowerCase() === normalizedParam
        );
        if (idx === -1 && !isNaN(paramNum)) {
          idx = chapters.findIndex((c) => {
            const cNum = parseFloat(String(c.chapter_name).replace(/[^\d.]/g, ""));
            return !isNaN(cNum) && Math.abs(cNum - paramNum) < 0.001;
          });
        }
        if (idx === -1 && chapters.length > 0) {
          idx = chapters.findIndex(
            (c) =>
              (c.chapter_title && c.chapter_title.toLowerCase().includes(normalizedParam)) ||
              (c.chapter_name && normalizedParam.includes(String(c.chapter_name).toLowerCase()))
          );
        }

        setCurrentChapterIdx(idx);
        if (idx === -1) throw new Error("Không tìm thấy chương này");

        // Fetch ảnh chương từ backend nội bộ (kèm token để kiểm tra VIP / mở khóa)
        const chapterObj = chapters[idx];
        const chapterApiUrl =
          chapterObj.chapter_api_data && chapterObj.chapter_api_data.startsWith("http")
            ? chapterObj.chapter_api_data
            : `${API_BASE_URL}/api/comic/comics/${slug}/chapters/${encodeURIComponent(
                chapterObj.chapter_name
              )}`;

        const chapterRes = await fetch(chapterApiUrl, { headers: authHeaders });
        const chapterData = await chapterRes.json();

        // Nếu chương bị khóa (HTTP 403 locked: true)
        if (chapterRes.status === 403 && chapterData?.locked) {
          setLockInfo(chapterData);
          setImages([]);
          setLoading(false);
          return;
        }

        setAccessInfo(chapterData.access || null);

        const domain = chapterData.data?.domain_cdn || "";
        const path = chapterData.data?.item?.chapter_path || "";
        const files = chapterData.data?.item?.chapter_image ?? [];

        const imgs = files.map((f) => {
          const fileStr = typeof f === "string" ? f : f.image_file || f.url || "";
          if (fileStr.startsWith("http://") || fileStr.startsWith("https://")) {
            return fileStr;
          }
          if (fileStr.startsWith("/Images/") || fileStr.startsWith("Images/")) {
            const cleanPath = fileStr.startsWith("/") ? fileStr : `/${fileStr}`;
            return `${API_BASE_URL}${encodeURI(cleanPath)}`;
          }
          if (
            fileStr.startsWith("/public/") ||
            fileStr.startsWith("public/") ||
            fileStr.startsWith("/uploads/") ||
            fileStr.startsWith("uploads/")
          ) {
            const cleanPath = fileStr.startsWith("/") ? fileStr : `/${fileStr}`;
            return `${API_BASE_URL}${encodeURI(cleanPath)}`;
          }
          if (domain && path) {
            return `${domain}/${path}/${fileStr}`;
          }
          return `${API_BASE_URL}/Images/chapters/${encodeURIComponent(fileStr)}`;
        });
        setImages(imgs);
      } catch (err) {
        setError("Lỗi khi tải dữ liệu chương.");
        console.error(err);
      }

      setLoading(false);
    };

    fetchData();
  }, [slug, chapterParam, refreshTick]);

  return {
    comicName,
    ageRating,
    notices,
    updatedAt,
    allChapters,
    currentChapterIdx,
    images,
    lockInfo,
    accessInfo,
    loading,
    error,
    reloadChapter,
  };
};
