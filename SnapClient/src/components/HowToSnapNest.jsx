import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faCloudArrowUp, faBookBookmark } from '@fortawesome/free-solid-svg-icons';

const HowToSnapNest = () => {
  const steps = [
    {
      number: "01",
      title: "Create Your Account",
      description: "Sign up in seconds with your Gmail/Github or mail account. No complicated forms, just quick and easy registration.",
      icon: faUserPlus
    },
    {
      number: "02",
      title: "Upload/BookMark Pictures",
      description: "Drag and drop your photos or Bookmark the images you see on the internet. SnapNest automatically organizes them by people.",
      icon: faCloudArrowUp
    },
    {
      number: "03",
      title: "Like,Comment and Rank",
      description: "SnapNest Ranks the top images based on the number of views it got. Users can like and comment on the images",
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
                <div key={index} data-aos="fade-up" data-aos-delay={index * 100} className="w-full">
                  <div className="flex flex-col sm:flex-row justify-center items-center mb-10 md:mb-8">
                    <div className="bg-white rounded-2xl shadow-2xl border-4 border-black p-6 sm:p-8 w-full max-w-2xl hover:scale-105 transition-transform duration-300 relative group">
                      <div className="absolute -top-5 -left-5 md:-top-6 md:-left-6 bg-yellow-400 rounded-full w-10 h-10 md:w-16 md:h-16 flex items-center justify-center border-4 border-black shadow-xl z-20">
                        <span className="text-base md:text-xl font-bold">{step.number}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6 md:ml-8 mt-2 sm:mt-0">
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