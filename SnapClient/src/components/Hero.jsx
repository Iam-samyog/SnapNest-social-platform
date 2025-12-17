export default function HeroPage() {
  return (
    <div className="w-full bg-white">
      <div className="container mx-auto max-w-[1600px] flex flex-col md:flex-row min-h-[500px] md:min-h-[800px]">
        {/* Left Side - SVG */}
        <div className="hidden sm:block w-full md:w-3/5 flex items-center justify-center p-6 md:p-12 relative">
          <div className="w-full h-full flex items-center justify-center relative z-10">
            <img 
              src="image/main.svg" 
              alt="SnapNest Illustration" 
              className="max-w-full max-h-[800px] md:max-h-[1000px] object-contain"
            />
          </div>
        </div>

        {/* Right Side - Content with Wave */}
        <div className="bg-yellow sm:bg-white w-full md:w-2/5 relative flex items-center justify-center p-6 md:p-12">
          {/* Wave Background */}
          <svg 
            className="absolute inset-0 w-full h-full "
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
                className="hidden sm:block"
              d="M0,0 Q100,500 0,1000 L1000,1000 L1000,0 Z" 
              fill="#FFC801"
            />
          </svg>
          <div className="max-w-md w-full space-y-8 relative z-10 ">
            {/* Logo/Title */}
            <div className="text-left">
              <h1 className="text-4xl md:text-7xl font-black text-black mb-4">
                SnapNest
              </h1>
              <p className="text-lg md:text-xl text-black leading-round">
                Capture, organize, and share your precious moments effortlessly. 
                SnapNest brings all your memories together in one beautiful, 
                secure place.
              </p>
            </div>
            {/* Buttons */}
            <div className="space-y-4 pt-6">
              <button className="w-full bg-gray-900 text-white py-3 md:py-4 px-6 rounded-lg text-base md:text-lg font-semibold hover:bg-gray-800 transition-colors duration-200 shadow-lg">
                Sign In
              </button>
              <button className="w-full bg-white text-gray-900 py-3 md:py-4 px-6 rounded-lg text-base md:text-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg border-2 border-gray-900">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}