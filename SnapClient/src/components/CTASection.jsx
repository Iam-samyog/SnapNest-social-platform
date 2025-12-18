import React from 'react';

import { useNavigate } from "react-router-dom";

const CTASection = () => {
    const navigate=useNavigate();
  const handleRegister = () => {
     navigate("/auth");
  };

  const handleSignIn = () => {
     navigate("/auth");
  };

  return (
    <div className=" py-20 px-6">
      <div className="max-w-5xl mx-auto text-center">
        {/* Brand Name */}
        <h1 className="text-7xl font-black text-black mb-8 tracking-tight">
          SnapNest
        </h1>

        {/* Description */}
        <p className="text-black text-xl leading-relaxed mb-12 max-w-3xl mx-auto opacity-90">
           SnapNest is your space to capture, organize, and share life’s best moments. Whether you’re a pro or just love photos, join our creative community and showcase your memories with ease.

        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button
            onClick={handleRegister}
            className="bg-black text-yellow-400 px-12 py-5 rounded-lg font-bold text-xl uppercase tracking-wide hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 shadow-2xl border-4 border-black"
          >
            Register Now
          </button>
          
          <button
            onClick={handleSignIn}
            className="bg-white text-black px-12 py-5 rounded-lg font-bold text-xl uppercase tracking-wide hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-2xl border-4 border-black"
          >
            Sign In
          </button>
        </div>

        {/* Additional Info */}
        <p className="text-black text-sm mt-8 opacity-75">
          Join over 100,000+ users already using SnapNest
        </p>
      </div>
    </div>
  );
};

export default CTASection;