import React, { useState } from "react";
import {
  LuBookOpen,
  LuSparkles,
  LuCrown,
  LuLock,
  LuShieldAlert,
  LuBot,
  LuCompass,
  LuChevronDown,
  LuSearch,
  LuCheck,
} from "react-icons/lu";

const GUIDE_SECTIONS = [
  {
    id: "reading",
    title: "1. Đọc truyện, Theo dõi & Phím tắt điều hướng",
    badge: "Cơ bản",
    Icon: LuBookOpen,
    items: [
      "Khi đang ở trang đọc chương, bạn có thể nhấn phím mũi tên Trái (←) để lùi về chương trước và mũi tên Phải (→) để sang chương tiếp theo.",
      "Thanh điều hướng cố định dưới đáy màn hình cho phép mở nhanh Danh sách chương, bật/tắt Bảng thông tin bên trái và bấm Theo dõi bộ truyện.",
      "Hệ thống tự động ghi nhớ vị trí cuộn trang và lưu vào mục 'Lịch sử đọc' để bạn tiếp tục đọc bất cứ lúc nào.",
    ],
  },
  {
    id: "rpg",
    title: "2. Hệ thống Gamification RPG – Cây Thế Giới Irminsul",
    badge: "RPG",
    Icon: LuCompass,
    items: [
      "Mỗi khi đọc chương mới, bình luận hoặc làm nhiệm vụ, bạn nhận được XP, Ký Ức Irminsul và có cơ hội nhặt Vật Phẩm Rơi (Loot Drop) mỗi 5 giây đọc.",
      "Hệ thống gồm 13 Tầng Cảnh Giới (từ 'Người Mới Thức Tỉnh' đến 'Hóa Thân Irminsul') và 10 Bậc Danh Vọng từ F → EX.",
      "Khi đạt các mốc cấp độ đột phá (Cấp 20, 40, 60...), hãy vào mục 'Balo & Chế Tạo' để luyện Thuốc Phù Thủy và bấm Đột Phá Cảnh Giới trên thẻ hồ sơ.",
    ],
  },
  {
    id: "checkin_quest",
    title: "3. Lịch Điểm Danh 7 Ngày & Nhiệm Vụ AI Cá Nhân",
    badge: "Thưởng mỗi ngày",
    Icon: LuSparkles,
    items: [
      "Tại tab 'Nhiệm Vụ', hãy điểm danh hằng ngày theo chu kỳ 7 ngày. Phần thưởng tăng dần từ Ngày 1 đến Ngày 7 (Rương Đại Thụ Irminsul tặng 120 Tinh Thạch + Lá Cây Thế Giới).",
      "Ngoài nhiệm vụ cố định, bạn có thể bấm nút 'AI Giao Nhiệm Vụ Cá Nhân' để Tiểu Thảo Thần Nahida phân tích sở thích đọc và tạo tới 2 nhiệm vụ riêng mỗi ngày.",
      "Xem thứ hạng của bạn so với các lữ khách khác tại Bảng Phong Thần (Leaderboard) ngay trong tab Nhiệm Vụ.",
    ],
  },
  {
    id: "vip_deposit",
    title: "4. Nạp Tinh Thạch Tự Động & Đặc Quyền VIP",
    badge: "VIP & Nạp",
    Icon: LuCrown,
    items: [
      "Tại tab 'VIP & Nạp', bạn có thể nạp Tinh Thạch (World Crystal) tự động theo tỉ giá 1.000đ = 10 Tinh Thạch (tặng thêm tới 25% khi nạp gói lớn).",
      "Chọn gói nạp -> bấm 'Tạo Mã QR Nạp Tự Động' -> quét mã VietQR/MoMo/ZaloPay hoặc bấm nút xác nhận thanh toán tự động để hệ thống cộng Tinh Thạch ngay lập tức.",
      "Dùng Tinh Thạch để đăng ký 2 gói VIP: 'Lữ Khách Ánh Sao' (500 Tinh Thạch / 7 ngày: đọc chương VIP, giảm 20% mở khóa chương, +10% XP, 60 lượt AI/ngày) hoặc 'Hộ Vệ Irminsul' (1800 Tinh Thạch / 30 ngày: giảm 50% mở chương, +20% XP, 200 lượt AI/ngày).",
    ],
  },
  {
    id: "chapter_lock",
    title: "5. Cơ chế Khóa Chương & Mở Khóa Vĩnh Viễn",
    badge: "Khóa chương",
    Icon: LuLock,
    items: [
      "Các chương đặc biệt hoặc ra mắt sớm (Early-Access) sẽ có nhãn Khóa Tinh Thạch hoặc nhãn Vương Miện VIP.",
      "Chương VIP: Thành viên đang có VIP được đọc miễn phí ngay lập tức.",
      "Chương Tinh Thạch: Mở khóa 1 lần bằng Tinh Thạch để sở hữu vĩnh viễn. Thành viên VIP được giảm 20% – 50% chi phí mở khóa. Nếu chương có hẹn giờ mở miễn phí (free_at), bạn cũng có thể chờ đến thời điểm đó để đọc miễn phí.",
    ],
  },
  {
    id: "age_notice",
    title: "6. Nhãn Độ Tuổi (ALL, 13+, 16+, 18+) & Cảnh Báo Admin",
    badge: "An toàn",
    Icon: LuShieldAlert,
    items: [
      "Mỗi bộ truyện đều được gắn nhãn giới hạn độ tuổi rõ ràng trên ảnh bìa và trang thông tin truyện: ALL (Mọi lứa tuổi), 13+, 16+ hoặc 18+.",
      "Khi truy cập truyện 18+, hệ thống sẽ yêu cầu xác nhận năm sinh để bảo vệ độc giả nhỏ tuổi.",
      "Các thông báo quan trọng từ Quản trị viên hoặc Nhóm dịch (Cảnh báo nội dung, Ghi chú dịch thuật, Cảnh báo Spoiler ẩn nội dung, Lịch ra chương) được hiển thị nổi bật ngay đầu trang truyện.",
    ],
  },
  {
    id: "ai_features",
    title: "7. Trợ Lý AI Nahida, Smart Recap & Công Cụ Dịch Giả",
    badge: "Trí tuệ nhân tạo",
    Icon: LuBot,
    items: [
      "Nút Trợ lý AI ở góc phải dưới màn hình giúp bạn tìm truyện bằng câu mô tả tự nhiên (ví dụ: 'tìm truyện main chuyển sinh nấu ăn'), giải đáp cốt truyện và hướng dẫn sử dụng web.",
      "Smart Recap: Khi bạn quay lại đọc một bộ truyện sau thời gian dài, AI sẽ tóm tắt nhanh diễn biến các chương trước để bạn bắt nhịp ngay.",
      "Dành cho Dịch giả & Admin: Khi đăng/sửa truyện hoặc chương, AI hỗ trợ quét ảnh tạo tóm tắt chương, gợi ý tiêu đề chương và tự động gợi ý Nhãn độ tuổi + Cảnh báo nội dung.",
    ],
  },
];

