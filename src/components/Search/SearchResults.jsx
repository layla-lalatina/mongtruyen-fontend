import React from "react";
import { Link } from "react-router-dom";
import { getComicThumbUrl } from "../../utils/imageHelpers";
import AgeBadge from "../Common/AgeBadge";

export const SearchResults = ({ results }) => {
  if (!results || results.length === 0) {
    return (
      <div className="text-center text-emerald-800/60 py-20 bg-emerald-50/20 rounded-2xl border border-emerald-100/50 my-4 w-full">
        <span className="text-lg">🌸 Không tìm thấy bộ truyện nào phù hợp tiêu chí của Lữ Hành.</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {results.map((item, idx) => (
        <Link
          to={`/truyen/${item.slug}`}
          key={item._id || item.slug || idx}
          className="group bg-white text-black rounded-2xl border border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-lg hover:shadow-emerald-100/50 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col h-full relative"
        >
          <div className="relative aspect-[3/4] overflow-hidden bg-emerald-50/50 w-full shrink-0">
            <img
              src={getComicThumbUrl(item.thumb_url || item.thumbUrl)}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />

            <div className="absolute top-2.5 left-2.5 z-10">
              <AgeBadge rating={item.ageRating || item.age_rating || "ALL"} size="xs" />
            </div>

            {(item.isVip || item.is_vip) && (
              <span className="absolute top-2.5 right-2.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-md shadow-md border border-amber-300 ring-1 ring-amber-400/40 shiny-gold-title flex items-center gap-1 z-10">
                👑 VIP
              </span>
            )}

            <span className="absolute bottom-2.5 right-2.5 bg-emerald-500/90 backdrop-blur-sm text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-lg shadow-sm border border-emerald-400/20 truncate max-w-[85%]">
              {item.soChuong || "Đang cập nhật"}
            </span>
          </div>

          <div className="p-3 flex-1 flex flex-col justify-between bg-white/40">
            <h3 className="font-bold text-[13px] leading-snug text-gray-800 line-clamp-2 min-h-[2.2rem] group-hover:text-emerald-700 transition-colors">
              {item.name}
            </h3>

            {item.category && item.category.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2 border-t border-emerald-50/50 pt-2">
                {item.category.slice(0, 2).map((cat, idx2) => (
                  <span
                    key={cat.id || idx2}
                    className="text-[10px] bg-emerald-50 text-emerald-700 rounded px-1.5 py-0.5 font-medium"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};
