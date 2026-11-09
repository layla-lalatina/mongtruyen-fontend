import React from "react";
import { createPortal } from "react-dom";

const ReportModal = ({
  showReportModal,
  setShowReportModal,
  handleReportSubmit,
  selectedReasons,
  toggleReason,
  otherReasonText,
  setOtherReasonText,
}) => {
  if (!showReportModal) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 animate-slide-in text-black">
        <div className="flex justify-between items-center border-b border-emerald-50 pb-3 mb-4">
          <h3 className="text-base font-extrabold text-emerald-950 flex items-center gap-1.5">
            ⚠️ Báo cáo bình luận vi phạm
          </h3>
          <button
            type="button"
            onClick={() => setShowReportModal(false)}
            className="text-gray-400 hover:text-gray-600 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleReportSubmit} className="space-y-4">
          <p className="text-xs text-gray-500 font-medium">
            Vui lòng chọn các lý do vi phạm (có thể chọn nhiều mục):
          </p>

          {/* Danh sách Checkbox lý do */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { key: "18+", label: "🔞 Nội dung 18+" },
              { key: "Chửi tục", label: "🤬 Chửi tục / Toxic" },
              { key: "Mại dâm", label: "🚯 Mại dâm / Mua bán" },
              { key: "Spam", label: "📢 Spam / Quảng cáo" },
              { key: "Quấy rối", label: "🎯 Quấy rối / Đe dọa" },
              { key: "Lừa đảo", label: "🔍 Lừa đảo / Scam" },
            ].map((reason) => {
              const isChecked = selectedReasons.includes(reason.key);
              return (
                <label
                  key={reason.key}
                  className={`flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer text-xs font-bold transition-all ${
                    isChecked
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm"
                      : "bg-gray-50/50 border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleReason(reason.key)}
                    className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{reason.label}</span>
                </label>
              );
            })}
          </div>

          {/* Ô mô tả lý do khác */}
          <div>
            <label className="block text-xs font-bold text-emerald-900 mb-1.5">
              Lý do khác / Mô tả chi tiết:
            </label>
            <textarea
              value={otherReasonText}
              onChange={(e) => setOtherReasonText(e.target.value)}
              placeholder="Nhập lý do chi tiết..."
              rows={3}
              className="w-full px-3 py-2 bg-emerald-50/10 border border-emerald-150 rounded-xl text-xs focus:ring-2 focus:ring-emerald-250 focus:outline-none text-black"
            />
          </div>

          {/* Các nút hành động */}
          <div className="flex justify-end gap-2 pt-2 border-t border-emerald-50">
            <button
              type="button"
              onClick={() => setShowReportModal(false)}
              className="px-4 py-2 border border-gray-200 text-gray-600 font-bold rounded-xl text-xs hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-sm transition-all"
            >
              Gửi báo cáo
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ReportModal;
