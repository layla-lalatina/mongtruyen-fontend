import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../config";

const CalendarWidget = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [quote, setQuote] = useState("Đang tải lời chúc...");

  // Cập nhật giờ mỗi giây
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Gọi API lời chúc tiếng Việt mỗi ngày
  useEffect(() => {
    const today = new Date().toDateString();
    const cacheVersion = "v2";
    const savedDate = localStorage.getItem("quoteDate");

    if (savedDate === today + cacheVersion) {
      const savedQuote = localStorage.getItem("quote");
      setQuote(savedQuote);
    } else {
      fetch(`${API_BASE_URL}/api/quote`)
        .then((res) => res.json())
        .then((data) => {
          setQuote(data.quote);
          localStorage.setItem("quote", data.quote);
          localStorage.setItem("quoteDate", today + cacheVersion);
        })
        .catch(() => setQuote("Hãy tận hưởng một ngày tuyệt vời!"));
    }

  }, []);

  return (
    <div className="w-full">
      <section className="bg-white/85 backdrop-blur-sm rounded-xl border border-emerald-50 shadow p-6">
        {/* Tiêu đề */}
        <h3 className="font-bold text-lg mb-4 text-emerald-700 border-b border-emerald-100 pb-2 flex items-center gap-1.5">
          📅 Thời gian + Thông báo từ Đại Đạo
        </h3>

        {/* Ngày giờ hiện tại */}
        <div className="mb-4 text-sm text-gray-700">
          <p>
            {currentTime.toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="font-semibold text-emerald-600 mt-1">{currentTime.toLocaleTimeString("vi-VN")}</p>
        </div>

        {/* Lời chúc */}
        <div className="mt-4 p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-lg text-emerald-800 text-sm shadow-inner">
          🌟 <span className="font-medium">{quote}</span>
        </div>
      </section>
    </div>
  );
};

export default CalendarWidget;
