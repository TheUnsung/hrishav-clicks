'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Camera,
  Lock,
  User,
  Plus,
  Trash2,
  ExternalLink,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  RefreshCw,
  UploadCloud,
  Link as LinkIcon,
  Loader2,
  FileCheck,
  Edit3,
  X,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorksWheelItem } from '@/components/ui/works-wheel';

interface PortfolioImage {
  src: string;
  alt: string;
  category: string;
  title: string;
  aspect: 'tall' | 'wide' | 'square';
}

export default function AdminPage() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Active admin tab: 'wheel' | 'portfolio'
  const [activeTab, setActiveTab] = useState<'wheel' | 'portfolio'>('wheel');

  // Photo data
  const [worksData, setWorksData] = useState<WorksWheelItem[]>([]);
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloudStorage, setCloudStorage] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Source selection: 'upload' | 'url'
  const [wheelSourceType, setWheelSourceType] = useState<'upload' | 'url'>('upload');
  const [portSourceType, setPortSourceType] = useState<'upload' | 'url'>('upload');

  // Upload loading states
  const [isUploadingWheel, setIsUploadingWheel] = useState(false);
  const [isUploadingPort, setIsUploadingPort] = useState(false);

  // Drag states
  const [isDraggingWheel, setIsDraggingWheel] = useState(false);
  const [isDraggingPort, setIsDraggingPort] = useState(false);

  // New Wheel Item form state
  const [newWheelTitle, setNewWheelTitle] = useState('');
  const [newWheelImage, setNewWheelImage] = useState('');
  const [newWheelHref, setNewWheelHref] = useState('');
  const [wheelFileName, setWheelFileName] = useState('');

  // New Portfolio Item form state
  const [newPortTitle, setNewPortTitle] = useState('');
  const [newPortSrc, setNewPortSrc] = useState('');
  const [newPortAlt, setNewPortAlt] = useState('');
  const [newPortCategory, setNewPortCategory] = useState('Landscape');
  const [customCategory, setCustomCategory] = useState('');
  const [newPortAspect, setNewPortAspect] = useState<'tall' | 'wide' | 'square'>('tall');
  const [portFileName, setPortFileName] = useState('');

  const wheelFileInputRef = useRef<HTMLInputElement>(null);
  const portFileInputRef = useRef<HTMLInputElement>(null);
  const editWheelFileInputRef = useRef<HTMLInputElement>(null);
  const editPortFileInputRef = useRef<HTMLInputElement>(null);

  // Editing state for Wheel item
  const [editingWheelIndex, setEditingWheelIndex] = useState<number | null>(null);
  const [editWheelForm, setEditWheelForm] = useState<WorksWheelItem | null>(null);
  const [isUploadingEditWheel, setIsUploadingEditWheel] = useState(false);

  // Editing state for Portfolio item
  const [editingPortIndex, setEditingPortIndex] = useState<number | null>(null);
  const [editPortForm, setEditPortForm] = useState<PortfolioImage | null>(null);
  const [isUploadingEditPort, setIsUploadingEditPort] = useState(false);

  // Check login session on mount
  useEffect(() => {
    const session = localStorage.getItem('hrishav_admin_auth');
    if (session === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch photos from API
  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/photos');
      if (res.ok) {
        const data = await res.json();
        setWorksData(data.worksData || []);
        setPortfolioImages(data.portfolioImages || []);
        setCloudStorage(data.cloudStorage ?? false);
      }
    } catch (err) {
      console.error('Failed to load photos:', err);
      showStatus('error', 'Failed to load photo data from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPhotos();
    }
  }, [isAuthenticated]);

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  // Upload file helper (supports direct client upload for large camera files up to 50MB+)
  const uploadImageFile = async (
    file: File,
    target: 'wheel' | 'portfolio'
  ) => {
    if (!file.type.startsWith('image/')) {
      showStatus('error', 'Please upload a valid image file (JPG, PNG, WebP)');
      return;
    }

    if (target === 'wheel') setIsUploadingWheel(true);
    else setIsUploadingPort(true);

    try {
      let uploadedUrl = '';

      // 1. Direct client upload to Vercel Blob (bypasses the 4.5MB Vercel serverless limit!)
      if (cloudStorage) {
        try {
          const { upload } = await import('@vercel/blob/client');
          const timestamp = Date.now();
          const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const newBlob = await upload(`photos/${timestamp}-${cleanName}`, file, {
            access: 'public',
            handleUploadUrl: '/api/upload',
          });
          uploadedUrl = newBlob.url;
        } catch (clientErr: any) {
          console.warn('Direct client upload attempt failed, attempting fallback:', clientErr);
        }
      }

      // 2. Fallback to standard server upload (for local dev or fallback)
      if (!uploadedUrl) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (res.ok && data.success && data.url) {
          uploadedUrl = data.url;
        } else {
          showStatus('error', data.error || 'Failed to upload photo');
          return;
        }
      }

      if (uploadedUrl) {
        if (target === 'wheel') {
          setNewWheelImage(uploadedUrl);
          setWheelFileName(file.name);
          if (!newWheelTitle) {
            const cleanTitle = file.name
              .replace(/\.[^/.]+$/, '')
              .replace(/[-_]/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase());
            setNewWheelTitle(cleanTitle);
          }
        } else {
          setNewPortSrc(uploadedUrl);
          setPortFileName(file.name);
          if (!newPortTitle) {
            const cleanTitle = file.name
              .replace(/\.[^/.]+$/, '')
              .replace(/[-_]/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase());
            setNewPortTitle(cleanTitle);
          }
        }
        showStatus('success', `Photo "${file.name}" uploaded successfully!`);
        return uploadedUrl;
      }
      return null;
    } catch (err: any) {
      console.error(err);
      showStatus('error', err?.message || 'Network error while uploading photo');
      return null;
    } finally {
      if (target === 'wheel') setIsUploadingWheel(false);
      else setIsUploadingPort(false);
    }
  };

  // Save changes to API
  const savePhotos = async (
    updatedWorks: WorksWheelItem[],
    updatedPort: PortfolioImage[]
  ) => {
    try {
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worksData: updatedWorks,
          portfolioImages: updatedPort,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showStatus('success', 'Changes saved to live portfolio!');
      } else {
        showStatus('error', data.error || 'Error saving changes to server');
      }
    } catch (err: any) {
      console.error(err);
      showStatus('error', err?.message || 'Network error while saving changes');
    }
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('hrishav_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Invalid credentials. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('hrishav_admin_auth');
    setUsername('');
    setPassword('');
  };

  // Add Wheel item
  const handleAddWheelItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWheelTitle.trim() || !newWheelImage.trim()) {
      showStatus('error', 'Title and photo are required');
      return;
    }

    const newItem: WorksWheelItem = {
      title: newWheelTitle.trim(),
      image: newWheelImage.trim(),
      href: newWheelHref.trim()
        ? newWheelHref.trim()
        : `#${newWheelTitle.toLowerCase().replace(/\s+/g, '-')}`,
    };

    const updated = [newItem, ...worksData];
    setWorksData(updated);
    savePhotos(updated, portfolioImages);

    // Reset inputs
    setNewWheelTitle('');
    setNewWheelImage('');
    setNewWheelHref('');
    setWheelFileName('');
    if (wheelFileInputRef.current) wheelFileInputRef.current.value = '';
  };

  // Delete Wheel item
  const handleDeleteWheelItem = (index: number) => {
    const updated = worksData.filter((_, i) => i !== index);
    setWorksData(updated);
    savePhotos(updated, portfolioImages);
  };

  // Add Portfolio item
  const handleAddPortfolioItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortTitle.trim() || !newPortSrc.trim()) {
      showStatus('error', 'Title and photo are required');
      return;
    }

    const finalCategory =
      newPortCategory === 'custom'
        ? customCategory.trim() || 'General'
        : newPortCategory;

    const newItem: PortfolioImage = {
      title: newPortTitle.trim(),
      src: newPortSrc.trim(),
      alt: newPortAlt.trim() || newPortTitle.trim(),
      category: finalCategory,
      aspect: newPortAspect,
    };

    const updated = [newItem, ...portfolioImages];
    setPortfolioImages(updated);
    savePhotos(worksData, updated);

    // Reset inputs
    setNewPortTitle('');
    setNewPortSrc('');
    setNewPortAlt('');
    setCustomCategory('');
    setPortFileName('');
    if (portFileInputRef.current) portFileInputRef.current.value = '';
  };

  // Delete Portfolio item
  const handleDeletePortfolioItem = (index: number) => {
    const updated = portfolioImages.filter((_, i) => i !== index);
    setPortfolioImages(updated);
    savePhotos(worksData, updated);
  };

  // Start editing a wheel item
  const handleStartEditWheel = (index: number) => {
    setEditingWheelIndex(index);
    setEditWheelForm({ ...worksData[index] });
  };

  // Save edited wheel item
  const handleSaveEditWheel = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWheelIndex === null || !editWheelForm) return;
    if (!editWheelForm.title.trim() || !editWheelForm.image.trim()) {
      showStatus('error', 'Title and photo are required');
      return;
    }

    const updated = [...worksData];
    const rawHref = editWheelForm.href ? editWheelForm.href.trim() : '';
    updated[editingWheelIndex] = {
      title: editWheelForm.title.trim(),
      image: editWheelForm.image.trim(),
      href: rawHref || `#${editWheelForm.title.toLowerCase().replace(/\s+/g, '-')}`,
    };

    setWorksData(updated);
    savePhotos(updated, portfolioImages);
    setEditingWheelIndex(null);
    setEditWheelForm(null);
    showStatus('success', 'Wheel photo updated successfully!');
  };

  // Start editing a portfolio item
  const handleStartEditPort = (index: number) => {
    setEditingPortIndex(index);
    setEditPortForm({ ...portfolioImages[index] });
  };

  // Save edited portfolio item
  const handleSaveEditPort = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPortIndex === null || !editPortForm) return;
    if (!editPortForm.title.trim() || !editPortForm.src.trim()) {
      showStatus('error', 'Title and photo are required');
      return;
    }

    const updated = [...portfolioImages];
    updated[editingPortIndex] = {
      ...editPortForm,
      title: editPortForm.title.trim(),
      src: editPortForm.src.trim(),
      alt: editPortForm.alt.trim() || editPortForm.title.trim(),
      category: editPortForm.category.trim() || 'General',
    };

    setPortfolioImages(updated);
    savePhotos(worksData, updated);
    setEditingPortIndex(null);
    setEditPortForm(null);
    showStatus('success', 'Portfolio photo updated successfully!');
  };

  // Upload replacement image for an existing item being edited
  const handleEditImageUpload = async (
    file: File,
    target: 'wheel' | 'port'
  ) => {
    if (target === 'wheel') setIsUploadingEditWheel(true);
    else setIsUploadingEditPort(true);

    try {
      const uploadTarget = target === 'wheel' ? 'wheel' : 'portfolio';
      const uploadedUrl = await uploadImageFile(file, uploadTarget);
      if (uploadedUrl) {
        if (target === 'wheel') {
          setEditWheelForm((prev) => (prev ? { ...prev, image: uploadedUrl } : null));
        } else {
          setEditPortForm((prev) => (prev ? { ...prev, src: uploadedUrl } : null));
        }
        showStatus('success', 'New replacement photo uploaded!');
      }
    } catch (err: any) {
      console.error(err);
      showStatus('error', err?.message || 'Error uploading replacement photo');
    } finally {
      if (target === 'wheel') setIsUploadingEditWheel(false);
      else setIsUploadingEditPort(false);
    }
  };

  // Preset sample helpers
  const fillSampleWheel = () => {
    setNewWheelTitle('Nordic Lights');
    setNewWheelImage('https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80');
    setNewWheelHref('#nordic-lights');
    setWheelSourceType('url');
  };

  const fillSamplePortfolio = () => {
    setNewPortTitle('Midnight Aurora');
    setNewPortSrc('https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=800&q=80');
    setNewPortAlt('Vibrant green aurora borealis dancing across night sky');
    setNewPortCategory('Landscape');
    setNewPortAspect('tall');
    setPortSourceType('url');
  };

  // ─────────────────────────────────────────────────────────────
  // 1. LOGIN SCREEN
  // ─────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(251,191,36,0.12),_transparent_70%)]" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <img
              src="/logo.png"
              alt="hrishav.frames"
              className="h-20 w-auto mx-auto mb-2 object-contain drop-shadow-2xl"
            />
            <p className="text-white/40 text-sm mt-1">Creator Studio & Photo Manager</p>
          </div>

          <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-2">Admin Sign In</h2>
            <p className="text-xs text-white/50 mb-6">
              Enter your credentials to manage your 3D Works Wheel and portfolio gallery.
            </p>

            {authError && (
              <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/60 mb-1.5 font-medium">
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white placeholder-white/20 text-sm focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/60 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-white/60 mb-1.5 font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white placeholder-white/20 text-sm focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/60 transition"
                    required
                  />
                </div>
              </div>


              <button
                type="submit"
                className="w-full mt-2 py-3 bg-white text-black font-semibold rounded-xl text-sm hover:bg-white/90 hover:scale-[1.01] active:scale-[0.99] transition duration-200 flex items-center justify-center gap-2"
              >
                Sign In to Studio
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <Link
                href="/"
                className="text-xs text-white/40 hover:text-white transition inline-flex items-center gap-1.5"
              >
                ← Back to public portfolio
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. AUTHENTICATED ADMIN DASHBOARD
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-400/30 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/logo.png"
                alt="hrishav.frames"
                className="h-11 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                Studio
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-medium text-white/80 transition"
            >
              <Eye className="w-3.5 h-3.5" />
              View Live Portfolio
              <ExternalLink className="w-3 h-3 text-white/40" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-medium text-rose-300 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Floating Status Notification */}
      {statusMessage && (
        <div
          className={cn(
            'fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200',
            statusMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/30 text-rose-200'
          )}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title & Navigation Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Photo Management Studio
            </h1>
            <div className="flex flex-wrap items-center gap-2.5 mt-1">
              <p className="text-white/40 text-sm">
                Upload local photos or paste URLs to customize your live portfolio.
              </p>
              {cloudStorage === true && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Cloud Storage Active
                </span>
              )}
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex p-1 bg-zinc-900 border border-white/10 rounded-xl self-start md:self-auto">
            <button
              onClick={() => setActiveTab('wheel')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition uppercase',
                activeTab === 'wheel'
                  ? 'bg-white text-black shadow'
                  : 'text-white/60 hover:text-white'
              )}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              3D Works Wheel ({worksData.length})
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition uppercase',
                activeTab === 'portfolio'
                  ? 'bg-white text-black shadow'
                  : 'text-white/60 hover:text-white'
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              Portfolio Grid ({portfolioImages.length})
            </button>
          </div>
        </div>

        {/* Notice if cloud storage is not yet connected on live site */}
        {cloudStorage === false && (
          <div className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <span className="font-semibold text-white">To enable live photo uploading/saving on Vercel:</span> Connect free Vercel Blob.
                <p className="text-white/60 text-xs mt-0.5">
                  In your <strong className="text-amber-300">Vercel Dashboard → hrishav-clicks → Storage tab → Create Database → Blob</strong>. It takes 10 seconds and is 100% free!
                </p>
              </div>
            </div>
            <a
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-400 text-black text-xs font-semibold hover:bg-amber-300 transition"
            >
              <span>Vercel Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-white/40 flex items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading photos...
          </div>
        ) : (
          <>
            {/* ═════════════════════════════════════════════════════════ */}
            {/* TAB 1: 3D WORKS WHEEL MANAGEMENT                         */}
            {/* ═════════════════════════════════════════════════════════ */}
            {activeTab === 'wheel' && (
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Form to add item */}
                <div className="lg:col-span-5 bg-zinc-900/70 border border-white/10 rounded-2xl p-6 backdrop-blur-sm sticky top-24">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <h2 className="text-base font-semibold text-white">
                        Add to 3D Works Wheel
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={fillSampleWheel}
                      className="text-[11px] text-amber-300/80 hover:text-amber-200 transition underline underline-offset-4"
                    >
                      Fill sample data
                    </button>
                  </div>

                  <form onSubmit={handleAddWheelItem} className="space-y-4">
                    {/* Method Selector: Upload vs URL */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-white/60 mb-2 font-medium">
                        Photo Source *
                      </label>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => setWheelSourceType('upload')}
                          className={cn(
                            'py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 border transition',
                            wheelSourceType === 'upload'
                              ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 font-semibold'
                              : 'bg-black/40 border-white/10 text-white/50 hover:text-white'
                          )}
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setWheelSourceType('url')}
                          className={cn(
                            'py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 border transition',
                            wheelSourceType === 'url'
                              ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 font-semibold'
                              : 'bg-black/40 border-white/10 text-white/50 hover:text-white'
                          )}
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                          Image URL
                        </button>
                      </div>

                      {/* File Upload Box */}
                      {wheelSourceType === 'upload' ? (
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingWheel(true);
                          }}
                          onDragLeave={() => setIsDraggingWheel(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingWheel(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) uploadImageFile(file, 'wheel');
                          }}
                          onClick={() => wheelFileInputRef.current?.click()}
                          className={cn(
                            'relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2',
                            isDraggingWheel
                              ? 'border-amber-400 bg-amber-500/10'
                              : 'border-white/15 bg-black/40 hover:border-amber-400/50 hover:bg-black/60'
                          )}
                        >
                          <input
                            ref={wheelFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadImageFile(file, 'wheel');
                            }}
                            className="hidden"
                          />

                          {isUploadingWheel ? (
                            <div className="flex flex-col items-center gap-2 py-2">
                              <Loader2 className="w-6 h-6 text-amber-300 animate-spin" />
                              <span className="text-xs text-white/70">Uploading to /uploads...</span>
                            </div>
                          ) : wheelFileName ? (
                            <div className="flex flex-col items-center gap-1.5 py-1">
                              <FileCheck className="w-6 h-6 text-emerald-400" />
                              <span className="text-xs text-emerald-300 font-medium truncate max-w-[200px]">
                                {wheelFileName}
                              </span>
                              <span className="text-[10px] text-white/40">Click or drag to replace</span>
                            </div>
                          ) : (
                            <>
                              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                                <UploadCloud className="w-5 h-5 text-amber-300/80" />
                              </div>
                              <div>
                                <span className="text-xs font-medium text-white/80">
                                  Click to upload
                                </span>{' '}
                                <span className="text-xs text-white/40">or drag & drop</span>
                              </div>
                              <span className="text-[10px] text-white/30">
                                PNG, JPG, WEBP up to 50MB (high-res supported)
                              </span>
                            </>
                          )}
                        </div>
                      ) : (
                        <div>
                          <input
                            type="url"
                            value={newWheelImage}
                            onChange={(e) => setNewWheelImage(e.target.value)}
                            placeholder="https://images.unsplash.com/... or /uploads/pic.jpg"
                            className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white placeholder-white/20 text-sm focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/60 transition"
                            required
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-white/60 mb-1.5 font-medium">
                        Photo Title *
                      </label>
                      <input
                        type="text"
                        value={newWheelTitle}
                        onChange={(e) => setNewWheelTitle(e.target.value)}
                        placeholder="e.g. Sunset in Dolomites"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white placeholder-white/20 text-sm focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/60 transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-white/60 mb-1.5 font-medium">
                        Target Link / Href
                      </label>
                      <input
                        type="text"
                        value={newWheelHref}
                        onChange={(e) => setNewWheelHref(e.target.value)}
                        placeholder="#sunset-dolomites (optional)"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white placeholder-white/20 text-sm focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/60 transition"
                      />
                    </div>

                    {/* Live Preview Box */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-white/40 mb-1.5 font-medium">
                        Live Preview
                      </label>
                      <div className="relative aspect-[1.45/1] rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
                        {newWheelImage ? (
                          <img
                            src={newWheelImage}
                            alt="Live preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="text-center text-white/30 p-4">
                            <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                            <span className="text-xs">Image preview will show here</span>
                          </div>
                        )}
                        {newWheelTitle && (
                          <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1.5 bg-black/80 backdrop-blur-md rounded-lg text-xs font-medium text-white truncate">
                            {newWheelTitle}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isUploadingWheel}
                      className="w-full py-3 bg-amber-300 text-black font-semibold rounded-xl text-sm hover:bg-amber-200 active:scale-[0.99] disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                    >
                      <Plus className="w-4 h-4" />
                      Add to 3D Works Wheel
                    </button>
                  </form>
                </div>

                {/* List of current wheel items */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div>
                      <h3 className="font-semibold text-white">
                        Active Wheel Items ({worksData.length})
                      </h3>
                      <p className="text-xs text-white/40">
                        These items render directly on the interactive 3D drum.
                      </p>
                    </div>
                  </div>

                  {worksData.length === 0 ? (
                    <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl text-white/40">
                      No photos in the wheel yet. Upload or add one!
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {worksData.map((item, index) => (
                        <div
                          key={`${item.title}-${index}`}
                          className="group relative bg-zinc-900/60 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition flex flex-col justify-between"
                        >
                          <div className="relative aspect-[1.45/1] overflow-hidden bg-black">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-white/70">
                              #{index + 1}
                            </div>
                            <div className="absolute top-2 right-2 flex items-center gap-1.5">
                              <button
                                onClick={() => handleStartEditWheel(index)}
                                className="p-1.5 rounded-lg bg-black/70 text-amber-300 hover:bg-amber-400 hover:text-black transition backdrop-blur-md"
                                title="Edit Photo Details & Image"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteWheelItem(index)}
                                className="p-1.5 rounded-lg bg-black/70 text-rose-400 hover:bg-rose-500 hover:text-white transition backdrop-blur-md"
                                title="Delete from Wheel"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="p-3 bg-zinc-950/70 border-t border-white/5">
                            <h4 className="font-medium text-sm text-white truncate">
                              {item.title}
                            </h4>
                            <p className="text-xs text-white/40 truncate mt-0.5">
                              {item.href || 'No link'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════ */}
            {/* TAB 2: PORTFOLIO GRID MANAGEMENT                         */}
            {/* ═════════════════════════════════════════════════════════ */}
            {activeTab === 'portfolio' && (
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Form to add item */}
                <div className="lg:col-span-5 bg-zinc-900/70 border border-white/10 rounded-2xl p-6 backdrop-blur-sm sticky top-24">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-amber-300" />
                      <h2 className="text-base font-semibold text-white">
                        Add to Portfolio Grid
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={fillSamplePortfolio}
                      className="text-[11px] text-amber-300/80 hover:text-amber-200 transition underline underline-offset-4"
                    >
                      Fill sample data
                    </button>
                  </div>

                  <form onSubmit={handleAddPortfolioItem} className="space-y-4">
                    {/* Method Selector: Upload vs URL */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-white/60 mb-2 font-medium">
                        Photo Source *
                      </label>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => setPortSourceType('upload')}
                          className={cn(
                            'py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 border transition',
                            portSourceType === 'upload'
                              ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 font-semibold'
                              : 'bg-black/40 border-white/10 text-white/50 hover:text-white'
                          )}
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setPortSourceType('url')}
                          className={cn(
                            'py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 border transition',
                            portSourceType === 'url'
                              ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 font-semibold'
                              : 'bg-black/40 border-white/10 text-white/50 hover:text-white'
                          )}
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                          Image URL
                        </button>
                      </div>

                      {/* File Upload Box */}
                      {portSourceType === 'upload' ? (
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingPort(true);
                          }}
                          onDragLeave={() => setIsDraggingPort(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingPort(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) uploadImageFile(file, 'portfolio');
                          }}
                          onClick={() => portFileInputRef.current?.click()}
                          className={cn(
                            'relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2',
                            isDraggingPort
                              ? 'border-amber-400 bg-amber-500/10'
                              : 'border-white/15 bg-black/40 hover:border-amber-400/50 hover:bg-black/60'
                          )}
                        >
                          <input
                            ref={portFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadImageFile(file, 'portfolio');
                            }}
                            className="hidden"
                          />

                          {isUploadingPort ? (
                            <div className="flex flex-col items-center gap-2 py-2">
                              <Loader2 className="w-6 h-6 text-amber-300 animate-spin" />
                              <span className="text-xs text-white/70">Uploading to /uploads...</span>
                            </div>
                          ) : portFileName ? (
                            <div className="flex flex-col items-center gap-1.5 py-1">
                              <FileCheck className="w-6 h-6 text-emerald-400" />
                              <span className="text-xs text-emerald-300 font-medium truncate max-w-[200px]">
                                {portFileName}
                              </span>
                              <span className="text-[10px] text-white/40">Click or drag to replace</span>
                            </div>
                          ) : (
                            <>
                              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                                <UploadCloud className="w-5 h-5 text-amber-300/80" />
                              </div>
                              <div>
                                <span className="text-xs font-medium text-white/80">
                                  Click to upload
                                </span>{' '}
                                <span className="text-xs text-white/40">or drag & drop</span>
                              </div>
                              <span className="text-[10px] text-white/30">
                                PNG, JPG, WEBP up to 50MB (high-res supported)
                              </span>
                            </>
                          )}
                        </div>
                      ) : (
                        <div>
                          <input
                            type="url"
                            value={newPortSrc}
                            onChange={(e) => setNewPortSrc(e.target.value)}
                            placeholder="https://images.unsplash.com/... or /uploads/..."
                            className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white placeholder-white/20 text-sm focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/60 transition"
                            required
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-white/60 mb-1.5 font-medium">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={newPortTitle}
                        onChange={(e) => setNewPortTitle(e.target.value)}
                        placeholder="e.g. Valley of Light"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white placeholder-white/20 text-sm focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/60 transition"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-white/60 mb-1.5 font-medium">
                          Category
                        </label>
                        <select
                          value={newPortCategory}
                          onChange={(e) => setNewPortCategory(e.target.value)}
                          className="w-full px-3 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400/60 transition"
                        >
                          <option value="Landscape">Landscape</option>
                          <option value="Urban">Urban</option>
                          <option value="Nature">Nature</option>
                          <option value="Seascape">Seascape</option>
                          <option value="Wildlife">Wildlife</option>
                          <option value="Architecture">Architecture</option>
                          <option value="Portrait">Portrait</option>
                          <option value="custom">+ Create New...</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-white/60 mb-1.5 font-medium">
                          Aspect Ratio
                        </label>
                        <select
                          value={newPortAspect}
                          onChange={(e) =>
                            setNewPortAspect(
                              e.target.value as 'tall' | 'wide' | 'square'
                            )
                          }
                          className="w-full px-3 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400/60 transition"
                        >
                          <option value="tall">Tall (Portrait)</option>
                          <option value="wide">Wide (Panorama)</option>
                          <option value="square">Square</option>
                        </select>
                      </div>
                    </div>

                    {newPortCategory === 'custom' && (
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-amber-300/80 mb-1.5 font-medium">
                          New Custom Category Name
                        </label>
                        <input
                          type="text"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          placeholder="e.g. Astrophotography"
                          className="w-full px-3.5 py-2.5 bg-black/60 border border-amber-400/40 rounded-xl text-white placeholder-white/20 text-sm focus:outline-none focus:border-amber-400 transition"
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-white/60 mb-1.5 font-medium">
                        Alt Description (Accessibility)
                      </label>
                      <input
                        type="text"
                        value={newPortAlt}
                        onChange={(e) => setNewPortAlt(e.target.value)}
                        placeholder="Brief description of the photograph"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white placeholder-white/20 text-sm focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/60 transition"
                      />
                    </div>

                    {/* Live Preview */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-white/40 mb-1.5 font-medium">
                        Live Preview
                      </label>
                      <div
                        className={cn(
                          'relative rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center transition-all',
                          newPortAspect === 'tall' && 'aspect-[3/4]',
                          newPortAspect === 'wide' && 'aspect-[16/9]',
                          newPortAspect === 'square' && 'aspect-square'
                        )}
                      >
                        {newPortSrc ? (
                          <img
                            src={newPortSrc}
                            alt="Live preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="text-center text-white/30 p-4">
                            <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                            <span className="text-xs">Image preview will show here</span>
                          </div>
                        )}
                        {newPortTitle && (
                          <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1.5 bg-black/80 backdrop-blur-md rounded-lg text-xs font-medium text-white flex items-center justify-between">
                            <span className="truncate">{newPortTitle}</span>
                            <span className="text-[10px] text-amber-300 uppercase tracking-wider">
                              {newPortCategory === 'custom'
                                ? customCategory || 'Custom'
                                : newPortCategory}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isUploadingPort}
                      className="w-full py-3 bg-amber-300 text-black font-semibold rounded-xl text-sm hover:bg-amber-200 active:scale-[0.99] disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                    >
                      <Plus className="w-4 h-4" />
                      Add to Portfolio Grid
                    </button>
                  </form>
                </div>

                {/* List of current portfolio images */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div>
                      <h3 className="font-semibold text-white">
                        Active Portfolio Photos ({portfolioImages.length})
                      </h3>
                      <p className="text-xs text-white/40">
                        Rendered in the responsive filterable masonry section.
                      </p>
                    </div>
                  </div>

                  {portfolioImages.length === 0 ? (
                    <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl text-white/40">
                      No photos in the portfolio grid yet. Upload or add one!
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {portfolioImages.map((img, index) => (
                        <div
                          key={`${img.src}-${index}`}
                          className="group relative bg-zinc-900/60 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition flex flex-col justify-between"
                        >
                          <div className="relative aspect-[4/3] overflow-hidden bg-black">
                            <img
                              src={img.src}
                              alt={img.alt}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] uppercase font-semibold tracking-wider text-amber-300">
                              {img.category}
                            </div>
                            <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white/60">
                              {img.aspect}
                            </div>
                            <div className="absolute top-2 right-2 flex items-center gap-1.5">
                              <button
                                onClick={() => handleStartEditPort(index)}
                                className="p-1.5 rounded-lg bg-black/70 text-amber-300 hover:bg-amber-400 hover:text-black transition backdrop-blur-md"
                                title="Edit Photo Details & Image"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePortfolioItem(index)}
                                className="p-1.5 rounded-lg bg-black/70 text-rose-400 hover:bg-rose-500 hover:text-white transition backdrop-blur-md"
                                title="Delete from Portfolio"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="p-3 bg-zinc-950/70 border-t border-white/5">
                            <h4 className="font-medium text-sm text-white truncate">
                              {img.title}
                            </h4>
                            <p className="text-xs text-white/40 truncate mt-0.5">
                              {img.alt}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* MODAL 1: EDIT WHEEL ITEM MODAL                              */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {editingWheelIndex !== null && editWheelForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-zinc-900 border border-white/20 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-zinc-950/50">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-300" />
                  <h3 className="font-semibold text-white text-base">
                    Edit 3D Wheel Photo #{editingWheelIndex + 1}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingWheelIndex(null);
                    setEditWheelForm(null);
                  }}
                  className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveEditWheel} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
                {/* Title */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-white/60 mb-1.5">
                    Photo Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editWheelForm.title}
                    onChange={(e) => setEditWheelForm({ ...editWheelForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400/50"
                  />
                </div>

                {/* Href / Hashtags */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-white/60 mb-1.5">
                    Hashtags / Link Target
                  </label>
                  <input
                    type="text"
                    value={editWheelForm.href || ''}
                    onChange={(e) => setEditWheelForm({ ...editWheelForm, href: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400/50"
                  />
                </div>

                {/* Photo Preview & Replacement Upload */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-white/60 mb-2">
                    Current Photo / Replace Image
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="w-32 h-24 rounded-xl overflow-hidden bg-black border border-white/10 shrink-0 relative">
                      <img
                        src={editWheelForm.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2 w-full">
                      <input
                        type="file"
                        ref={editWheelFileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleEditImageUpload(file, 'wheel');
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => editWheelFileInputRef.current?.click()}
                        disabled={isUploadingEditWheel}
                        className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-medium text-white transition flex items-center justify-center gap-2"
                      >
                        {isUploadingEditWheel ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3.5 h-3.5 text-amber-300" />
                            Choose New Image to Replace
                          </>
                        )}
                      </button>
                      <input
                        type="url"
                        placeholder="Or paste an image URL..."
                        value={editWheelForm.image}
                        onChange={(e) => setEditWheelForm({ ...editWheelForm, image: e.target.value })}
                        className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white/80 focus:outline-none focus:border-amber-400/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingWheelIndex(null);
                      setEditWheelForm(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingEditWheel}
                    className="px-5 py-2.5 bg-amber-300 text-black font-semibold rounded-xl text-xs hover:bg-amber-200 active:scale-[0.99] transition flex items-center gap-1.5 shadow-lg shadow-amber-500/10"
                  >
                    <Check className="w-4 h-4" />
                    Save Wheel Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* MODAL 2: EDIT PORTFOLIO ITEM MODAL                          */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {editingPortIndex !== null && editPortForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-zinc-900 border border-white/20 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-zinc-950/50">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-300" />
                  <h3 className="font-semibold text-white text-base">
                    Edit Portfolio Photo #{editingPortIndex + 1}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPortIndex(null);
                    setEditPortForm(null);
                  }}
                  className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveEditPort} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
                {/* Title */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-white/60 mb-1.5">
                    Photo Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editPortForm.title}
                    onChange={(e) => setEditPortForm({ ...editPortForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400/50"
                  />
                </div>

                {/* Description / Alt text */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-white/60 mb-1.5">
                    Description / Alt Text
                  </label>
                  <textarea
                    rows={2}
                    value={editPortForm.alt || ''}
                    onChange={(e) => setEditPortForm({ ...editPortForm, alt: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400/50 resize-none"
                  />
                </div>

                {/* Category & Aspect Ratio Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-white/60 mb-1.5">
                      Category
                    </label>
                    <input
                      type="text"
                      required
                      value={editPortForm.category}
                      onChange={(e) => setEditPortForm({ ...editPortForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-white/60 mb-1.5">
                      Aspect Ratio
                    </label>
                    <select
                      value={editPortForm.aspect}
                      onChange={(e) =>
                        setEditPortForm({
                          ...editPortForm,
                          aspect: e.target.value as 'tall' | 'wide' | 'square',
                        })
                      }
                      className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/50"
                    >
                      <option value="tall" className="bg-zinc-900">Tall (Portrait)</option>
                      <option value="wide" className="bg-zinc-900">Wide (Landscape)</option>
                      <option value="square" className="bg-zinc-900">Square (1:1)</option>
                    </select>
                  </div>
                </div>

                {/* Photo Preview & Replacement Upload */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-white/60 mb-2">
                    Current Photo / Replace Image
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="w-32 h-24 rounded-xl overflow-hidden bg-black border border-white/10 shrink-0 relative">
                      <img
                        src={editPortForm.src}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2 w-full">
                      <input
                        type="file"
                        ref={editPortFileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleEditImageUpload(file, 'port');
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => editPortFileInputRef.current?.click()}
                        disabled={isUploadingEditPort}
                        className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-medium text-white transition flex items-center justify-center gap-2"
                      >
                        {isUploadingEditPort ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3.5 h-3.5 text-amber-300" />
                            Choose New Image to Replace
                          </>
                        )}
                      </button>
                      <input
                        type="url"
                        placeholder="Or paste an image URL..."
                        value={editPortForm.src}
                        onChange={(e) => setEditPortForm({ ...editPortForm, src: e.target.value })}
                        className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white/80 focus:outline-none focus:border-amber-400/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPortIndex(null);
                      setEditPortForm(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingEditPort}
                    className="px-5 py-2.5 bg-amber-300 text-black font-semibold rounded-xl text-xs hover:bg-amber-200 active:scale-[0.99] transition flex items-center gap-1.5 shadow-lg shadow-amber-500/10"
                  >
                    <Check className="w-4 h-4" />
                    Save Portfolio Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
