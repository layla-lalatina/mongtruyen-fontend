import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useFollowedComics } from "../Read/hooks/useFollowedComics";
import HomeHero from "./HomeHero";
import HomeMainGrid from "./HomeMainGrid";
import { API_BASE_URL } from "../../../config";
import "../../index.css";

const Home = ({ user }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [readingHistory, setReadingHistory] = useState([]);
  const [historyComics, setHistoryComics] = useState({});
  const [homeComments, setHomeComments] = useState([]);
  const { followedComics } = useFollowedComics({ user });
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user?.token) return;
    fetch(`${API_BASE_URL}/api/user/profile`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setProfile(data);
        }
      })
      .catch((err) => console.error("Error fetching profile on home:", err));
  }, [user]);

  // Load danh sách truyện
  useEffect(() => {
    const p = parseInt(searchParams.get("page") || "1", 10);
    setPage(isNaN(p) || p < 1 ? 1 : p);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`${API_BASE_URL}/api/comic/comics?page=${page}&limit=24`)
      .then((res) => res.json())
      .then((data) => {
        const items = (data.comics || data.data?.items || []).map((c) => ({
          ...c,
          _id: c.slug,
          name: c.name || c.title,
          slug: c.slug,
          thumb_url: c.thumb_url || c.thumbUrl,
          chap: c.soChuong || (c.chapters?.length ? `${c.chapters.length} chương` : "Đang cập nhật")
        }));
        setComics(items);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch(() => {
        setError("Lỗi khi tải dữ liệu từ CSDL");
        setLoading(false);
      });
  }, [page]);

  useEffect(() => {
    if (!user?.token) return;
    fetch(`${API_BASE_URL}/api/user/history`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((data) => setReadingHistory(data.readingHistory || []));
  }, [user]);

  useEffect(() => {
    if (!user?.token || !readingHistory.length) return;
    const uniqueSlugs = [...new Set(readingHistory.map((h) => h.slug))];
    if (uniqueSlugs.length === 0) return;

    fetch(`${API_BASE_URL}/api/comic/comics/batch?slugs=${encodeURIComponent(uniqueSlugs.join(","))}`)
      .then((res) => res.json())
      .then((batchData) => {
        const obj = {};
        (batchData.comics || []).forEach((item) => {
          obj[item.slug] = item;
        });
        setHistoryComics(obj);
      })
      .catch(() => setHistoryComics({}));
  }, [user, readingHistory]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/comment`)
      .then((res) => res.json())
      .then((data) => {
        const comments = Array.isArray(data.comments) ? data.comments : [];
        setHomeComments(comments);
      })
      .catch(() => {
        setHomeComments([]);
      });
  }, []);

  const goToPage = (p) => setSearchParams({ page: p });

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f3fbf8] dark:bg-[#081411] text-emerald-800 dark:text-emerald-300">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
        <div className="font-medium animate-pulse">
          Đang kết nối với Cây Thế Giới Irminsul...
        </div>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f3fbf8] dark:bg-[#081411] text-red-500 p-4 text-center">
        <span className="text-2xl mb-2">⚠️</span>
        <div className="font-bold text-lg mb-1">Mất kết nối với Cây Thế Giới</div>
        <div className="text-sm opacity-80">{error}</div>
      </div>
    );

  return (
    <div className="bg-[#f3fbf8] min-h-screen relative overflow-x-clip">
      {/* Hiệu ứng các hạt sáng bay Irminsul ở nền */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(12)].map((_, i) => {
          const size = Math.random() * 8 + 4; // 4px to 12px
          const left = Math.random() * 100; // 0% to 100%
          const delay = Math.random() * 15; // 0s to 15s
          const duration = Math.random() * 20 + 10; // 10s to 30s
          const flyX = Math.random() * 100 - 50 + "px"; // -50px to 50px
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

      {/* Hero Header */}
      <HomeHero user={user} profile={profile} />

      {/* Main Grid */}
      <HomeMainGrid
        comics={comics}
        page={page}
        totalPages={totalPages}
        goToPage={goToPage}
        readingHistory={readingHistory}
        historyComics={historyComics}
        followedComics={followedComics}
        homeComments={homeComments}
        user={user}
      />
    </div>
  );
};

export default Home;
