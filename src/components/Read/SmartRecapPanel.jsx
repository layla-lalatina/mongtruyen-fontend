/**
 * 🌳 SYSTEM: IRMINSUL FANTASY RPG — ENHANCED AI SMART RECAP & CHARACTER LORE PANEL
 * ============================================================
 * @file SmartRecapPanel.jsx
 * @description Panel tóm tắt thông minh nội dung truyện và tra cứu hồ sơ nhân vật:
 *   - Tab 1: Ký Ức Mạch Truyện (Kiểu sức mạnh, Nhân vật chính/phụ, Recap diễn biến)
 *   - Tab 2: Hồ Sơ Nhân Vật & Thiết Lập Bộ Truyện (Đầy đủ Main, Nữ chính, Tính cách, Sức mạnh)
 *   - Tab 3: Hỏi Đáp Tương Tác Cùng Nahida AI (Hỏi tên nhân vật, sức mạnh, diễn biến...)
 * ============================================================
 */

import React, { useState } from "react";
import { API_BASE_URL } from "../../../config";

const SmartRecapPanel = ({ comicSlug, lastChapterNumber, user, lastReadAt }) => {
  const [activeTab, setActiveTab] = useState("recap"); // 'recap' | 'characters' | 'ask'
  const [recap, setRecap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [shown, setShown] = useState(false);

  // States cho tính năng hỏi đáp nhanh với Nahida
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [chatLog, setChatLog] = useState([]); // [{ q, a }]

  // Hiển thị nếu user đã đọc và lần cuối đọc > 1 ngày trước hoặc bấm nút gọi
  const shouldShow = (() => {
    if (!user?.token || !comicSlug || !lastChapterNumber) return false;
    if (!lastReadAt) return false;
    const daysSince = (Date.now() - new Date(lastReadAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= 1;
  })();

  const fetchRecap = async () => {
    if (!comicSlug || !user?.token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/smart-recap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ comicSlug, lastChapterNumber }),
      });
      const data = await res.json();
      if (data.success) {
        setRecap(data);
        setShown(true);
      } else {
        setError(data.message || "Không thể tải Recap lúc này.");
      }
    } catch {
      setError("Lỗi kết nối tới AI Service. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleAskNahida = async (qText) => {
    const askText = qText || question;
    if (!askText.trim() || asking) return;

    setAsking(true);
    setQuestion("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/smart-recap/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          comicSlug,
          question: askText,
          currentChapterNumber: lastChapterNumber,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setChatLog((prev) => [
          ...prev,
          { q: askText, thinking: data.thinking || "", a: data.answer, openThinking: false },
        ]);
      } else {
        setChatLog((prev) => [
          ...prev,
          { q: askText, thinking: "", a: "🌿 " + (data.message || "Không thể xử lý câu hỏi lúc này."), openThinking: false },
        ]);
      }
    } catch {
      setChatLog((prev) => [
        ...prev,
        { q: askText, thinking: "", a: "🌿 Lỗi kết nối tới Cây Thế Giới Irminsul. Vui lòng thử lại sau anh nhé! ✨", openThinking: false },
      ]);
    } finally {
      setAsking(false);
    }
  };

  const toggleThinking = (idx) => {
    setChatLog((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, openThinking: !item.openThinking } : item))
    );
  };

  if (!shouldShow || dismissed) return null;

  const quickQuestions = [
    "👤 Nhân vật chính tên gì & có tính cách ra sao?",
    "⚡ Truyện này có hệ thống hay sức mạnh gì không?",
    "💍 Nữ chính là ai và tại sao hai người kết hôn?",
    "📖 Điểm lại diễn biến chính từ chương 1 đến 3",
  ];

  return (
    <div className="mb-6 rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-[#f2fbf7] via-white to-[#edf8f4] shadow-md shadow-emerald-900/5 overflow-hidden transition-all">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-emerald-100/70 via-teal-100/50 to-emerald-50 border-b border-emerald-200/60">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 bg-emerald-500/10 text-emerald-700 rounded-xl text-base">🌿</span>
          <div>
            <div className="text-xs sm:text-sm font-black text-emerald-950 flex items-center gap-2">
              <span>AI Smart Recap & Hồ Sơ Nhân Vật</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-extrabold uppercase tracking-wider">
                Nahida AI
              </span>
            </div>
            <div className="text-[11px] text-emerald-700 font-medium">
              Ký ức mạch truyện, phân tích nhân vật chính/phụ & kiểu sức mạnh
            </div>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-emerald-200/60 text-emerald-700 text-base font-bold transition"
          title="Đóng bảng tóm tắt"
        >
          ×
        </button>
      </div>

      {/* Main Container */}
      <div className="p-4 sm:p-5">
        {!shown && !loading && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs text-emerald-900 font-bold">
                Bạn đã đọc đến <span className="text-emerald-700 font-extrabold">Chương {lastChapterNumber}</span> từ vài ngày trước.
              </p>
              <p className="text-[11px] text-gray-500">
                Để nắm rõ nhân vật chính, nữ chính, kiểu sức mạnh và mạch truyện, hãy để Nahida tra cứu Ký Ức Irminsul giúp bạn! ✨
              </p>
            </div>
            <button
              onClick={fetchRecap}
              className="flex-shrink-0 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
            >
              <span>🌿</span>
              <span>Điểm Lại Ký Ức Truyện</span>
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col sm:flex-row items-center gap-3 py-4 text-center sm:text-left justify-center sm:justify-start">
            <div className="w-8 h-8 border-3 border-emerald-300 border-t-emerald-600 rounded-full animate-spin flex-shrink-0" />
            <div>
              <p className="text-xs font-black text-emerald-900">
                Thảo Thần Nahida đang nạp hồ sơ tác phẩm từ CSDL...
              </p>
              <p className="text-[11px] text-gray-400">
                Đang đối soát nhân vật chính Yuzaki Nasa, nữ chính, tính cách và các chương đã đọc.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {recap && (
          <div className="space-y-4 animate-fade-in">
            {/* Tabs Điều Hướng */}
            <div className="flex flex-wrap gap-2 border-b border-emerald-100 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab("recap")}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  activeTab === "recap"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white text-emerald-900 hover:bg-emerald-50 border border-emerald-100"
                }`}
              >
                <span>📜</span>
                <span>Tóm Tắt Mạch Truyện</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("characters")}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  activeTab === "characters"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white text-emerald-900 hover:bg-emerald-50 border border-emerald-100"
                }`}
              >
                <span>👤</span>
                <span>Hồ Sơ Nhân Vật & Bối Cảnh</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("ask")}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  activeTab === "ask"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white text-emerald-900 hover:bg-emerald-50 border border-emerald-100"
                }`}
              >
                <span>💬</span>
                <span>Hỏi Đáp Cùng Nahida ✨</span>
              </button>
            </div>

            {/* TAB 1: TÓM TẮT MẠCH TRUYỆN */}
            {activeTab === "recap" && (
              <div className="space-y-3.5">
                {/* Badge Kiểu sức mạnh */}
                {recap.powerSystem && (
                  <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start sm:items-center gap-2.5">
                      <span className="p-1.5 bg-amber-500/20 text-amber-800 rounded-xl text-xs flex-shrink-0">
                        ⚡
                      </span>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                          Kiểu Sức Mạnh & Thiết Lập Bộ Truyện:
                        </div>
                        <div className="text-xs sm:text-sm font-black text-gray-900">
                          {recap.powerSystem.type}
                        </div>
                      </div>
                    </div>
                    {recap.powerSystem.description && (
                      <div className="text-[11px] text-gray-600 sm:text-right max-w-md italic font-medium">
                        {recap.powerSystem.description}
                      </div>
                    )}
                  </div>
                )}

                {/* Tuyến nhân vật rút gọn */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-6 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                        <span>👑</span>
                        <span>Nhân Vật Chính (Main):</span>
                      </span>
                      <div className="text-sm font-extrabold text-emerald-950 mt-1">
                        {recap.protagonist?.name || "Yuzaki Nasa"}
                      </div>
                    </div>
                    {recap.protagonist?.recentState && (
                      <div className="mt-1.5 pt-1.5 border-t border-emerald-200/60 text-[11px] text-emerald-900">
                        <span className="font-bold">Trạng thái: </span>
                        <span>{recap.protagonist.recentState}</span>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-6 bg-rose-50/70 border border-rose-200/80 rounded-2xl p-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 flex items-center gap-1">
                        <span>🌸</span>
                        <span>Nữ Chính:</span>
                      </span>
                      <div className="text-sm font-extrabold text-rose-950 mt-1">
                        {recap.femaleLead || "Tsukuyomi Tsukasa (Yuzaki Tsukasa)"}
                      </div>
                    </div>
                    <div className="mt-1.5 pt-1.5 border-t border-rose-200/60 text-[11px] text-rose-900">
                      <span>Ân nhân cứu mạng, chấp thuận lời tỏ tình với điều kiện kết hôn</span>
                    </div>
                  </div>
                </div>

                {/* Đoạn văn recap Nahida */}
                <div className="p-4 bg-white/90 rounded-2xl border border-emerald-100 shadow-sm relative">
                  <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700 mb-1 flex items-center gap-1.5">
                    <span>✨</span>
                    <span>Diễn Biến Cốt Truyện Gần Nhất:</span>
                  </div>
                  <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {recap.recap}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: HỒ SƠ NHÂN VẬT & BỐI CẢNH (ĐẦY ĐỦ TỪ SQL) */}
            {activeTab === "characters" && (
              <div className="space-y-3.5">
                {/* Thẻ Main & Nữ Chính Chi Tiết */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Nhân vật chính Nasa */}
                  <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                        👑 Nhân Vật Chính (Main)
                      </span>
                      <span className="text-xs font-bold text-emerald-700">Thiên tài đời thường</span>
                    </div>
                    <h4 className="text-base font-black text-emerald-950">
                      {recap.protagonist?.name || "Yuzaki Nasa"}
                    </h4>
                    <div className="text-xs text-gray-700 space-y-1">
                      <p>
                        <b>⚡ Kiểu sức mạnh: </b>
                        <span>Không có hệ thống hay siêu nhiên chiến đấu. Sở hữu trí tuệ siêu việt, đầu óc tính toán logic cực nhanh và làm chủ mọi kỹ năng đời thường (&quot;nhanh hơn tên lửa NASA&quot;).</span>
                      </p>
                      <p>
                        <b>🌿 Tính cách & Phẩm chất: </b>
                        <span>Cực kỳ ngăn nắp, chăm chỉ, chu đáo, tự lập sớm, luôn lạc quan và có ý chí sắt đá. Dành trọn tình yêu thương và sự chiều chuộng tuyệt đối cho vợ mình.</span>
                      </p>
                    </div>
                  </div>

                  {/* Nữ chính Tsukasa */}
                  <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                        🌸 Nữ Chính
                      </span>
                      <span className="text-xs font-bold text-rose-700">Người Vợ Son Bí Ẩn</span>
                    </div>
                    <h4 className="text-base font-black text-rose-950">
                      {recap.femaleLead || "Tsukuyomi Tsukasa (Yuzaki Tsukasa)"}
                    </h4>
                    <div className="text-xs text-gray-700 space-y-1">
                      <p>
                        <b>✨ Thân phận & Đặc điểm: </b>
                        <span>Thiếu nữ xinh đẹp với thể chất bí ẩn đã lao mình che chắn đỡ cú tông xe tải cứu sống Nasa trong đêm tuyết rơi.</span>
                      </p>
                      <p>
                        <b>💍 Ước hẹn định mệnh: </b>
                        <span>Chấp nhận lời tỏ tình của Nasa với điều kiện phải kết hôn. Đúng đêm sinh nhật 18 tuổi của Nasa, cô đã mang giấy đăng ký kết hôn đến tìm cậu.</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tiền đề câu chuyện */}
                <div className="p-3.5 bg-white rounded-2xl border border-gray-200/80">
                  <div className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                    📖 Tiền Đề Cốt Truyện & Khởi Đầu:
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {recap.storyPremise || "Vào một đêm tuyết rơi trước kỳ thi chuyển cấp, Nasa trúng tiếng sét ái tình với Tsukasa và bất cẩn bị xe tải tông. Tsukasa cứu mạng cậu. Bất chấp chấn thương nặng, Nasa đuổi theo tỏ tình và Tsukasa đồng ý với điều kiện hai người phải kết hôn. Nhiều năm sau, vào ngày sinh nhật 18 tuổi của Nasa, Tsukasa bất ngờ xuất hiện mang theo giấy đăng ký kết hôn, bắt đầu cuộc sống hôn nhân đầy bất ngờ và ngọt ngào."}
                  </p>
                </div>

                {/* Danh sách nhân vật phụ */}
                {recap.supportingCharacters && recap.supportingCharacters.length > 0 && (
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2">
                      👥 Các Nhân Vật Phụ Đã Biết:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {recap.supportingCharacters.map((c, i) => (
                        <div key={i} className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                          <span className="font-extrabold text-emerald-900">{c.name}</span>
                          <span className="text-gray-600 block text-[11px] mt-0.5">{c.role || c.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: HỎI ĐÁP TƯƠNG TÁC CÙNG NAHIDA AI */}
            {activeTab === "ask" && (
              <div className="space-y-3.5">
                <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-100 text-xs text-emerald-800">
                  💡 Anh có thể hỏi bất kỳ câu hỏi nào về nhân vật chính, nữ chính, sức mạnh hoặc diễn biến các chương đã đọc. Nahida sẽ tra cứu trực tiếp từ Ký Ức Cây Thế Giới Irminsul để giải đáp ngay! ✨
                </div>

                {/* Câu hỏi gợi ý nhanh */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Câu hỏi gợi ý nhanh:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {quickQuestions.map((qText, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={asking}
                        onClick={() => handleAskNahida(qText)}
                        className="px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-900 transition disabled:opacity-50"
                      >
                        {qText}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lịch sử hỏi đáp */}
                {chatLog.length > 0 && (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {chatLog.map((item, idx) => (
                      <div key={idx} className="space-y-1.5 text-xs">
                        {/* Câu hỏi của người dùng */}
                        <div className="bg-gray-100 text-gray-800 px-3.5 py-1.5 rounded-2xl max-w-[85%] ml-auto font-semibold">
                          {item.q}
                        </div>

                        {/* Quá trình suy nghĩ của AI (Thinking Process) */}
                        {item.thinking && (
                          <div className="max-w-[95%] border border-emerald-200/70 rounded-2xl overflow-hidden bg-white/80 shadow-xs">
                            <button
                              type="button"
                              onClick={() => toggleThinking(idx)}
                              className="w-full px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-emerald-800 hover:bg-emerald-50/70 transition select-none"
                            >
                              <span className="flex items-center gap-1.5">
                                <span className="text-xs">💭</span>
                                <span className="tracking-wide">Quá Trình Suy Nghĩ Của Nahida (AI Thinking)</span>
                              </span>
                              <span className="text-[10px] text-emerald-600 font-extrabold">
                                {item.openThinking ? "Thu gọn ▲" : "Xem chi tiết ▼"}
                              </span>
                            </button>
                            {item.openThinking && (
                              <div className="px-3 py-2 bg-emerald-50/40 text-[11px] text-gray-600 italic border-t border-emerald-100/70 whitespace-pre-wrap leading-relaxed animate-fade-in">
                                {item.thinking}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Câu trả lời chính thức */}
                        <div className="bg-emerald-50 text-emerald-950 border border-emerald-200 px-3.5 py-2.5 rounded-2xl max-w-[95%] leading-relaxed shadow-xs">
                          <span className="font-extrabold text-emerald-700 mr-1.5">🌿 Nahida:</span>
                          <span>{item.a}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Trạng thái đang suy nghĩ khi bấm gửi */}
                {asking && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs text-emerald-800 animate-pulse">
                    <span className="animate-spin text-sm">💭</span>
                    <span className="font-bold">Nahida đang kích hoạt chuỗi suy nghĩ & liên kết Ký Ức Irminsul...</span>
                  </div>
                )}

                {/* Form hỏi đáp */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAskNahida();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Hỏi Nahida về nhân vật chính, sức mạnh, cốt truyện..."
                    disabled={asking}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <button
                    type="submit"
                    disabled={asking || !question.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs transition shadow-sm"
                  >
                    {asking ? "Đang tra cứu..." : "Hỏi Nahida"}
                  </button>
                </form>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-emerald-100 text-[11px]">
              <span className="text-gray-400">
                {recap.chaptersWithSummary > 0
                  ? `📊 Nạp dữ liệu xác thực từ ${recap.chaptersWithSummary} chương & Hồ sơ SQL`
                  : "✨ Nạp dữ liệu xác thực từ Hồ sơ SQL"}
              </span>

              <button
                onClick={() => {
                  setRecap(null);
                  setShown(false);
                  setDismissed(true);
                }}
                className="font-bold text-emerald-700 hover:text-emerald-900 transition flex items-center gap-1"
              >
                <span>Thu gọn Recap</span>
                <span>▲</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartRecapPanel;
