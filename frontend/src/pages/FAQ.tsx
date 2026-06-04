import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';
import { FAQItem, Comment } from '../types';
import { 
  ArrowUp, 
  ArrowDown, 
  Share, 
  Bookmark, 
  Eye, 
  MessageSquare, 
  HelpCircle,
  CornerDownRight, 
  ThumbsUp, 
  ArrowLeft, 
  Award,
  Trash2
} from 'lucide-react';

export default function FAQ() {
  const { isAuthenticated, bookmarks, toggleBookmark, token, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Unified States for Full-Stack database sync
  const [activeQuestion, setActiveQuestion] = useState<FAQItem | null>(null);
  const [questions, setQuestions] = useState<FAQItem[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [activeReplyBoxId, setActiveReplyBoxId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  // Read the active question ID (if URL presents ?id=xxx)
  const questionId = searchParams.get('id');

  // Load single thread or full list index on route parameters change
  useEffect(() => {
    let active = true;
    async function loadData() {
      setLoading(true);
      try {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        if (questionId) {
          const res = await fetch(`/api/posts/${questionId}`, { headers });
          if (res.ok && active) {
            const data = await res.json();
            setActiveQuestion(data);
          } else if (active) {
            setActiveQuestion(null);
          }
        } else {
          const res = await fetch(`/api/posts`, { headers });
          if (res.ok && active) {
            const data = await res.json();
            setQuestions(data);
          }
        }
      } catch (err) {
        console.error('Failed to loading discussion board threads:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => { active = false; };
  }, [questionId, token]);

  // Upvote/Downvote logic
  const handleVote = async (id: string, dir: 'up' | 'down') => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Optimistically update details view state
    setActiveQuestion(prev => {
      if (!prev) return null;
      let diff = 0;
      let newVoted: 'up' | 'down' | null = null;
      
      if (prev.voted === dir) {
        diff = dir === 'up' ? -1 : 1;
        newVoted = null;
      } else {
        if (prev.voted === null || prev.voted === undefined) {
          diff = dir === 'up' ? 1 : -1;
        } else {
          diff = dir === 'up' ? 2 : -2;
        }
        newVoted = dir;
      }

      return {
        ...prev,
        upvotes: prev.upvotes + diff,
        voted: newVoted
      };
    });

    try {
      const matchDir = activeQuestion?.voted === dir ? null : dir;

      const res = await fetch(`/api/posts/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ dir: matchDir })
      });
      
      if (res.ok) {
        const data = await res.json();
        setActiveQuestion(prev => {
          if (!prev) return null;
          return {
            ...prev,
            upvotes: data.upvotes,
            voted: data.voted
          };
        });
      }
    } catch (e) {
      console.error('Failed to sync thread voting counters:', e);
    }
  };

  // Create Root Comment (JWT protected)
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeQuestion) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`/api/posts/${activeQuestion.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newCommentText.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveQuestion(prev => {
          if (!prev) return null;
          
          // Check if likedBy initially empty
          const commentModel: Comment = {
            ...data,
            likedByMe: false,
            replies: []
          };

          return {
            ...prev,
            commentsCount: prev.commentsCount + 1,
            comments: [...(prev.comments || []), commentModel]
          };
        });
        setNewCommentText('');
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to submit comment.');
      }
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

  // Create Nested Reply (JWT protected)
  const handlePostReply = async (commentId: string) => {
    if (!replyText.trim() || !activeQuestion) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`/api/posts/${activeQuestion.id}/comments/${commentId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: replyText.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveQuestion(prev => {
          if (!prev) return null;
          return {
            ...prev,
            commentsCount: prev.commentsCount + 1,
            comments: (prev.comments || []).map(c => {
              if (c.id !== commentId) return c;
              return {
                ...c,
                replies: [...(c.replies || []), data]
              };
            })
          };
        });
        setReplyText('');
        setActiveReplyBoxId(null);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to submit nested reply.');
      }
    } catch (err) {
      console.error('Error replying to comment:', err);
    }
  };

  // Toggle Comment Likes (JWT protected)
  const handleToggleLikeComment = async (commentId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`/api/posts/${activeQuestion!.id}/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveQuestion(prev => {
          if (!prev) return null;
          return {
            ...prev,
            comments: (prev.comments || []).map(c => {
              if (c.id !== commentId) return c;
              return {
                ...c,
                likes: data.likes,
                likedByMe: data.likedByMe
              };
            })
          };
        });
      }
    } catch (e) {
      console.error('Failed to toggle comment like:', e);
    }
  };

  // Copy share links
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Academic shareable thread URL copied to clipboard!');
  };

  // DELETE OWN POST METHOD (JWT protected)
  const handleDeletePost = async () => {
    if (!activeQuestion) return;
    if (!window.confirm('Are you absolutely sure you want to delete this research discussion thread? This action is irreversible.')) {
      return;
    }

    try {
      const res = await fetch(`/api/posts/${activeQuestion.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const resJson = await res.json();
      if (res.ok && resJson.success) {
        navigate('/');
      } else {
        alert(resJson.error || 'Unauthorized or delete request refused by server.');
      }
    } catch (err) {
      console.error('Failed to delete post thread:', err);
      alert('Network failure on post deletion query.');
    }
  };

  // Render Loader spinner if loading content
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3.5 select-none">
        <span className="w-8 h-8 border-4 border-[#ff6b35] border-t-transparent rounded-full animate-spin"></span>
        <p className="text-xs text-[#e1bfb5] opacity-60">Consulting academic archives...</p>
      </div>
    );
  }

  // RENDER DUAL INDEX VIEW: If no active question is mapped in state
  if (!activeQuestion) {
    return (
      <div className="space-y-6">
        
        {/* Portal Cover */}
        <section className="bg-[#1c2025] border border-[#31353b] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#5bd5fc]/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2 select-none">
              <HelpCircle className="w-6 h-6 text-[#5bd5fc]" />
              <span>Vicharanashala Peer FAQs</span>
            </h1>
            <p className="text-xs text-[#e1bfb5] opacity-85 max-w-xl leading-relaxed">
              Find solutions to scholarship applications, critical gap formulations, CGPA waiver models, and department-wise mentor recruitment standards.
            </p>
          </div>

          <Link
            to="/ask-question"
            className="bg-[#ff6b35] hover:bg-[#ff8c5a] text-white px-4 py-2 font-bold text-xs rounded-xl shadow-md cursor-pointer shrink-0 transition-transform active:scale-95 flex items-center gap-1.5 select-none"
          >
            <span>Ask a Scholar</span>
          </Link>
        </section>

        {/* Index List of FAQs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.length === 0 ? (
            <div className="sm:col-span-2 text-center py-8 text-xs text-[#e1bfb5] opacity-50 italic border border-dashed border-[#31353b] p-4 rounded-xl">
              No active scholarly questions found.
            </div>
          ) : (
            questions.map(q => {
              const isSaved = bookmarks.includes(q.id);

              return (
                <div 
                  key={q.id}
                  className="bg-[#181c21] border border-[#31353b] hover:border-[#ff6b35]/30 p-5 rounded-2xl flex flex-col justify-between transition-all group relative"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="bg-[#5bd5fc]/10 text-[#5bd5fc] px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider border border-[#5bd5fc]/20">
                        {q.category}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault(); e.stopPropagation();
                          toggleBookmark(q.id);
                        }}
                        className="text-[#e1bfb5] hover:text-[#ff6b35] transition-colors cursor-pointer"
                      >
                        <Bookmark className="w-4 h-4" fill={isSaved ? '#ff6b35' : 'none'} />
                      </button>
                    </div>

                    <h3 className="font-bold text-sm text-white group-hover:text-[#ffb59d] transition-colors leading-snug mb-2 select-text">
                      {q.title}
                    </h3>
                    
                    <p className="text-xs text-[#e1bfb5] opacity-60 line-clamp-2 leading-relaxed mb-4 select-text">
                      {q.intro}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#31353b]/30">
                    <span className="text-[10px] text-[#e1bfb5]/50 font-semibold uppercase">
                      {q.upvotes} upvotes • {q.views} views
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setSearchParams({ id: q.id });
                      }}
                      className="text-xs font-bold text-[#ffd0c2] hover:text-white flex items-center gap-1 underline transition-colors cursor-pointer"
                    >
                      <span>Read Thread</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    );
  }

  // ELSE RENDER HIGH-FIDELITY ACTIVE DETAILS VIEW
  const isSaved = bookmarks.includes(activeQuestion.id);
  const isOwnPost = isAuthenticated && user && activeQuestion.author.id === user.id;

  return (
    <div className="space-y-6">
      
      {/* Return to Feed */}
      <button 
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#e1bfb5] hover:text-white transition-all bg-[#1c2025]/80 border border-[#31353b] px-3.5 py-1.5 rounded-xl cursor-pointer select-none"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Feed</span>
      </button>

      {/* Structured Post Card Header */}
      <section className="bg-[#181c21] border border-[#31353b] rounded-2xl p-6 relative">
        <div className="flex items-center gap-2 mb-4 select-none">
          <span className="bg-[#ff6b35]/15 text-[#ffb59d] px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide border border-[#ff6b35]/20">
            {activeQuestion.category}
          </span>
          <span className="text-[#e1bfb5] text-xs opacity-60">• {activeQuestion.timestamp}</span>
        </div>

        <h1 className="text-xl md:text-2xl font-extrabold text-white leading-snug tracking-tight mb-5 select-text">
          {activeQuestion.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#31353b]/30">
          
          {/* Author */}
          <div className="flex items-center gap-3">
            <img
              alt={activeQuestion.author.name}
              className="w-10 h-10 rounded-full border border-[#ff6b35]/30 select-none"
              src={activeQuestion.author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'}
            />
            <div>
              <p className="font-bold text-sm text-[#e0e2ea]">{activeQuestion.author.name}</p>
              <p className="text-xs text-[#e1bfb5] opacity-70">{activeQuestion.author.title}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 select-none">
            
            {/* DELETE OWN POST ACTION */}
            {isOwnPost && (
              <button 
                onClick={handleDeletePost}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-950/40 text-red-400 hover:text-red-200 hover:bg-red-900/50 border border-red-900/35 rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Thread</span>
              </button>
            )}

            <button 
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 hover:bg-[#31353b]/60 text-[#e1bfb5] hover:text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
            >
              <Share className="w-4 h-4" />
              <span>Share</span>
            </button>
            
            <button
              onClick={() => toggleBookmark(activeQuestion.id)}
              className={`p-2.5 rounded-xl cursor-pointer transition-colors ${
                isSaved
                  ? 'bg-[#ffebe6]/10 text-[#ff6b35] hover:bg-[#ffebe6]/20'
                  : 'hover:bg-[#31353b]/60 text-[#e1bfb5] hover:text-white'
              }`}
              title={isSaved ? "Saved" : "Save"}
            >
              <Bookmark className="w-4.5 h-4.5" fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          </div>

        </div>
      </section>

      {/* Detailed Structured Response Markdown details */}
      <article className="bg-[#181c21] border border-[#31353b] rounded-2xl overflow-hidden shadow-sm">
        
        <div className="p-6 md:p-8 space-y-6 text-[#e0e2ea] leading-relaxed select-textCopy">
          
          <h2 className="font-extrabold text-[#ffb59d] text-lg md:text-xl tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-[#ff6b35]" />
            <span>{activeQuestion.structuredApproach.title}</span>
          </h2>

          <p className="text-xs md:text-sm text-gray-300">
            {activeQuestion.structuredApproach.description}
          </p>

          {/* Highlights Bullets items */}
          <ul className="space-y-4">
            {activeQuestion.structuredApproach.bullets.map((bullet, idx) => (
              <li key={idx} className="flex gap-3 text-xs md:text-sm items-start">
                <span className="bg-[#ff6b35] text-white text-[10px] font-extrabold w-5 h-5 flex items-center justify-center rounded-full mt-0.5 shrink-0 select-none">
                  {idx + 1}
                </span>
                <div>
                  <strong className="text-white block font-bold mb-0.5">{bullet.title}:</strong>
                  <span className="opacity-80">
                    {bullet.content.split('`').map((part, pIdx) => (
                      pIdx % 2 === 1 
                        ? <code key={pIdx} className="bg-[#1c2025] px-1.5 py-0.5 rounded text-[#5bd5fc] font-mono text-[11px]">{part}</code>
                        : part
                    ))}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          {/* Custom image attachment */}
          {activeQuestion.image && (
            <div className="rounded-xl overflow-hidden border border-[#31353b] bg-[#101419] max-h-[420px] flex items-center justify-center shrink-0">
              <img 
                className="w-full h-full object-contain max-h-[420px]"
                src={activeQuestion.image} 
                alt={activeQuestion.imageAlt || activeQuestion.title} 
              />
            </div>
          )}

          {/* ProTip Quote Block */}
          {activeQuestion.structuredApproach.proTip && (
            <div className="bg-[#1c2025] p-5 rounded-xl border-l-4 border-[#5bd5fc] text-xs md:text-sm italic relative">
              <span className="absolute -top-3.5 left-4 bg-[#00a3c8] text-white px-2 py-0.5 rounded text-[9px] uppercase font-bold select-none">
                Advisor Pro-Tip
              </span>
              <p className="opacity-90">
                {activeQuestion.structuredApproach.proTip.split('`').map((p, i) => (
                  i % 2 === 1 
                    ? <span key={i} className="not-italic bg-[#12161a] border border-[#31353b] px-1.5 py-0.5 rounded text-[#5bd5fc] font-mono text-[11px]">{p}</span>
                    : p
                ))}
              </p>
            </div>
          )}

        </div>

        {/* Action Controls footer */}
        <div className="bg-[#1c2025] px-6 py-4 flex items-center justify-between border-t border-[#31353b] select-none">
          <div className="flex items-center gap-5">
            
            <div className="flex items-center bg-[#262a30] rounded-full border border-[#31353b] py-0.5 px-0.5">
              <button 
                onClick={() => handleVote(activeQuestion.id, 'up')}
                className={`p-1.5 px-3 rounded-full transition-all cursor-pointer ${
                  activeQuestion.voted === 'up' 
                    ? 'bg-[#ff6b35] text-white' 
                    : 'text-[#e1bfb5] hover:text-[#ff6b35]'
                }`}
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>

              <span className="px-2 font-bold text-xs text-white min-w-[32px] text-center">
                {activeQuestion.upvotes}
              </span>

              <button 
                onClick={() => handleVote(activeQuestion.id, 'down')}
                className={`p-1.5 px-3 rounded-full transition-all cursor-pointer ${
                  activeQuestion.voted === 'down' 
                    ? 'bg-[#5bd5fc] text-[#001f28]' 
                    : 'text-[#e1bfb5] hover:text-[#5bd5fc]'
                }`}
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[#e1bfb5] opacity-70">
              <Eye className="w-4 h-4 text-[#ffb59d]" />
              <span className="text-xs font-semibold">{activeQuestion.views} Views</span>
            </div>

          </div>

          <span className="hidden md:inline text-xs text-[#5bd5fc] font-medium">Verify credentials via department SSO</span>
        </div>

      </article>

      {/* Discussion Threads Nested Reddit styles */}
      <section className="mt-12">
        <h3 className="font-extrabold text-lg text-white mb-6 flex items-center gap-2 select-none">
          <MessageSquare className="w-5 h-5 text-[#ff6b35]" />
          <span>Peer Conversations ({activeQuestion.commentsCount})</span>
        </h3>

        {/* Comment Add Input Box */}
        <form onSubmit={handlePostComment} className="mb-8 bg-[#181c21] border border-[#31353b] rounded-xl p-4">
          <textarea 
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            rows={3}
            className="w-full bg-transparent border-none outline-none text-[#e0e2ea] placeholder-[#e1bfb5]/40 text-xs md:text-sm resize-none focus:ring-0"
            placeholder="Review this academic solution. Share exceptions, related resources or feedback with author..."
            required
            id="faq-comment-input-area"
          />
          <div className="flex justify-end pt-3 border-t border-[#31353b]/40 mt-2 select-none">
            <button
              type="submit"
              disabled={!newCommentText.trim()}
              className="px-5 py-2 bg-[#ff6b35] hover:bg-[#ff8c5a] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-lg transition-transform active:scale-95 cursor-pointer"
            >
              Post comment directly
            </button>
          </div>
        </form>

        {/* List of comments */}
        <div className="space-y-6">
          {(!activeQuestion.comments || activeQuestion.comments.length === 0) ? (
            <div className="p-8 text-center bg-[#181c21]/50 border border-dashed border-[#31353b] rounded-xl select-none">
              <p className="text-xs text-[#e1bfb5] opacity-50">This thread is currently quiet. Add your research question/response above!</p>
            </div>
          ) : (
            activeQuestion.comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 group">
                
                <div className="flex flex-col items-center">
                  <img 
                    alt={comment.authorName} 
                    className="w-8 h-8 rounded-full border border-slate-700 shrink-0 select-none animate-fadeIn"
                    src={comment.authorAvatar} 
                  />
                  <div className="w-[1.5px] h-full bg-[#31353b]/50 group-hover:bg-[#ffb59d]/20 rounded-full mt-1.5 transition-colors"></div>
                </div>

                <div className="flex-1 pb-6 border-b border-[#31353b]/30">
                  
                  <div className="flex items-center gap-2 mb-1.5 select-none">
                    <span className="font-bold text-xs text-white">{comment.authorName}</span>
                    <span className="text-[9px] bg-[#1c2025] text-[#5bd5fc] px-1.5 py-0.2 rounded font-semibold border border-[#00a3c8]/20">{comment.authorTitle}</span>
                    <span className="text-[11px] text-[#e1bfb5] opacity-50">• {comment.timestamp}</span>
                  </div>

                  <p className="text-xs md:text-sm text-[#e0e2ea]/90 leading-relaxed mb-3 break-words select-text">
                    {comment.content}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-4 text-[11px] select-none text-[#e1bfb5] opacity-80">
                    <button 
                      onClick={() => {
                        setActiveReplyBoxId(activeReplyBoxId === comment.id ? null : comment.id);
                        setReplyText('');
                      }}
                      className="flex items-center gap-1.5 hover:text-[#ff6b35] cursor-pointer font-bold"
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>

                    <button 
                      onClick={() => handleToggleLikeComment(comment.id)}
                      className={`flex items-center gap-1.5 hover:text-[#5bd5fc] cursor-pointer font-bold ${
                        comment.likedByMe ? 'text-[#5bd5fc]' : ''
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{comment.likes} likes</span>
                    </button>
                  </div>

                  {/* Reply Input Box nested */}
                  {activeReplyBoxId === comment.id && (
                    <div className="mt-4 bg-[#101419]/90 border border-[#31353b] p-3 rounded-lg flex flex-col gap-2">
                      <input 
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs text-white placeholder-[#e1bfb5]/40 px-1 py-1"
                        placeholder="Write a constructive response..."
                        id="faq-nested-reply-input"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 text-[10px] pt-2 border-t border-[#31353b]/45 shrink-0 select-none">
                        <button 
                          type="button" 
                          onClick={() => setActiveReplyBoxId(null)}
                          className="px-2.5 py-1 text-[#e1bfb5] hover:text-white cursor-pointer font-bold"
                        >
                          Cancel
                        </button>
                        <button 
                          type="button"
                          onClick={() => handlePostReply(comment.id)}
                          disabled={!replyText.trim()}
                          className="px-3 py-1 bg-[#ff6b35] hover:bg-[#ff8c5a] disabled:opacity-40 text-white font-bold rounded cursor-pointer"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Inline Responses list */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-3.5 pl-2 border-l border-[#31353b]/60">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-3 bg-[#1c2025]/50 border border-[#31353b]/55 p-3 rounded-xl">
                          <img 
                            alt={reply.authorName} 
                            className="w-6 h-6 rounded-full select-none shrink-0"
                            src={reply.authorAvatar} 
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 select-none">
                              <span className="font-extrabold text-xs text-[#ffb59d]">{reply.authorName}</span>
                              <span className="text-[9px] bg-black text-[#e1bfb5] px-1 rounded select-none">{reply.authorTitle}</span>
                              <span className="text-[10px] text-[#e1bfb5] opacity-50 select-none">• {reply.timestamp}</span>
                            </div>
                            <p className="text-xs text-[#e0e2ea] break-words select-text">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            ))
          )}
        </div>

      </section>

    </div>
  );
}
