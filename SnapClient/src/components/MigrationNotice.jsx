import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, X } from 'lucide-react';

const MigrationNotice = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hasSeenNotice = localStorage.getItem('hasSeenMigrationNotice');
    if (!hasSeenNotice) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenMigrationNotice', 'true');
  };

  const handleAction = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenMigrationNotice', 'true');
    navigate('/auth');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl overflow-hidden"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Decorative background gradient */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 blur-[100px] rounded-full" />

        {/* Close Button */}
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
            <Info className="text-blue-500 w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">Database Upgraded!</h2>
          
          <p className="text-zinc-400 leading-relaxed mb-8">
            We've migrated to a powerful new infrastructure! 🚀 
            <br /><br />
            To provide a fresh experience, all previous account data has been reset. Please <strong>sign up again</strong> to start sharing your amazing snaps!
          </p>

          <div className="flex flex-col w-full gap-3">
            <button
              onClick={handleAction}
              className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started Again
            </button>
            <button
              onClick={handleDismiss}
              className="w-full py-4 bg-zinc-800 text-zinc-300 font-semibold rounded-2xl hover:bg-zinc-700 transition-all"
            >
              Maybe Later
            </button>
          </div>
          
          <p className="mt-4 text-xs text-zinc-500">
            Thank you for being part of SnapNest!
          </p>
        </div>
      </div>
    </div>
  );
};

export default MigrationNotice;
