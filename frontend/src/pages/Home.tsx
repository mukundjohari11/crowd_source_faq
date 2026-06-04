import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';
import { FAQItem } from '../types';
import { 
  ArrowUp, 
  ArrowDown, 
  MessageSquare, 
  Eye, 
  Bookmark, 
  Info,
  PlusCircle,
  FileImage
} from 'lucide-react';

interface HomeProps {
  searchQuery: string;
}

export default function Home({ searchQuery }: HomeProps) {
  const { isAuthenticated, bookmarks, toggleBookmark, token } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isBookmarksRoute = location.pathname === '/bookmarks';
  const filterType = isBookmarksRoute ? 'bookmarks' : searchParams.get('filter'); // 'bookmarks' | 'mine' or undefined
  const navigate = useNavigate();

  // Redirect to login if unauthenticated on bookmarks route
  useEffect(() => {
    if (isBookmarksRoute && !isAuthenticated) {
      navigate('/login');
    }
  }, [isBookmarksRoute, isAuthenticated, navigate]);

  const [questions, setQuestions] = useState<FAQItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'high' | 'new' | 'popular'>('high');
  const [loading, setLoading] = useState(false);

  // Synchronize and load questions dynamically from the backend Express API
  useEffect(() => {
    let active = true;
    async function loadPosts() {
      setLoading(true);
      try {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        let sortingParam = 'hot';
        if (sortBy === 'new') sortingParam = 'new';
        if (sortBy === 'popular') sortingParam = 'views';

        let url = `/api/posts?sort=${sortingParam}`;
        if (selectedCategory) {
          url += `&category=${selectedCategory}`;
        }
        if (searchQuery.trim()) {
          url += `&search=${encodeURIComponent(searchQuery)}`;
        }
        if (filterType === 'mine') {
          url += `&myQuestions=true`;
        }
        if (filterType === 'bookmarks') {
          url += `&bookmarked=true`;
        }

        const res = await fetch(url, { headers });
        if (res.ok && active) {
          const data = await res.json();
          setQuestions(data);
        }
      } catch (err) {
        console.error('Failed to sync forum posts:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadPosts();
    return () => { active = false; };
  }, [sortBy, selectedCategory, searchQuery, filterType, token]);

  const handleVote = async (id: string, dir: 'up' | 'down') => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Optimistically update the UI numbers
    setQuestions(prev => prev.map(item => {
      if (item.id !== id) return item;
      
      let diff = 0;
      let newVoted: 'up' | 'down' | null = null;
      
      if (item.voted === dir) {
        diff = dir === 'up' ? -1 : 1;
        newVoted = null;
      } else {
        if (item.voted === null || item.voted === undefined) {
          diff = dir === 'up' ? 1 : -1;
        } else {
          diff = dir === 'up' ? 2 : -2;
        }
        newVoted = dir;
      }

      return {
        ...item,
        upvotes: item.upvotes + diff,
        voted: newVoted
      };
    }));

    try {
      const match = questions.find(q => q.id === id);
      const targetDir = match?.voted === dir ? null : dir;

      const res = await fetch(`/api/posts/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ dir: targetDir })
      });
      
      if (res.ok) {
        const data = await res.json();
        setQuestions(prev => prev.map(item => {
          if (item.id === id) {
            return {
              ...item,
              upvotes: data.upvotes,
              voted: data.voted
            };
          }
          return item;
        }));
      }
    } catch (e) {
      console.error('Failed to sync voting metrics:', e);
    }
  };

  const categories = ['ALL', 'RESEARCH', 'STIPENDS', 'MENTORSHIP', 'CAREERS', 'OPEN_SOURCE'];

  return (
    <div className="space-y-6">
      
      {/* Banner / Overview Header */}
      <section className="bg-gradient-to-r from-[#1c2025] to-[#101419] border border-[#31353b] rounded-2xl p-6 relative overflow-hidden shadow-md">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#ff6b35]/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-[#ff6b35]/15 text-[#ffb59d] px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border border-[#ff6b35]/20">
              Vicharanashala Research Hub
            </span>
            <span className="text-xs text-[#e1bfb5] opacity-60">Academic Year 2026</span>
          </div>
          
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight leading-snug">
            Welcome to the Scholar Discussion Board
          </h2>
          <p className="text-xs text-[#e1bfb5] opacity-85 mt-2 leading-relaxed">
            A collaborative forum built with a Reddit-inspired layout. Post engineering questions, explore research proposals, verify stipend qualifiers, and seek expert reviews.
          </p>
        </div>
      </section>

      {/* Sorting bar & Options */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1c2025]/50 p-3 rounded-xl border border-[#31353b]/80">
        
        {/* Sort triggers */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setSortBy('high')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              sortBy === 'high' 
                ? 'bg-[#ffebe6]/10 text-[#ffb59d]' 
                : 'text-[#e1bfb5] hover:bg-[#101419]/80 hover:text-white'
            }`}
          >
            🔥 Best
          </button>
          
          <button
            onClick={() => setSortBy('new')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              sortBy === 'new' 
                ? 'bg-[#ffebe6]/10 text-[#ffb59d]' 
                : 'text-[#e1bfb5] hover:bg-[#101419]/80 hover:text-white'
            }`}
          >
            ⚡ Newest
          </button>

          <button
            onClick={() => setSortBy('popular')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              sortBy === 'popular' 
                ? 'bg-[#ffebe6]/10 text-[#ffb59d]' 
                : 'text-[#e1bfb5] hover:bg-[#101419]/80 hover:text-white'
            }`}
          >
            📊 Trending
          </button>
        </div>

        {/* Categories tags line filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === 'ALL' ? null : cat)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-wider transition-all select-none lowercase ${
                (cat === 'ALL' && selectedCategory === null) || (selectedCategory === cat)
                  ? 'bg-[#00a3c8]/20 text-[#5bd5fc] border border-[#00a3c8]'
                  : 'bg-[#101419]/90 text-[#e1bfb5] border border-[#31353b] hover:border-[#e1bfb5]/40'
              }`}
            >
              #{cat.toLowerCase().replace('_', ' ')}
            </button>
          ))}
        </div>

      </div>

      {/* Active Filter description labels */}
      {(filterType === 'bookmarks' || filterType === 'mine') && (
        <div className="p-3.5 bg-[#ff6b35]/10 border border-[#ff6b35]/25 rounded-xl text-xs flex justify-between items-center text-[#ffb59d]">
          <span className="font-semibold">
            {filterType === 'bookmarks' && `Showing your Saved Bookmarks`}
            {filterType === 'mine' && `Showing your Academic Questions & Proposals`}
          </span>
          <button
            onClick={() => navigate('/')}
            className="text-[10px] uppercase font-bold text-white hover:underline focus:outline-none"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Question Cards Feed list */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="w-8 h-8 border-4 border-[#ff6b35] border-t-transparent rounded-full animate-spin"></span>
            <p className="text-xs text-[#e1bfb5] opacity-60">Consulting records and peer debates...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-16 bg-[#181c21] rounded-2xl border border-dashed border-[#ff6b35]/25 gap-3 p-6 flex flex-col justify-center items-center">
            <Info className="w-10 h-10 text-[#ffb59d] animate-pulse" />
            <h3 className="text-base font-bold text-[#e0e2ea]">No questions found</h3>
            <p className="text-xs text-[#e1bfb5] opacity-70 max-w-sm">
              We couldn't locate any active research threads matching your parameters. Be the first to start a fresh scholarly thread!
            </p>
            <Link
              to="/ask-question"
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#ff6b35] hover:bg-[#ff8c5a] text-white text-xs font-bold rounded-xl shadow-lg transition-transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ask First Question</span>
            </Link>
          </div>
        ) : (
          questions.map((item) => {
            const isBookmarked = bookmarks.includes(item.id);

            return (
              <div 
                key={item.id}
                className="bg-[#181c21] border border-[#31353b] hover:border-[#ff6b35]/40 rounded-2xl transition-all shadow-md overflow-hidden relative flex"
              >
                {/* Vertical Upvote Downvote Column (Reddit-Style) */}
                <div className="flex flex-col items-center justify-start py-4 px-3 bg-[#101419]/40 gap-1.5 border-r border-[#31353b]/30 min-w-[54px] select-none shrink-0">
                  <button 
                    onClick={() => handleVote(item.id, 'up')}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      item.voted === 'up' 
                        ? 'bg-[#ff6b35] text-white shadow-md' 
                        : 'text-[#e1bfb5] hover:text-[#ff6b35]'
                    }`}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <span className="font-extrabold text-xs text-white my-0.5">
                    {item.upvotes}
                  </span>

                  <button 
                    onClick={() => handleVote(item.id, 'down')}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      item.voted === 'down' 
                        ? 'bg-[#5bd5fc] text-[#001f28] shadow-md' 
                        : 'text-[#e1bfb5] hover:text-[#5bd5fc]'
                    }`}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Primary Card body */}
                <div className="flex-1 p-5 md:p-6 flex flex-col justify-between overflow-hidden">
                  <div>
                    {/* Header bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3 select-none">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#1c2025] text-[#5bd5fc] border border-[#00a3c8]/30 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider">
                          {item.category}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-[11px] text-[#e1bfb5] opacity-60 flex items-center gap-1.5">
                          <img 
                            src={item.author.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120'} 
                            alt={item.author.name} 
                            className="w-4 h-4 rounded-full border border-slate-700 inline"
                          />
                          <strong className="text-white hover:underline">{item.author.name}</strong> • {item.timestamp}
                        </span>
                      </div>

                      {/* Small Save bookmark trigger */}
                      <button
                        onClick={() => toggleBookmark(item.id)}
                        className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                          isBookmarked 
                            ? 'text-[#ff6b35]' 
                            : 'text-[#e1bfb5] hover:text-white'
                        }`}
                        title={isBookmarked ? 'Remove' : 'Save'}
                      >
                        <Bookmark className="w-4.5 h-4.5" fill={isBookmarked ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    {/* Title & link */}
                    <Link 
                      to={`/faq?id=${item.id}`}
                      className="block hover:text-[#ffb59d] transition-colors focus:outline-none mb-1.5"
                    >
                      <h3 className="font-extrabold text-base md:text-lg text-white leading-snug tracking-tight">
                        {item.title}
                      </h3>
                    </Link>

                    {/* Image Attachment Thumbnail (If present) */}
                    {item.image && (
                      <div className="my-3 max-h-[220px] rounded-xl overflow-hidden border border-slate-800 bg-[#101419] flex items-center justify-center shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.imageAlt || item.title} 
                          className="w-full h-full object-cover grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300" 
                        />
                      </div>
                    )}

                    {/* Intro snippet */}
                    <p className="text-xs text-[#e1bfb5] opacity-85 leading-relaxed line-clamp-2 select-text mb-4">
                      {item.intro}
                    </p>
                  </div>

                  {/* Foot stats line */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#31353b]/35">
                    <div className="flex items-center gap-4 text-xs select-none">
                      
                      {/* Navigate directly to active thread detail */}
                      <Link 
                        to={`/faq?id=${item.id}`} 
                        className="flex items-center gap-1.5 text-[#e1bfb5] hover:text-white font-bold transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 text-[#ffb59d]" />
                        <span>{item.commentsCount} Comments</span>
                      </Link>

                      <div className="flex items-center gap-1.5 text-[#e1bfb5] opacity-60">
                        <Eye className="w-4 h-4 text-[#5bd5fc]" />
                        <span>{item.views} Views</span>
                      </div>

                    </div>

                    <Link
                      to={`/faq?id=${item.id}`}
                      className="text-[11px] font-extrabold text-[#5bd5fc] hover:text-white transition-all flex items-center gap-1 underline"
                    >
                      <span>Engage Stream</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
