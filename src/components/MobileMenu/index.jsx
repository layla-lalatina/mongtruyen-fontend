import React from "react";
import { MobileNavLinks } from "./MobileNavLinks";
import { MobileUserBar } from "./MobileUserBar";

/**
 * 🌳 SYSTEM: IRMINSUL FANTASY RPG - MOBILE MENU CONTAINER
 * @file index.jsx
 * @path fontend/src/components/MobileMenu/index.jsx
 */
function MobileMenu({
  open,
  onClose,
  categories,
  user,
  onLogout,
  historyComics,
  readingHistory,
}) {
  return (
    <div
      className={`fixed inset-0 z-[999] bg-emerald-950/20 backdrop-blur-sm transition-opacity duration-200 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 right-0 h-full w-72 max-w-full bg-[#f3fbf8]/95 backdrop-blur-md text-emerald-950 shadow-2xl z-[1000] transform transition-transform duration-300 border-l border-emerald-100/50 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-emerald-100/50">
          <span className="font-extrabold text-lg text-emerald-950 flex items-center gap-1.5">
            <span>Menu Lữ Hành 🍃</span>
          </span>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-emerald-800 hover:text-emerald-500 transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-4 overflow-y-auto h-[calc(100vh-64px)] custom-scrollbar">
          <MobileNavLinks
            categories={categories}
            user={user}
            historyComics={historyComics}
            readingHistory={readingHistory}
            onClose={onClose}
          />
          <MobileUserBar user={user} onLogout={onLogout} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}

export default MobileMenu;
