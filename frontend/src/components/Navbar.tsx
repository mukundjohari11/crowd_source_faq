import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';
import { Search, Bell, Sparkles, User, LogOut, ChevronDown, BookOpen, AlertCircle, HelpCircle, PlusSquare, Menu } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAskAIClick?: () => void;
  onToggleSidebar?: () => void;
}

export default function Navbar({ searchQuery, setSearchQuery, onAskAIClick, onToggleSidebar }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full h-[64px] z-50 bg-[#1c2025] border-b border-[#31353b]">
      <div className="flex items-center justify-between px-4 md:px-6 w-full h-full max-w-[1500px] mx-auto">
        
        {/* Brand & Search */}
        <div className="flex items-center gap-3">
          
          {/* Hamburger icon button to toggle side menu */}
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-[#e1bfb5] hover:bg-[#31353b]/60 hover:text-white transition-colors cursor-pointer focus:outline-none shrink-0"
            aria-label="Toggle navigation drawer"
            id="navbar-hamburger-btn"
          >
            <Menu className="w-5.5 h-5.5" />
          </button>

          {/* Styled BRAND LOGO matching user upload */}
          <Link to="/" className="flex items-center gap-2 group decoration-none">
            {/* Custom rounded box containing a crisp white V */}
            <div className="w-8 h-8 rounded-[10px] bg-[#4a80b4] flex items-center justify-center shadow-inner select-none shrink-0 transition-transform group-hover:scale-105 duration-200">
              <span className="text-white font-[950] text-[15px] select-none text-center">V</span>
            </div>
            {/* Elegant serif name */}
            <span className="text-sm sm:text-base font-serif font-medium text-[#f1f3f5] tracking-wide transition-all group-hover:opacity-90 leading-none">
              Vicharanashala
            </span>
            {/* Light blue outline monospace pill badge IIT Ropar */}
            <span className="bg-[#4a80b4]/10 text-[#a2c8ec] border border-[#4a80b4]/40 px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider select-none leading-none">
              IIT Ropar
            </span>
          </Link>
          
          {/* Global Reddit bar tool */}
          <div className="hidden lg:flex items-center bg-[#101419] px-3 py-1.5 rounded-xl border border-[#31353b] focus-within:border-[#ff6b35] transition-all ms-2">
            <Search className="text-[#e1bfb5] w-4 h-4 opacity-50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-xs ms-2.5 w-48 xl:w-64 placeholder-[#e1bfb5]/40"
              placeholder="Search posts or methodology..."
              id="global-search-bar"
            />
          </div>
        </div>

        {/* Global Links / Before vs After Login logic */}
        <div className="flex items-center gap-3 md:gap-4">
          
          {/* Shared Links */}
          <Link 
            to="/faq" 
            className="text-xs font-bold text-[#e1bfb5] hover:text-[#ffb59d] flex items-center gap-1 py-1.5 px-2 hover:bg-[#31353b]/30 rounded-lg transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-[#5bd5fc]" />
            <span className="hidden sm:inline">FAQ Portal</span>
          </Link>

          <Link 
            to="/ask-question" 
            className="text-xs font-bold text-[#e1bfb5] hover:text-[#ffb59d] flex items-center gap-1 py-1.5 px-2 hover:bg-[#31353b]/30 rounded-lg transition-colors"
          >
            <PlusSquare className="w-4 h-4 text-[#ffb59d]" />
            <span className="hidden sm:inline">Ask Question</span>
          </Link>

          {onAskAIClick && (
            <button
              onClick={onAskAIClick}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#ff6b35]/15 border border-[#ff6b35]/35 hover:bg-[#ff6b35]/25 text-[#ffb59d] font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Consult AI</span>
            </button>
          )}

          <div className="w-[1px] h-5 bg-[#31353b] hidden sm:block"></div>

          {!isAuthenticated ? (
            /* BEFORE LOGIN VIEW */
            <div className="flex items-center gap-2">
              <Link 
                to="/login"
                className="text-xs font-bold text-white hover:text-[#ffb59d] px-3.5 py-2 hover:bg-[#31353b]/50 rounded-xl transition-all"
              >
                Log In
              </Link>
              <Link 
                to="/signup"
                className="text-xs font-extrabold bg-[#ff6b35] hover:bg-[#ff8c5a] text-white px-3.5 py-2 rounded-xl transition-all shadow-md shadow-[#ff6b35]/10 whitespace-nowrap"
              >
                Register
              </Link>
            </div>
          ) : (
            /* AFTER LOGIN VIEW */
            <div className="flex items-center gap-3 relative">
              
              {/* Notification Bell */}
              <button 
                onClick={() => alert('No new fellowship alerts. Live research streams are currently tranquil.')}
                className="relative p-2 text-[#ffb59d] hover:bg-[#31353b]/60 rounded-full transition-all cursor-pointer group"
                id="navbar-alert-bell"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              </button>

              {/* User Avatar Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 py-1 px-1.5 hover:bg-[#101419] rounded-xl border border-transparent hover:border-[#31353b] transition-all cursor-pointer select-none"
                  id="user-profile-menu-button"
                >
                  <img
                    alt={user?.name}
                    className="w-7 h-7 rounded-full border border-[#ff6b35]/50 shrink-0"
                    src={user?.avatar}
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-[#e1bfb5]" />
                </button>

                {dropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setDropdownOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-3 w-56 bg-[#1c2025] border border-[#31353b] rounded-2xl shadow-2xl py-3 z-50 animate-fade-in text-xs">
                      
                      <div className="px-4 py-2 border-b border-[#31353b]/60 mb-2">
                        <p className="font-bold text-white text-sm truncate">{user?.name}</p>
                        <p className="text-[10px] text-[#e1bfb5] opacity-60 truncate mt-0.5">{user?.email}</p>
                        <span className="inline-block mt-1 bg-[#ff6b35]/10 text-[#ffb59d] text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded border border-[#ff6b35]/20">
                          {user?.title}
                        </span>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => { setDropdownOpen(false); }}
                        className="flex items-center gap-3 px-4 py-2 text-[#e1bfb5] hover:text-white hover:bg-[#31353b]/50 transition-colors"
                      >
                        <User className="w-4 h-4 text-[#ffb59d]" />
                        <span>My Scholar Profile</span>
                      </Link>

                      <Link
                        to="/"
                        onClick={() => { setDropdownOpen(false); }}
                        className="flex items-center gap-3 px-4 py-2 text-[#e1bfb5] hover:text-white hover:bg-[#31353b]/50 transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-[#5bd5fc]" />
                        <span>Research Feed</span>
                      </Link>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate('/ask-question');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-[#e1bfb5] hover:text-white text-left hover:bg-[#31353b]/50 transition-colors cursor-pointer"
                      >
                        <PlusSquare className="w-4 h-4 text-[#ffb59d]" />
                        <span>Ask New Question</span>
                      </button>

                      <div className="h-[1px] bg-[#31353b]/60 my-2"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 text-left hover:bg-red-500/10 transition-colors cursor-pointer font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout Account</span>
                      </button>

                    </div>
                  </>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </nav>
  );
}
