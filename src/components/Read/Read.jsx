/**
 * 🌳 SYSTEM: IRMINSUL FANTASY RPG - READ COMIC VIEW
 * ==========================================================
 * @file Read.jsx
 * @path fontend/src/components/Read/Read.jsx
 * @description Renders the chapter reading interface, handles page scroll progress tracking,
 * sidebar settings, rating integrations, and dispatches loot-drop-received events to reward XP.
 * ==========================================================
 */

import React, { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  LuChevronLeft,
  LuChevronRight,
  LuBookOpen,
  LuBookmark,
  LuStar,
  LuInfo,
  LuX,
  LuServer,
  LuCrown,
  LuTriangleAlert,
} from "react-icons/lu";
import ChapterNav from "./ChapterNav";
import LootDropPopup from "./LootDropPopup";
import SmartRecapPanel from "./SmartRecapPanel";
import ChapterList from "./ChapterList";
import ChapterImages from "./ChapterImages";
import LockedChapterGate from "./LockedChapterGate";
import AgeBadge from "../Common/AgeBadge";
import AgeVerificationModal from "../Common/AgeVerificationModal";
import ComicNoticeBanner from "../Common/ComicNoticeBanner";
import Rating from "../Rating";
import CommentSection from "../CommentSection";
import { useFollowStatus } from "./hooks/useFollowStatus";
import { useChapterData } from "./hooks/useChapterData";
import { useReadingHistory } from "./hooks/useReadingHistory";
import { useFollowedComics } from "./hooks/useFollowedComics";
import { API_BASE_URL } from "../../../config";
import { getComicThumbUrl } from "../../utils/imageHelpers";

import GuestBanner from "../GuestBanner";

