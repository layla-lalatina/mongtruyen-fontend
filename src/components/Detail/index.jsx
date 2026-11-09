import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LuShieldAlert, LuPlus, LuTrash2 } from "react-icons/lu";
import Breadcrumbs from "./Breadcrumbs";
import ComicInfo from "./ComicInfo";
import ChapterList from "./ChapterList";
import ReadingHistory from "./ReadingHistory";
import TopRanking from "../Home/TopRanking";
import CommentSection from "../CommentSection";
import Rating from "../Rating";
import ComicNoticeBanner from "../Common/ComicNoticeBanner";
import AgeVerificationModal from "../Common/AgeVerificationModal";
import { API_BASE_URL } from "../../../config";

/**
 * 🌳 SYSTEM: IRMINSUL FANTASY RPG - COMIC DETAIL CONTAINER
 * @file index.jsx
 * @path fontend/src/components/Detail/index.jsx
 */
const Detail = ({ user }) => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [comic, setComic] = useState(null);
  const [comicStats, setComicStats] = useState({ views: 0, followers: 0, rating: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readingHistory, setReadingHistory] = useState([]);
  const [historyComics, setHistoryComics] = useState({});
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [ageVerified, setAgeVerified] = useState(
    () => typeof window !== "undefined" && localStorage.getItem("irminsul_age_verified") === "1"
  );
  const [noticeType, setNoticeType] = useState("WARNING");
  const [noticeSeverity, setNoticeSeverity] = useState("WARN");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticeSubmitting, setNoticeSubmitting] = useState(false);
  const [showNoticeForm, setShowNoticeForm] = useState(false);

  const isStaff =
    user &&
    ((user.role || "").toUpperCase() === "ADMIN" ||
      (user.role || "").toUpperCase() === "TRANSLATOR");

  const handleAddNotice = async (e) => {
    e.preventDefault();
    if (!noticeContent.trim() || !user?.token) return;
    setNoticeSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/comic/comics/${slug}/notices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          type: noticeType,
          severity: noticeSeverity,
          content: noticeContent.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.notice) {
        setComic((prev) => ({
          ...prev,
          notices: [data.notice, ...(prev?.notices || [])],
        }));
        setNoticeContent("");
        setShowNoticeForm(false);
      }
    } catch (err) {
      console.error("Lỗi thêm cảnh báo:", err);
    } finally {
      setNoticeSubmitting(false);
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/comic/notices/${noticeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (data.success) {
        setComic((prev) => ({
          ...prev,
          notices: (prev?.notices || []).filter((n) => n.id !== noticeId),
        }));
      }
    } catch (err) {
      console.error("Lỗi xóa cảnh báo:", err);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const authHeaders = user?.token ? { Authorization: `Bearer ${user.token}` } : {};
        const resLocal = await fetch(`${API_BASE_URL}/api/comic/comics/${slug}`, {
          headers: authHeaders,
        });
        if (!resLocal.ok) throw new Error("Lỗi khi tải chi tiết truyện từ CSDL");
        const localData = await resLocal.json();
        const loadedComic = localData.data?.item || null;
        if (!loadedComic) throw new Error("Không tìm thấy thông tin truyện trong CSDL");

        if (cancelled) return;
        setComic(loadedComic);
        setComicStats({
          views: Number(loadedComic.total_views || loadedComic.views || 0),
          followers: Number(loadedComic.followers || 0),
          rating: Number(loadedComic.rating_avg || loadedComic.rating || 0),
        });

        const headers = { "Content-Type": "application/json" };
        if (user?.token) {
          headers["Authorization"] = `Bearer ${user.token}`;
        }
        const resView = await fetch(`${API_BASE_URL}/api/comic/view/${slug}`, {
          method: "POST",
          headers,
          body: JSON.stringify({ name: loadedComic?.name || slug }),
        });
        if (resView.ok) {
          const viewData = await resView.json();
          if (viewData.success) {
            setComicStats({
              views: viewData.view_count ?? loadedComic.total_views ?? loadedComic.views ?? 0,
              followers: viewData.followers ?? loadedComic.followers ?? 0,
              rating: viewData.rating ?? loadedComic.rating_avg ?? 0,
            });
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Đã xảy ra lỗi");
          console.error("Chi tiết lỗi:", err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [slug, user]);

  useEffect(() => {
    if (user?.token) {
      fetch(`${API_BASE_URL}/api/user/history`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Lỗi khi tải lịch sử đọc");
          return res.json();
        })
        .then((data) => {
          setReadingHistory(Array.isArray(data.readingHistory) ? data.readingHistory : []);
        })
        .catch((err) => {
          console.error("Lỗi khi tải lịch sử đọc:", err);
        });
    } else {
      try {
        const localHist = JSON.parse(localStorage.getItem("guest_reading_history") || "[]");
        setReadingHistory(localHist);
      } catch (e) {
        setReadingHistory([]);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user?.token || !readingHistory.length) return;
    const uniqueSlugs = [...new Set(readingHistory.map((h) => h.slug))];
    Promise.all(
      uniqueSlugs.map((slug) =>
        fetch(`${API_BASE_URL}/api/comic/comics/${slug}`)
          .then((res) => {
            if (!res.ok) throw new Error(`Lỗi khi tải chi tiết truyện ${slug}`);
            return res.json();
          })
          .then((data) => ({
            slug,
            name: data.data?.item?.name || data.data?.item?.title || slug,
            thumb_url: data.data?.item?.thumb_url || "",
          }))
          .catch((err) => {
            console.error(err);
            return { slug, name: slug, thumb_url: "" };
          })
      )
    ).then((arr) => {
      const obj = {};
      arr.forEach((item) => {
        obj[item.slug] = item;
      });
      setHistoryComics(obj);
    });
  }, [user, readingHistory]);

  useEffect(() => {
    if (!user?.token || !slug) return setIsFollowing(false);
    fetch(`${API_BASE_URL}/api/user/is-following/${slug}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi khi kiểm tra trạng thái theo dõi");
        return res.json();
      })
      .then((data) => setIsFollowing(!!data.isFollowing))
      .catch((err) => {
        console.error("Lỗi khi kiểm tra trạng thái theo dõi:", err);
        setIsFollowing(false);
      });
  }, [user, slug]);

  // Lắng nghe sự kiện đồng bộ theo dõi tức thì từ Local Agent (AIChatWidget)
  useEffect(() => {
    const handleAgentStateUpdate = (e) => {
      const act = e.detail;
      if (!act) return;
      if (act.type === "BOOKMARK_CHANGED" && (!act.slug || act.slug === slug)) {
        const nextFollow = !!act.isFollowing;
        setIsFollowing(nextFollow);
        setComicStats((prev) => ({
          ...prev,
          followers:
            typeof act.followers === "number"
              ? act.followers
              : Math.max(0, Number(prev.followers || 0) + (nextFollow ? 1 : -1)),
        }));
      }
    };
    window.addEventListener("agent-state-updated", handleAgentStateUpdate);
    return () => window.removeEventListener("agent-state-updated", handleAgentStateUpdate);
  }, [slug]);

  const handleClickChapter = async (chapterName) => {
    if (viewLoading || !comic?.name) return;
    setViewLoading(true);
    try {
      const headers = { "Content-Type": "application/json" };
      if (user?.token) {
        headers["Authorization"] = `Bearer ${user.token}`;
      }
      await fetch(`${API_BASE_URL}/api/comic/view/${slug}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ chapter: chapterName, name: comic.name }),
      });
    } catch (error) {
      console.error("Lỗi khi tăng view:", error);
    } finally {
      setViewLoading(false);
      navigate(`/doc/${comic.slug}/${encodeURIComponent(chapterName)}`);
    }
  };

  const handleFollow = async () => {
    if (!user?.token) {
      navigate("/login");
      return;
    }
    setFollowLoading(true);
    const nextFollowing = !isFollowing;
    const url = isFollowing
      ? `${API_BASE_URL}/api/user/unfollow`
      : `${API_BASE_URL}/api/user/follow`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (res.ok || data?.success) {
        const newFollowers =
          typeof data?.followers === "number"
            ? data.followers
            : Math.max(0, Number(comicStats.followers || 0) + (nextFollowing ? 1 : -1));
        setIsFollowing(nextFollowing);
        setComicStats((prev) => ({
          ...prev,
          followers: newFollowers,
        }));
        window.dispatchEvent(
          new CustomEvent("agent-state-updated", {
            detail: {
              type: "BOOKMARK_CHANGED",
              slug,
              isFollowing: nextFollowing,
              followers: newFollowers,
            },
          })
        );
      }
    } catch (err) {
      console.error("Lỗi khi theo dõi/bỏ theo dõi:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  const isChapterRead = (slug, chapterName) => {
    const history = readingHistory.find((h) => h.slug === slug);
    if (!history) return false;
    const parseNum = (ch) => {
      const n = parseFloat(String(ch).replace(/[^\d.]/g, ""));
      return isNaN(n) ? 0 : n;
    };
    const currentNum = parseNum(chapterName);
    const savedNum = parseNum(history.chapter);
    return currentNum > 0 && savedNum > 0 && currentNum <= savedNum;
  };

  if (loading) {
    return (
      <div className="bg-[#f3fbf8] min-h-screen flex flex-col items-center justify-center text-emerald-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mb-4"></div>
        <p className="font-semibold animate-pulse">Đang kết nối ký ức với Cây Thế Giới...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#f3fbf8] min-h-screen flex items-center justify-center">
        <div className="bg-white/80 p-6 rounded-2xl border border-red-100 shadow-md text-red-500 font-semibold">
          ⚠️ Lỗi: {error}
        </div>
      </div>
    );
  }

  if (!comic) {
    return (
      <div className="bg-[#f3fbf8] min-h-screen flex items-center justify-center">
        <div className="bg-white/80 p-6 rounded-2xl border border-emerald-100 shadow-md text-emerald-800 font-semibold">
          🌸 Không tìm thấy thông tin bộ truyện này.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f3fbf8] min-h-screen relative overflow-hidden py-8 px-2 md:px-4">
      {/* Hiệu ứng các hạt sáng bay Irminsul ở nền */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(12)].map((_, i) => {
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

      <div className="max-w-7xl mx-auto relative z-10 bg-white/85 backdrop-blur-md rounded-3xl shadow-xl shadow-emerald-100/40 border border-emerald-100/50 p-4 md:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <Breadcrumbs
              links={[
                { label: "Trang chủ", to: "/" },
                { label: "Thể loại", to: "/the-loai" },
                {},
              ]}
              current={comic?.name || ""}
            />
            <ComicInfo
              comic={comic}
              comicStats={comicStats}
              isFollowing={isFollowing}
              followLoading={followLoading}
              user={user}
              handleFollow={handleFollow}
            />

            {/* Hệ thống Cảnh báo / Ghi chú từ Quản trị viên & Nhóm dịch */}
            <div className="mt-4 space-y-2.5">
              <ComicNoticeBanner notices={comic?.notices || []} />

              {isStaff && (
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                      <LuShieldAlert className="w-4 h-4 text-emerald-600" />
                      Quản lý Cảnh báo / Ghi chú nội dung (Admin & Dịch giả)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowNoticeForm((v) => !v)}
                      className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition"
                    >
                      <LuPlus className="w-3.5 h-3.5" />
                      {showNoticeForm ? "Đóng biểu mẫu" : "Thêm cảnh báo / ghi chú"}
                    </button>
                  </div>

                  {showNoticeForm && (
                    <form onSubmit={handleAddNotice} className="mt-3 space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <select
                          value={noticeType}
                          onChange={(e) => setNoticeType(e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold bg-white text-slate-800"
                        >
                          <option value="WARNING">Cảnh báo nội dung (WARNING)</option>
                          <option value="NOTE">Ghi chú từ Admin / Nhóm dịch (NOTE)</option>
                          <option value="SPOILER">Cảnh báo Spoiler (SPOILER)</option>
                          <option value="HIATUS">Thông báo lịch ra chương (HIATUS)</option>
                        </select>
                        <select
                          value={noticeSeverity}
                          onChange={(e) => setNoticeSeverity(e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold bg-white text-slate-800"
                        >
                          <option value="INFO">Mức độ: Thông tin (Xanh ngọc)</option>
                          <option value="WARN">Mức độ: Lưu ý (Vàng hổ phách)</option>
                          <option value="DANGER">Mức độ: Nghiêm trọng (Đỏ)</option>
                        </select>
                      </div>
                      <textarea
                        rows={2}
                        value={noticeContent}
                        onChange={(e) => setNoticeContent(e.target.value)}
                        placeholder="Nhập nội dung cảnh báo hoặc ghi chú cho độc giả..."
                        className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={noticeSubmitting}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50"
                        >
                          {noticeSubmitting ? "Đang lưu..." : "Đăng cảnh báo"}
                        </button>
                      </div>
                    </form>
                  )}

                  {Array.isArray(comic?.notices) && comic.notices.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-emerald-200/60 flex flex-wrap gap-2">
                      {comic.notices.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => handleDeleteNotice(n.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition"
                          title="Xóa cảnh báo này"
                        >
                          <LuTrash2 className="w-3 h-3" />
                          Xóa #{n.id} ({n.type})
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <ChapterList
              chapters={comic?.chapters || []}
              slug={slug}
              user={user}
              readingHistory={readingHistory}
              handleClickChapter={handleClickChapter}
              isChapterRead={isChapterRead}
            />
          </div>
          <div className="w-full lg:w-80 flex-shrink-0">
            <ReadingHistory
              user={user}
              readingHistory={readingHistory}
              historyComics={historyComics}
            />
            <TopRanking />
          </div>
        </div>
        <div className="w-full mt-6">
          <Rating comicSlug={slug} user={user} />
        </div>
        <div className="w-full mt-6">
          <CommentSection comicSlug={slug} user={user} />
        </div>
      </div>

      {/* Modal xác nhận độ tuổi nếu bộ truyện gắn nhãn 18+ */}
      <AgeVerificationModal
        isOpen={(comic?.ageRating || comic?.age_rating) === "18+" && !ageVerified}
        minAge={18}
        comicTitle={comic?.name}
        user={user}
        onVerified={() => setAgeVerified(true)}
        onCancel={() => navigate("/")}
      />
    </div>
  );
};

export default Detail;
