import React from "react";
import { Link } from "react-router-dom";
import { useReadingHistory } from "../Read/hooks/useReadingHistory";
import { API_BASE_URL } from "../../../config";
import { getComicThumbUrl } from "../../utils/imageHelpers";

const ReadingHistorySidebar = ({ user }) => {
  const { readingHistory } = useReadingHistory({
    user,
    slug: null,
    chapter: null,
  });

  if (!user?.token) {
    return null;
  }

  return (
    <div className="bg-white rounded shadow p-4">
      <div className="font-bold text-base mb-2 text-[#2196f3]">
        Lịch sử đọc truyện
      </div>

      {readingHistory.length === 0 ? (
        <div className="text-xs text-gray-500">
          Bạn chưa đọc truyện nào.
        </div>
      ) : (
        <ul className="text-xs text-gray-800 space-y-2">
          {readingHistory
            .reduce((acc, curr) => {
              if (!acc.find((item) => item.slug === curr.slug)) {
                acc.push(curr);
              }
              return acc;
            }, [])
            .slice(0, 10)
            .map((item) => (
              <li key={item.slug} className="flex items-center gap-2">
                <Link to={`/truyen/${item.slug}`}>
                  <img
                    src={getComicThumbUrl(item.thumb_url)}
                    alt={item.name}
                    className="w-8 h-12 object-cover rounded border"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-cover.jpg";
                    }}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/truyen/${item.slug}`}
                    className="font-semibold hover:underline text-sm line-clamp-1"
                  >
                    {item.name}
                  </Link>
                  <div className="text-[10px] text-gray-500">
                    Đã đọc đến: {item.chapter}
                  </div>
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default ReadingHistorySidebar;
