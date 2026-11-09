import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "../../../config";
import ProfileHeader from "./ProfileHeader";
import ProfileCard from "./ProfileCard/index";
import FollowedComics from "./FollowedComics";
import HistoryComics from "./HistoryComics";
import TabNavigation from "./TabNavigation";
import Comments from "./Comments";
import Inventory from "./Inventory";
import Shop from "./Shop";
import QuestBoard from "./QuestBoard";
import XpHistory from "./XpHistory";
import VipAndDeposit from "./VipAndDeposit";
import UserGuide from "./UserGuide";

const ProfileContainer = ({ user, onLogout }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [followed, setFollowed] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState(() => searchParams.get("tab") || "followed");
  const tabContentRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const switchTabAndScroll = (nextTab) => {
    setTab(nextTab);
    setSearchParams({ tab: nextTab }, { replace: true });
    setTimeout(() => {
      tabContentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  useEffect(() => {
    const qTab = searchParams.get("tab");
    if (qTab && qTab !== tab) {
      setTab(qTab);
    }
    if (qTab && !loading && profile) {
      setTimeout(() => {
        tabContentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [searchParams, loading, Boolean(profile)]);

  const navigate = useNavigate();

  const [dailyRewardInfo, setDailyRewardInfo] = useState(null);

  const fetchProfile = () => {
    if (!user?.token) return;
    fetch(`${API_BASE_URL}/api/user/profile`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401 && onLogout) {
            onLogout();
          }
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data && data.username) {
          setProfile(data);
          setEmail(data.email || "");
          setRole(data.role || "member");
          if (data.dailyReward) {
            setDailyRewardInfo(data.dailyReward);
          }
          if (data.isVip !== undefined) {
            try {
              const stored = JSON.parse(localStorage.getItem("user") || "{}");
              stored.isVip = data.isVip;
              stored.vipTier = data.vipTier;
              stored.vipPlanName = data.vipPlanName;
              localStorage.setItem("user", JSON.stringify(stored));
            } catch (e) {}
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi fetch profile:", err);
        setProfile(null);
        setLoading(false);
      });
  };

  // Fetch profile
  useEffect(() => {
    fetchProfile();
    const handleAgentSync = () => {
      fetchProfile();
      loadFollowedComics();
    };
    window.addEventListener("agent-state-updated", handleAgentSync);
    return () => window.removeEventListener("agent-state-updated", handleAgentSync);
  }, [user]);

  const loadFollowedComics = () => {
    if (!user?.token) return;
    fetch(`${API_BASE_URL}/api/user/followed`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(async data => {
        const slugs = data.followedComics || [];
        if (slugs.length === 0) return setFollowed([]);
        fetch(`${API_BASE_URL}/api/comic/comics/batch?slugs=${encodeURIComponent(slugs.join(","))}`)
          .then(res => res.json())
          .then(batchData => {
            setFollowed(batchData.comics || []);
          })
          .catch(() => setFollowed([]));
      });
  };

  // Fetch followed comics
  useEffect(() => {
    if (tab === "followed") {
      loadFollowedComics();
    }
  }, [user, tab]);

  // Fetch reading history
  useEffect(() => {
    if (!user?.token) return;
    fetch(`${API_BASE_URL}/api/user/history`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(async data => {
        const historyArr = data.readingHistory || [];
        const uniqueSlugs = [...new Set(historyArr.map(h => h.slug))];
        if (uniqueSlugs.length === 0) return setHistory(historyArr);

        fetch(`${API_BASE_URL}/api/comic/comics/batch?slugs=${encodeURIComponent(uniqueSlugs.join(","))}`)
          .then(res => res.json())
          .then(batchData => {
            const infoMap = {};
            (batchData.comics || []).forEach(c => {
              infoMap[c.slug] = c;
            });
            setHistory(
              historyArr.map(h => ({
                ...h,
                name: infoMap[h.slug]?.name || h.slug,
                thumb_url: infoMap[h.slug]?.thumb_url || ""
              }))
            );
          })
          .catch(() => setHistory(historyArr));
      });
  }, [user]);

  if (!user?.token) {
    return (
      <div className="max-w-2xl mx-auto py-10 text-center">
        <div className="text-lg mb-4">Bạn chưa đăng nhập.</div>
        <Link to="/login" className="px-4 py-2 bg-[#0c3a2f] text-white rounded-lg hover:bg-emerald-800 transition">
          Đăng nhập
        </Link>
      </div>
    );
  }

  if (loading || !profile) {
    return (
      <div className="max-w-2xl mx-auto py-10 text-center text-emerald-800/80 font-medium">
        Đang tải thông tin tài khoản...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f3fbf8] text-gray-800 relative overflow-hidden">
      {/* Hiệu ứng hạt sáng bay nền ở profile */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(6)].map((_, i) => {
          const size = Math.random() * 6 + 3;
          const left = Math.random() * 100;
          const delay = Math.random() * 10;
          const duration = Math.random() * 20 + 10;
          return (
            <div
              key={i}
              className="irminsul-particle"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                animationDelay: `${delay}s`,
                "--fly-duration": `${duration}s`,
                "--fly-x": "20px",
              }}
            />
          );
        })}
      </div>

      <div className="flex-1 w-full relative z-10">
        <div className="w-full px-3 sm:px-6 lg:px-10 py-6 bg-transparent min-h-screen">
          <ProfileHeader
            onLogout={onLogout}
            onOpenGuide={() => switchTabAndScroll("guide")}
            onOpenVip={() => switchTabAndScroll("vip")}
          />
          <ProfileCard
            user={user}
            profile={profile}
            email={email}
            setEmail={setEmail}
            role={role}
            refetchProfile={fetchProfile}
            onOpenGuide={() => switchTabAndScroll("guide")}
          />
          <div ref={tabContentRef} id="profile-tab-section" className="scroll-mt-20">
            <TabNavigation
              tab={tab}
              setTab={switchTabAndScroll}
            />
            <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-emerald-100/50 shadow-sm mt-6 w-full">
              {tab === "followed" ? (
                <FollowedComics comics={followed} user={user} onUnfollow={loadFollowedComics} />
              ) : tab === "history" ? (
                <HistoryComics history={history} />
              ) : tab === "inventory" ? (
                <Inventory user={user} profile={profile} refetchProfile={fetchProfile} />
              ) : tab === "shop" ? (
                <Shop user={user} profile={profile} refetchProfile={fetchProfile} />
              ) : tab === "quests" ? (
                <QuestBoard user={user} refetchProfile={fetchProfile} />
              ) : tab === "vip" ? (
                <VipAndDeposit onBalanceChanged={fetchProfile} />
              ) : tab === "guide" ? (
                <UserGuide />
              ) : tab === "xpHistory" ? (
                <XpHistory user={user} />
              ) : (
                <Comments user={user} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal nhận quà đăng nhập */}
      {dailyRewardInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-emerald-950 to-teal-950 text-white rounded-3xl border border-emerald-500/25 p-6 max-w-sm w-full text-center shadow-2xl relative animate-scale-up">
            {/* Hào quang lấp lánh */}
            <div className="absolute inset-0 bg-gradient-radial from-emerald-500/10 to-transparent pointer-events-none rounded-3xl" />
            
            <div className="text-5xl mb-4 animate-bounce">🎁</div>
            <h3 className="text-lg font-black text-emerald-200 mb-2">Quà Đăng Nhập Ngày Mới!</h3>
            <p className="text-xs text-emerald-100/80 mb-4 font-medium">
              Chào mừng lữ hành trở lại bí cảnh! Chúc anh một ngày đọc truyện thật vui vẻ.
            </p>
            
            <div className="flex flex-col gap-2 mb-6 text-left">
              <div className="flex items-center justify-between p-3 bg-emerald-900/40 border border-emerald-850 rounded-xl">
                <span className="text-xs text-emerald-300 font-bold">Ký Ức Irminsul</span>
                <span className="text-xs font-black text-emerald-400">+{dailyRewardInfo.xp} XP</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-900/40 border border-emerald-850 rounded-xl">
                <span className="text-xs text-emerald-300 font-bold">Quà May Mắn</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm">{dailyRewardInfo.itemIcon}</span>
                  <span className="text-xs font-black text-emerald-400">{dailyRewardInfo.itemName}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setDailyRewardInfo(null)}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-transform active:scale-95"
            >
              Nhận Quà
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileContainer;
