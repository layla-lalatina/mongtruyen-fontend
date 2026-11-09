import React from "react";
import { Link } from "react-router-dom";
import {
  LuClock,
  LuStar,
  LuHeart,
  LuBookOpen,
  LuZap,
  LuCheck,
  LuPlus,
} from "react-icons/lu";
import { getComicThumbUrl } from "../../utils/imageHelpers";
import AgeBadge from "../Common/AgeBadge";

const ComicInfo = ({
  comic,
  comicStats,
  isFollowing,
  followLoading,
  user,
  handleFollow,
}) => {
  const thumb = getComicThumbUrl(comic.thumb_url || comic.thumbUrl);
  const ageRating = comic.ageRating || comic.age_rating || "ALL";

  // Lấy chương đầu tiên và cuối cùng
  const firstChapter =
    comic.chapters?.[0]?.server_data?.[0]?.chapter_name || "";
  const lastServerData = comic.chapters?.[0]?.server_data;
  const lastChapter =
    lastServerData?.[lastServerData.length - 1]?.chapter_name || "";

  return (
    <div className="flex flex-col md:flex-row gap-6 bg-white/90 backdrop-blur-md rounded-2xl border border-emerald-100 p-6 shadow-sm">
      <div className="shrink-0 flex justify-center md:justify-start relative">
        <img
          src={thumb}
          alt={comic.name}
          className="w-44 h-64 object-cover rounded-2xl shadow-md border-2 border-emerald-100/80 hover:scale-102 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/default-cover.jpg";
          }}
        />
        <div className="absolute top-2.5 left-2.5">
          <AgeBadge rating={ageRating} size="sm" />
        </div>
        {(comic.isVip || comic.is_vip) && (
          <div className="absolute top-2.5 right-2.5">
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black text-[11px] px-2.5 py-1 rounded-lg shadow-md border border-amber-300 ring-1 ring-amber-400/40 shiny-gold-title flex items-center gap-1">
              👑 VIP
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-950 leading-tight">
            {comic.name}
          </h1>
          <AgeBadge rating={ageRating} size="lg" showLabel />
          {(comic.isVip || comic.is_vip) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black text-xs rounded-full shadow-md border border-amber-300 ring-2 ring-amber-400/40 shiny-gold-title uppercase tracking-wider">
              👑 Truyện Đặc Quyền VIP
            </span>
          )}
        </div>

        <div className="text-xs text-emerald-800/70 font-semibold bg-emerald-50/60 self-start px-2.5 py-1 rounded-lg border border-emerald-100/60 flex items-center gap-1.5">
          <LuClock className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            Cập nhật lúc:{" "}
            {comic.updatedAt || comic.apiUpdatedAt || comic.updated_at
              ? new Date(
                  comic.updatedAt || comic.apiUpdatedAt || comic.updated_at
                ).toLocaleDateString("vi-VN", {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }) +
                " - " +
                new Date(
                  comic.updatedAt || comic.apiUpdatedAt || comic.updated_at
                ).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm border-y border-emerald-50 py-3 my-1">
          <div>
            <span className="font-bold text-emerald-900/60 text-xs block uppercase">
              Tác giả
            </span>
            <span className="font-semibold text-emerald-950">
              {Array.isArray(comic.author)
                ? comic.author.length > 0 && comic.author.join(", ").trim()
                  ? comic.author.join(", ")
                  : "Admin"
                : comic.author && comic.author !== "Đang cập nhật"
                ? comic.author
                : "Admin"}
            </span>
          </div>
          <div>
            <span className="font-bold text-emerald-900/60 text-xs block uppercase">
              Tình trạng
            </span>
            <span className="font-semibold text-emerald-950">
              {comic.status?.toLowerCase() === "completed" ||
              comic.status?.toLowerCase() === "hoàn thành"
                ? "Hoàn thành"
                : comic.status?.toLowerCase() === "hiatus"
                ? "Tạm ngưng"
                : "Đang tiến hành"}
            </span>
          </div>
          <div>
            <span className="font-bold text-emerald-900/60 text-xs block uppercase">
              Độ tuổi
            </span>
            <span className="font-bold text-emerald-950">{ageRating}</span>
          </div>
          <div>
            <span className="font-bold text-emerald-900/60 text-xs block uppercase">
              Lượt xem
            </span>
            <span className="font-semibold text-emerald-950">
              {comicStats.views.toLocaleString()}
            </span>
          </div>
        </div>

        <div>
          <span className="font-bold text-emerald-900/60 text-xs block uppercase mb-1.5">
            Thể loại
          </span>
          <div className="flex flex-wrap gap-2">
            {comic.category?.length ? (
              comic.category.map((cat, i) => (
                <Link
                  key={cat.id || cat.slug || i}
                  to={`/the-loai/${cat.slug}`}
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-lg text-xs font-bold transition-all border border-emerald-100/50"
                >
                  {cat.name}
                </Link>
              ))
            ) : (
              <span className="text-gray-400 text-xs italic">Không có thể loại</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm mt-1">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-emerald-800">Xếp hạng:</span>
            <span className="text-amber-500 font-bold text-base flex items-center gap-1">
              <LuStar className="w-4 h-4 fill-current" /> {comicStats.rating || "0.0"}
            </span>
            <span className="text-xs text-emerald-800/60">
              ({comic.rate_count || 0} lượt đánh giá)
            </span>
          </div>

          <div className="h-4 w-px bg-emerald-100" />

          <div className="flex items-center gap-2">
            <button
              className={`px-4 py-1.5 rounded-xl text-xs font-extrabold shadow-sm transition-all duration-300 flex items-center gap-1.5 ${
                isFollowing
                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
              onClick={handleFollow}
              disabled={followLoading || !user}
            >
              {followLoading ? (
                "Đang xử lý..."
              ) : isFollowing ? (
                <>
                  <LuCheck className="w-3.5 h-3.5" /> Đã theo dõi
                </>
              ) : (
                <>
                  <LuHeart className="w-3.5 h-3.5" /> Theo dõi
                </>
              )}
            </button>
            <span className="text-emerald-700 font-bold">
              {comicStats.followers.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-800/60 font-medium">
              Lữ hành đã theo dõi
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 mt-3">
          {firstChapter ? (
            <Link
              to={`/doc/${comic.slug}/${firstChapter}`}
              className="bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <LuBookOpen className="w-4 h-4" />
              Đọc từ đầu
            </Link>
          ) : (
            <span className="text-gray-400 text-xs italic">Chưa có chương</span>
          )}
          {lastChapter && (
            <Link
              to={`/doc/${comic.slug}/${lastChapter}`}
              className="bg-teal-600 hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-500/20 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <LuZap className="w-4 h-4" />
              Đọc mới nhất (Chương {lastChapter})
            </Link>
          )}
        </div>

        <div className="mt-3 bg-emerald-50/20 p-4 rounded-xl border border-emerald-50/50">
          <span className="font-bold text-emerald-950 text-sm block mb-1">Mô tả</span>
          <div
            className="text-gray-700 text-xs md:text-sm leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: comic.content || "Không có mô tả.",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ComicInfo;
