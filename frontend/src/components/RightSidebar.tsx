import React, { useState } from 'react';
import { Send, CheckCircle, Flame } from 'lucide-react';
import { RelatedQuestionMeta } from '../types';

interface RightSidebarProps {
  relatedMetas: RelatedQuestionMeta[];
  onSelectQuestion: (id: string) => void;
  onTagSelect: (tag: string) => void;
}

export default function RightSidebar({ relatedMetas, onSelectQuestion, onTagSelect }: RightSidebarProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      alert('Please enter a valid academic/work email.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      setEmail('');
    }, 850);
  };

  return (
    <aside className="hidden lg:block w-[320px] p-6 sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto scrollbar-hide">
      <div className="space-y-8">
        
        {/* Related Questions section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-4 h-4 text-[#ff6b35]" />
            <h4 className="font-semibold text-xs text-[#e1bfb5] uppercase tracking-widest opacity-70">
              Related Questions
            </h4>
          </div>
          
          <div className="space-y-4">
            {relatedMetas.map((meta) => (
              <button
                key={meta.id}
                onClick={() => onSelectQuestion(meta.id)}
                className="block text-left group w-full cursor-pointer focus:outline-none"
              >
                <p className="font-medium text-sm text-[#e0e2ea] group-hover:text-[#ffb59d] transition-colors leading-snug mb-1">
                  {meta.title}
                </p>
                <span className="text-xs text-[#e1bfb5] opacity-50 block">
                  {meta.commentsCount} comments • {meta.views} views
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Top Categories section */}
        <section>
          <h4 className="font-semibold text-xs text-[#e1bfb5] uppercase tracking-widest mb-4 opacity-70">
            Top Categories
          </h4>
          <div className="flex flex-wrap gap-2">
            {['Stipends', 'Open Source', 'Mentorship', 'Research', 'Careers'].map((tag) => (
              <span
                key={tag}
                onClick={() => onTagSelect(tag.toUpperCase())}
                className="px-3 py-1 bg-[#1a1e24] border border-[#31353b] text-[#5bd5fc] hover:border-[#5bd5fc] hover:bg-[#5bd5fc]/10 rounded-full text-xs font-medium cursor-pointer transition-all active:scale-95"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* Elegant newsletter subscription card */}
        <section className="bg-gradient-to-br from-[#ff6b35]/15 to-[#ffb59d]/5 border border-[#ff6b35]/25 p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff6b35]/5 rounded-full blur-xl pointer-events-none"></div>

          <p className="font-bold text-sm text-[#ffb59d] mb-1">Never miss an update</p>
          <p className="text-xs text-[#e0e2ea] opacity-80 mb-4 leading-relaxed">
            Get weekly digest of the best research forums, expert advice, and stipend opportunities.
          </p>
          
          {subscribed ? (
            <div className="flex items-center gap-2 bg-[#1c2025]/90 border border-green-500/20 p-3 rounded-lg text-green-400 text-xs animate-fade-in">
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-400" />
              <span>Perfect! You are subscribed to the Vicharanashala digest.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email..."
                required
                className="flex-1 bg-[#101419] border border-[#31353b] rounded text-xs px-3 py-2 text-white focus:outline-none focus:border-[#ff6b35] transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#ff6b35] hover:bg-[#ff8c5a] text-white p-2 rounded transition-opacity active:scale-95 cursor-pointer flex items-center justify-center min-w-[36px]"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </form>
          )}
        </section>

      </div>
    </aside>
  );
}