const Read = ({ user }) => {
  const { slug, chapter } = useParams();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showChapterList, setShowChapterList] = useState(false);
  const [showPickerModal, setShowPickerModal] = useState(false);
  const chapterListRef = useRef(null);
  const [historyComics, setHistoryComics] = useState({});
  const [scrollProgress, setScrollProgress] = useState(0);
  const [guestReadCount, setGuestReadCount] = useState(0);
  const [showGuestBanner, setShowGuestBanner] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : false
  );

  const {
    comicName,
    ageRating,
    notices,
    updatedAt,
    allChapters,
    currentChapterIdx,
    images,
    lockInfo,
    accessInfo,
    loading: imgLoading,
    error: imgError,
    reloadChapter,
  } = useChapterData(slug, chapter);

  const [ageVerified, setAgeVerified] = useState(
    () => typeof window !== "undefined" && localStorage.getItem("irminsul_age_verified") === "1"
  );

  // Gửi API tăng view mỗi khi chuyển/mở đọc từng chương (dành cho cả User & Guest)
  useEffect(() => {
    if (!slug || !chapter) return;

    const headers = { "Content-Type": "application/json" };
    if (user?.token) {
      headers["Authorization"] = `Bearer ${user.token}`;
    }

    fetch(`${API_BASE_URL}/api/comic/view/${slug}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ chapter, name: comicName || slug }),
    }).catch((err) => console.error("Lỗi gửi tăng view chương:", err));
  }, [slug, chapter, comicName, user]);

  // Đếm số chương Khách vãng lai đã đọc để hiển thị thông báo mời đăng nhập
  useEffect(() => {
    if (user?.token) {
      setShowGuestBanner(false);
      return;
    }

    if (slug && chapter) {
      let readChapters = [];
      try {
        readChapters = JSON.parse(localStorage.getItem("guest_read_chapters_list") || "[]");
      } catch (e) {
        readChapters = [];
      }

      const chapKey = `${slug}-${chapter}`;
      if (!readChapters.includes(chapKey)) {
        readChapters.push(chapKey);
        localStorage.setItem("guest_read_chapters_list", JSON.stringify(readChapters));
      }

      const count = readChapters.length;
      setGuestReadCount(count);

      // Đọc mỗi 3 chương (mốc 3, 6, 9...) hiển thị banner mời đăng nhập
      if (count >= 3 && count % 3 === 0) {
        setShowGuestBanner(true);
      }
    }
  }, [slug, chapter, user]);

  // Tính toán tiến trình cuộn trang & Ghi nhớ vị trí cuộn
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
        localStorage.setItem(`read-pos-${slug}-${chapter}`, window.scrollY.toString());
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [slug, chapter]);

  // Khôi phục vị trí cuộn trang khi tải xong ảnh
  useEffect(() => {
    if (!imgLoading && images && images.length > 0) {
      const savedPos = localStorage.getItem(`read-pos-${slug}-${chapter}`);
      if (savedPos) {
        const yPos = parseFloat(savedPos);
        const timer = setTimeout(() => {
          window.scrollTo(0, yPos);
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [imgLoading, images, slug, chapter]);

  const { isFollowing, toggleFollow } = useFollowStatus({ user, slug });
  const { readingHistory, isChapterRead } = useReadingHistory({ user, slug, chapter });
  const { followedComics, loading: followLoading, error: followError } = useFollowedComics({ user });

  // Lấy thông tin lần cuối đọc truyện này từ readingHistory để Smart Recap
  const currentComicHistory = readingHistory.find((h) => h.slug === slug);
  const lastReadChapter = currentComicHistory?.chapter || null;
  const lastReadAt = currentComicHistory?.updatedAt || currentComicHistory?.lastReadAt || null;

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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

  // Nhịp tim ping cày đồ khi đọc truyện (10 giây / lần, tối đa 5 lần / chương, 100 lần / ngày)
  useEffect(() => {
    if (!user?.token || !slug || !chapter) return;
    let stopped = false;

    // Ping lần đầu để khởi tạo phiên đọc chương
    fetch(`${API_BASE_URL}/api/user/reading-heartbeat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ comicSlug: slug, chapterSlug: chapter }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.chapterLimitReached || data.dailyLimitReached) {
          stopped = true;
        }
      })
      .catch((err) => console.error("Heartbeat error:", err));

    const interval = setInterval(() => {
      if (stopped) return;
      fetch(`${API_BASE_URL}/api/user/reading-heartbeat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ comicSlug: slug, chapterSlug: chapter }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.drop) {
            const event = new CustomEvent("loot-drop-received", { detail: data.drop });
            window.dispatchEvent(event);
          }
          if (data.chapterLimitReached || data.dailyLimitReached) {
            stopped = true;
            clearInterval(interval);
          }
        })
        .catch((err) => console.error("Heartbeat error:", err));
    }, 10000); // Mỗi 10 giây nhận quà 1 lần

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [user, slug, chapter]);

  const goToChapter = (idx) => {
    if (idx >= 0 && idx < allChapters.length) {
      const chap = allChapters[idx];
      navigate(`/doc/${slug}/${encodeURIComponent(chap.chapter_name)}`);
      setShowChapterList(false);
    }
  };

  const prevIdx = currentChapterIdx - 1 >= 0 ? currentChapterIdx - 1 : -1;
  const nextIdx = currentChapterIdx + 1 < allChapters.length ? currentChapterIdx + 1 : -1;

  const renderSidebarContent = (mobile = false) => (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6 text-sm">
      <div>
        <div className="mb-3 p-2.5 rounded-lg border border-gray-200 bg-gray-50 space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => prevIdx !== -1 && goToChapter(prevIdx)}
              disabled={prevIdx === -1}
              className="px-2.5 py-1.5 rounded-md bg-white border border-emerald-100 text-gray-700 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              title="Chương trước"
            >
              <LuChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowPickerModal(true)}
              className="flex-1 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold hover:bg-emerald-100 transition-colors text-xs truncate"
              title="Mở danh sách chương"
            >
              Chương {allChapters[currentChapterIdx]?.chapter_name || "?"}
            </button>

            <button
              onClick={() => nextIdx !== -1 && goToChapter(nextIdx)}
              disabled={nextIdx === -1}
              className="px-2.5 py-1.5 rounded-md bg-white border border-emerald-100 text-gray-700 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              title="Chương sau"
            >
              <LuChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={toggleFollow}
            className={`w-full px-3 py-2 rounded-md font-semibold text-white transition ${
              isFollowing ? "bg-rose-500 hover:bg-rose-600 shadow-sm" : "bg-emerald-600 hover:bg-emerald-700 shadow-sm"
            }`}
          >
            {isFollowing ? "Bỏ theo dõi" : "Theo dõi"}
          </button>
        </div>

        <h3 className="font-bold mb-3 text-emerald-700 flex items-center gap-1.5">
          <LuBookOpen className="w-4 h-4" /> Lịch sử đọc
        </h3>
        {user && readingHistory?.length > 0 ? (
          <div className="space-y-2">
            {[...new Set(readingHistory.map((h) => h.slug))]
              .slice(0, 2)
              .map((slug) => {
                const comic = historyComics[slug];
                return (
                  <Link
                    key={slug}
                    to={`/truyen/${slug}`}
                    onClick={() => mobile && setShowSidebar(false)}
                    className="flex items-center gap-2 hover:bg-emerald-50 p-2 rounded transition-colors"
                  >
                    <img
                      src={getComicThumbUrl(comic?.thumb_url)}
                      alt={comic?.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-cover.jpg";
                      }}
                      className="w-8 h-12 object-cover rounded border"
                    />
                    <span className="truncate">{comic?.name || slug}</span>
                  </Link>
                );
              })}
          </div>
        ) : (
          <p className="text-gray-500 italic">Chưa có dữ liệu lưu dấu kỷ niệm.</p>
        )}
      </div>

      <div>
        <h3 className="font-bold mb-3 text-emerald-700 flex items-center gap-1.5">
          <LuBookmark className="w-4 h-4" /> Truyện theo dõi
        </h3>
        {user ? (
          followLoading ? (
            <p className="text-gray-500">Đang tải truyện theo dõi...</p>
          ) : followError ? (
            <p className="text-red-500">{followError}</p>
          ) : followedComics.length > 0 ? (
            <div className="space-y-2">
              {followedComics.slice(0, 2).map((comic) => (
                <Link
                  key={comic.slug}
                  to={`/truyen/${comic.slug}`}
                  onClick={() => mobile && setShowSidebar(false)}
                  className="flex items-center gap-2 hover:bg-emerald-50 p-2 rounded transition-colors"
                >
                  <img
                    src={getComicThumbUrl(comic.thumb_url)}
                    alt={comic.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-cover.jpg";
                    }}
                    className="w-8 h-12 object-cover rounded border border-emerald-100"
                  />
                  <div className="truncate">
                    <div className="font-semibold text-gray-800 truncate">{comic.name}</div>
                    <div className="text-xs text-emerald-600 font-medium">
                      {String(comic.chap || "").startsWith("Chương")
                        ? comic.chap
                        : `Chương ${comic.latestChapter || comic.chap || comic.totalChapters || "Mới"}`}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Chưa có truyện theo dõi.</p>
          )
        ) : (
          <p className="text-gray-500">Đăng nhập để lưu theo dõi.</p>
        )}
      </div>

      <div>
        <h3 className="font-bold mb-3 text-emerald-700 flex items-center gap-1.5">
          <LuStar className="w-4 h-4" /> Đánh giá truyện
        </h3>
        <Rating comicSlug={slug} user={user} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3fbf8] text-gray-800 py-4 font-sans relative">
      {/* Thanh tiến trình đọc phát sáng màu xanh ngọc */}
      <div
        className="fixed top-0 left-0 h-1 z-[99] bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-75 glow-emerald-shadow"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Desktop sidebar */}
      {isDesktop && (
        <aside 
          className={`fixed top-0 left-0 w-80 bg-white/95 backdrop-blur-xl border-r border-emerald-100 shadow-2xl z-40 h-screen flex flex-col transform transition-transform duration-300 ${
            showSidebar ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 border-b border-emerald-100 bg-emerald-50/50 text-emerald-950 font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <LuInfo className="w-4 h-4 text-emerald-600" /> Thông tin truyện
            </span>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-slate-500 hover:text-emerald-800 font-bold text-xs bg-emerald-100/70 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
              title="Ẩn thanh bên"
            >
              <LuX className="w-3.5 h-3.5" /> Ẩn
            </button>
          </div>
          {renderSidebarContent()}
        </aside>
      )}

      {/* Mobile drawer sidebar */}
      <aside
        className={`fixed top-0 left-0 w-64 bg-white/95 backdrop-blur-md text-black shadow transform transition-transform duration-300 z-40 border-r border-emerald-100 ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } flex flex-col h-screen lg:hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b border-emerald-100 bg-emerald-50/30 text-emerald-950">
          <h2 className="font-bold">Thông tin</h2>
          <button
            onClick={() => setShowSidebar(false)}
            className="text-gray-500 hover:text-black text-2xl"
          >
            ×
          </button>
        </div>
        {renderSidebarContent(true)}
      </aside>

      {/* Overlay (Chỉ hiển thị ở Mobile để tap tắt drawer) */}
      {showSidebar && (
        <div
          onClick={() => setShowSidebar(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-30 lg:hidden"
        ></div>
      )}

      {/* Chapter picker modal from sidebar button */}
      {showPickerModal && (
        <div className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 w-full max-w-3xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-emerald-100 bg-emerald-50/30 text-emerald-950">
              <h3 className="font-bold">Chọn chương</h3>
              <button
                onClick={() => setShowPickerModal(false)}
                className="text-gray-500 hover:text-gray-800 text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-3">
              <ChapterList
                allChapters={allChapters}
                currentChapterIdx={currentChapterIdx}
                goToChapter={goToChapter}
                isChapterRead={isChapterRead}
                slug={slug}
                user={user}
                onSelect={() => setShowPickerModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="max-w-5xl mx-auto space-y-6 pb-24 px-2 relative z-10">
        <nav className="text-xs text-gray-500 mb-2 px-2 font-medium">
          <Link to="/" className="hover:underline text-emerald-600 font-semibold">Trang Chủ</Link>
          {" / "}
          <Link to={`/truyen/${slug}`} className="hover:underline text-emerald-600 font-semibold">{comicName}</Link>
          {" / "}
          
          <span className="text-emerald-800">Chương {chapter}</span>
        </nav>

        <div className="bg-white/90 backdrop-blur-sm p-5 border border-emerald-100 rounded-2xl shadow-sm text-sm">
          {/* AI Smart Recap — hiển thị khi quay lại đọc sau thời gian dài */}
          {lastReadChapter && (
            <SmartRecapPanel
              comicSlug={slug}
              lastChapterNumber={lastReadChapter}
              user={user}
              lastReadAt={lastReadAt}
            />
          )}
          <h1 className="text-lg font-bold text-emerald-900 mb-2 flex items-center gap-2 flex-wrap">
            <Link to={`/truyen/${slug}`} className="hover:underline text-emerald-700">{comicName} </Link>
             - Chương {chapter}
            <AgeBadge rating={ageRating} size="sm" />
            <span className="text-xs text-emerald-600/70 font-medium">
              (Cập nhật: {updatedAt && !isNaN(new Date(updatedAt).getTime()) ? new Date(updatedAt).toLocaleDateString("vi-VN") : "Mới đây"})
            </span>
          </h1>
          <p className="mb-3 text-emerald-950/80">
            Nếu không xem được hình, vui lòng đổi <strong>"SERVER HÌNH"</strong> bên dưới.
          </p>
          <div className="flex gap-2 flex-wrap">
            <button className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition shadow-sm flex items-center gap-1.5">
              <LuServer className="w-4 h-4" /> Server 1
            </button>
            <button className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition shadow-sm flex items-center gap-1.5">
              <LuCrown className="w-4 h-4" /> Server VIP
            </button>
            <button className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-semibold transition shadow-sm flex items-center gap-1.5">
              <LuTriangleAlert className="w-4 h-4" /> Báo Lỗi Chương
            </button>
          </div>
        </div>

        {/* Cảnh báo / Ghi chú từ Admin */}
        <ComicNoticeBanner notices={notices} />

        {/* Banner Vinh Danh Đặc Quyền VIP khi đọc chương */}
        {accessInfo?.unlockType === "VIP" && !lockInfo && (
          <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-amber-950 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-between shadow-md border border-amber-300">
            <div className="flex items-center gap-2">
              <span className="text-xl animate-bounce">👑</span>
              <span>Đặc Quyền VIP: Đang đọc chương VIP độc quyền không giới hạn!</span>
            </div>
            <span className="bg-amber-950 text-amber-300 text-[10px] px-2.5 py-0.5 rounded-full uppercase font-black tracking-wider shadow-xs">
              {accessInfo.vipTier >= 2 ? "Hộ Vệ Irminsul" : "Lữ Khách Ánh Sao"}
            </span>
          </div>
        )}

        {/* Nội dung chương hoặc Cổng mở khóa chương */}
        {lockInfo ? (
          <LockedChapterGate
            lockInfo={lockInfo}
            chapterName={chapter}
            comicName={comicName}
            user={user}
            onUnlocked={() => reloadChapter()}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <ChapterImages images={images} loading={imgLoading} error={imgError} />
          </div>
        )}

        {/* Modal xác nhận tuổi nếu truyện 18+ */}
        <AgeVerificationModal
          isOpen={ageRating === "18+" && !ageVerified}
          minAge={18}
          comicTitle={comicName}
          user={user}
          onVerified={() => setAgeVerified(true)}
          onCancel={() => navigate(`/truyen/${slug}`)}
        />

        <div className="bg-white/95 text-gray-800 rounded-2xl shadow-sm p-4 border border-emerald-50">
          <h3 className="font-bold text-emerald-800 mb-3 border-b border-emerald-100 pb-2">Bình luận</h3>
          <CommentSection comicSlug={slug} user={user} />
        </div>
      </main>

      {/* ChapterNav cố định dưới đáy màn hình (Dành cho cả PC & Mobile) */}
      <ChapterNav
        allChapters={allChapters}
        currentChapterIdx={currentChapterIdx}
        prevIdx={prevIdx}
        nextIdx={nextIdx}
        goToChapter={goToChapter}
        showChapterList={showChapterList}
        setShowChapterList={setShowChapterList}
        renderChapterList={() => (
          <ChapterList
            ref={chapterListRef}
            allChapters={allChapters}
            currentChapterIdx={currentChapterIdx}
            goToChapter={goToChapter}
            isChapterRead={isChapterRead}
            slug={slug}
            user={user}
            onSelect={() => setShowChapterList(false)}
          />
        )}
        isFollowing={isFollowing}
        toggleFollow={toggleFollow}
        onToggleSidebar={() => setShowSidebar((v) => !v)}
        dropdownPlacement="up"
        className="!fixed !bottom-0 !left-0 !w-full !z-50"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
      />

      {/* Guest Banner Thông báo Khách vãng lai */}
      {showGuestBanner && (
        <GuestBanner
          readCount={guestReadCount}
          onClose={() => setShowGuestBanner(false)}
        />
      )}

      {/* Loot Drop Popup — Hiển thị phần thưởng rơi khi đọc truyện */}
      {user?.token && <LootDropPopup />}
    </div>
  );
};

export default Read;
