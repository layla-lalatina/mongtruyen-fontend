import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import { getComicThumbUrl } from "../../utils/imageHelpers";

/**
 * 🌳 SYSTEM: IRMINSUL FANTASY RPG — TRANSLATOR SUITE
 * ============================================================
 * @file TranslatorAiAssistant.jsx
 * @description Phân tích cảm xúc & tổng hợp ý kiến độc giả từ bình luận bộ truyện (AI Sentiment & Insights).
 * Đã lược bỏ phần tóm tắt chương để tích hợp trực tiếp vào quy trình đăng chương mới.
 */
const TranslatorAiAssistant = ({
  comics = [],
  user,
  selectedComicSlug,
  setSelectedComicSlug,
  onOpenComicDrawer,
}) => {
  const [loadingAi, setLoadingAi] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState("");

  const currentComic = comics.find((c) => c.slug === selectedComicSlug);

  const formatComicDate = (dateVal) => {
    if (!dateVal) return "Mới cập nhật";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "Mới cập nhật";
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle phân tích bình luận độc giả
  const handleAnalyzeComments = async (e) => {
    e?.preventDefault();
    if (!selectedComicSlug) {
      setError("Vui lòng chọn bộ truyện cần phân tích bình luận!");
      return;
    }

    setLoadingAi(true);
    setError("");
    setAnalysisResult(null);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/ai/analyze-comments/${selectedComicSlug}`,
        {},
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );

      if (res.data.success) {
        setAnalysisResult(res.data);
      } else {
        setError(res.data.message || "Không thể phân tích bình luận.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi gọi AI phân tích bình luận.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-2xl animate-fade-in flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button
            onClick={() => setError("")}
            className="text-rose-500 hover:text-rose-700 font-extrabold text-sm px-2"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT TRÁI: BỘ TRUYỆN ĐANG CHỌN PHÂN TÍCH */}
        <div className="lg:col-span-5 bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-emerald-950 flex items-center gap-2">
              <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs">💬</span>
              Bộ Truyện Cần Phân Tích
            </h3>
            {comics.length > 0 && (
              <button
                type="button"
                onClick={onOpenComicDrawer}
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>🔍</span> Danh sách ({comics.length} truyện)
              </button>
            )}
          </div>

          {/* Card chọn truyện (tham khảo phong cách Ảnh 1) */}
          {currentComic ? (
            <div
              onClick={onOpenComicDrawer}
              className="bg-emerald-50/60 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-200/80 hover:border-emerald-400 cursor-pointer transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={getComicThumbUrl(currentComic.thumb_url || currentComic.thumbUrl)}
                  alt={currentComic.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-cover.jpg";
                  }}
                  className="w-14 h-20 object-cover rounded-xl shadow-xs border border-emerald-200 shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="font-extrabold text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 truncate group-hover:text-emerald-600 transition-colors">
                      {currentComic.name}
                    </h4>
                    <span className="shrink-0 text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                      ✓ Đang chọn
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-500 truncate mb-1.5">
                    Tác giả: <span className="font-semibold text-gray-700">{currentComic.author || "Đang cập nhật"}</span>
                  </p>

                  <div className="text-[10px] sm:text-[11px] text-gray-500 flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      📖 {currentComic.soChuong || `${currentComic.totalChapters || 0} chương`}
                    </span>
                    <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                      👁️ {(currentComic.totalViews || currentComic.views || 0).toLocaleString()} views
                    </span>
                    <span className="text-gray-500 text-[10px]">
                      🕒 {formatComicDate(currentComic.updatedAt || currentComic.updated_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-emerald-100/80 flex items-center justify-between text-[11px]">
                <span className="text-emerald-700 font-semibold">Bấm vào khung để đổi sang bộ truyện khác</span>
                <span className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg group-hover:bg-emerald-700 transition shadow-2xs">
                  Đổi truyện 🔄
                </span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenComicDrawer}
              className="w-full p-5 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl bg-emerald-50/40 hover:bg-emerald-50/80 text-emerald-800 transition flex items-center justify-between font-bold text-xs group"
            >
              <span className="flex items-center gap-2.5">
                <span className="text-2xl group-hover:scale-110 transition-transform">📚</span>
                <span className="text-left">
                  Bấm vào đây để chọn bộ truyện cần phân tích bình luận...
                  <span className="block text-[11px] text-gray-500 font-normal mt-0.5">({comics.length} bộ truyện trong danh sách)</span>
                </span>
              </span>
              <span className="px-3.5 py-1.5 bg-emerald-600 group-hover:bg-emerald-700 text-white rounded-xl text-xs shadow-xs font-extrabold shrink-0">
                Chọn truyện 👉
              </span>
            </button>
          )}

          <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-[11px] text-emerald-800 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-emerald-900">
              <span>💡</span> Cơ chế Phân Tích Ý Kiến Độc Giả AI:
            </div>
            <p className="leading-relaxed text-gray-600">
              Trợ lý Nahida sẽ quét tối đa 30 bình luận mới nhất của bộ truyện, phân tích cảm xúc (Sentiment Analysis), bóc tách điểm độc giả thích thú nhất, các góp ý về bản dịch/nội dung và đưa ra khuyến nghị hữu ích cho nhóm dịch.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAnalyzeComments}
            disabled={loadingAi || !selectedComicSlug}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-2xl transition shadow-md shadow-emerald-600/20 text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {loadingAi ? (
              <>
                <span className="animate-spin text-sm">🌿</span>
                Đang quét bình luận & phân tích cảm xúc...
              </>
            ) : (
              <>
                <span>📊</span>
                Bắt Đầu Phân Tích Ý Kiến Độc Giả
              </>
            )}
          </button>
        </div>

        {/* CỘT PHẢI: BÁO CÁO PHẢN HỒI ĐỘC GIẢ */}
        <div className="lg:col-span-7 bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-emerald-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-emerald-950 flex items-center gap-2">
              <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs">📊</span>
              Báo Cáo Phản Hồi Độc Giả
            </h3>
            {analysisResult && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                Đã phân tích {analysisResult.totalAnalyzed || 0} bình luận
              </span>
            )}
          </div>

          {!analysisResult && !loadingAi && (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-gray-400">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center text-3xl mb-3 shadow-inner">
                💬
              </div>
              <p className="text-xs font-bold text-gray-600 mb-1">Chưa có dữ liệu phân tích</p>
              <p className="text-[11px] text-gray-400 max-w-sm">
                Hãy chọn bộ truyện ở cột bên trái và bấm <b>Bắt Đầu Phân Tích Ý Kiến Độc Giả</b> để Nahida tổng hợp báo cáo.
              </p>
            </div>
          )}

          {loadingAi && (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
              <p className="text-xs font-bold text-emerald-900">
                Đang kết nối Cây Thế Giới Irminsul...
              </p>
              <p className="text-[11px] text-emerald-600 mt-1">
                Tổng hợp cảm xúc độc giả và bóc tách các ý kiến phản hồi
              </p>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-4 animate-fade-in text-xs">
              {/* Chỉ số cảm xúc */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-extrabold text-emerald-900 uppercase tracking-wider">
                    Tổng quan cảm xúc:
                  </span>
                  <span className="font-black px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white text-xs">
                    {analysisResult.analysis?.overallSentiment || "Tích cực"}
                  </span>
                </div>

                {/* Progress bar tỉ lệ cảm xúc */}
                <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden flex shadow-inner">
                  <div
                    style={{ width: `${analysisResult.analysis?.positivePercent || 0}%` }}
                    className="bg-emerald-500 h-full transition-all duration-500"
                    title={`Tích cực: ${analysisResult.analysis?.positivePercent}%`}
                  />
                  <div
                    style={{ width: `${analysisResult.analysis?.neutralPercent || 0}%` }}
                    className="bg-amber-400 h-full transition-all duration-500"
                    title={`Trung lập: ${analysisResult.analysis?.neutralPercent}%`}
                  />
                  <div
                    style={{ width: `${analysisResult.analysis?.negativePercent || 0}%` }}
                    className="bg-rose-500 h-full transition-all duration-500"
                    title={`Tiêu cực: ${analysisResult.analysis?.negativePercent}%`}
                  />
                </div>

                <div className="flex justify-between text-[10px] font-extrabold text-gray-600 pt-0.5">
                  <span className="text-emerald-700">🟢 Tích cực: {analysisResult.analysis?.positivePercent || 0}%</span>
                  <span className="text-amber-700">🟡 Trung lập: {analysisResult.analysis?.neutralPercent || 0}%</span>
                  <span className="text-rose-700">🔴 Tiêu cực: {analysisResult.analysis?.negativePercent || 0}%</span>
                </div>
              </div>

              {/* Điểm độc giả khen */}
              {analysisResult.analysis?.highlights?.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-extrabold text-emerald-800 flex items-center gap-1.5">
                    <span>👍</span> Điểm Độc Giả Thích Nhất:
                  </div>
                  <ul className="list-disc list-inside space-y-1 p-3 bg-emerald-50/40 rounded-xl text-gray-700 border border-emerald-100/80 leading-relaxed font-medium">
                    {analysisResult.analysis.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Điểm độc giả phàn nàn / góp ý */}
              {analysisResult.analysis?.criticisms?.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-extrabold text-rose-700 flex items-center gap-1.5">
                    <span>⚠️</span> Góp Ý & Phàn Nàn Của Độc Giả:
                  </div>
                  <ul className="list-disc list-inside space-y-1 p-3 bg-rose-50/40 rounded-xl text-gray-700 border border-rose-100/80 leading-relaxed font-medium">
                    {analysisResult.analysis.criticisms.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Lời khuyên cho Dịch giả */}
              {analysisResult.analysis?.predictions && (
                <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 text-indigo-950 space-y-1.5">
                  <div className="text-[11px] font-extrabold text-indigo-800 flex items-center gap-1.5">
                    <span>💡</span> Nhận Định & Lời Khuyên Của Nahida:
                  </div>
                  <p className="leading-relaxed font-medium text-[11px] text-gray-700">
                    {analysisResult.analysis.predictions}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranslatorAiAssistant;
