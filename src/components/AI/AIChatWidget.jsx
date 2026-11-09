/**
 * 🌳 SYSTEM: IRMINSUL FANTASY RPG - NAHIDA AI GEMINI CHAT WORKSPACE
 * ==========================================================
 * @file AIChatWidget.jsx
 * @path fontend/src/components/AI/AIChatWidget.jsx
 * @description Gemini-styled AI Assistant Workspace with collapsible sidebar,
 * conversation history management, new chat sessions, draggable resizing, and mobile layout.
 * ==========================================================
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../config";

const AIChatWidget = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Nhận diện ngữ cảnh trang hiện tại theo thời gian thực cho Local Agent
  const currentPageContext = useMemo(() => {
    const pathname = location.pathname || "/";
    const search = location.search || "";
    const detailMatch = pathname.match(/^\/truyen\/([^/?#]+)/i);
    const readMatch = pathname.match(/^\/doc\/([^/?#]+)\/([^/?#]+)/i);

    let comicSlug = null;
    let chapter = null;
    let shortBadge = "Trang chủ";

    if (readMatch) {
      comicSlug = decodeURIComponent(readMatch[1]);
      chapter = decodeURIComponent(readMatch[2]);
      shortBadge = `Đọc: ${comicSlug.slice(0, 18)} • Ch.${chapter}`;
    } else if (detailMatch) {
      comicSlug = decodeURIComponent(detailMatch[1]);
      shortBadge = `Truyện: ${comicSlug.slice(0, 22)}`;
    } else if (pathname.startsWith("/profile")) {
      shortBadge = "Hồ sơ & Nhiệm vụ RPG";
    } else if (pathname.startsWith("/deposit")) {
      shortBadge = "Nạp Tinh Thạch & VIP";
    } else if (pathname.startsWith("/translator")) {
      shortBadge = "Kênh Dịch Giả";
    } else if (pathname.startsWith("/admin")) {
      shortBadge = "Quản Trị Admin";
    } else if (pathname.startsWith("/hot")) {
      shortBadge = "Truyện Hot";
    } else if (pathname.startsWith("/full")) {
      shortBadge = "Truyện Hoàn Thành";
    }

    return {
      pathname,
      search,
      comicSlug,
      chapter,
      shortBadge,
    };
  }, [location.pathname, location.search]);

  // Phát hiện thiết bị di động (Mobile Detection)
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 640 : false);

  // Kích thước tùy chỉnh khi kéo thả: Mặc định mở lên luôn nằm 1 góc gọn gàng ~460px
  const [size, setSize] = useState(() => {
    const savedW = typeof window !== "undefined" ? localStorage.getItem("gemini_chat_width") : null;
    const savedH = typeof window !== "undefined" ? localStorage.getItem("gemini_chat_height") : null;
    const defaultW = typeof window !== "undefined" ? Math.min(460, window.innerWidth - 20) : 460;
    const defaultH = typeof window !== "undefined" ? Math.min(600, window.innerHeight - 30) : 600;
    const currentW =
      savedW && parseInt(savedW, 10) >= 360 && parseInt(savedW, 10) <= 580
        ? parseInt(savedW, 10)
        : defaultW;
    const currentH =
      savedH && parseInt(savedH, 10) >= 420 && parseInt(savedH, 10) <= 740
        ? parseInt(savedH, 10)
        : defaultH;
    return {
      width: currentW,
      height: currentH,
    };
  });
  const [isResizing, setIsResizing] = useState(false);

  // Cờ nhận biết kích thước cửa sổ chat đang thu nhỏ để bố cục Header & Nội dung không bị tràn/cắt chữ
  const isCompactWidth = !isExpanded && !isMobile && size.width < 430;
  const isShortHeight = !isExpanded && !isMobile && size.height < 480;

  // Đồng bộ trạng thái theo dõi bộ truyện đang xem trên màn hình theo thời gian thực
  const [isCurrentComicFollowed, setIsCurrentComicFollowed] = useState(false);

  // Quản lý các phiên hội thoại (Conversations)
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [editingTitleText, setEditingTitleText] = useState("");

  // Modal xác nhận tùy chỉnh thay cho window.confirm
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Xóa",
    onConfirm: null,
  });

  const [gender, setGender] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Kiểm tra và đồng bộ trạng thái theo dõi khi người dùng đang mở trang truyện / đọc chương
  useEffect(() => {
    const slug = currentPageContext.comicSlug;
    if (!user?.token || !slug) {
      setIsCurrentComicFollowed(false);
      return;
    }
    fetch(`${API_BASE_URL}/api/user/is-following/${slug}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((data) => setIsCurrentComicFollowed(!!data.isFollowing))
      .catch(() => { });
  }, [user, currentPageContext.comicSlug]);

  useEffect(() => {
    const handleFollowSync = (e) => {
      const act = e.detail;
      if (
        act?.type === "BOOKMARK_CHANGED" &&
        (!act.slug || act.slug === currentPageContext.comicSlug)
      ) {
        setIsCurrentComicFollowed(!!act.isFollowing);
      }
    };
    window.addEventListener("agent-state-updated", handleFollowSync);
    return () => window.removeEventListener("agent-state-updated", handleFollowSync);
  }, [currentPageContext.comicSlug]);

  // Tự động thích ứng khi kích cỡ trình duyệt thay đổi (Window Resize Listener)
  useEffect(() => {
    const handleWindowResize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      if (mobile) {
        setShowSidebar(false);
      }
      // Tự động thu nhỏ nếu kích thước cửa sổ trình duyệt nhỏ hơn kích thước chat
      setSize((prev) => ({
        width: Math.max(360, Math.min(prev.width, window.innerWidth - 20)),
        height: Math.max(420, Math.min(prev.height, window.innerHeight - 24)),
      }));
    };

    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  // ─── LOGIC KÉO THẢ THAY ĐỔI KÍCH THƯỚC (RESIZE DRAG) ───
  const startResize = (e, direction) => {
    e.preventDefault();
    if (isExpanded || isMobile) return;

    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = size.width;
    const startH = size.height;

    let currentW = startW;
    let currentH = startH;

    const onMouseMove = (moveEvent) => {
      let newW = startW;
      let newH = startH;

      if (direction === "width" || direction === "both") {
        newW = startW + (startX - moveEvent.clientX);
        newW = Math.max(360, Math.min(newW, window.innerWidth - 20));
      }

      if (direction === "height" || direction === "both") {
        newH = startH + (startY - moveEvent.clientY);
        newH = Math.max(420, Math.min(newH, window.innerHeight - 20));
      }

      currentW = newW;
      currentH = newH;
      setSize({ width: newW, height: newH });
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      localStorage.setItem("gemini_chat_width", currentW);
      localStorage.setItem("gemini_chat_height", currentH);
    };

    document.body.style.userSelect = "none";
    document.body.style.cursor =
      direction === "both" ? "nwse-resize" : direction === "width" ? "ew-resize" : "ns-resize";
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Hỗ trợ Touch Drag cho màn hình cảm ứng
  const startTouchResize = (e, direction) => {
    if (isExpanded || isMobile || !e.touches[0]) return;

    setIsResizing(true);
    const startX = e.touches[0].clientX;
    const startY = e.touches[0].clientY;
    const startW = size.width;
    const startH = size.height;
    let currentW = startW;
    let currentH = startH;

    const onTouchMove = (moveEvent) => {
      if (!moveEvent.touches[0]) return;
      let newW = startW;
      let newH = startH;

      if (direction === "width" || direction === "both") {
        newW = startW + (startX - moveEvent.touches[0].clientX);
        newW = Math.max(360, Math.min(newW, window.innerWidth - 20));
      }

      if (direction === "height" || direction === "both") {
        newH = startH + (startY - moveEvent.touches[0].clientY);
        newH = Math.max(420, Math.min(newH, window.innerHeight - 20));
      }

      currentW = newW;
      currentH = newH;
      setSize({ width: newW, height: newH });
    };

    const onTouchEnd = () => {
      setIsResizing(false);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      localStorage.setItem("gemini_chat_width", currentW);
      localStorage.setItem("gemini_chat_height", currentH);
    };

    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
  };

  // Tạo lời chào mặc định phù hợp với xưng hô
  const getDefaultGreeting = (userGender = gender) => {
    const title = userGender === "male" ? "anh" : userGender === "female" ? "chị" : "lữ hành";
    const username = user?.username || "";
    return `Chào ${title}${username ? ` ${username}` : ""}! 🌿 Em là Nahida, trợ lý trí tuệ từ Cây Thế Giới Irminsul. ${title.charAt(0).toUpperCase() + title.slice(1)} muốn em hỗ trợ tra cứu hoặc gợi ý truyện gì hôm nay? 🌱✨`;
  };

  // Tải profile để lấy giới tính
  useEffect(() => {
    const savedGender = localStorage.getItem("user_gender");
    if (savedGender) setGender(savedGender);

    const fetchProfile = async () => {
      if (!user?.token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await response.json();
        if (data.gender) {
          setGender(data.gender);
          localStorage.setItem("user_gender", data.gender);
        }
      } catch (err) {
        console.error("Lỗi khi tải profile lấy giới tính:", err);
      }
    };
    fetchProfile();
  }, [user]);

  // Tải danh sách conversations và hội thoại ban đầu
  const fetchConversationsList = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/conversations`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (data.success && data.conversations) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách hội thoại:", err);
    }
  };

  // Tải lịch sử ban đầu khi mở widget hoặc đăng nhập - Luôn ưu tiên đoạn chat mới nhất
  useEffect(() => {
    const initChat = async () => {
      if (!user?.token) {
        setMessages([{ role: "model", text: getDefaultGreeting() }]);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/ai/history`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json();
        if (data.success) {
          if (data.conversations) setConversations(data.conversations);
          if (data.energy) setEnergy(data.energy);

          // Luôn chọn và mở cuộc trò chuyện mới nhất
          const targetConvId = data.conversationId || (data.conversations?.length > 0 ? data.conversations[0].id : null);
          if (targetConvId) {
            setActiveConversationId(targetConvId);
            if (data.history && data.history.length > 0 && data.conversationId === targetConvId) {
              setMessages(data.history);
            } else {
              const msgRes = await fetch(`${API_BASE_URL}/api/ai/conversations/${targetConvId}/messages`, {
                headers: { Authorization: `Bearer ${user.token}` },
              });
              const msgData = await msgRes.json();
              if (msgData.success && msgData.messages?.length > 0) {
                setMessages(msgData.messages);
              } else {
                setMessages([{ role: "model", text: getDefaultGreeting() }]);
              }
            }
          } else if (data.history && data.history.length > 0) {
            setMessages(data.history);
          } else {
            setMessages([{ role: "model", text: getDefaultGreeting() }]);
          }

          // Luôn cuộn xuống tin nhắn mới nhất
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 150);
        }
      } catch (err) {
        console.error("Lỗi tải lịch sử chat ban đầu:", err);
        setMessages([{ role: "model", text: getDefaultGreeting() }]);
      }
    };

    if (isOpen) {
      initChat();
    }
  }, [isOpen, user]);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Chuyển sang một cuộc trò chuyện cũ (Load conversation)
  const handleSelectConversation = async (convId) => {
    if (convId === activeConversationId || loading) return;
    setActiveConversationId(convId);
    setLoading(true);
    setStatusText("Đang mở lại dòng ký ức...");

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/conversations/${convId}/messages`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (data.success) {
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        } else {
          setMessages([{ role: "model", text: getDefaultGreeting() }]);
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải đoạn chat:", err);
    } finally {
      setLoading(false);
      if (isMobile) {
        setShowSidebar(false);
      }
    }
  };

  // Tạo cuộc trò chuyện mới (+ Đoạn chat mới)
  const handleNewChat = () => {
    if (loading) return;
    setActiveConversationId(null);
    setPendingAction(null);
    setInput("");
    setMessages([{ role: "model", text: getDefaultGreeting() }]);
    if (isMobile) {
      setShowSidebar(false);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Xóa một cuộc trò chuyện
  const handleDeleteConversation = (convId, e) => {
    e.stopPropagation();
    const conv = conversations.find((c) => c.id === convId);
    const titleText = conv?.title ? `"${conv.title}"` : "cuộc trò chuyện này";

    setConfirmModal({
      isOpen: true,
      title: "Xác nhận xóa đoạn chat",
      message: `Bạn có chắc chắn muốn xóa ${titleText} không? Dữ liệu trò chuyện sẽ bị xóa vĩnh viễn trên Cây Thế Giới.`,
      confirmLabel: "Xóa cuộc trò chuyện",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/ai/conversations/${convId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${user.token}` },
          });
          const data = await res.json();
          if (data.success) {
            const remaining = conversations.filter((c) => c.id !== convId);
            setConversations(remaining);

            if (activeConversationId === convId) {
              if (remaining.length > 0) {
                handleSelectConversation(remaining[0].id);
              } else {
                handleNewChat();
              }
            }
          }
        } catch (err) {
          console.error("Lỗi khi xóa đoạn chat:", err);
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Bắt đầu đổi tên cuộc trò chuyện
  const startEditingTitle = (conv, e) => {
    e.stopPropagation();
    setEditingTitleId(conv.id);
    setEditingTitleText(conv.title);
  };

  // Lưu tên cuộc trò chuyện mới
  const handleSaveTitle = async (convId, e) => {
    if (e) e.stopPropagation();
    if (!editingTitleText.trim()) {
      setEditingTitleId(null);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/conversations/${convId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ title: editingTitleText.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, title: editingTitleText.trim() } : c))
        );
      }
    } catch (err) {
      console.error("Lỗi khi đổi tên đoạn chat:", err);
    } finally {
      setEditingTitleId(null);
    }
  };

  // Xóa toàn bộ lịch sử (Clear all history)
  const handleClearAllHistory = () => {
    setConfirmModal({
      isOpen: true,
      title: "Xóa toàn bộ ký ức",
      message: "Bạn có chắc muốn xóa TOÀN BỘ lịch sử trò chuyện trên Cây Thế Giới? Toàn bộ các đoạn hội thoại trước đây của bạn với Nahida sẽ được làm sạch vĩnh viễn. 🥺",
      confirmLabel: "Xóa toàn bộ",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/ai/clear`, {
            method: "POST",
            headers: { Authorization: `Bearer ${user.token}` },
          });
          const data = await res.json();
          if (data.success) {
            setConversations([]);
            setActiveConversationId(null);
            setMessages([{ role: "model", text: "Toàn bộ ký ức đã được làm sạch! Hãy bắt đầu cuộc trò chuyện mới nha! 🌿✨" }]);
          }
        } catch (err) {
          console.error("Lỗi xóa toàn bộ lịch sử:", err);
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Sao chép nội dung tin nhắn
  const handleCopyMessage = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // Trạng thái xử lý giống Google Gemini (chỉ hiển thị trong lúc đang xử lý dữ liệu)
  const getStatusText = (msg = "") => {
    const lower = String(msg).toLowerCase();
    if (lower.includes("theo dõi") || lower.includes("tủ sách")) {
      return "⚡ Đang đồng bộ tủ sách theo dõi...";
    }
    if (lower.includes("chương tiếp") || lower.includes("đọc tiếp") || lower.includes("mở chương")) {
      return "⚡ Đang chuyển sang chương truyện...";
    }
    if (lower.includes("điểm danh") || lower.includes("nhiệm vụ")) {
      return "⚡ Đang xử lý Điểm danh & Nhiệm vụ RPG...";
    }
    return "✨ Đang suy nghĩ & phân tích dữ liệu từ Cây Thế Giới...";
  };

  // Thực thi TỨC THÌ các hành động điều khiển giao diện Web từ Local Agent
  const executeClientActions = (actions = []) => {
    if (!Array.isArray(actions) || actions.length === 0) return;

    actions.forEach((act) => {
      if (act.toast) {
        window.dispatchEvent(new CustomEvent("loot-drop-received", { detail: act.toast }));
      }
      if (act.type === "REFRESH_USER_STATE" || act.type === "BOOKMARK_CHANGED") {
        window.dispatchEvent(new CustomEvent("agent-state-updated", { detail: act }));
      }
      if (act.type === "NAVIGATE" && act.path && act.autoNavigate) {
        navigate(act.path);
        if (isMobile) setIsOpen(false);
      }
    });
  };

  const userRole = (user?.role || "READER").toUpperCase();
  const isAdmin = userRole === "ADMIN";
  const isTranslator = userRole === "TRANSLATOR" || isAdmin;

  // Gợi ý hành động nhanh linh hoạt theo vai trò & ngữ cảnh trang hiện tại
  const quickPrompts = useMemo(() => {
    if (currentPageContext.comicSlug) {
      return [
        { label: "📖 Tóm tắt", prompt: "Tóm tắt nội dung, nhân vật chính và sức mạnh của bộ truyện mình đang xem" },
        isCurrentComicFollowed
          ? { label: "✅ Đã theo dõi", prompt: "Bỏ theo dõi bộ truyện này giúp mình" }
          : { label: "❤️ Theo dõi", prompt: "Theo dõi bộ truyện này vào tủ sách giúp mình" },
        {
          label: currentPageContext.chapter ? "▶️ Chương tiếp theo" : "▶️ Đọc tiếp bộ này",
          prompt: currentPageContext.chapter ? "Mở chương tiếp theo của bộ truyện này cho mình đọc" : "Mở chương đọc tiếp của bộ truyện này cho mình",
        },
        { label: "📅 Điểm danh & Nhiệm vụ", prompt: "Điểm danh hằng ngày và kiểm tra nhiệm vụ RPG giúp mình" },
      ];
    }

    if (isAdmin) {
      return [
        { label: "👑 Thống kê User", prompt: "Thống kê tổng số thành viên và số lượng theo từng vai trò (Admin, Translator, Reader)" },
        { label: "📊 Kho truyện MySQL", prompt: "Thống kê tổng số bộ truyện, tổng số chương và tổng view trên toàn hệ thống" },
        { label: "📅 Tự động Điểm danh", prompt: "Điểm danh hằng ngày và nhận thưởng nhiệm vụ RPG giúp mình" },
        { label: "⚡ Kiểm tra 21 bảng", prompt: "Liệt kê danh sách các bảng trong cơ sở dữ liệu Cây Thế Giới" },
      ];
    }

    if (isTranslator) {
      return [
        { label: "📈 Độc giả thích đọc gì?", prompt: "Phân tích giúp anh xu hướng độc giả gần đây đang thích đọc thể loại nào và truyện nào đang hot nhất?" },
        { label: "📊 Thống kê truyện của tôi", prompt: "Thống kê giúp anh toàn bộ truyện và số lượt xem, người theo dõi mà anh đã đăng" },
        { label: "📅 Điểm danh & Nhiệm vụ", prompt: "Điểm danh hằng ngày và nhận thưởng nhiệm vụ RPG giúp anh" },
        { label: "✍️ Đặt tên chương cuốn hút", prompt: "Tư vấn cho anh cách đặt tên tiêu đề chương truyện hấp dẫn, gây tò mò cho bạn đọc" },
      ];
    }

    return [
      { label: "📅 Tự động Điểm danh", prompt: "Điểm danh hằng ngày trên Cây Thế Giới giúp mình" },
      { label: "🏆 Nhận thưởng Nhiệm vụ", prompt: "Kiểm tra và nhận thưởng tất cả nhiệm vụ RPG đã hoàn thành giúp mình" },
      { label: "🔥 Truyện hot nhất", prompt: "Gợi ý cho mình top truyện đang hot và có nhiều lượt xem nhất hiện nay" },
      { label: "🧙‍♂️ Truyện Chuyển sinh", prompt: "Gợi ý cho mình các bộ truyện thể loại Chuyển sinh, Isekai hay nhất" },
    ];
  }, [currentPageContext.comicSlug, currentPageContext.chapter, isCurrentComicFollowed, isAdmin, isTranslator]);

  // Gửi tin nhắn đến API Local Agent
  const sendMessage = async (userMessage) => {
    if (!userMessage || loading) return;
    setInput("");

    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);
    setStatusText(getStatusText(userMessage));
    setPendingAction(null);

    try {
      if (!user?.token) {
        throw new Error("Bạn chưa đăng nhập, hãy đăng nhập để trò chuyện với em nhé!");
      }

      const chatHistory = messages
        .filter((m) => m.role === "user" || m.role === "model")
        .map((m) => ({ role: m.role, text: m.text }))
        .slice(-10);

      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          history: chatHistory,
          conversationId: activeConversationId,
          pageContext: currentPageContext,
        }),
      });

      const data = await response.json();
      if (data.success) {
        if (data.energy) setEnergy(data.energy);
        if (data.pendingAction) setPendingAction(data.pendingAction);

        // Cập nhật conversationId nếu đây là hội thoại mới
        if (data.conversationId && data.conversationId !== activeConversationId) {
          setActiveConversationId(data.conversationId);
        }

        // Tải lại danh sách conversations để cập nhật tiêu đề và mốc thời gian
        fetchConversationsList();

        // Thực thi các hành động điều khiển Web / RPG từ Local Agent
        if (data.clientActions && data.clientActions.length > 0) {
          executeClientActions(data.clientActions);
        }

        if (data.replies && data.replies.length > 0) {
          for (let i = 0; i < data.replies.length; i++) {
            if (i > 0) await new Promise((r) => setTimeout(r, 400));
            const isLast = i === data.replies.length - 1;
            setMessages((prev) => [
              ...prev,
              {
                role: "model",
                text: data.replies[i],
                ...(isLast && data.agentMeta ? { agentMeta: data.agentMeta } : {}),
                ...(isLast && data.clientActions ? { clientActions: data.clientActions } : {}),
              },
            ]);
          }
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "model", text: `⚠️ Có chút trục trặc rồi anh ơi: ${data.message}` },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "model", text: `🌱 Ký ức Irminsul bị gián đoạn: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
  };

  // Xác nhận thực thi SQL từ Admin
  const handleConfirmAction = async () => {
    if (!pendingAction || loading) return;

    const actionSql = pendingAction.sql;
    setLoading(true);
    setStatusText("🧠 Suy nghĩ ➔ ⚡ Đang thực thi câu lệnh SQL... ⚡");

    const confirmMessage = "Xác nhận thực thi câu lệnh SQL";
    setMessages((prev) => [...prev, { role: "user", text: confirmMessage }]);
    setPendingAction(null);

    try {
      const chatHistory = messages
        .filter((m) => m.role === "user" || m.role === "model")
        .map((m) => ({ role: m.role, text: m.text }))
        .slice(-10);

      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          message: confirmMessage,
          history: chatHistory,
          conversationId: activeConversationId,
          confirmAction: { sql: actionSql },
          pageContext: currentPageContext,
        }),
      });

      const data = await response.json();
      if (data.success) {
        if (data.energy) setEnergy(data.energy);
        if (data.clientActions && data.clientActions.length > 0) {
          executeClientActions(data.clientActions);
        }
        if (data.replies && data.replies.length > 0) {
          for (let i = 0; i < data.replies.length; i++) {
            if (i > 0) await new Promise((r) => setTimeout(r, 400));
            const isLast = i === data.replies.length - 1;
            setMessages((prev) => [
              ...prev,
              {
                role: "model",
                text: data.replies[i],
                ...(isLast && data.agentMeta ? { agentMeta: data.agentMeta } : {}),
              },
            ]);
          }
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "model", text: `⚠️ Thực thi thất bại: ${data.message}` },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "model", text: `🌱 Lỗi xác thực hành động: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAction = () => {
    setPendingAction(null);
    setMessages((prev) => [
      ...prev,
      { role: "model", text: "Đã hủy yêu cầu chỉnh sửa dữ liệu hệ thống. Em sẽ giữ an toàn cho Cây Thế Giới! 🍃" },
    ]);
  };

  const handleSaveGender = async (selectedGender) => {
    setGender(selectedGender);
    localStorage.setItem("user_gender", selectedGender);

    const title = selectedGender === "male" ? "anh" : "chị";
    setMessages((prev) => {
      const newMsgs = [...prev];
      if (newMsgs[0] && newMsgs[0].role === "model") {
        newMsgs[0].text = `Chào ${title}! 🌿 Em là Nahida, trợ lý đắc lực từ Cây Thế Giới Irminsul đây. ${title.charAt(0).toUpperCase() + title.slice(1)} muốn em gợi ý hay tìm kiếm truyện gì hôm nay nào? 🌱✨`;
      }
      return newMsgs;
    });

    if (user?.token) {
      try {
        await fetch(`${API_BASE_URL}/api/user/update-gender`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ gender: selectedGender }),
        });
      } catch (err) {
        console.error("Lỗi đồng bộ giới tính:", err);
      }
    }
  };

  // Helper render Markdown & Thẻ link truyện
  const renderMessageContent = (text, isAI) => {
    if (!text || typeof text !== "string") return null;

    const lines = text.split("\n");

    return lines.map((line, lineIdx) => {
      const isBullet = /^\s*[-*•]\s+/.test(line);
      const cleanLine = isBullet ? line.replace(/^\s*[-*•]\s+/, "") : line;
      const tokenRegex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`/g;
      const elements = [];
      let lastIndex = 0;
      let match;

      while ((match = tokenRegex.exec(cleanLine)) !== null) {
        if (match.index > lastIndex) {
          elements.push(cleanLine.substring(lastIndex, match.index));
        }

        if (match[1] && match[2]) {
          const linkTitle = match[1];
          const linkUrl = match[2];
          const isComicLink = linkUrl.startsWith("/truyen/") || linkUrl.includes("/truyen/");

          elements.push(
            <Link
              key={`link-${lineIdx}-${match.index}`}
              to={linkUrl}
              onClick={() => setIsOpen(false)}
              className={
                isComicLink
                  ? "inline-flex items-center gap-1.5 px-2.5 py-0.5 my-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 hover:text-emerald-950 font-extrabold border border-emerald-300 hover:border-emerald-500 shadow-xs hover:scale-105 active:scale-95 transition-all text-[11px] group cursor-pointer"
                  : "text-emerald-700 underline font-bold hover:text-emerald-900"
              }
              title={`Nhấp để mở: ${linkTitle}`}
            >
              {isComicLink && <span className="text-xs">📖</span>}
              <span className="group-hover:underline underline-offset-2">{linkTitle}</span>
              {isComicLink && <span className="text-[9px] opacity-75 group-hover:translate-x-0.5 transition-transform">↗</span>}
            </Link>
          );
        } else if (match[3]) {
          elements.push(
            <strong key={`bold-${lineIdx}-${match.index}`} className={isAI ? "font-black text-emerald-950" : "font-black text-white"}>
              {match[3]}
            </strong>
          );
        } else if (match[4]) {
          elements.push(
            <code key={`code-${lineIdx}-${match.index}`} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-[10px] border border-emerald-200">
              {match[4]}
            </code>
          );
        }

        lastIndex = tokenRegex.lastIndex;
      }

      if (lastIndex < cleanLine.length) {
        elements.push(cleanLine.substring(lastIndex));
      }

      return (
        <div key={lineIdx} className={isBullet ? "flex items-start gap-1.5 my-1" : "min-h-[1.2rem]"}>
          {isBullet && <span className="text-emerald-600 shrink-0 text-[10px] mt-0.5">✦</span>}
          <div className="flex-1 leading-relaxed">
            {elements.length > 0 ? elements : <span className="invisible">-</span>}
          </div>
        </div>
      );
    });
  };

  // Xác định tiêu đề hiển thị của phiên chat hiện tại
  const currentConversation = conversations.find((c) => c.id === activeConversationId);
  const currentTitle = currentConversation?.title || "Cuộc trò chuyện mới";

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 font-sans">
      {/* ─── 1. BONG BÓNG TRÒ CHUYỆN GEMINI KHI THU NHỎ (FLOATING LAUNCHER) ─── */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setShowSidebar(false);
            setIsExpanded(false);
          }}
          className="group relative w-13 h-13 sm:w-14 sm:h-14 bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-600/40 border-2 border-white hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
          title="Mở trợ lý Nahida AI"
        >
          {/* Hào quang lấp lánh */}
          <span className="absolute -inset-1 rounded-full bg-emerald-400/40 blur-md group-hover:bg-emerald-400/70 transition duration-300" />

          {/* Biểu tượng Gemini Sparkle */}
          <div className="relative z-10 flex items-center justify-center text-white">
            <span className="text-2xl animate-pulse">✨</span>
          </div>

          {/* Huy hiệu AI */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-[8px] text-slate-900 font-black justify-center items-center shadow-sm">
              AI
            </span>
          </span>
        </button>
      )}

      {/* ─── 2. CỬA SỔ TRÒ CHUYỆN PHONG CÁCH GOOGLE GEMINI ─── */}
      {isOpen && (
        <div
          style={
            !isExpanded && !isMobile
              ? { width: `${size.width}px`, height: `${size.height}px` }
              : undefined
          }
          className={`fixed transition-[width,height] ${isResizing ? "duration-0 select-none" : "duration-200"
            } flex flex-col bg-white/95 backdrop-blur-2xl border border-emerald-300 shadow-[0_20px_50px_rgba(16,185,129,0.18)] overflow-hidden z-[99999] text-slate-800 ${isMobile
              ? "inset-0 w-full h-full rounded-none"
              : isExpanded
                ? "inset-2 sm:inset-5 rounded-3xl"
                : "bottom-3 sm:bottom-6 right-2 sm:right-6 rounded-3xl max-w-[96vw] max-h-[96vh]"
            }`}
        >
          {/* ══ CÁC TAY NẮM KÉO THAY ĐỔI KÍCH THƯỚC (RESIZE HANDLES) ══ */}
          {!isExpanded && !isMobile && (
            <>
              {/* Tay nắm góc trên bên trái (Kéo cả rộng và cao cùng lúc) */}
              <div
                onMouseDown={(e) => startResize(e, "both")}
                onTouchStart={(e) => startTouchResize(e, "both")}
                className="absolute top-0 left-0 w-7 h-7 z-40 cursor-nwse-resize flex items-center justify-center group"
                title="Kéo góc này để phóng to / thu nhỏ bảng chat"
              >
                <div className="w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-500 group-hover:border-emerald-600 rounded-tl transition-colors shadow-sm" />
              </div>

              {/* Cạnh trên (Kéo thay đổi chiều cao) */}
              <div
                onMouseDown={(e) => startResize(e, "height")}
                onTouchStart={(e) => startTouchResize(e, "height")}
                className="absolute top-0 left-7 right-7 h-2 z-30 cursor-ns-resize hover:bg-emerald-400/40 active:bg-emerald-500/50 transition-colors"
                title="Kéo cạnh trên để thay đổi chiều cao"
              />

              {/* Cạnh trái (Kéo thay đổi chiều rộng) */}
              <div
                onMouseDown={(e) => startResize(e, "width")}
                onTouchStart={(e) => startTouchResize(e, "width")}
                className="absolute top-7 bottom-7 left-0 w-2 z-30 cursor-ew-resize hover:bg-emerald-400/40 active:bg-emerald-500/50 transition-colors"
                title="Kéo cạnh trái để thay đổi chiều rộng"
              />
            </>
          )}

          {/* Badge hiển thị kích thước khi đang kéo */}
          {isResizing && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 px-3 py-1 bg-emerald-600 text-white text-[11px] font-black rounded-full shadow-xl pointer-events-none animate-pulse">
              📐 {Math.round(size.width)} × {Math.round(size.height)} px
            </div>
          )}

          {/* ══ HEADER PHONG CÁCH GEMINI (LIGHT THEME - TƯƠNG THÍCH KHI KÉO NHỎ NHẤT) ══ */}
          <div
            className={`bg-gradient-to-r from-emerald-50 via-teal-50 to-white ${isCompactWidth ? "px-2.5 py-2 gap-1.5" : "px-3 sm:px-4 py-2.5 sm:py-3 gap-2"
              } border-b border-emerald-200/80 flex items-center justify-between shadow-xs shrink-0 select-none`}
          >
            {/* Trái: Toggle Sidebar + Tiêu đề & Model */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className={`${isCompactWidth ? "w-7 h-7" : "w-8 h-8"
                  } rounded-xl flex items-center justify-center transition cursor-pointer border shrink-0 ${showSidebar
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-white/90 text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200 shadow-2xs"
                  }`}
                title={showSidebar ? "Thu gọn thanh lịch sử" : "Mở thanh lịch sử"}
              >
                <span className="text-xs sm:text-sm font-bold">☰</span>
              </button>

              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div
                  className={`${isCompactWidth ? "w-7 h-7 text-xs" : "w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm"
                    } rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-600 flex items-center justify-center shadow-sm text-white shrink-0`}
                >
                  ✨
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h3 className="text-xs sm:text-sm font-black tracking-wide leading-none shrink-0 whitespace-nowrap bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 bg-clip-text text-transparent">
                      Nahida AI
                    </h3>
                    {user && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black shrink-0 border ${isAdmin
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : isTranslator
                              ? "bg-purple-100 text-purple-900 border-purple-300"
                              : "bg-emerald-100 text-emerald-900 border-emerald-300"
                          }`}
                      >
                        {isAdmin
                          ? size.width < 390
                            ? "👑"
                            : "👑 Admin"
                          : isTranslator
                            ? size.width < 390
                              ? "✍️"
                              : "✍️ Dịch Giả"
                            : size.width < 390
                              ? "🌿"
                              : "🌿 Lữ Hành"}
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 truncate mt-0.5 flex items-center gap-1 font-medium">
                    {!isCompactWidth && <span className="hidden sm:inline">Local Agent •</span>}
                    <span className="text-emerald-700 font-bold truncate">
                      {energy
                        ? isCompactWidth
                          ? `🔋 ${energy.percent}% • Gemini`
                          : `🔋 ${energy.percent}% • Bộ não Gemini`
                        : "🧠 Bộ não Gemini"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Phải: Nút New Chat + Phóng to/Thu nhỏ + Đóng */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleNewChat}
                className={`flex items-center gap-1 ${isCompactWidth ? "px-2 py-1 text-[10.5px]" : "px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs"
                  } rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 font-bold transition active:scale-95 cursor-pointer shadow-xs shrink-0`}
                title="Bắt đầu cuộc trò chuyện mới"
              >
                <span>+</span>
                <span>{isCompactWidth ? "Mới" : "Chat Mới"}</span>
              </button>

              {/* Nút phóng to thu nhỏ toàn màn hình (ẩn trên mobile vì đã full screen) */}
              {!isMobile && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`${isCompactWidth ? "w-7 h-7" : "w-8 h-8"
                    } rounded-xl bg-white/90 hover:bg-emerald-50 text-slate-600 hover:text-emerald-900 flex items-center justify-center transition border border-emerald-200 shadow-2xs cursor-pointer text-xs shrink-0`}
                  title={isExpanded ? "Thu nhỏ cửa sổ" : "Phóng to toàn trang web"}
                >
                  {isExpanded ? "🗗" : "⛶"}
                </button>
              )}

              <button
                onClick={() => setIsOpen(false)}
                className={`${isCompactWidth ? "w-7 h-7" : "w-8 h-8"
                  } rounded-xl bg-white/90 hover:bg-rose-50 text-slate-600 hover:text-rose-600 flex items-center justify-center transition border border-emerald-200 shadow-2xs cursor-pointer font-bold text-xs shrink-0`}
                title="Đóng"
              >
                ✕
              </button>
            </div>
          </div>

          {/* ══ NỘI DUNG CHÍNH (SIDEBAR + MAIN CHAT AREA) ══ */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Lớp nền mờ (Backdrop) trên di động khi mở Sidebar Drawer */}
            {isMobile && showSidebar && (
              <div
                onClick={() => setShowSidebar(false)}
                className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 transition-opacity animate-fade-in"
              />
            )}

            {/* ─── THANH BÊN XEM LỊCH SỬ (GEMINI SIDEBAR - LIGHT THEME) ─── */}
            <div
              className={`transition-all duration-300 flex flex-col bg-[#f2f9f5] border-r border-emerald-200/90 overflow-hidden shrink-0 ${isMobile
                  ? `fixed inset-y-0 left-0 w-4/5 max-w-[290px] z-50 shadow-2xl ${showSidebar ? "translate-x-0" : "-translate-x-full"
                  }`
                  : showSidebar
                    ? "w-64 sm:w-72"
                    : "w-0 border-none"
                }`}
            >
              {/* Tiêu đề & Nút đóng Drawer trên di động */}
              {isMobile && (
                <div className="p-3 border-b border-emerald-200 flex items-center justify-between bg-white">
                  <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                    <span>✨</span> Lịch sử hội thoại
                  </span>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="p-1 px-2.5 hover:bg-emerald-100 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-bold border border-emerald-200"
                  >
                    ✕ Đóng
                  </button>
                </div>
              )}

              {/* Nút "+ Đoạn chat mới" lớn ở đầu Sidebar */}
              <div className="p-3 border-b border-emerald-200/70 bg-white/50">
                <button
                  onClick={handleNewChat}
                  className="w-full py-2.5 px-3 sm:px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl border border-emerald-600 flex items-center gap-2.5 font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <span className="text-base text-emerald-200">＋</span>
                  <span>Đoạn chat mới</span>
                </button>
              </div>

              {/* Danh sách các cuộc trò chuyện gần đây */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1 gemini-scrollbar">
                <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Gần đây</span>
                  <span className="text-emerald-700 font-bold">{conversations.length}</span>
                </div>

                {conversations.length === 0 ? (
                  <div className="px-3 py-6 text-center text-xs text-slate-500 italic">
                    Chưa có đoạn chat nào trước đây. Hãy bắt đầu ngay! 🌿
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const isActive = conv.id === activeConversationId;
                    const isEditing = editingTitleId === conv.id;

                    return (
                      <div
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv.id)}
                        className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition cursor-pointer select-none ${isActive
                            ? "bg-white text-emerald-900 border border-emerald-300 font-bold shadow-xs"
                            : "hover:bg-emerald-100/60 text-slate-700 font-medium"
                          }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className={`text-xs ${isActive ? "text-emerald-700" : "text-slate-400"}`}>
                            💬
                          </span>

                          {isEditing ? (
                            <input
                              type="text"
                              value={editingTitleText}
                              onChange={(e) => setEditingTitleText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveTitle(conv.id, e);
                                if (e.key === "Escape") setEditingTitleId(null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                              className="bg-white border border-emerald-400 rounded px-1.5 py-0.5 text-xs text-slate-900 outline-none w-full shadow-inner"
                            />
                          ) : (
                            <span className="truncate flex-1">{conv.title}</span>
                          )}
                        </div>

                        {/* Các nút thao tác (Đổi tên / Xóa) */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1.5 shrink-0">
                          {isEditing ? (
                            <button
                              onClick={(e) => handleSaveTitle(conv.id, e)}
                              className="p-1 text-emerald-700 hover:text-emerald-900 font-bold text-xs"
                              title="Lưu"
                            >
                              ✓
                            </button>
                          ) : (
                            <button
                              onClick={(e) => startEditingTitle(conv, e)}
                              className="p-1 text-slate-500 hover:text-amber-600 text-[11px]"
                              title="Đổi tên"
                            >
                              ✏️
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDeleteConversation(conv.id, e)}
                            className="p-1 text-slate-500 hover:text-rose-600 text-[11px]"
                            title="Xóa đoạn chat"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chân thanh bên: Nút Xóa toàn bộ lịch sử */}
              {conversations.length > 0 && (
                <div className="p-3 border-t border-emerald-200 bg-white/70">
                  <button
                    onClick={handleClearAllHistory}
                    className="w-full py-1.5 px-3 text-[11px] text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                  >
                    <span>🗑️</span>
                    <span>Xóa toàn bộ ký ức</span>
                  </button>
                </div>
              )}
            </div>

            {/* ─── VÙNG TRÒ CHUYỆN CHÍNH (MAIN CHAT AREA - LIGHT THEME) ─── */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#f8fbf9] relative">
              {/* Header phụ hiển thị tên phiên chat hiện tại & ngữ cảnh trang thời gian thực */}
              <div
                className={`${isCompactWidth ? "px-2.5 py-1.5" : "px-3 sm:px-4 py-2"
                  } bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between gap-2 text-xs text-slate-500 shrink-0`}
              >
                <span className="truncate font-semibold flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="text-emerald-600 shrink-0">🌱</span>
                  <span className="text-slate-800 truncate">{currentTitle}</span>
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {currentPageContext?.shortBadge && (
                    <span
                      className={`px-2 py-0.5 rounded-full bg-white text-emerald-800 border border-emerald-200/90 text-[10px] font-bold shadow-2xs truncate ${isCompactWidth ? "max-w-[135px]" : "max-w-[165px] sm:max-w-[210px]"
                        }`}
                      title={`Agent đang nhận diện trang hiện tại: ${currentPageContext.pageLabel}`}
                    >
                      📍 {currentPageContext.shortBadge}
                    </span>
                  )}
                  {!isCompactWidth && (
                    <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                      {messages.length} tin
                    </span>
                  )}
                </div>
              </div>

              {/* Khung tin nhắn cuộn */}
              <div
                className={`flex-1 overflow-y-auto ${isExpanded
                    ? "p-4 sm:p-6 space-y-4"
                    : isCompactWidth || isShortHeight
                      ? "p-2.5 space-y-2.5"
                      : "p-3.5 space-y-3.5"
                  } gemini-scrollbar`}
              >
                {/* 1. HỘP THOẠI CHỌN GIỚI TÍNH NẾU CHƯA CÓ */}
                {user && !gender && (
                  <div className="p-3.5 sm:p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col gap-2.5 shadow-sm text-xs text-emerald-900 font-medium animate-fade-in">
                    <p className="leading-relaxed">
                      Chào bạn! 🌿 Có thể cho em biết bạn là nam hay nữ để em chọn từ xưng hô phù hợp nhất để trò chuyện và phục vụ bạn không nè? 🌱✨
                    </p>
                    <div className="flex gap-2.5">
                      <button
                        onClick={() => handleSaveGender("male")}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold rounded-xl transition shadow-sm cursor-pointer"
                      >
                        🙋‍♂️ Nam
                      </button>
                      <button
                        onClick={() => handleSaveGender("female")}
                        className="flex-1 py-2 bg-pink-600 hover:bg-pink-500 active:scale-95 text-white font-extrabold rounded-xl transition shadow-sm cursor-pointer"
                      >
                        🙋‍♀️ Nữ
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. MÀN HÌNH CHÀO MỪNG PHONG CÁCH GEMINI KHI BẮT ĐẦU (LIGHT THEME) */}
                {messages.length <= 1 && (
                  <div className={`${isShortHeight ? "py-2" : "py-4 sm:py-6"} flex flex-col items-center text-center animate-fade-in`}>
                    <div className={`${isShortHeight ? "w-11 h-11 text-xl mb-2" : "w-14 h-14 text-2xl mb-3"} rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-600 flex items-center justify-center text-white shadow-[0_4px_20px_rgba(16,185,129,0.25)]`}>
                      ✨
                    </div>

                    <h2 className={`${isCompactWidth || isShortHeight ? "text-base" : "text-lg sm:text-xl"} font-black bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-950 bg-clip-text text-transparent px-2`}>
                      {gender === "male"
                        ? `Chào Anh ${user?.username || ""} 🌿`
                        : gender === "female"
                          ? `Chào Chị ${user?.username || ""} 🌿`
                          : `Chào Lữ Hành ${user?.username || ""} 🌿`}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1 max-w-md px-3 leading-relaxed">
                      Hôm nay em có thể trợ giúp gì cho bạn về thế giới truyện tranh và hệ thống Cây Thế Giới Irminsul?
                    </p>

                    {/* 4 Thẻ gợi ý hành động phong cách Gemini */}
                    <div className={`grid ${isCompactWidth ? "grid-cols-1 gap-2 mt-3" : "grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4"} w-full max-w-xl text-left px-1`}>
                      {quickPrompts.slice(0, 4).map((qp, idx) => (
                        <div
                          key={idx}
                          onClick={() => sendMessage(qp.prompt)}
                          className="p-2.5 sm:p-3 rounded-2xl bg-white hover:bg-emerald-50/70 border border-emerald-200 hover:border-emerald-400 transition cursor-pointer group shadow-xs hover:shadow-sm flex flex-col justify-between"
                        >
                          <div className="text-xs font-black text-emerald-800 group-hover:text-emerald-900 flex items-center justify-between">
                            <span>{qp.label}</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600">➔</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {qp.prompt}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. DANH SÁCH TIN NHẮN (MESSAGE STREAM - LIGHT THEME) */}
                {messages.map((m, idx) => {
                  const isAI = m.role === "model";

                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 sm:gap-2.5 ${isAI ? "" : "flex-row-reverse"} animate-fade-in`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 shadow-xs border ${isAI
                            ? "bg-gradient-to-tr from-emerald-600 to-teal-500 border-emerald-300 text-white"
                            : "bg-emerald-100 border-emerald-300 text-emerald-800 font-black"
                          }`}
                      >
                        {isAI ? "🍃" : (user?.username ? user.username.charAt(0).toUpperCase() : "U")}
                      </div>

                      {/* Bong bóng tin nhắn (Đã ẩn phần Suy nghĩ & Hành động tĩnh để gọn sạch giống Gemini) */}
                      <div className="max-w-[88%] sm:max-w-[82%] flex flex-col gap-1">
                        <div
                          className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed font-medium ${isAI
                              ? "bg-white text-slate-800 rounded-tl-none border border-emerald-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                              : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none border border-emerald-600 shadow-[0_2px_8px_rgba(16,185,129,0.25)]"
                            }`}
                        >
                          {isAI ? renderMessageContent(m.text, true) : <p className="whitespace-pre-line">{m.text}</p>}
                        </div>

                        {/* Nút điều hướng nhanh nếu Local Agent vừa kích hoạt mở trang */}
                        {isAI && Array.isArray(m.clientActions) && m.clientActions.some((a) => a.type === "NAVIGATE" && a.path) && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {m.clientActions
                              .filter((a) => a.type === "NAVIGATE" && a.path)
                              .map((navAct, nIdx) => (
                                <button
                                  key={nIdx}
                                  type="button"
                                  onClick={() => navigate(navAct.path)}
                                  className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-bold flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
                                >
                                  <span>🚀</span>
                                  <span>Đi tới: {navAct.label || navAct.path}</span>
                                </button>
                              ))}
                          </div>
                        )}

                        {/* Nút Sao chép câu trả lời */}
                        {isAI && (
                          <div className="flex items-center gap-2 px-1 text-[10px] text-slate-400">
                            <button
                              onClick={() => handleCopyMessage(m.text, idx)}
                              className="hover:text-emerald-700 transition cursor-pointer flex items-center gap-1 font-medium"
                            >
                              <span>{copiedIdx === idx ? "✓ Đã sao chép!" : "📋 Sao chép"}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Hiệu ứng Suy nghĩ & Xử lý dữ liệu phong cách Google Gemini (Chỉ hiện khi đang xử lý) */}
                {loading && (
                  <div className="flex items-start gap-2 sm:gap-2.5 animate-fade-in">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 border border-emerald-300 text-white flex items-center justify-center text-xs shrink-0 animate-pulse">
                      ✨
                    </div>
                    <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/80 to-white border border-emerald-200/90 px-3.5 py-2.5 rounded-2xl rounded-tl-none text-xs text-emerald-900 font-semibold flex items-center gap-2.5 shadow-xs">
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="inline-block w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                      <span className="text-[11px] text-emerald-800 font-semibold animate-pulse">
                        {statusText || "✨ Đang suy nghĩ & xử lý dữ liệu..."}
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* ─── VÙNG NHẬP LIỆU (GEMINI FLOATING INPUT FOOTER - LIGHT THEME) ─── */}
              <div className={`${isCompactWidth || isShortHeight ? "p-2 gap-1.5" : "p-2.5 sm:p-3 gap-2"} border-t border-emerald-200 bg-white/95 flex flex-col shrink-0`}>
                {/* Hộp xác nhận SQL Admin nếu có */}
                {pendingAction && !loading && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col gap-2 shadow-xs animate-fade-in">
                    <div className="text-[11px] text-amber-900 font-black flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>Xác minh lệnh CSDL từ Quản Trị Viên:</span>
                    </div>
                    <code className="text-[10px] bg-slate-100 p-2 rounded-lg text-slate-800 font-mono break-all leading-tight max-h-[70px] overflow-y-auto border border-amber-200">
                      {pendingAction.sql}
                    </code>
                    <div className="flex gap-2">
                      <button
                        onClick={handleConfirmAction}
                        className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-extrabold rounded-xl text-xs transition shadow-xs cursor-pointer"
                      >
                        Xác nhận thực thi
                      </button>
                      <button
                        onClick={handleCancelAction}
                        className="py-1.5 px-4 bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                      >
                        Hủy bỏ
                      </button>
                    </div>
                  </div>
                )}

                {/* Thanh Gợi Ý Nhanh (Chips) */}
                {user && !loading && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 gemini-scrollbar text-[10px]">
                    <span className="text-[9px] text-slate-400 font-bold uppercase shrink-0">Gợi ý:</span>
                    {quickPrompts.map((qp, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => sendMessage(qp.prompt)}
                        className="px-2.5 py-1 rounded-xl bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 hover:text-emerald-950 font-bold border border-emerald-200 whitespace-nowrap transition active:scale-95 shrink-0 cursor-pointer shadow-2xs"
                      >
                        {qp.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Hộp Nhập Liệu Phong Cách Gemini Floating Capsule */}
                {user ? (
                  <form onSubmit={handleSend} className="relative flex items-center">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Hỏi em về truyện tranh, nhân vật, thống kê hoặc nhập lệnh..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={loading}
                      className="w-full pl-3.5 sm:pl-4 pr-11 sm:pr-12 py-2.5 sm:py-3 bg-slate-50/80 border border-emerald-300 focus:border-emerald-500 focus:bg-white rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition shadow-inner"
                    />

                    <button
                      type="submit"
                      disabled={loading || !input.trim()}
                      className="absolute right-1.5 sm:right-2 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-tr from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-md"
                      title="Gửi tin nhắn"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transform rotate-45 mr-0.5 mt-0.5">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                      </svg>
                    </button>
                  </form>
                ) : (
                  <p className="text-center text-xs text-slate-600 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-200">
                    Hãy{" "}
                    <Link to="/login" onClick={() => setIsOpen(false)} className="text-emerald-700 font-extrabold hover:underline">
                      đăng nhập
                    </Link>{" "}
                    để cùng Nahida đắm chìm vào thế giới truyện tranh nhé! 🌿
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Modal xác nhận xóa tùy chỉnh (Thay thế window.confirm - Light Theme) */}
          {confirmModal.isOpen && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-[1000] flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white border border-emerald-300 rounded-2xl p-5 max-w-sm w-full shadow-2xl animate-scale-up text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-xl shrink-0 text-rose-600">
                    🗑️
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {confirmModal.title}
                    </h4>
                    <span className="text-[10px] text-rose-600 font-semibold">Hành động không thể hoàn tác</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-5">
                  {confirmModal.message}
                </p>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirmModal.onConfirm) confirmModal.onConfirm();
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>✕</span>
                    <span>{confirmModal.confirmLabel || "Xác nhận xóa"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIChatWidget;
