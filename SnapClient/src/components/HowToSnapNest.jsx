import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faCloudArrowUp, faBookBookmark } from '@fortawesome/free-solid-svg-icons';

const HowToSnapNest = () => {
  const steps = [
    {
      number: "01",
      title: "Create Your Account",
      description: "Sign up in seconds with your email or social media. No complicated forms, just quick and easy registration.",
      icon: faUserPlus
    },
    {
      number: "02",
      title: "Upload Your Memories",
      description: "Drag and drop your photos and videos. SnapNest automatically organizes them by date, location, and people.",
      icon: faCloudArrowUp
    },
    {
      number: "03",
      title: "Organize & Create Albums",
      description: "Create custom albums for different occasions. Tag people, add descriptions, and relive your favorite moments.",
      icon: faBookBookmark
    },
  ];

  return (
    <div className="w-full bg-white mt-4">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="w-full flex flex-col items-center justify-center p-4 sm:p-8 relative">
          <div className="w-full max-w-4xl mx-auto relative">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-black mb-4">
                How to Use SnapNest
              </h2>
              <p className="text-lg sm:text-xl text-yellow-600">
                Your journey with SnapNest
              </p>
            </div>
            <div className="relative">
              {steps.map((step, index) => (
                <div key={index}>
                  <div className="flex flex-col sm:flex-row justify-center items-center mb-8">
                    <div className="bg-white rounded-2xl shadow-2xl border-4 border-black p-4 sm:p-8 w-full max-w-2xl hover:scale-105 transition-transform duration-300 relative">
                      <div className="absolute -top-6 -left-6 bg-yellow-400 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center border-4 border-black shadow-xl">
                        <span className="text-lg sm:text-xl font-bold">{step.number}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 ml-0 sm:ml-8">
                        <div className="flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14 bg-yellow-400 rounded-xl flex items-center justify-center text-xl sm:text-2xl border-2 border-black">
                          <FontAwesomeIcon icon={step.icon} size="lg" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl sm:text-2xl font-bold text-black mb-2 sm:mb-3">
                            {step.title}
                          </h3>
                          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex justify-center mb-8">
                      <div className="w-1 h-10 sm:h-16 bg-black relative">
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-black"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToSnapNest;