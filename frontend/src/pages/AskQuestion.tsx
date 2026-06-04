import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';
import { BulletPoint } from '../types';
import { 
  Sparkles, 
  AlertCircle, 
  UploadCloud, 
  Trash2, 
  X,
  FileImage,
  ArrowLeft
} from 'lucide-react';

export default function AskQuestion() {
  const { isAuthenticated, user, token, addMyQuestion } = useAuth();
  const navigate = useNavigate();

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('RESEARCH');
  const [intro, setIntro] = useState('');
  const [approachTitle, setApproachTitle] = useState('My Proposed Project Plan');
  const [approachDescription, setApproachDescription] = useState('');
  const [proTip, setProTip] = useState('Key parameters to test first before scale.');
  const [isLoading, setIsLoading] = useState(false);

  // Image upload states
  const [image, setImage] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  // Structured bullet points dynamically managed by user (Reddit style)
  const [bullets, setBullets] = useState<BulletPoint[]>([
    { title: 'Goal Orientation', content: 'Define the target and metrics of evaluation.' },
    { title: 'Implementation', content: 'Build using low-footprint frameworks and mock tests.' }
  ]);

  const [newBulletTitle, setNewBulletTitle] = useState('');
  const [newBulletContent, setNewBulletContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAddBullet = () => {
    if (!newBulletTitle.trim() || !newBulletContent.trim()) {
      return;
    }
    setBullets(prev => [...prev, { title: newBulletTitle.trim(), content: newBulletContent.trim() }]);
    setNewBulletTitle('');
    setNewBulletContent('');
  };

  const handleRemoveBullet = (index: number) => {
    setBullets(prev => prev.filter((_, i) => i !== index));
  };

  // Drag & Drop mechanisms
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are permitted for attachment uploads.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.onerror = () => {
      setError('Failed to convert image attachment.');
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !intro.trim() || !approachDescription.trim()) {
      setError('Please fully write Title, Intro, and Description fields to ensure scholarly depth.');
      return;
    }

    if (bullets.length < 1) {
      setError('Vicharanashala requires at least one solution milestone bullet.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category: category.toUpperCase(),
          title: title.trim(),
          intro: intro.trim(),
          structuredApproach: {
            title: approachTitle.trim(),
            description: approachDescription.trim(),
            bullets,
            proTip: proTip.trim()
          },
          image,
          imageAlt: title.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server rejected post creation.');
      }

      addMyQuestion(data.id);
      navigate(`/faq?id=${data.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit post to the peer-review database.');
    } finally {
      setIsLoading(false);
    }
  };

  // SSO Wall card render if user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="bg-[#1c2025] border border-[#31353b] rounded-2xl p-6 sm:p-8 max-w-xl mx-auto my-8 text-center space-y-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-[#ff6b35]"></div>
        
        <div className="inline-flex p-4 bg-[#ff6b35]/15 text-[#ff6b35] rounded-full">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-white tracking-tight">Academic Credentials Required</h2>
          <p className="text-xs text-[#e1bfb5] opacity-85 leading-relaxed max-w-sm mx-auto">
            To submit research proposals, request technical stipend approvals, or start new conversations, claiming your authenticated SSO student profile is mandatory.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3 select-none">
          <Link
            to="/login"
            className="px-6 py-2.5 bg-[#ff6b35] hover:bg-[#ff8c5a] text-white font-bold text-xs rounded-xl shadow-md transition-transform active:scale-95"
          >
            Sign In with University SSO
          </Link>
          <Link
            to="/signup"
            className="px-6 py-2.5 bg-transparent border border-[#31353b] hover:border-[#ffb59d]/50 text-[#ffb59d] font-bold text-xs rounded-xl hover:bg-[#101419]/50 transition-all"
          >
            Create Academic Profile
          </Link>
        </div>

        <div className="text-[11px] text-[#e1bfb5] opacity-40">
          Vicharanashala peer-review systems adhere strictly to research contribution policies.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      
      {/* Header title */}
      <div className="border-b border-[#31353b]/80 pb-4 select-none">
        <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Create scholarly FAQ proposal</h1>
        <p className="text-xs text-[#e1bfb5] opacity-70 mt-1">
          Draft a verified question, structure your technical proposed solution milestones, and receive feedback from AI Advisors and academic mentors.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/35 text-xs text-red-200 rounded-xl flex gap-3 items-center">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Details */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Core fields card */}
        <div className="bg-[#181c21] border border-[#31353b] p-6 rounded-2xl space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-widest font-extrabold text-[#e1bfb5] opacity-60 mb-2">
                Question Topic Title
              </label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. How to structure a literature review for a technical stipend application?"
                className="w-full bg-[#101419] border border-[#31353b] rounded-xl px-4 py-2.5 text-xs md:text-sm text-white focus:outline-none focus:border-[#ff6b35] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest font-extrabold text-[#e1bfb5] opacity-60 mb-2">
                Category tag
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#101419] border border-[#31353b] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#ff6b35] transition-all"
              >
                <option value="RESEARCH">Research</option>
                <option value="STIPENDS">Stipends</option>
                <option value="MENTORSHIP">Mentorship</option>
                <option value="CAREERS">Careers</option>
                <option value="OPEN_SOURCE">Open Source</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest font-extrabold text-[#e1bfb5] opacity-60 mb-2">
              Brief Introduction (Scientific context)
            </label>
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              rows={3}
              placeholder="Provide a high-level background framework, stating why this topic is crucial for scholars..."
              className="w-full bg-[#101419] border border-[#31353b] rounded-xl px-4 py-2.5 text-xs md:text-sm text-white focus:outline-none focus:border-[#ff6b35] transition-all resize-none"
              required
            />
          </div>

          {/* DRAG-AND-DROP FILE UPLOAD SECTION */}
          <div>
            <label className="block text-xs uppercase tracking-widest font-extrabold text-[#e1bfb5] opacity-60 mb-2">
              Schematic or Image Attachment
            </label>
            
            {!image ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? 'border-[#ff6b35] bg-[#ff6b35]/5 text-white'
                    : 'border-[#31353b] bg-[#101419]/50 text-[#e1bfb5] hover:border-[#ff6b35]/40'
                }`}
                onClick={() => document.getElementById('imageFileInput')?.click()}
              >
                <UploadCloud className="w-8 h-8 text-[#e1bfb5] opacity-60 animate-bounce" />
                <p className="text-xs font-bold text-white">Drag & drop or click to upload schematic</p>
                <p className="text-[10px] opacity-60">Supports PNG, JPG, or SVG drawings</p>
                <input
                  type="file"
                  id="imageFileInput"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative border border-[#31353b] rounded-xl p-3 bg-[#101419] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-slate-900 overflow-hidden flex items-center justify-center shrink-0 border border-slate-700">
                    <img src={image} alt="Attachment Thumbnail" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-xs text-white font-bold flex items-center gap-1">
                      <FileImage className="w-3.5 h-3.5 text-[#5bd5fc]" />
                      image_attached.png
                    </span>
                    <span className="text-[10px] text-[#e1bfb5] opacity-50 block">Ready to upload to database</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Structured Solution Milestones */}
        <div className="bg-[#181c21] border border-[#31353b] p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 mb-1 select-none">
            <Sparkles className="w-5 h-5 text-[#5bd5fc]" />
            <h3 className="font-bold text-sm text-white">The Structured Solution Milestones</h3>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-extrabold text-[#e1bfb5] opacity-60 mb-2">
                Response Strategy Section Title
              </label>
              <input 
                type="text"
                value={approachTitle}
                onChange={(e) => setApproachTitle(e.target.value)}
                className="w-full bg-[#101419] border border-[#31353b] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#ff6b35] transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-extrabold text-[#e1bfb5] opacity-60 mb-2">
                Response Summary Description
              </label>
              <textarea 
                value={approachDescription}
                onChange={(e) => setApproachDescription(e.target.value)}
                rows={2}
                placeholder="e.g. Recommended chronological checkpoints for applying peers..."
                className="w-full bg-[#101419] border border-[#31353b] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#ff6b35] transition-all resize-none"
                required
              />
            </div>
          </div>

          {/* Bullet points listing & add trigger */}
          <div className="pt-2 border-t border-[#31353b]/60 mt-2 space-y-3">
            <p className="text-[10px] uppercase tracking-widest font-extrabold text-[#e1bfb5] opacity-60">Highlight bullets ({bullets.length})</p>
            
            {bullets.length === 0 ? (
              <span className="text-[10px] text-[#e1bfb5] opacity-50 block italic">Add milestones inside your roadmap below...</span>
            ) : (
              <ul className="space-y-4">
                {bullets.map((b, idx) => (
                  <li key={idx} className="flex justify-between items-start bg-[#101419] border border-[#31353b]/70 p-2.5 rounded-lg text-xs animate-fadeIn">
                    <div className="pr-4 leading-normal">
                      <strong className="text-[#ffb59d]">{idx + 1}. {b.title}:</strong>
                      <span className="text-gray-300 ml-1 opacity-90">{b.content}</span>
                    </div>
                    <button
                      type="button" 
                      onClick={() => handleRemoveBullet(idx)}
                      className="text-red-400 hover:text-red-300 p-1 rounded transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Compose bullet */}
            <div className="bg-[#101419]/70 border border-[#31353b]/80 p-3 rounded-xl space-y-3.5">
              <span className="text-[10px] font-bold text-[#5bd5fc] block">Introduce new milestone checkpoint:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input 
                  type="text"
                  placeholder="e.g. Critical Gap formulation"
                  value={newBulletTitle}
                  onChange={(e) => setNewBulletTitle(e.target.value)}
                  className="bg-[#101419] border border-[#31353b] rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#ff6b35] transition-all"
                />
                <input 
                  type="text"
                  placeholder="e.g. Identify gaps in performance metrics."
                  value={newBulletContent}
                  onChange={(e) => setNewBulletContent(e.target.value)}
                  className="bg-[#101419] border border-[#31353b] rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#ff6b35] transition-all"
                />
              </div>
              <button
                type="button"
                onClick={handleAddBullet}
                className="w-full sm:w-auto px-4 py-1.5 bg-[#5bd5fc]/10 text-[#5bd5fc] hover:bg-[#5bd5fc]/20 border border-[#5bd5fc]/30 text-xs font-bold rounded-lg transition-all"
              >
                + Add milestone bullet
              </button>
            </div>

          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest font-extrabold text-[#e1bfb5] opacity-60 mb-2">
              Pro-Tip note (Scholarly advice)
            </label>
            <input 
              type="text"
              value={proTip}
              onChange={(e) => setProTip(e.target.value)}
              className="w-full bg-[#101419] border border-[#31353b] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#ff6b35] transition-all"
            />
          </div>

        </div>

        {/* Action Triggers */}
        <div className="flex justify-end gap-3 select-none">
          <Link
            to="/"
            className="px-5 py-2.5 text-xs font-bold text-[#e1bfb5] hover:text-white hover:bg-[#1c2025] rounded-xl transition-all"
          >
            Cancel Draft
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-[#ff6b35] hover:bg-[#ff8c5a] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#ff6b35]/25 hover:shadow-xl transition-transform active:scale-95 cursor-pointer max-h-[44px] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Submit Post to Peer-Review'
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
