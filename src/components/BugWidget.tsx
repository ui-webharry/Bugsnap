import React, { useState, useEffect } from 'react';
import * as htmlToImage from 'html-to-image';
import { Camera, Send, X, Bug, CheckCircle2, Loader2 } from 'lucide-react';

export const BugWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const captureScreenshot = async () => {
    setLoading(true);
    try {
      // html-to-image is much better at handling modern CSS like oklch()
      const dataUrl = await htmlToImage.toJpeg(document.body, {
        quality: 0.7,
        pixelRatio: 0.5, // Reduced scale for faster upload
      });
      setScreenshot(dataUrl);
    } catch (err) {
      console.error('Failed to capture screenshot', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Use the absolute URL of the app for API calls so it works when embedded
      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      const apiUrl = window.location.origin.includes('localhost') 
        ? '/api/reports' 
        : `${baseUrl}/api/reports`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          screenshot,
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error: ${response.status} ${text.slice(0, 50)}`);
      }

      setStep('success');
      setTitle('');
      setDescription('');
      setScreenshot(null);
    } catch (err) {
      console.error('Failed to submit bug report:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-700 transition-all hover:scale-110 z-[9999]"
        title="Report a bug"
      >
        <Bug size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100%-2rem)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bug size={18} />
          <span className="font-semibold">Report a Bug</span>
        </div>
        <button onClick={() => { setIsOpen(false); setStep('form'); }} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="p-4 max-h-[80vh] overflow-y-auto">
        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">What's wrong?</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary..."
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Details</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue..."
                rows={3}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Screenshot</label>
              {screenshot ? (
                <div className="relative group rounded-lg overflow-hidden border border-zinc-200">
                  <img src={screenshot} alt="Preview" className="w-full h-32 object-cover" />
                  <button
                    type="button"
                    onClick={() => setScreenshot(null)}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={captureScreenshot}
                  disabled={loading}
                  className="w-full py-4 border-2 border-dashed border-zinc-200 rounded-lg flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
                  <span className="text-xs font-medium">Capture current screen</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              Submit Report
            </button>
          </form>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="font-bold text-zinc-900 mb-1">Report Received!</h3>
            <p className="text-sm text-zinc-500 mb-6">Thanks for helping us improve.</p>
            <button
              onClick={() => { setIsOpen(false); setStep('form'); }}
              className="px-6 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
      <div className="p-2 bg-zinc-50 border-t border-zinc-100 text-center">
        <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest">Powered by BugSnap</span>
      </div>
    </div>
  );
};
