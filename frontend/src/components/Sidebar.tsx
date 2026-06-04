import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';
import { Home, HelpCircle, PlusSquare, Bookmark, User, Cpu, ChevronRight } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onResetFilters?: () => void;
}

export default function Sidebar({ isOpen, onClose, onResetFilters }: SidebarProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const isHomeActive = location.pathname === '/' && !location.search;
  const isFaqActive = location.pathname === '/faq';
  const isAskActive = location.pathname === '/ask-question' || location.pathname === '/ask';
  const isBookmarksActive = location.pathname === '/bookmarks';
  const isProfileActive = location.pathname === '/profile';

  const handleLinkClick = () => {
    // If screen size is mobile, automatically slide sidebar closed upon navigation
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <aside 
      className={`fixed left-0 top-[64px] h-[calc(100vh-64px)] w-[240px] z-45 bg-[#101419] border-r border-[#31353b] flex flex-col p-4 gap-2 text-xs transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      id="unified-collapsible-sidebar"
    >
      
      {/* Brand Badge inside Sidebar */}
      <div className="mb-6 px-2 select-none">
        <p className="text-sm font-extrabold text-[#e0e2ea] tracking-tight flex items-center gap-1.5">
          <span>Vicharanashala</span>
          <span className="w-1.5 h-1.5 bg-[#ff6b35] rounded-full animate-ping"></span>
        </p>
      </div>

      {/* Main navigation list using Router paths */}
      <div className="flex flex-col gap-1">
        <p className="px-3 text-[9px] uppercase tracking-widest font-extrabold text-[#e1bfb5]/40 mb-2">Navigation Streams</p>

        {/* Home route */}
        <Link
          to="/"
          onClick={() => {
            if (onResetFilters) onResetFilters();
            handleLinkClick();
          }}
          className={`flex items-center justify-between w-full p-2.5 rounded-xl transition-all text-left font-semibold border ${
            isHomeActive
              ? 'bg-[#ffebe6]/10 text-[#ffb59d] border-[#ff6b35]/30'
              : 'text-[#e1bfb5] hover:bg-[#1c2025]/60 hover:text-white border-transparent'
          }`}
          id="sidebar-home-route"
        >
          <div className="flex items-center gap-3">
            <Home className="w-4 h-4 shrink-0" />
            <span>Home Feed</span>
          </div>
          {isHomeActive && <ChevronRight className="w-3 h-3 text-[#ff6b35]" />}
        </Link>

        {/* FAQs Portal route */}
        <Link
          to="/faq"
          onClick={handleLinkClick}
          className={`flex items-center justify-between w-full p-2.5 rounded-xl transition-all text-left font-semibold border ${
            isFaqActive
              ? 'bg-[#ffebe6]/10 text-[#ffb59d] border-[#ff6b35]/30'
              : 'text-[#e1bfb5] hover:bg-[#1c2025]/60 hover:text-white border-transparent'
          }`}
          id="sidebar-faq-route"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-4 h-4 shrink-0 text-[#5bd5fc]" />
            <span>FAQs Portal</span>
          </div>
          {isFaqActive && <ChevronRight className="w-3 h-3 text-[#5bd5fc]" />}
        </Link>

        {/* Ask Question route */}
        <Link
          to="/ask-question"
          onClick={handleLinkClick}
          className={`flex items-center justify-between w-full p-2.5 rounded-xl transition-all text-left font-semibold border ${
            isAskActive
              ? 'bg-[#ffebe6]/10 text-[#ffb59d] border-[#ff6b35]/30'
              : 'text-[#e1bfb5] hover:bg-[#1c2025]/60 hover:text-white border-transparent'
          }`}
          id="sidebar-ask-route"
        >
          <div className="flex items-center gap-3">
            <PlusSquare className="w-4 h-4 shrink-0 text-[#ffb59d]" />
            <span>Ask Question</span>
          </div>
          {isAskActive && <ChevronRight className="w-3 h-3 text-[#ffb59d]" />}
        </Link>

        {/* Authenticated Only Streams */}
        {isAuthenticated && (
          <>
            <div className="h-[1px] bg-[#31353b]/40 my-2" />
            <p className="px-3 text-[9px] uppercase tracking-widest font-extrabold text-[#e1bfb5]/40 mb-2">Personal Streams</p>

            {/* My Posts route */}
            <Link
              to="/profile"
              onClick={handleLinkClick}
              className={`flex items-center justify-between w-full p-2.5 rounded-xl transition-all text-left font-semibold border ${
                location.pathname === '/profile' && !location.search.includes('bookmarks')
                  ? 'bg-[#ffebe6]/10 text-[#ffb59d] border-[#ff6b35]/30'
                  : 'text-[#e1bfb5] hover:bg-[#1c2025]/60 hover:text-white border-transparent'
              }`}
              id="sidebar-my-posts-route"
            >
              <div className="flex items-center gap-3">
                <Cpu className="w-4 h-4 shrink-0 text-indigo-400" />
                <span>My Posts</span>
              </div>
              {location.pathname === '/profile' && !location.search.includes('bookmarks') && <ChevronRight className="w-3 h-3 text-indigo-400" />}
            </Link>

            {/* Bookmarks route */}
            <Link
              to="/bookmarks"
              onClick={handleLinkClick}
              className={`flex items-center justify-between w-full p-2.5 rounded-xl transition-all text-left font-semibold border ${
                isBookmarksActive
                  ? 'bg-[#ffebe6]/10 text-[#ffb59d] border-[#ff6b35]/30'
                  : 'text-[#e1bfb5] hover:bg-[#1c2025]/60 hover:text-white border-transparent'
              }`}
              id="sidebar-bookmarks-route"
            >
              <div className="flex items-center gap-3">
                <Bookmark className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Saved Posts</span>
              </div>
              {isBookmarksActive && <ChevronRight className="w-3 h-3 text-amber-400" />}
            </Link>

            {/* Profile route */}
            <Link
              to="/profile"
              onClick={handleLinkClick}
              className={`flex items-center justify-between w-full p-2.5 rounded-xl transition-all text-left font-semibold border ${
                isProfileActive
                  ? 'bg-[#ffebe6]/10 text-[#ffb59d] border-[#ff6b35]/30'
                  : 'text-[#e1bfb5] hover:bg-[#1c2025]/60 hover:text-white border-transparent'
              }`}
              id="sidebar-profile-route"
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>My Profile</span>
              </div>
              {isProfileActive && <ChevronRight className="w-3 h-3 text-emerald-400" />}
            </Link>
          </>
        )}
      </div>

      {/* Decorative Quick statistics or academic guidance blocks */}
      <div className="mt-auto space-y-3 pt-4 border-t border-[#31353b]/60">
        <div className="bg-[#181c21] p-3.5 rounded-2xl border border-[#31353b]/80 space-y-2.5 select-none">
          <p className="font-extrabold text-[#ffb59d] tracking-wider uppercase text-[9px] flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-[#5bd5fc]" />
            <span>Platform Stats</span>
          </p>
          <div className="space-y-1.5 text-[10px]">
            <div className="flex justify-between text-[#e1bfb5] opacity-60">
              <span>Academic status:</span>
              <span className="font-bold text-green-400">Live</span>
            </div>
            <div className="flex justify-between text-[#e1bfb5] opacity-60">
              <span>Active users:</span>
              <span className="font-bold text-white">4.2k online</span>
            </div>
          </div>
        </div>

        {isAuthenticated && (
          <div className="px-2 py-1 flex items-center gap-2 select-none">
            <img 
              alt={user?.name} 
              className="w-5 h-5 rounded-full border border-green-500"
              src={user?.avatar} 
            />
            <span className="text-[10px] text-[#e1bfb5] truncate">Logged as: <strong>{user?.name}</strong></span>
          </div>
        )}
      </div>

    </aside>
  );
}
