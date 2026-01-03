import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HeroPage() {
  return (
    <div className="relative w-full bg-yellow-400 overflow-hidden py-12 md:py-24">
      {/* Dynamic Background Elements */}
      <div className="absolute top-20 right-[10%] w-64 h-64 bg-black/5 rounded-full blur-3xl animate-drift pointer-events-none" />
      <div className="absolute bottom-20 left-[5%] w-96 h-96 bg-black/10 rounded-full blur-3xl animate-drift pointer-events-none" />
      
      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="container mx-auto max-w-[1450px] px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Content Side */}
          <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left relative z-10" data-aos="fade-up">
          
            
            <h1 className="text-[2.75rem] md:text-8xl font-black text-black leading-[0.95] md:leading-[0.9] tracking-tighter">
              CAPTURE <span className="decoration-black decoration-4 md:decoration-8 underline-offset-4 md:underline-offset-8">MOMENTS.</span><br />
              CREATE <span className="opacity-40">MEMORIES.</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-black font-bold max-w-xl leading-relaxed mx-auto lg:mx-0">
              Join the most aesthetic community to organize, discover, and share your visual stories. Effortless bookmarking, beautiful collections.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
              <Link to="/auth" className="w-full sm:w-auto">
                <button className="group w-full bg-black text-yellow-400 px-10 py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-[1.05] active:scale-95 transition-all shadow-2xl border-4 border-black">
                  START SNAPPING
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </button>
              </Link>
              <Link to="/auth" className="w-full sm:w-auto">
                <button className="w-full px-10 py-5 rounded-2xl font-black text-black bg-white border-4 border-black hover:bg-gray-100 transition-all shadow-xl">
                  SIGN IN
                </button>
              </Link>
            </div>

            {/* <div className="pt-8 flex items-center gap-4 justify-center lg:justify-start">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-black bg-white shadow-xl flex items-center justify-center font-black text-xs">
                    {i}
                  </div>
                ))}
              </div>
              <p className="text-sm font-black text-black tracking-tight uppercase">
                TRUSTED BY <span className="bg-black text-yellow-400 px-2 py-0.5 rounded">10K+</span> CREATIVES
              </p>
            </div> */}
          </div>

          {/* Visualization Side */}
          <div className="w-full lg:w-1/2 relative" data-aos="zoom-in" data-aos-delay="200">
            <div className="relative z-10 ">
              {/* Main Image Container */}
              <div className="aspect-square w-full max-w-[600px] mx-auto bg-black rounded-[48px] overflow-hidden rotate-3 shadow-[0_40px_80px_rgba(0,0,0,0.3)] border-8 border-black relative group">
                <img 
                  src="image/main.svg" 
                  alt="SnapNest Illustration" 
                  className="w-full h-full object-contain p-8 md:p-12 -rotate-3 transition-transform duration-700 "
                />
                <div className="absolute inset-0 bg-yellow-400/10 mix-blend-overlay pointer-events-none" />
              </div>
              
              {/* Floating High-Contrast Badges */}
              <div className="absolute top-10 -left-10 bg-black text-yellow-400 px-8 py-4 rounded-2xl shadow-2xl -rotate-6 hidden md:block border-4 border-yellow-400 scale-110">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black uppercase tracking-tighter">New Like! ❤️</span>
                </div>
              </div>

              <div className="absolute bottom-20 -right-10 bg-white text-black px-8 py-4 rounded-2xl shadow-2xl rotate-6 hidden md:block border-4 border-black scale-110">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black uppercase tracking-tighter">Trending ✨</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}