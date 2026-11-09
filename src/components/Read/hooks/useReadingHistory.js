import { useEffect, useState, useRef } from "react";
import { API_BASE_URL } from "../../../../config";
import { getComicThumbUrl } from "../../../utils/imageHelpers";

export const useReadingHistory = ({ user, slug, chapter }) => {
  const [readingHistory, setReadingHistory] = useState([]);
  const [historyComics, setHistoryComics] = useState({});
  const lastSaved = useRef({ slug: null, chapter: null });

  // Gửi lịch sử đọc và lấy danh sách lịch sử (Hỗ trợ cả User & Guest)
  useEffect(() => {
    if (!slug || !chapter) return;
    if (lastSaved.current.slug === slug && lastSaved.current.chapter === chapter) {
      return;
    }
    lastSaved.current = { slug, chapter };

    const saveAndFetchHistory = async () => {
      if (user?.token) {
        try {
          // Gửi lịch sử đọc cho User
          await fetch(`${API_BASE_URL}/api/user/history`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({ slug, chapter }),
          });

          // Lấy lịch sử đọc từ Server
          const res = await fetch(`${API_BASE_URL}/api/user/history`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setReadingHistory(data.readingHistory || []);
          }
        } catch (err) {
          console.error("Lỗi khi tải lịch sử đọc:", err);
        }
      } else {
        // Lưu lịch sử đọc cho Khách vãng lai vào localStorage
        try {
          const raw = localStorage.getItem("guest_reading_history");
          let list = raw ? JSON.parse(raw) : [];
          if (!Array.isArray(list)) list = [];

          // Cập nhật hoặc thêm mới truyện vào lịch sử local
          const index = list.findIndex((item) => item.slug === slug);
          const newItem = { slug, chapter, updatedAt: new Date().toISOString() };
          if (index >= 0) {
            list[index] = newItem;
          } else {
            list.unshift(newItem);
          }

          localStorage.setItem("guest_reading_history", JSON.stringify(list));
          setReadingHistory(list);
        } catch (e) {
          console.error("Lỗi lưu lịch sử đọc local:", e);
        }
      }
    };

    saveAndFetchHistory();
  }, [user, slug, chapter]);

  // Lấy thông tin chi tiết (name, thumb_url) cho các truyện trong lịch sử
  useEffect(() => {
    if (!readingHistory.length) return;
    const uniqueSlugs = [...new Set(readingHistory.map((h) => h.slug))];
    if (uniqueSlugs.length === 0) return;

    fetch(`${API_BASE_URL}/api/comic/comics/batch?slugs=${encodeURIComponent(uniqueSlugs.join(","))}`)
      .then((res) => res.json())
      .then((batchData) => {
        const map = {};
        (batchData.comics || []).forEach((c) => {
          map[c.slug] = {
            name: c.name || c.title || c.slug,
            thumb_url: getComicThumbUrl(c.thumb_url || c.thumbUrl),
          };
        });
        setHistoryComics(map);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy thông tin truyện lịch sử từ CSDL:", err);
      });
  }, [readingHistory]);

  const isChapterRead = (slugToCheck, chapterName) => {
    const history = readingHistory.find((h) => h.slug === slugToCheck);
    if (!history) return false;

    const parseNum = (ch) => {
      const n = parseFloat(String(ch).replace(/[^\d.]/g, ""));
      return isNaN(n) ? 0 : n;
    };

    const currentNum = parseNum(chapterName);
    const savedNum = parseNum(history.chapter);

    return currentNum > 0 && savedNum > 0 && currentNum <= savedNum;
  };

  // Kết hợp readingHistory với historyComics để có name và thumb_url
  const enrichedHistory = readingHistory.map((item) => ({
    ...item,
    name: historyComics[item.slug]?.name || item.slug,
    thumb_url: historyComics[item.slug]?.thumb_url || "https://via.placeholder.com/120x180?text=No+Img",
  }));

  return {
    readingHistory: enrichedHistory,
    isChapterRead,
  };
};