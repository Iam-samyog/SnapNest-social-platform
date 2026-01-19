import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, X } from 'lucide-react';

const MigrationNotice = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Show on every refresh as requested
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleAction = () => {
    setIsVisible(false);
    navigate('/auth');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-500">
      <div 
        className="relative w-full max-w-md bg-yellow-400 border-4 border-black rounded-[40px] p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-black/5 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-black/5 rounded-full" />

        {/* Close Button */}
        <button 
          onClick={handleDismiss}
          className="absolute top-6 right-6 p-2 text-black hover:scale-125 transition-transform"
        >
          <X size={28} strokeWidth={3} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-black rounded-[28px] flex items-center justify-center mb-8 rotate-3 shadow-[5px_5px_0px_0px_rgba(255,255,255,0.2)]">
            <Info className="text-yellow-400 w-10 h-10" strokeWidth={3} />
          </div>

          <h2 className="text-3xl font-[900] text-black mb-4 uppercase tracking-tighter leading-tight">
            Database<br />Upgraded! 🚀
          </h2>
          
          <p className="text-black/80 font-bold leading-relaxed mb-10 text-lg">
            We've migrated to a new system! All previous accounts have been reset. <br /><br />
            <strong>Sign up again</strong> to keep sharing your snaps! 📸
          </p>

          <div className="flex flex-col w-full gap-4">
            <button
              onClick={handleAction}
              className="w-full py-5 bg-black text-yellow-400 font-[900] text-xl rounded-2xl hover:scale-[1.05] active:scale-[0.95] transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]"
            >
              LET'S GO!
            </button>
            <button
              onClick={handleDismiss}
              className="w-full py-4 bg-transparent text-black font-black text-sm uppercase tracking-widest hover:underline transition-all"
            >
              Maybe Later
            </button>
          </div>
          
          <div className="mt-8 flex items-center gap-2">
            <div className="h-1 w-12 bg-black/20 rounded-full" />
            <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">
              SnapNest Social
            </span>
            <div className="h-1 w-12 bg-black/20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MigrationNotice;