export default function UserGuide() {
  const [search, setSearch] = useState("");
  const [openIds, setOpenIds] = useState(() =>
    GUIDE_SECTIONS.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
  );

  const toggleSection = (id) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = GUIDE_SECTIONS.filter((sec) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      sec.title.toLowerCase().includes(q) ||
      sec.badge.toLowerCase().includes(q) ||
      sec.items.some((it) => it.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-white/95 rounded-3xl border border-emerald-100 p-6 shadow-sm space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-100 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800">
            <LuBookOpen className="w-3.5 h-3.5" /> Cẩm nang Lữ Khách Irminsul
          </span>
          <h2 className="text-xl font-black text-emerald-950 mt-1">
            Hướng Dẫn Sử Dụng Toàn Tập
          </h2>
          <p className="text-xs text-slate-600">
            Tra cứu nhanh mọi tính năng đọc truyện, hệ thống tu luyện RPG, VIP, mở khóa chương và trợ lý AI.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <LuSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm trong hướng dẫn (VD: VIP, khóa chương...)"
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-emerald-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-emerald-50/30"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((sec) => {
          const Icon = sec.Icon;
          const isOpen = Boolean(openIds[sec.id]);
          return (
            <div
              key={sec.id}
              className="rounded-2xl border border-emerald-100/90 bg-emerald-50/20 overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggleSection(sec.id)}
                className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-emerald-50/60 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 shadow-sm">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-sm sm:text-base text-emerald-950 truncate">
                    {sec.title}
                  </span>
                  <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                    {sec.badge}
                  </span>
                </div>
                <LuChevronDown
                  className={`w-4 h-4 text-emerald-700 transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-4 pt-1 border-t border-emerald-100/60 bg-white space-y-2">
                  {sec.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed py-1"
                    >
                      <LuCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

