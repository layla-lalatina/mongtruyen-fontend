import React from "react";
import { Link } from "react-router-dom";

const ReportQueue = ({
  reportedComments,
  handleOpenUserHistory,
  onModerateComment,
  onDeleteComment,
}) => {
  return (
    <div>
      <h2 className="text-sm font-black text-rose-700 bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-2xl flex items-center gap-2 mb-3 shadow-inner">
        ⚠️ Hàng Đợi Báo Cáo Vi Phạm ({reportedComments.length} tin cần xử lý)
      </h2>

      {reportedComments.length === 0 ? (
        <div className="p-4 bg-emerald-50/10 border border-dashed border-emerald-200 text-center rounded-2xl">
          <p className="text-xs text-emerald-800/60 font-semibold">
            ✨ Tuyệt vời! Chưa phát hiện báo cáo vi phạm nào mới.
          </p>
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[250px] border border-rose-200 rounded-2xl bg-white p-2.5 space-y-2.5 shadow-sm text-black">
          {reportedComments.map((comment) => (
            <div
              key={comment.id}
              className="p-3 border border-rose-100 rounded-xl bg-rose-50/20 hover:bg-rose-50/40 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2 font-bold">
                  <button
                    onClick={() =>
                      handleOpenUserHistory(
                        comment.User || {
                          id: comment.userId,
                          username: comment.displayName || "Ẩn danh",
                        }
                      )
                    }
                    className="text-indigo-700 hover:underline cursor-pointer"
                    title="Xem lịch sử bình luận"
                  >
                    @{comment.User?.username || comment.displayName || "Ẩn danh"}
                  </button>
                  <span className="text-gray-400">tại</span>
                  <Link
                    to={`/truyen/${comment.comicSlug}`}
                    className="text-emerald-700 hover:underline font-mono"
                  >
                    {comment.comicSlug}
                  </Link>
                  <span className="text-rose-600 bg-rose-100 border border-rose-200 px-1.5 py-0.2 rounded text-[9px] uppercase font-black">
                    Lý do: {comment.reportReason || "Không rõ lý do"}
                  </span>
                </div>
                <p className="text-gray-700 italic bg-white p-2 rounded-lg border border-gray-150 break-words leading-relaxed">
                  "{comment.content}"
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => onModerateComment(comment.id, "active")}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg border border-emerald-700 shadow-sm"
                >
                  Không vấn đề
                </button>
                <button
                  onClick={() => onModerateComment(comment.id, "hidden")}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg border border-amber-600 shadow-sm"
                >
                  Ẩn
                </button>
                <button
                  onClick={() => onDeleteComment(comment.id)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg border border-red-700 shadow-sm"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportQueue;
