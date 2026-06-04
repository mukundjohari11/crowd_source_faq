import React, { useState, useMemo, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/context/AuthContext';
import { FAQItem, RelatedQuestionMeta } from './types';

// Page Components
import Home from './pages/Home';
import FAQ from './pages/FAQ';
import AskQuestion from './pages/AskQuestion';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';

// Global Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';

// Styling Icons
import { Sparkles, Sparkle, X, Send, AlertCircle } from 'lucide-react';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Search queries shared from Navbar to pages
  const [searchQuery, setSearchQuery] = useState('');

  // Sidebar collapsible state: hidden on mobile (< 768px) and open on desktop (>= 768px)
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });

  // AI Modal/Drawer States (Gemini AI Expert Consultant)
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ role: 'user' | 'model'; text: string }>>([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Load list of all questions to supply statistics / related questions to RightSidebar
  const [allQuestions, setAllQuestions] = useState<FAQItem[]>([]);

  useEffect(() => {
    let active = true;
    async function loadAll() {
      try {
        const res = await fetch('/api/posts');
        if (res.ok && active) {
          const data = await res.json();
          setAllQuestions(data);
        }
      } catch (err) {
        console.error('Failed to update sidebar metrics:', err);
      }
    }
    loadAll();
    return () => { active = false; };
  }, [location]);

  // Derived related FAQs for RightSidebar
  const relatedQuestionMetas = useMemo((): RelatedQuestionMeta[] => {
    // Return up to 3 highest-rated questions that are not the current one
    const activeId = new URLSearchParams(location.search).get('id');
    return allQuestions
      .filter(q => q.id !== activeId)
      .slice(0, 3)
      .map(q => ({
        id: q.id,
        title: q.title,
        commentsCount: q.commentsCount,
        views: q.views
      }));
  }, [allQuestions, location]);

  const presetAIPrompts = [
    `Summarize Dr. Chatterjee's structure for the literature review`,
    `How to highlight the Critical Gap inside a fellowship application?`,
    `What are the standard requirements for Vicharanashala stipends?`
  ];

  // Call server-side Gemini 3.5 API
  const handleAskAI = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiPrompt.trim() || isAILoading) return;

    const userMsg = aiPrompt;
    setAiChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiPrompt('');
    setIsAILoading(true);
    setAiError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg,
          context: {
            currentPath: location.pathname + location.search,
            authenticated: isAuthenticated,
            questionIndex: allQuestions.map(q => ({ id: q.id, title: q.title }))
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server error calling AI advisor');
      }

      const data = await response.json();
      setAiChatHistory(prev => [...prev, { role: 'model', text: data.text }]);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Advisory server connection unsuccessful. Ensure GEMINI_API_KEY is configured correctly.');
    } finally {
      setIsAILoading(false);
    }
  };

  // Check if current route is a standalone page where full layout headers are suppressed (e.g. login/signup)
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    );
  }

  return (
    <div className="bg-[#101419] text-[#e0e2ea] min-h-screen font-sans selection:bg-[#ff6b35]/30">
      
      {/* Dynamic Navigation Bar */}
      <Navbar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onAskAIClick={() => setIsAIModalOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
      />

      {/* Mobile backdrop overlay that closes the sidebar when clicked */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 top-[64px] bg-black/60 z-30 md:hidden transition-opacity duration-300 pointer-events-auto"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Grid structure */}
      <div className={`pt-[64px] flex w-full max-w-[1550px] mx-auto min-h-[calc(100vh-64px)] transition-all duration-300 ${
        isSidebarOpen ? 'md:pl-[240px]' : 'md:pl-0'
      }`}>
        
        {/* Dynamic Navigation Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          onResetFilters={() => setSearchQuery('')} 
        />

        {/* Center Live Forum Content Column */}
        <main className="flex-1 p-4 md:p-6 lg:p-7 border-r border-[#31353b] max-w-[860px] min-w-0">
          <Routes>
            <Route path="/" element={<Home searchQuery={searchQuery} />} />
            <Route path="/bookmarks" element={<Home searchQuery={searchQuery} />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/ask" element={<AskQuestion />} />
            <Route path="/ask-question" element={<AskQuestion />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>

        {/* Dynamic Context Right Sidebar */}
        <RightSidebar 
          relatedMetas={relatedQuestionMetas}
          onSelectQuestion={(id) => {
            navigate(`/faq?id=${id}`);
          }}
          onTagSelect={(cat) => {
            setSearchQuery(cat);
            navigate('/');
          }}
        />

      </div>

      {/* Corporate Modern Footer */}
      <footer className={`bg-[#0a0e13] border-t border-[#31353b] w-full py-8 mt-16 select-none text-xs transition-all duration-300 ${
        isSidebarOpen ? 'md:pl-[240px]' : 'md:pl-0'
      }`}>
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
            <span className="text-sm font-bold bg-gradient-to-r from-[#ffb59d] to-[#ff6b35] bg-clip-text text-transparent">Vicharanashala</span>
            <span className="text-[#e1bfb5] opacity-50 font-medium">© 2026 Vicharanashala Community. Dedicated to Scientific Research and Academic Excellence.</span>
          </div>
          <div className="flex gap-6">
            {['About', 'Privacy', 'Guidelines'].map((link) => (
              <a
                key={link}
                href="#"
                className="text-[#e1bfb5]/70 hover:text-[#ffb59d] transition-colors"
                onClick={(e) => { e.preventDefault(); alert(`Vicharanashala "${link}" documentation is currently preloaded.`); }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* Floating Sparkles AI Assistant Slider Drawer Overlay */}
      {isAIModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex justify-end animate-fade-in text-xs">
          <div className="w-full max-w-[480px] bg-[#1c2025] h-full shadow-2xl border-l border-[#31353b] flex flex-col relative">
            
            {/* Header */}
            <div className="p-5 border-b border-[#31353b] flex items-center justify-between bg-[#181c21]">
              <div className="flex items-center gap-2">
                <Sparkle className="w-5 h-5 text-[#ff6b35]" />
                <div>
                  <h3 className="font-bold text-sm text-white">Ask AI Forum Advisor</h3>
                  <p className="text-[10px] text-[#e1bfb5]">Powered by Gemini 3.5 Flash server-side</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAIModalOpen(false)}
                className="p-1.5 text-[#e1bfb5] hover:bg-[#31353b] rounded-full transition-colors cursor-pointer"
                id="close-sidebar-ai"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Path contextual indicator */}
            <div className="p-3.5 bg-[#ff6b35]/10 border-b border-[#ff6b35]/20 text-[11px] text-[#ffb59d] flex items-center gap-2 select-none">
              <Sparkles className="w-4 h-4 shrink-0 text-[#ff6b35]" />
              <span>
                Looking at path: <code className="bg-[#101419] px-1.5 py-0.5 rounded text-white font-mono">{location.pathname + location.search}</code>
              </span>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* Bot Welcome Greeting Card */}
              <div className="p-4 bg-[#181c21] rounded-xl border border-[#31353b] space-y-2">
                <p className="font-bold text-[#ffb59d] flex items-center gap-1.5">
                  🎓 Welcome Scholar!
                </p>
                <p className="leading-relaxed text-[#e0e2ea] opacity-90 font-medium">
                  Welcome back! I can clarify lit-review criteria, stipend GPA calculations, help with research topics, or give feedback on Statement of Purpose drafts. Select a preset query or ask me anything custom!
                </p>
              </div>

              {/* Chat history */}
              {aiChatHistory.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex flex-col max-w-[85%] ${
                    msg.role === 'user' ? 'ms-auto items-end' : 'items-start'
                  }`}
                >
                  <span className="text-[9px] uppercase tracking-wider text-[#e1bfb5]/40 mb-1 font-bold">
                    {msg.role === 'user' ? 'You' : 'AI Mentor'}
                  </span>
                  
                  <div className={`p-3.5 rounded-2xl leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-[#ff6b35] text-white rounded-tr-xs animate-fade-in' 
                      : 'bg-[#181c21] border border-[#31353b] text-[#e0e2ea]/95 rounded-tl-xs whitespace-pre-wrap select-text animate-fade-in'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Loading circle */}
              {isAILoading && (
                <div className="flex items-center gap-2 bg-[#181c21] border border-[#31353b] p-3 rounded-xl max-w-[65%] animate-pulse">
                  <div className="w-4 h-4 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[#e1bfb5] opacity-70">Synthesizing solution...</span>
                </div>
              )}

              {/* Fail Error alert */}
              {aiError && (
                <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-300 rounded-xl space-y-2 flex gap-3 items-start">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-red-200">Advisor offline</h5>
                    <p className="opacity-95 leading-relaxed">{aiError}</p>
                    <button 
                      onClick={() => handleAskAI()}
                      className="text-[10px] uppercase font-bold text-[#ffb59d] hover:underline block mt-1"
                    >
                      Retry Connection
                    </button>
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {aiChatHistory.length === 0 && (
                <div className="pt-4 space-y-2 select-none">
                  <p className="text-[10px] text-[#e1bfb5] uppercase tracking-wider font-bold opacity-60">Suggested Questions</p>
                  <div className="flex flex-col gap-2">
                    {presetAIPrompts.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setAiPrompt(p); }}
                        className="text-left p-2.5 rounded-lg bg-[#262a30]/60 hover:bg-[#262a30] border border-[#31353b] text-[#5bd5fc] flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="truncate pr-4">{p}</span>
                        <span>→</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Input Action Form */}
            <form onSubmit={handleAskAI} className="p-4 bg-[#181c21] border-t border-[#31353b] flex gap-2">
              <input 
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask Vicharanashala AI Advisor..."
                className="flex-1 bg-[#101419] border border-[#31353b] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff6b35] transition-all"
                disabled={isAILoading}
                id="drawer-ai-input"
              />
              <button
                type="submit"
                disabled={!aiPrompt.trim() || isAILoading}
                className="bg-[#ff6b35] hover:bg-[#ff8c5a] disabled:opacity-40 text-white p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
              >
                <span>Send</span>
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
