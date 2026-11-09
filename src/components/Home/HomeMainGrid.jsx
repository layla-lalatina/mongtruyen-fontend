import React from "react";
import { Link } from "react-router-dom";
import Pagination from "./Pagination";
import TopRanking from "./TopRanking";

import { getComicThumbUrl } from "../../utils/imageHelpers";
import AIRecommendSection from "./AIRecommendSection";
import AgeBadge from "../Common/AgeBadge";

const HomeMainGrid = ({
  comics,
  page,
  totalPages,
  goToPage,
  readingHistory,
  historyComics,
  followedComics,
  homeComments,
  user,
}) => {
  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 xl:px-10 pt-4 pb-0 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start relative">
        {/* Main Section: Bên trái hiển thị tự nhiên dính liền trang chủ */}
        <div className="lg:col-span-8 pb-10">
          {/* AI Gợi ý truyện cá nhân hóa — chỉ hiện khi đã đăng nhập & có lịch sử */}
          <AIRecommendSection
            user={user}
            readingHistory={readingHistory}
            historyComics={historyComics}
          />

          <section className="pb-4">
            <h2 className="text-xl font-bold mb-4 flex items-center text-emerald-900 dark:text-emerald-300 py-2.5">
              <span className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg mr-2 text-sm tracking-wide shadow-sm">
                MỚI CẬP NHẬT
              </span>
              <span>Truyện mới nhất</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {comics.map((item) => {
                const latestChapter = item.chap
                  ? (item.chap.toLowerCase().includes("chương") ? item.chap : `Chương ${item.chap}`)
                  : item.soChuong
                    ? (item.soChuong.toLowerCase().includes("chương") ? item.soChuong : `Chương ${item.soChuong}`)
                    : item.totalChapters && item.totalChapters > 0
                      ? `Chương ${item.totalChapters}`
                      : (item.chaptersLatest && item.chaptersLatest.length > 0 ? `Chương ${item.chaptersLatest[0].chapter_name}` : "Đang cập nhật");

                return (
                  <Link
                    key={item._id || item.slug}
                    to={`/truyen/${item.slug}`}
                    className="group bg-white/80 backdrop-blur-sm text-black rounded-2xl border border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-md hover:shadow-emerald-100/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-emerald-50/50 w-full shrink-0">
                      <img
                        src={getComicThumbUrl(item.thumb_url || item.thumbUrl)}
                        alt={item.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default-cover.jpg";
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />

                      {/* Nhãn độ tuổi */}
                      <div className="absolute top-2.5 left-2.5">
                        <AgeBadge rating={item.ageRating || item.age_rating || "ALL"} size="xs" />
                      </div>

                      {/* Nhãn VIP Hoàng Gia nếu là truyện VIP */}
                      {(item.isVip || item.is_vip) && (
                        <span className="absolute top-2.5 right-2.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-md shadow-md border border-amber-300 ring-1 ring-amber-400/40 shiny-gold-title flex items-center gap-1 z-10">
                          👑 VIP
                        </span>
                      )}

                      {/* Glassmorphism Chapter Badge */}
                      <span className="absolute bottom-2.5 right-2.5 bg-emerald-500/90 backdrop-blur-sm text-white font-bold text-[11px] px-2 py-0.5 rounded-md shadow-sm border border-emerald-400/20 truncate max-w-[85%]">
                        {latestChapter}
                      </span>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between bg-white/40">
                      <h3 className="font-bold text-[14px] leading-snug text-gray-800 line-clamp-2 min-h-[2.5rem] group-hover:text-emerald-700 transition-colors">
                        {item.name}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </section>
        </div>

        {/* Sidebar Section: Tách riêng độc lập, cuộn riêng và dính với footer khi lướt xuống cuối */}
        <div className="lg:col-span-4 lg:sticky lg:top-[5.5rem] lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto custom-scrollbar lg:pl-6 lg:border-l lg:border-emerald-100/80 pb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center text-emerald-900 dark:text-emerald-300 sticky top-0 bg-[#f3fbf8]/95 dark:bg-[#081411]/95 backdrop-blur-md z-20 py-2.5">
            <span className="bg-emerald-600 text-white px-2 py-1 rounded mr-2 text-sm shadow-sm">
              Mộng Truyện
            </span>
            <span>Truyện của bạn</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Lịch sử đọc */}
            <div>
              <div className="bg-white/85 backdrop-blur-sm rounded-xl border border-emerald-50 shadow p-4 h-full">
                <h3 className="font-bold text-lg mb-3 text-emerald-700 flex items-center gap-1.5">
                  📖 Lịch sử đọc
                </h3>
                {readingHistory.length === 0 ? (
                  <div className="text-xs text-gray-500">
                    Bạn chưa đọc truyện nào.
                  </div>
                ) : (
                  <div className="space-y-2 text-xs text-gray-700">
                    {[...new Set(readingHistory.map((h) => h.slug))]
                      .slice(0, 5)
                      .map((slug) => {
                        const comic = historyComics[slug];
                        const hist = readingHistory.find((h) => h.slug === slug);
                        const chapNumber = hist?.chapter || "1";
                        const thumbSrc = getComicThumbUrl(
                          comic?.thumb_url || comic?.thumbUrl || hist?.thumb_url || hist?.thumbUrl
                        );
                        return (
                          <Link
                            key={slug}
                            to={
                              chapNumber
                                ? `/doc/${slug}/${encodeURIComponent(chapNumber)}`
                                : `/truyen/${slug}`
                            }
                            className="flex items-center gap-2.5 hover:bg-emerald-50 p-2 rounded-lg transition-colors"
                          >
                            <img
                              src={thumbSrc}
                              alt={comic?.name || hist?.name || slug}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/default-cover.jpg";
                              }}
                              className="w-9 h-12 object-cover rounded-md border border-emerald-200 bg-emerald-50 shrink-0 shadow-xs"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm text-gray-800 truncate">
                                {comic?.name || hist?.name || hist?.title || slug}
                              </div>
                              <div className="text-xs text-emerald-600 font-medium">
                                Đang đọc Chap {chapNumber}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    {readingHistory.length > 5 && (
                      <Link
                        to="/profile"
                        className="block mt-2 text-xs font-semibold text-center text-purple-600 hover:underline"
                      >
                        Xem thêm...
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Truyện theo dõi */}
            <div>
              <div className="bg-white/85 backdrop-blur-sm rounded-xl border border-emerald-50 shadow p-4 h-full">
                <h3 className="font-bold text-lg mb-3 text-emerald-700 flex items-center gap-1.5">
                  📌 Truyện theo dõi
                </h3>
                {followedComics.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    Bạn chưa theo dõi truyện nào.
                  </p>
                ) : (
                  <div className="space-y-2 text-xs text-gray-700">
                    {followedComics.slice(0, 5).map((comic) => {
                      const displayChap = String(comic.chap || "").startsWith("Chương")
                        ? comic.chap
                        : `Chương ${comic.latestChapter || comic.chap || comic.totalChapters || "Mới"}`;

                      return (
                        <Link
                          key={comic.slug}
                          to={`/truyen/${comic.slug}`}
                          className="flex items-center gap-2 hover:bg-emerald-50 p-2 rounded transition-colors"
                        >
                          <img
                            src={getComicThumbUrl(comic.thumb_url)}
                            alt={comic.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/default-cover.jpg";
                            }}
                            className="w-8 h-12 object-cover rounded border border-emerald-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0 truncate">
                            <div className="font-semibold text-sm text-gray-800 truncate">
                              {comic.name}
                            </div>
                            <div className="text-xs text-emerald-600 font-medium">
                              {displayChap}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                    {followedComics.length > 5 && (
                      <Link
                        to="/profile"
                        className="block mt-2 text-xs font-semibold text-center text-purple-600 hover:underline"
                      >
                        Xem thêm...
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Ranking */}
          <div className="w-full mb-6">
            <TopRanking comics={comics} />
          </div>

          {/* Bình luận mới nhất */}
          <div className="mt-6 bg-white/85 backdrop-blur-sm rounded-xl shadow p-4 border border-emerald-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg text-emerald-700 flex items-center gap-1.5">
                💬 Bình luận mới nhất
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-inner">
                {homeComments.length} bình luận
              </span>
            </div>

            {homeComments.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có bình luận nào.</p>
            ) : (
              <div className="space-y-2">
                {homeComments.slice(0, 30).map((comment) => (
                  <div
                    key={comment.id}
                    className="p-2.5 rounded-lg border border-emerald-100/50 bg-emerald-50/20 hover:bg-emerald-50/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-semibold text-emerald-950 truncate">
                        {comment.displayName ||
                          comment.User?.username ||
                          "Ẩn danh"}
                      </span>
                      <span className="text-[11px] text-emerald-600/70 shrink-0 font-medium">
                        {comment.createdAt
                          ? new Date(comment.createdAt).toLocaleDateString(
                              "vi-VN"
                            )
                          : ""}
                      </span>
                    </div>

                    <p className="text-xs text-gray-700 line-clamp-2 bg-white/40 p-1.5 rounded border border-emerald-100/20">
                      {comment.content}
                    </p>

                    <Link
                      to={`/truyen/${comment.comicSlug}`}
                      className="inline-block mt-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                    >
                      Xem truyện
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeMainGrid;
