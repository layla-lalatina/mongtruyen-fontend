import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../../config";

export const useFollowStatus = ({ user, slug }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();

  // Kiểm tra trạng thái theo dõi khi component mount hoặc slug thay đổi
  useEffect(() => {
    if (!user?.token || !slug) {
      setIsFollowing(false);
      return;
    }

    fetch(`${API_BASE_URL}/api/user/is-following/${slug}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((data) => setIsFollowing(!!data.isFollowing))
      .catch((err) => {
        console.error("Lỗi khi kiểm tra theo dõi:", err);
      });
  }, [user, slug]);

  // Lắng nghe sự kiện đồng bộ theo dõi tức thì từ Local Agent (AIChatWidget)
  useEffect(() => {
    const handleAgentStateUpdate = (e) => {
      const act = e.detail;
      if (!act) return;
      if (act.type === "BOOKMARK_CHANGED" && (!act.slug || act.slug === slug)) {
        setIsFollowing(!!act.isFollowing);
      }
    };
    window.addEventListener("agent-state-updated", handleAgentStateUpdate);
    return () => window.removeEventListener("agent-state-updated", handleAgentStateUpdate);
  }, [slug]);

  // Toggle follow/unfollow
  const toggleFollow = async () => {
    if (!user?.token) {
      navigate("/login");
      return;
    }
    const nextFollowing = !isFollowing;
    setIsFollowing(nextFollowing);
    try {
      const endpoint = isFollowing ? "/unfollow" : "/follow";
      const res = await axios.post(
        `${API_BASE_URL}/api/user${endpoint}`,
        { slug },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      window.dispatchEvent(
        new CustomEvent("agent-state-updated", {
          detail: {
            type: "BOOKMARK_CHANGED",
            slug,
            isFollowing: nextFollowing,
            followers: res.data?.followers,
          },
        })
      );
    } catch (err) {
      setIsFollowing(!nextFollowing);
      console.error("Lỗi khi thay đổi trạng thái theo dõi:", err);
    }
  };

  return { isFollowing, toggleFollow };
};
