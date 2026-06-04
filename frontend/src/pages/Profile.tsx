import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/context/AuthContext';
import { FAQItem } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  Mail, 
  MapPin, 
  GraduationCap, 
  Edit3, 
  Check, 
  Bookmark, 
  MessageSquare,
  Eye, 
  BookOpen, 
  LogOut,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function Profile() {
  const { user, isAuthenticated, token, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Selected Tab state: 'posts' | 'bookmarks'
  const [activeTab, setActiveTab] = useState<'posts' | 'bookmarks'>('posts');
  
  // Lists from the database
  const [myPosts, setMyPosts] = useState<FAQItem[]>([]);
  const [savedPosts, setSavedPosts] = useState<FAQItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Edit fields state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editBio, setEditBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if unauthenticated on mounting
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load fields when user profile loads
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditTitle(user.title || 'Undergraduate Scholar');
      setEditBio(user.bio || 'Honorable scholar of the forum.');
    }
  }, [user]);

  // Fetch lists of posts from the backend Express server
  useEffect(() => {
    if (!token) return;

    let active = true;
    async function loadProfileLists() {
      setLoadingPosts(true);
      try {
        // Query authored posts
        const postsRes = await fetch('/api/posts?myQuestions=true', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (postsRes.ok && active) {
          const postsData = await postsRes.json();
          setMyPosts(postsData);
        }

        // Query bookmarked posts
        const savedRes = await fetch('/api/posts?bookmarked=true', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (savedRes.ok && active) {
          const savedData = await savedRes.json();
          setSavedPosts(savedData);
        }
      } catch (err) {
        console.error('Failed to load profile lists:', err);
      } finally {
        if (active) setLoadingPosts(false);
      }
    }

    loadProfileLists();
    return () => { active = false; };
  }, [token, user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!editName.trim()) {
      setError('Name field cannot be left blank.');
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateProfile({
        name: editName.trim(),
        title: editTitle.trim(),
        bio: editBio.trim()
      });

      if (result.success) {
        setIsEditing(false);
      } else {
        setError(result.error || 'Failed to sync profile changes.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error occurred while updating profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <span className="w-8 h-8 border-4 border-[#ff6b35] border-t-transparent rounded-full animate-spin"></span>
        <p className="text-xs text-[#e1bfb5] opacity-60">Redirecting to SSO login gateway...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* Banner & ID Card wrapper */}
      <section className="bg-[#181c21] border border-[#31353b] rounded-2xl overflow-hidden relative shadow-xl">
        <div className="h-28 bg-gradient-to-r from-[#21110b] to-[#141b21] relative border-b border-[#31353b]/80">
          <div className="absolute top-4 right-4 bg-[#ff6b35]/25 border border-[#ff6b35]/40 text-[#ffb59d] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest select-none flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b35] animate-ping"></span>
            <span>VERIFIED UNIVERSITY SSO</span>
          </div>
        </div>

        {/* Content Card Body */}
        <div className="p-6 md:p-8 pt-0 -mt-10 relative flex flex-col md:flex-row gap-6 md:items-start">
          
          {/* Avatar frame */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-[#181c21] bg-slate-900 overflow-hidden shrink-0 shadow-lg relative select-none">
            <img 
              src={user.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(user.name)}`} 
              alt={user.name} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* User Meta Information details */}
          <div className="flex-1 space-y-4">
            
            {/* Read-Only Mode */}
            {!isEditing ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3 justify-between">
                  <div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">{user.name}</h2>
                    <p className="text-xs font-bold text-[#5bd5fc] flex items-center gap-1 mt-0.5 select-none">
                      <GraduationCap className="w-4 h-4 text-[#00a3c8]" />
                      <span>{user.title || 'Undergraduate Scholar'}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#1c2025] hover:bg-slate-800 border border-[#31353b] hover:border-slate-600 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Scholar Card</span>
                  </button>
                </div>

                <p className="text-xs md:text-sm text-[#e1bfb5] leading-relaxed select-text mt-2 block break-words italic opacity-95">
                  "{user.bio || 'Honorable scholar of the forum.'}"
                </p>

                {/* Email details row */}
                <div className="pt-2 flex flex-wrap gap-4 text-slate-500 font-mono text-[11px] select-none">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{user.email}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Campus Host Node 01</span>
                  </span>
                </div>
              </div>
            ) : (
              /* Editable State form */
              <form onSubmit={handleSaveProfile} className="space-y-4 animate-fadeIn">
                
                {error && (
                  <div className="p-3 bg-red-950/40 border border-red-500/35 text-xs text-red-200 rounded-lg flex gap-2 items-center">
                    <AlertCircle className="w-4.5 h-4.5 text-red-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-extrabold tracking-widest text-[#e1bfb5] opacity-50 mb-1.5">
                      Scholar Name
                    </label>
                    <input 
                      type="text"
                      className="w-full bg-[#101419] border border-[#31353b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff6b35] transition-colors"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-extrabold tracking-widest text-[#e1bfb5] opacity-50 mb-1.5">
                      Academic Designation / Rank
                    </label>
                    <input 
                      type="text"
                      className="w-full bg-[#101419] border border-[#31353b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff6b35] transition-colors"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="e.g. Master Candidate, AI Researcher"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-extrabold tracking-widest text-[#e1bfb5] opacity-50 mb-1.5">
                    Personal Scholarly Motto
                  </label>
                  <textarea 
                    className="w-full bg-[#101419] border border-[#31353b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff6b35] transition-colors resize-none"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={2}
                    placeholder="Provide a quick tagline describing your computational or academic goal..."
                  />
                </div>

                <div className="flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 hover:bg-[#1a1e23] border border-transparent rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-[#ff6b35] hover:bg-[#ff8c5a] hover:shadow text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                  >
                    {isSaving ? (
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Update Scholar Card</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

            {/* Logout button at the base of card */}
            <div className="pt-3 border-t border-[#31353b]/40 flex justify-between select-none">
              <span className="text-[10px] font-bold text-[#ffd0c2] block">SSO Account Session Live</span>
              <button
                onClick={handleLogoutClick}
                className="text-[11px] text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 font-bold cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect Profile</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* Tabs segment: Authored Proposals vs. Bookmarks */}
      <div className="space-y-4">
        
        {/* Navigation line */}
        <div className="flex border-b border-[#31353b]/80 gap-6 text-xs font-bold select-none">
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-3 relative transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'posts' ? 'text-[#ff6b35]' : 'text-[#e1bfb5] opacity-75 hover:opacity-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>My Authored Proposals ({myPosts.length})</span>
            {activeTab === 'posts' && <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#ff6b35] rounded-t-full"></div>}
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`pb-3 relative transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'bookmarks' ? 'text-[#ff6b35]' : 'text-[#e1bfb5] opacity-75 hover:opacity-100'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>My Bookmarks ({savedPosts.length})</span>
            {activeTab === 'bookmarks' && <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#ff6b35] rounded-t-full"></div>}
          </button>
        </div>

        {/* Dynamic Lists Feed */}
        {loadingPosts ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <span className="w-6 h-6 border-3 border-[#ff6b35] border-t-transparent rounded-full animate-spin"></span>
            <p className="text-[11px] text-[#e1bfb5] opacity-60">Refreshing database state...</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {activeTab === 'posts' ? (
              myPosts.length === 0 ? (
                <div className="text-center py-10 bg-[#1c2025]/50 border border-dashed border-[#31353b] rounded-xl text-xs space-y-2">
                  <p className="text-[#e1bfb5] opacity-60 italic">You have not proposed any academic questions yet.</p>
                  <Link to="/ask-question" className="inline-block text-[#ff6b35] hover:underline font-bold">+ Create your first post</Link>
                </div>
              ) : (
                myPosts.map(post => (
                  <Link 
                    key={post.id} 
                    to={`/faq?id=${post.id}`}
                    className="block bg-[#181c21] border border-[#31353b] hover:border-[#ff6b35]/30 p-4 rounded-xl transition-all group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="bg-[#1c2025] border border-[#31353b] text-[#5bd5fc] px-1.5 py-0.2 rounded text-[9px] uppercase tracking-wider font-extrabold">
                          {post.category}
                        </span>
                        <h4 className="text-sm font-extrabold text-white group-hover:text-[#ffb59d] mt-1.5 leading-snug">
                          {post.title}
                        </h4>
                        <p className="text-xs text-[#e1bfb5] opacity-65 mt-1 line-clamp-1 break-words">
                          {post.intro}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-[10px] text-slate-500 font-medium shrink-0">
                        <span>🔥 {post.upvotes} Upvotes</span>
                        <span>💬 {post.commentsCount} Comments</span>
                      </div>
                    </div>
                  </Link>
                ))
              )
            ) : (
              savedPosts.length === 0 ? (
                <div className="text-center py-10 bg-[#1c2025]/50 border border-dashed border-[#31353b] rounded-xl text-xs space-y-2 select-none">
                  <p className="text-[#e1bfb5] opacity-60 italic">Your bookmarks database is completely empty.</p>
                  <Link to="/" className="inline-block text-[#ff6b35] hover:underline font-bold">Browse home feed threads</Link>
                </div>
              ) : (
                savedPosts.map(post => (
                  <Link 
                    key={post.id} 
                    to={`/faq?id=${post.id}`}
                    className="block bg-[#181c21] border border-[#31353b] hover:border-[#ff6b35]/30 p-4 rounded-xl transition-all group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="bg-[#1c2025] border border-[#31353b] text-[#5bd5fc] px-1.5 py-0.2 rounded text-[9px] uppercase tracking-wider font-extrabold">
                          {post.category}
                        </span>
                        <h4 className="text-sm font-extrabold text-white group-hover:text-[#ffb59d] mt-1.5 leading-snug">
                          {post.title}
                        </h4>
                        <p className="text-xs text-[#e1bfb5] opacity-65 mt-1 line-clamp-1 break-words font-mono">
                          by @{post.author.name}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-[10px] text-slate-500 font-medium shrink-0">
                        <span>🔥 {post.upvotes} Upvotes</span>
                        <span>💬 {post.commentsCount} Comments</span>
                      </div>
                    </div>
                  </Link>
                ))
              )
            )}
          </div>
        )}

      </div>

    </div>
  );
}
