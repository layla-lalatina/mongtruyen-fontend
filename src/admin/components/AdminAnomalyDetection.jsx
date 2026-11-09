import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../../config";
import { getComicThumbUrl } from "../../utils/imageHelpers";

/**
 * 🌳 SYSTEM: IRMINSUL FANTASY RPG — ADMIN AI ANOMALY & COMIC WARNING PANEL
 * =========================================================================
 * @file AdminAnomalyDetection.jsx
 * @description Panel quản trị viên giám sát rủi ro toàn diện:
 *  - Cảnh báo nội dung truyện (18+, bạo lực, thiếu nhãn độ tuổi, thiếu cảnh báo độc giả, điểm nóng bình luận).
 *  - Cảnh báo bình luận độc hại / bị báo cáo / spam bình luận.
 *  - Cảnh báo tài khoản tích lũy World Crystal / XP vượt ngưỡng bất thường.
 */
const AdminAnomalyDetection = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [filterTab, setFilterTab] = useState("ALL"); // ALL | COMIC | USER
  const [loading, setLoading] = useState(true);
  const [applyingSlug, setApplyingSlug] = useState(null);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  // AI phân tích sâu: kết quả theo key từng cảnh báo, trạng thái chạy, mục đã ẩn
  const [aiResults, setAiResults] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const [applyingAll, setApplyingAll] = useState(false);
  const [dismissed, setDismissed] = useState({});

  // Khóa định danh ổn định cho từng cảnh báo (truyện theo slug, user theo id + loại + vị trí)
  const getItemKey = (item, idx) =>
    item?.comicSlug ? `comic:${item.comicSlug}` : `user:${item?.userId ?? "x"}:${item?.type}:${idx}`;

  const getToken = () => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser).token : null;
  };

  const fetchAnomalies = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const res = await axios.get(`${API_BASE_URL}/api/ai/anomaly-detection`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setAnomalies(res.data.anomalies || []);
        // Khóa của mục tài khoản/bình luận phụ thuộc vị trí → bỏ khi quét lại; khóa truyện theo slug thì giữ
        const keepComicOnly = (obj) =>
          Object.fromEntries(Object.entries(obj).filter(([k]) => k.startsWith("comic:")));
        setAiResults(keepComicOnly);
        setDismissed(keepComicOnly);
      } else {
        setError(res.data.message || "Không thể tải danh sách cảnh báo.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi quét hành vi bất thường.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const handleBanUser = async (userId, username) => {
    if (!window.confirm(`Bạn có chắc chắn muốn khóa tài khoản "${username}" không?`)) return;
    try {
      const token = getToken();
      await axios.put(
        `${API_BASE_URL}/api/user/admin/users/${userId}/role`,
        { isBanned: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionMessage(`Đã khóa thành công tài khoản "${username}".`);
      fetchAnomalies();
    } catch (err) {
      alert("Lỗi khi khóa tài khoản: " + (err.response?.data?.message || err.message));
    }
  };

  const handleApplyComicWarning = async (item, idx) => {
    if (!item?.comicSlug) return;
    setApplyingSlug(item.comicSlug);
    try {
      const token = getToken();
      // Nếu AI đã phân tích sâu thì ưu tiên đề xuất của AI (nhãn tuổi, mức độ, nội dung cảnh báo)
      const ai = aiResults[getItemKey(item, idx)];
      const useAi = ai && ai.recommendedAction === "APPLY_WARNING";
      const res = await axios.post(
        `${API_BASE_URL}/api/ai/apply-comic-warning`,
        {
          comicSlug: item.comicSlug,
          ageRating: (useAi && ai.suggestedAgeRating) || item.suggestedAgeRating || "16+",
          noticeType: (useAi && ai.suggestedNoticeType) || item.suggestedNoticeType || "WARNING",
          severity: (useAi && ai.suggestedSeverity) || item.suggestedSeverity || "WARN",
          content: (useAi && ai.suggestedWarningContent) || item.suggestedWarningContent,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        setActionMessage(
          res.data.message || `Đã gắn cảnh báo cho bộ truyện "${item.comicTitle}" thành công!`
        );
        fetchAnomalies();
      }
    } catch (err) {
      alert("Lỗi khi gắn cảnh báo truyện: " + (err.response?.data?.message || err.message));
    } finally {
      setApplyingSlug(null);
    }
  };

  // ─── AI PHÂN TÍCH SÂU (bấm nút mới chạy, 1 lần gọi AI cho cả lô để tiết kiệm hạn mức) ───
  const handleDeepAnalyze = async () => {
    if (anomalies.length === 0 || aiLoading) return;
    setAiLoading(true);
    setError("");
    try {
      const token = getToken();
      const items = anomalies.map((a, idx) => ({
        key: getItemKey(a, idx),
        type: a.type,
        targetType: a.targetType,
        severity: a.severity,
        comicSlug: a.comicSlug,
        userId: a.userId,
        username: a.username,
        description: a.description,
      }));
      const res = await axios.post(
        `${API_BASE_URL}/api/ai/anomaly-deep-analysis`,
        { items, limit: 8 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        const map = {};
        (res.data.results || []).forEach((r) => {
          map[r.key] = r;
        });
        setAiResults((prev) => ({ ...prev, ...map }));
        setActionMessage(
          `AI đã phân tích sâu ${res.data.analyzedCount} mục` +
          (res.data.skippedCount > 0 ? ` (còn ${res.data.skippedCount} mục chưa xét, bấm lại để tiếp tục sau)` : "") +
          ". Đây chỉ là đề xuất, anh duyệt từng mục nhé."
        );
      } else {
        setError(res.data?.message || "AI không phân tích được.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi gọi AI phân tích sâu.");
    } finally {
      setAiLoading(false);
    }
  };

  // Các mục truyện AI xác nhận có rủi ro và khuyến nghị gắn cảnh báo
  const getApplicableAiComics = () =>
    anomalies
      .map((a, idx) => ({ a, idx, ai: aiResults[getItemKey(a, idx)] }))
      .filter(
        ({ a, ai }) =>
          a.comicSlug &&
          ai &&
          ai.isConfirmed &&
          ai.recommendedAction === "APPLY_WARNING" &&
          !dismissed[getItemKey(a, anomalies.indexOf(a))]
      );

  const handleApplyAllAi = async () => {
    const list = getApplicableAiComics();
    if (list.length === 0) return;
    if (
      !window.confirm(
        `Áp dụng đề xuất của AI cho ${list.length} bộ truyện (đổi nhãn tuổi + gắn banner cảnh báo)?\n\n` +
        list.map(({ a, ai }) => `• ${a.comicTitle} → ${ai.suggestedAgeRating || "?"}`).join("\n")
      )
    )
      return;
    setApplyingAll(true);
    let ok = 0;
    for (const { a, ai } of list) {
      try {
        const res = await axios.post(
          `${API_BASE_URL}/api/ai/apply-comic-warning`,
          {
            comicSlug: a.comicSlug,
            ageRating: ai.suggestedAgeRating || a.suggestedAgeRating || "16+",
            noticeType: ai.suggestedNoticeType || a.suggestedNoticeType || "WARNING",
            severity: ai.suggestedSeverity || a.suggestedSeverity || "WARN",
            content: ai.suggestedWarningContent || a.suggestedWarningContent,
          },
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
        if (res.data?.success) ok += 1;
      } catch (err) {
        console.error("Lỗi áp dụng cảnh báo cho", a.comicSlug, err);
      }
    }
    setApplyingAll(false);
    setActionMessage(`Đã áp dụng đề xuất AI cho ${ok}/${list.length} bộ truyện.`);
    setAiResults({});
    fetchAnomalies();
  };

  // Khối hiển thị kết luận của AI dưới mỗi cảnh báo
  const renderAiVerdict = (item, idx) => {
    const key = getItemKey(item, idx);
    const ai = aiResults[key];
    if (!ai) return null;
    const RISK_STYLE = {
      HIGH: "bg-rose-100 text-rose-700 border-rose-200",
      MEDIUM: "bg-amber-100 text-amber-800 border-amber-200",
      LOW: "bg-emerald-100 text-emerald-800 border-emerald-200",
    };
    const ACTION_LABEL = {
      APPLY_WARNING: "Nên gắn nhãn & cảnh báo",
      BAN_USER: "Nên khóa tài khoản",
      MONITOR: "Nên theo dõi thêm",
      DISMISS: "Có thể bỏ qua (báo nhầm)",
    };
    return (
      <div
        className={`mt-1 p-2.5 rounded-xl border text-[11px] space-y-1 ${ai.isConfirmed ? "bg-violet-50/80 border-violet-200" : "bg-gray-50 border-gray-200"
          }`}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-black text-violet-800">AI phân tích sâu</span>
          <span className={`px-1.5 py-0.5 rounded-full border font-black ${RISK_STYLE[ai.riskLevel] || RISK_STYLE.MEDIUM}`}>
            Rủi ro {ai.riskLevel === "HIGH" ? "cao" : ai.riskLevel === "LOW" ? "thấp" : "trung bình"}
          </span>
          <span className="px-1.5 py-0.5 rounded-full bg-white border border-violet-200 font-bold text-violet-700">
            Tin cậy {ai.confidence}%
          </span>
          <span className={`font-black ${ai.isConfirmed ? "text-rose-600" : "text-emerald-600"}`}>
            {ai.isConfirmed ? "✔ Xác nhận có rủi ro" : "✘ Nhiều khả năng báo nhầm"}
          </span>
        </div>
        <p className="text-gray-700 font-medium">{ai.reason}</p>
        <p className="text-violet-900 font-bold">
          👉 Đề xuất: {ACTION_LABEL[ai.recommendedAction] || ai.recommendedAction}
          {ai.suggestedAgeRating ? ` (nhãn ${ai.suggestedAgeRating})` : ""}
        </p>
        {ai.suggestedWarningContent && ai.recommendedAction === "APPLY_WARNING" && (
          <p className="text-amber-900 font-semibold">⚠️ Nội dung cảnh báo AI soạn: &ldquo;{ai.suggestedWarningContent}&rdquo;</p>
        )}
        {(ai.recommendedAction === "DISMISS" || !ai.isConfirmed) && (
          <button
            onClick={() => setDismissed((prev) => ({ ...prev, [key]: true }))}
            className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg font-bold text-gray-700"
          >
            Ẩn mục này (đã xem)
          </button>
        )}
      </div>
    );
  };

  const comicAnomalies = anomalies.filter((a) => a.targetType === "COMIC" || String(a.type || "").startsWith("COMIC_"));
  const userAnomalies = anomalies.filter((a) => a.targetType !== "COMIC" && !String(a.type || "").startsWith("COMIC_"));

  const displayedAnomalies = (
    filterTab === "COMIC"
      ? comicAnomalies
      : filterTab === "USER"
        ? userAnomalies
        : anomalies
  ).filter((a) => !dismissed[getItemKey(a, anomalies.indexOf(a))]);
  const applicableAiCount = getApplicableAiComics().length;
  const analyzedCount = Object.keys(aiResults).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-emerald-950 flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-base">🛡️</span>
            Hệ Thống AI Giám Sát Rủi Ro (Truyện, Bình Luận & Tài Khoản)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Tự động quét cảnh báo nội dung truyện (16+/18+), bình luận vi phạm và tài khoản bất thường trên Cây Thế Giới Irminsul.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start">
          <button
            onClick={handleDeepAnalyze}
            disabled={aiLoading || loading || anomalies.length === 0}
            title="AI đọc thêm mô tả truyện, bình luận, giao dịch để xác nhận rủi ro và soạn sẵn cảnh báo (1 lần gọi AI cho tối đa 8 mục)"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm shadow-violet-600/20"
          >
            {aiLoading ? "⏳ AI đang phân tích..." : " AI phân tích sâu"}
          </button>
          <button
            onClick={fetchAnomalies}
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm shadow-emerald-600/20"
          >
            {loading ? "⏳ Đang quét..." : " Quét lại ngay"}
          </button>
        </div>
      </div>

      {applicableAiCount > 0 && (
        <div className="p-3 bg-violet-50 border border-violet-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-violet-900">
            🤖 AI xác nhận {applicableAiCount} bộ truyện cần gắn nhãn &amp; cảnh báo (đã soạn sẵn nội dung).
          </span>
          <button
            onClick={handleApplyAllAi}
            disabled={applyingAll}
            className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold shadow-xs"
          >
            {applyingAll ? "⏳ Đang áp dụng..." : ` Áp dụng tất cả đề xuất truyện (${applicableAiCount})`}
          </button>
        </div>
      )}

      {actionMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl flex items-center justify-between">
          <span>✓ {actionMessage}</span>
          <button onClick={() => setActionMessage("")} className="text-emerald-700 hover:text-emerald-950 font-black px-2">
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-2xl">
          ⚠️ {error}
        </div>
      )}

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-lg font-black">
            🚨
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase">Mức Nghiêm Trọng</div>
            <div className="text-lg font-black text-rose-600">
              {anomalies.filter((a) => a.severity === "HIGH").length} cảnh báo
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-lg font-black">
            📚
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase">Cảnh Báo Truyện</div>
            <div className="text-lg font-black text-amber-600">
              {comicAnomalies.length} bộ truyện
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-black">
            💬
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase">Bình Luận & User</div>
            <div className="text-lg font-black text-indigo-600">
              {userAnomalies.length} trường hợp
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg font-black">
            ✅
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase">Trạng Thái An Ninh</div>
            <div className="text-sm font-extrabold text-emerald-700">
              {anomalies.length === 0 ? "Hệ thống an toàn" : "Đang giám sát rủi ro"}
            </div>
          </div>
        </div>
      </div>

      {/* Bộ lọc phân loại cảnh báo */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilterTab("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition border ${filterTab === "ALL"
            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
            : "bg-white text-emerald-900 border-emerald-100 hover:bg-emerald-50"
            }`}
        >
          📋 Tất cả ({anomalies.length})
        </button>
        <button
          onClick={() => setFilterTab("COMIC")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition border ${filterTab === "COMIC"
            ? "bg-amber-500 text-white border-amber-500 shadow-sm"
            : "bg-white text-amber-900 border-amber-200 hover:bg-amber-50"
            }`}
        >
          📚 Cảnh báo Truyện ({comicAnomalies.length})
        </button>
        <button
          onClick={() => setFilterTab("USER")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition border ${filterTab === "USER"
            ? "bg-rose-600 text-white border-rose-600 shadow-sm"
            : "bg-white text-rose-900 border-rose-200 hover:bg-rose-50"
            }`}
        >
          💬 Cảnh báo Bình luận & Tài khoản ({userAnomalies.length})
        </button>
      </div>

      {/* Bảng danh sách cảnh báo */}
      <div className="bg-white rounded-3xl border border-emerald-100 overflow-hidden shadow-sm">
        <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
          <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
            Danh Sách Cảnh Báo Rủi Ro ({displayedAnomalies.length})
          </span>
          <span className="text-[11px] text-gray-400">Tự động phát hiện bởi AI & Logic Guard</span>
        </div>

        {displayedAnomalies.length === 0 && !loading && (
          <div className="p-12 text-center text-gray-400">
            <span className="text-4xl block mb-2">🌿</span>
            <p className="text-xs font-bold text-emerald-800">Không có cảnh báo rủi ro nào trong danh mục này!</p>
            <p className="text-[11px] text-gray-400 mt-1">
              Mọi bộ truyện, bình luận và tài khoản đều đã được gắn nhãn và kiểm duyệt đầy đủ.
            </p>
          </div>
        )}

        {displayedAnomalies.length > 0 && (
          <div className="divide-y divide-gray-100">
            {displayedAnomalies.map((item, idx) => {
              const isComicRisk =
                item.targetType === "COMIC" || String(item.type || "").startsWith("COMIC_");

              if (isComicRisk) {
                return (
                  <div
                    key={`comic-risk-${item.comicSlug || idx}`}
                    className="p-4 hover:bg-amber-50/30 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <Link to={`/truyen/${item.comicSlug}`} className="shrink-0">
                        <img
                          src={getComicThumbUrl(item.thumbUrl)}
                          alt={item.comicTitle}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/default-cover.jpg";
                          }}
                          className="w-12 h-16 object-cover rounded-xl border border-amber-200 shadow-xs bg-emerald-50"
                        />
                      </Link>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${item.severity === "HIGH"
                              ? "bg-rose-100 text-rose-700 border border-rose-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                              }`}
                          >
                            {item.severity === "HIGH" ? "🔴 Cảnh báo Truyện 18+" : "🟡 Cảnh báo Nội dung Truyện"}
                          </span>

                          <Link
                            to={`/truyen/${item.comicSlug}`}
                            className="font-black text-sm text-emerald-950 hover:text-emerald-600 truncate"
                          >
                            📖 {item.comicTitle}
                          </Link>

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                            Nhãn hiện tại: {item.currentAgeRating || "ALL"} → Đề xuất:{" "}
                            <strong className="text-rose-600">{item.suggestedAgeRating || "16+"}</strong>
                          </span>
                        </div>

                        <p className="text-xs text-gray-700 font-medium">{item.description}</p>

                        {item.suggestedWarningContent && (
                          <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 font-semibold">
                            ⚠️ Nội dung cảnh báo đề xuất gắn lên truyện: &ldquo;{item.suggestedWarningContent}&rdquo;
                          </div>
                        )}

                        <p className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                          <span>💡 Khuyến nghị:</span>
                          <span>{item.recommendation}</span>
                        </p>
                        {renderAiVerdict(item, anomalies.indexOf(item))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-end lg:self-center shrink-0">
                      <Link
                        to={`/truyen/${item.comicSlug}`}
                        className="px-3 py-1.5 bg-white hover:bg-gray-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition"
                      >
                        👁️ Xem truyện
                      </Link>
                      <button
                        onClick={() => handleApplyComicWarning(item, anomalies.indexOf(item))}
                        disabled={applyingSlug === item.comicSlug}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold transition shadow-xs"
                      >
                        {applyingSlug === item.comicSlug
                          ? "⏳ Đang gắn..."
                          : aiResults[getItemKey(item, anomalies.indexOf(item))]?.recommendedAction === "APPLY_WARNING"
                            ? `🤖 Gắn theo AI (${aiResults[getItemKey(item, anomalies.indexOf(item))]?.suggestedAgeRating || item.suggestedAgeRating || "16+"})`
                            : `🛡️ Gắn Nhãn ${item.suggestedAgeRating || "16+"} & Cảnh Báo`}
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={`user-risk-${idx}`}
                  className="p-4 hover:bg-gray-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${item.severity === "HIGH"
                          ? "bg-rose-100 text-rose-700 border border-rose-200"
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                          }`}
                      >
                        {item.severity === "HIGH" ? "🔴 Nghiêm trọng" : "🟡 Trung bình"}
                      </span>
                      <span className="font-extrabold text-xs text-gray-900">{item.username || "Ẩn danh"}</span>
                      <span className="text-[11px] text-gray-400">({item.email || "Không có email"})</span>
                    </div>

                    <p className="text-xs text-gray-700 font-medium">{item.description}</p>
                    <p className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                      <span>💡 Khuyến nghị:</span>
                      <span>{item.recommendation}</span>
                    </p>
                    {renderAiVerdict(item, anomalies.indexOf(item))}
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => handleBanUser(item.userId, item.username)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition"
                    >
                      🚫 Khóa Tài Khoản
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnomalyDetection;
