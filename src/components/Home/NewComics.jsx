import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Pagination from "./Pagination";
import AgeBadge from "../Common/AgeBadge";
import { API_BASE_URL } from "../../../config";
import { getComicThumbUrl } from "../../utils/imageHelpers";

const NewComics = ({ selectedCategory }) => {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();


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
        setComics(data.comics || data.data?.items || []);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch((err) => {
        setError("Lỗi khi tải dữ liệu");
        console.error(err);
        setLoading(false);
      });
  }, [page]);

  if (loading) {
    return (
      <div className="bg-[#222] flex items-center justify-center text-white text-xl py-8 rounded">
        Đang tải...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#222] flex items-center justify-center text-red-500 text-xl py-8 rounded">
        {error}
      </div>
    );
  }

  const filteredComics = selectedCategory
    ? comics.filter((item) =>
        item.category?.some((cat) => cat.id === selectedCategory)
      )
    : comics;

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredComics.map((item, idx) => (
          <Link
            to={`/truyen/${item.slug}`}
            key={item._id || idx}
            className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 text-black block overflow-hidden border border-gray-300 hover:-translate-y-1 relative"
          >
            <div className="relative w-full aspect-[3/4] overflow-hidden">
              <img
                src={getComicThumbUrl(item.thumb_url || item.thumbUrl)}
                alt={item.name || item.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-cover.jpg";
                }}
                className="w-full h-full object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200 border-b border-gray-300"
                loading="lazy"
              />
              {item.isHot && (
                <span className="absolute top-2 right-2 bg-gradient-to-r from-[#ff512f] to-[#f09819] text-xs text-white font-bold px-2 py-0.5 rounded shadow">
                  HOT
                </span>
              )}
              <div className="absolute top-2 left-2">
                <AgeBadge rating={item.ageRating || item.age_rating || "ALL"} size="xs" />
              </div>
            </div>
            <div className="p-2 flex flex-col gap-1">
              <h3 className="text-base font-bold text-black group-hover:text-[#ffb300] line-clamp-2 min-h-[2.5em] leading-tight">
                {item.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => setSearchParams({ page: p })}
      />
    </div>
  );
};

export default NewComics;