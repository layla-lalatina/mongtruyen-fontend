// src/hooks/useFollowedComics.js
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../../config";

import { getComicThumbUrl } from "../../../utils/imageHelpers";

export const useFollowedComics = ({ user }) => {
  const [followedComics, setFollowedComics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.token) {
      setFollowedComics([]);
      return;
    }

    const fetchFollowedComics = async () => {
      setLoading(true);
      setError(null);
      try {
        // Lấy danh sách slug truyện theo dõi
        const followedRes = await axios.get(`${API_BASE_URL}/api/user/followed`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const comicSlugs = followedRes.data.followedComics || [];
        if (comicSlugs.length === 0) {
          setFollowedComics([]);
          return;
        }

        const batchRes = await fetch(`${API_BASE_URL}/api/comic/comics/batch?slugs=${encodeURIComponent(comicSlugs.join(","))}`);
        const batchData = await batchRes.json();
        const serverComics = followedRes.data.comics || [];
        const comics = (batchData.comics || serverComics).map(c => {
          const matchedServer = serverComics.find(sc => sc.slug === c.slug);
          const chapVal = c.latestChapter || c.chap || matchedServer?.latestChapter || matchedServer?.chap || "1";
          return {
            slug: c.slug,
            name: c.name || c.title || c.slug,
            thumb_url: getComicThumbUrl(c.thumb_url || c.thumbUrl),
            chap: chapVal,
            latestChapter: chapVal,
            totalChapters: c.totalChapters || matchedServer?.totalChapters || 1
          };
        });
        setFollowedComics(comics);
      } catch (err) {
        setError("Không thể tải danh sách truyện theo dõi.");
        console.error("Lỗi API followed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowedComics();

    const handleAgentUpdate = (e) => {
      if (e.detail?.type === "BOOKMARK_CHANGED" || e.detail?.type === "REFRESH_USER_STATE") {
        fetchFollowedComics();
      }
    };
    window.addEventListener("agent-state-updated", handleAgentUpdate);
    return () => window.removeEventListener("agent-state-updated", handleAgentUpdate);
  }, [user]);

  return { followedComics, loading, error };
};