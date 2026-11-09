/**
 * 🌳 SYSTEM: IRMINSUL FANTASY RPG - QUEST BOARD, 7-DAY CHECK-IN & LEADERBOARD
 * ==========================================================
 * @file QuestBoard.jsx
 * @path fontend/src/components/Profile/QuestBoard.jsx
 */

import React, { useState, useEffect } from "react";
import {
  LuScrollText,
  LuCalendarCheck,
  LuSparkles,
  LuTrophy,
  LuLock,
  LuCheck,
  LuGift,
  LuBot,
  LuCrown,
} from "react-icons/lu";
import { API_BASE_URL } from "../../../config";

const QuestBoard = ({ user, refetchProfile }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("daily"); // daily | weekly | leaderboard

  // Điểm danh 7 ngày
  const [checkinData, setCheckinData] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkinMsg, setCheckinMsg] = useState("");

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState([]);

  const fetchTasks = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const [tasksRes, checkinRes, lbRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/user/tasks`, {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
        fetch(`${API_BASE_URL}/api/user/checkin-status`, {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
        fetch(`${API_BASE_URL}/api/user/leaderboard`),
      ]);
      const data = await tasksRes.json();
      if (data.success) {
        setTasks(data.tasks || []);
      }
      if (checkinRes.ok) {
        const cData = await checkinRes.json();
        if (cData.success) setCheckinData(cData);
      }
      if (lbRes.ok) {
        const lbData = await lbRes.json();
        if (lbData.success) setLeaderboard(lbData.leaderboard || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Lỗi tải nhiệm vụ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const handleAgentSync = () => {
      fetchTasks();
    };
    window.addEventListener("agent-state-updated", handleAgentSync);
    return () => window.removeEventListener("agent-state-updated", handleAgentSync);
  }, [user]);

  const handleDailyCheckin = async () => {
    if (!user?.token || checkingIn) return;
    setCheckingIn(true);
    setCheckinMsg("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/daily-checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await res.json();
      setCheckinMsg(data.message || "");
      if (data.success) {
        await fetchTasks();
        if (refetchProfile) refetchProfile();
      }
    } catch (err) {
      setCheckinMsg("Lỗi kết nối khi điểm danh.");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleClaim = async (taskId) => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/tasks/claim/${taskId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        await fetchTasks();
        if (refetchProfile) refetchProfile();
        if (data.newAiQuest?.title) {
          setCheckinMsg(
            `🎉 Nhận thưởng thành công (+${data.rewardXp} XP, +${data.rewardCrystal} Tinh Thạch)! 🤖 AI Tiểu Thảo Thần đã tự động tạo ngay nhiệm vụ mới cho bạn: "${data.newAiQuest.title}"`
          );
        } else {
          setCheckinMsg(
            `Nhận thưởng nhiệm vụ thành công! +${data.rewardXp} XP, +${data.rewardCrystal} Tinh Thạch`
          );
        }
      } else {
        setCheckinMsg(data.message || "Lỗi khi nhận thưởng");
      }
    } catch (err) {
      setCheckinMsg("Lỗi máy chủ khi nhận thưởng");
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="py-10 text-center text-emerald-800 text-base font-semibold animate-pulse">
        Đang mở bảng phong ấn nhiệm vụ Irminsul...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center text-rose-500 text-base font-semibold">
        {error}. Vui lòng thử lại sau!
      </div>
    );
  }

  const filteredTasks = tasks
    .filter((t) => {
      const isAi =
        t.isAiGenerated ||
        t.type === "ai_dynamic" ||
        (t.rawQuestType || "").toUpperCase() === "AI_DYNAMIC";
      if (activeTab === "daily") {
        return t.type === "daily" || isAi;
      }
      return t.type === activeTab;
    })
    .sort((a, b) => {
      const aAi =
        a.isAiGenerated ||
        a.type === "ai_dynamic" ||
        (a.rawQuestType || "").toUpperCase() === "AI_DYNAMIC";
      const bAi =
        b.isAiGenerated ||
        b.type === "ai_dynamic" ||
        (b.rawQuestType || "").toUpperCase() === "AI_DYNAMIC";
      if (aAi && !bAi) return -1;
      if (!aAi && bAi) return 1;
      return 0;
    });

  return (
    <div className="w-full space-y-6">
      {/* 1. LỊCH ĐIỂM DANH 7 NGÀY IRMINSUL */}
      {checkinData && (
        <div className="rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-5 sm:p-6 shadow-lg border border-emerald-700/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-300">
                <LuCalendarCheck className="w-4 h-4" /> Chuỗi điểm danh hiện tại:{" "}
                {checkinData.streak || 0} ngày
              </div>
              <h3 className="text-xl sm:text-2xl font-black mt-0.5">
                Lịch Điểm Danh 7 Ngày – Rương Đại Thụ Irminsul
              </h3>
            </div>

            <button
              type="button"
              onClick={handleDailyCheckin}
              disabled={checkinData.checkedInToday || checkingIn}
              className={`px-5 py-3 rounded-2xl font-extrabold text-sm flex items-center gap-2 transition shadow-md ${
                checkinData.checkedInToday
                  ? "bg-white/15 text-emerald-200 border border-white/20 cursor-default"
                  : "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950"
              }`}
            >
              {checkinData.checkedInToday ? (
                <>
                  <LuCheck className="w-4 h-4" /> Đã điểm danh hôm nay
                </>
              ) : (
                <>
                  <LuGift className="w-4 h-4" />
                  {checkingIn ? "Đang nhận..." : "Điểm Danh Nhận Quà Ngay"}
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {(checkinData.schedule || []).map((dayCfg) => {
              const passed = dayCfg.day <= (checkinData.cycleDay || 0);
              const isNext =
                !checkinData.checkedInToday && dayCfg.day === ((checkinData.cycleDay || 0) % 7) + 1;
              return (
                <div
                  key={dayCfg.day}
                  className={`rounded-2xl p-3.5 border text-center flex flex-col justify-between transition ${
                    dayCfg.isGrandChest
                      ? "bg-amber-400/20 border-amber-300/60"
                      : passed
                      ? "bg-emerald-600/30 border-emerald-400/50"
                      : isNext
                      ? "bg-white/15 border-amber-300 ring-2 ring-amber-300/40"
                      : "bg-white/5 border-white/10 opacity-80"
                  }`}
                >
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-200 flex items-center justify-center gap-1">
                    <span>Ngày {dayCfg.day}</span>
                    {passed && <LuCheck className="w-3.5 h-3.5 text-amber-300" />}
                  </div>
                  <div className="my-1.5 text-sm sm:text-base font-black text-amber-300">
                    +{dayCfg.crystals} Tinh Thạch
                  </div>
                  <div className="text-xs text-emerald-100/85 font-semibold">
                    +{dayCfg.xp} XP • {dayCfg.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {checkinMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm font-bold text-emerald-900 flex items-center justify-between gap-3">
          <span>{checkinMsg}</span>
          <button
            type="button"
            onClick={() => setCheckinMsg("")}
            className="underline text-emerald-700 shrink-0"
          >
            Đóng
          </button>
        </div>
      )}

      {/* 2. HEADER & SUB-TAB SWITCHER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-emerald-100/60 pb-4 gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-emerald-950 flex items-center gap-2">
            <LuScrollText className="w-6 h-6 text-emerald-600" />
            Bảng Nhiệm Vụ & Phong Thần Irminsul
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Hoàn thành nhiệm vụ hằng ngày, nhận chỉ thị tự động từ AI Tiểu Thảo Thần và đua Top Cảnh Giới.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-emerald-50 p-1 rounded-xl border border-emerald-100/60">
            <button
              onClick={() => setActiveTab("daily")}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === "daily"
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-emerald-700/70 hover:text-emerald-800"
              }`}
            >
              Hàng Ngày & AI
            </button>
            <button
              onClick={() => setActiveTab("weekly")}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === "weekly"
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-emerald-700/70 hover:text-emerald-800"
              }`}
            >
              Hàng Tuần & Thành Tựu
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "leaderboard"
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-emerald-700/70 hover:text-emerald-800"
              }`}
            >
              <LuTrophy className="w-4 h-4 text-amber-500" /> Bảng Phong Thần
            </button>
          </div>
        </div>
      </div>

      {/* 3. BẢNG PHONG THẦN (LEADERBOARD) HOẶC DANH SÁCH NHIỆM VỤ */}
      {activeTab === "leaderboard" ? (
        <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm sm:text-base text-left border-collapse">
              <thead>
                <tr className="bg-emerald-50/80 border-b border-emerald-100 text-emerald-900 font-extrabold uppercase text-xs sm:text-sm">
                  <th className="py-3.5 px-4">Hạng</th>
                  <th className="py-3.5 px-4">Lữ Khách</th>
                  <th className="py-3.5 px-4">Cảnh Giới</th>
                  <th className="py-3.5 px-4">Danh Vọng</th>
                  <th className="py-3.5 px-4 text-right">Ký Ức Irminsul</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row) => (
                  <tr key={row.userId} className="border-b border-slate-100 last:border-0 hover:bg-emerald-50/30">
                    <td className="py-3.5 px-4 font-black">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs sm:text-sm ${
                          row.rank === 1
                            ? "bg-amber-400 text-slate-950"
                            : row.rank === 2
                            ? "bg-slate-300 text-slate-900"
                            : row.rank === 3
                            ? "bg-amber-700 text-white"
                            : "bg-emerald-50 text-emerald-800"
                        }`}
                      >
                        {row.rank}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-800 flex items-center gap-2">
                      <span>{row.username}</span>
                      {row.isVip && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-xs font-black">
                          <LuCrown className="w-3.5 h-3.5" /> VIP
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-700">
                      Cấp {row.level} • {row.levelTitle}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-600">{row.fameRank}</td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-800">
                      {Number(row.irminsulMemories || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-base">
          Không có nhiệm vụ nào hoạt động.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => {
            const current = task.progress?.currentValue ?? 0;
            const target = task.targetValue;
            const isCompleted = task.progress?.isCompleted ?? false;
            const isClaimed = task.progress?.isClaimed ?? false;
            const progressPercent = Math.min(100, Math.round((current / target) * 100));
            const isAiTask =
              task.isAiGenerated ||
              task.type === "ai_dynamic" ||
              (task.rawQuestType || "").toUpperCase() === "AI_DYNAMIC";

            return (
              <div
                key={task.id}
                className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between bg-white ${
                  isClaimed
                    ? "border-gray-200/60 opacity-75"
                    : isAiTask
                    ? "ai-quest-card border-2 border-emerald-400 ring-2 ring-emerald-400/25 shadow-md"
                    : isCompleted
                    ? "border-emerald-300 shadow-sm"
                    : "border-emerald-100/70 hover:shadow-md"
                }`}
              >
                <div>
                  {isAiTask && (
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-emerald-200/40">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-black uppercase tracking-wider shadow-xs">
                        <LuBot className="w-4 h-4" /> Nhiệm Vụ Do AI Tạo
                      </span>
                      <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-300/60 px-2.5 py-1 rounded-full">
                        ✨ Tự tạo nhiệm vụ mới sau khi nhận quà
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-gray-800 text-base sm:text-lg leading-snug flex items-center gap-1.5">
                        <span>{task.title}</span>
                        {isClaimed && (
                          <span className="text-xs text-gray-500 font-semibold">(Đã nhận thưởng)</span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>
                      {task.actionHint && (
                        <div className="pt-1">
                          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-300/60 px-3 py-1 rounded-lg">
                            🎯 Yêu cầu: {task.actionHint}
                          </span>
                        </div>
                      )}
                      {task.isLocked && (
                        <div className="pt-1 flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 px-3 py-1 rounded-lg">
                            <LuLock className="w-3.5 h-3.5" /> {task.lockReason || "Nhiệm vụ bị phong ấn"}
                          </span>
                        </div>
                      )}
                    </div>

                    <span
                      className={`text-xs sm:text-sm font-black px-3 py-1 rounded-full shrink-0 border ${
                        task.isLocked
                          ? "bg-amber-50 text-amber-800 border-amber-300"
                          : isClaimed
                          ? "bg-emerald-50 text-gray-500 border-emerald-200/40"
                          : isCompleted
                          ? "bg-emerald-600 text-white border-emerald-500"
                          : "bg-emerald-50 text-emerald-800 border-emerald-200/60"
                      }`}
                    >
                      {task.isLocked ? "Đang khóa" : `${current} / ${target}`}
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-emerald-50 rounded-full overflow-hidden mb-4 border border-emerald-200/40">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        task.isLocked
                          ? "bg-amber-400"
                          : isClaimed
                          ? "bg-gray-400"
                          : isCompleted
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                          : "bg-gradient-to-r from-emerald-400 to-teal-300"
                      }`}
                      style={{ width: `${task.isLocked ? 0 : progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap justify-between items-center gap-2 mt-2 pt-3 border-t border-emerald-100/60">
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-xl">
                      <LuSparkles className="w-4 h-4 text-emerald-600" />
                      <span>+{task.rewardXp} XP</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-amber-900 bg-amber-100/90 border border-amber-300 px-3 py-1.5 rounded-xl">
                      <LuSparkles className="w-4 h-4 text-amber-600" />
                      <span>+{task.rewardCrystal} Tinh Thạch</span>
                    </div>
                  </div>

                  {task.isLocked ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded-xl bg-amber-50 text-amber-700 text-xs sm:text-sm font-extrabold border border-amber-300 cursor-not-allowed flex items-center gap-1.5"
                    >
                      <LuLock className="w-4 h-4" /> Chưa mở
                    </button>
                  ) : isClaimed ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded-xl bg-emerald-50 text-gray-500 text-xs sm:text-sm font-extrabold border border-emerald-200/50 cursor-not-allowed flex items-center gap-1.5"
                    >
                      <LuCheck className="w-4 h-4" /> Đã nhận
                    </button>
                  ) : isCompleted ? (
                    <button
                      onClick={() => handleClaim(task.id)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs sm:text-sm font-black shadow-md transition-all duration-200 active:scale-95 flex items-center gap-1.5"
                    >
                      <LuGift className="w-4 h-4" /> Nhận quà
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-bold border border-emerald-200/60 cursor-not-allowed opacity-80"
                    >
                      Chưa đạt
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuestBoard;
