import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';
import { Sparkles, AlertCircle, Key, Mail, ArrowLeft } from 'lucide-react';

export default function Login() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101419] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ff6b35]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#5bd5fc]/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6">
        <Link 
          to="/"
          className="flex items-center gap-2 text-xs font-bold text-[#e1bfb5] hover:text-white transition-all bg-[#1c2025]/80 border border-[#31353b] px-3.5 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-[#1c2025] border border-[#31353b] rounded-2xl p-8 shadow-2xl relative z-10">
        
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-[#ff6b35]/15 rounded-2xl border border-[#ff6b35]/20 mb-3 text-[#ff6b35]">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2.5xl font-extrabold text-white tracking-tight">Vicharanashala</h1>
          <p className="text-sm text-[#e1bfb5] opacity-70 mt-1">Stipend & Fellowship Community Hub</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 text-xs text-red-200 rounded-xl flex gap-3 items-center">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest font-extrabold text-[#e1bfb5] opacity-60 mb-2">
              Academic Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e1bfb5] opacity-50" />
              <input
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#101419] border border-[#31353b] rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff6b35] transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest font-extrabold text-[#e1bfb5] opacity-60 mb-2">
              Account Password
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e1bfb5] opacity-50" />
              <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#101419] border border-[#31353b] rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff6b35] transition-all"
                required
              />
            </div>
            <div className="flex justify-end mt-2">
              <button 
                type="button"
                onClick={() => alert('Vicharanashala platform credentials recovery email has been sent to the associated academic domain!')}
                className="text-xs text-[#5bd5fc] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#ff6b35] hover:bg-[#ff8c5a] text-white font-bold text-sm rounded-xl py-3 cursor-pointer transition-transform active:scale-95 flex items-center justify-center min-h-[44px]"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Sign In with University SSO'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-[#e1bfb5] opacity-70">
          <span>First time in Vicharanashala? </span>
          <Link to="/signup" className="text-[#ffb59d] hover:text-[#ff6b35] font-bold hover:underline">
            Register Academic Profile
          </Link>
        </div>

      </div>
    </div>
  );
}
