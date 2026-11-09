import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../../config";

export const useRandomComics = () => {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/comic/comics?limit=30`)
      .then((res) => res.json())
      .then((data) => {
        const items = data.comics || data.data?.items || [];
        const shuffled = [...items].sort(() => 0.5 - Math.random());
        setComics(shuffled.slice(0, 10));
      })
      .catch((err) => {
        console.error("Lỗi fetch random comics:", err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  return { randomComics: comics, loading, error };
};
