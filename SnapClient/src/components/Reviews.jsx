import React, { useState } from 'react';

const Review = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const reviews = [
    {
      id: 1,
      name: "Sarah Johnson",
      position: "CEO, Tech Solutions",
      rating: 5,
      text: "Exceptional service! The team went above and beyond to deliver outstanding results. Their professionalism and attention to detail made all the difference in our project.",
      image: "SJ"
    },
    {
      id: 2,
      name: "Michael Chen",
      position: "Marketing Director",
      rating: 5,
      text: "Working with this team has been an absolute pleasure. They understood our vision perfectly and brought it to life with incredible precision and creativity.",
      image: "MC"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      position: "Founder, StartupHub",
      rating: 5,
      text: "I highly recommend their services! They delivered beyond our expectations and the results speak for themselves. Professional, responsive, and truly talented.",
      image: "ER"
    },
    {
      id: 4,
      name: "David Thompson",
      position: "Product Manager",
      rating: 5,
      text: "Outstanding work from start to finish. The attention to detail and commitment to quality is unmatched. They made the entire process smooth and enjoyable.",
      image: "DT"
    },
    {
      id: 5,
      name: "Lisa Anderson",
      position: "Creative Director",
      rating: 5,
      text: "Simply amazing! Their creativity and technical expertise transformed our brand. The team is responsive, professional, and delivers exceptional quality every time.",
      image: "LA"
    },
    {
      id: 6,
      name: "James Wilson",
      position: "Operations Lead",
      rating: 5,
      text: "Best decision we made for our business! The results exceeded all expectations and the ROI has been incredible. Highly professional and truly dedicated team.",
      image: "JW"
    }
  ];

  const reviewsPerPage = 3;
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === totalPages - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? totalPages - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const getCurrentReviews = () => {
    const start = currentIndex * reviewsPerPage;
    return reviews.slice(start, start + reviewsPerPage);
  };

  return (
    <div className="bg-yellow-400 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-black mb-4 uppercase tracking-tight">
            User  Reviews
          </h2>
          <p className="text-xl text-black opacity-90">
            See what our users  have to say about us
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Review Cards Grid */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {Array.from({ length: totalPages }).map((_, pageIndex) => (
                <div 
                  key={pageIndex}
                  className="w-full flex-shrink-0"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                    {reviews.slice(pageIndex * reviewsPerPage, (pageIndex + 1) * reviewsPerPage).map((review) => (
                      <div 
                        key={review.id}
                        className="bg-white border-4 border-black rounded-lg p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300"
                      >
                        {/* Stars */}
                        <div className="flex gap-1 mb-4">
                          {[...Array(review.rating)].map((_, i) => (
                            <svg
                              key={i}
                              className="w-5 h-5 fill-yellow-400 stroke-black"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                        </div>

                        {/* Review Text */}
                        <p className="text-black text-base leading-relaxed mb-6 italic">
                          "{review.text}"
                        </p>

                        {/* Reviewer Info */}
                        <div className="flex items-center gap-3 mt-auto">
                          <div className="w-12 h-12 bg-yellow-400 border-2 border-black rounded-full flex items-center justify-center font-bold text-lg text-black flex-shrink-0">
                            {review.image}
                          </div>
                          <div>
                            <h4 className="font-bold text-black text-base">{review.name}</h4>
                            <p className="text-black opacity-75 text-sm">{review.position}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-black text-yellow-400 w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl hover:bg-gray-800 transition-colors duration-300 shadow-lg z-10"
            aria-label="Previous reviews"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-black text-yellow-400 w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl hover:bg-gray-800 transition-colors duration-300 shadow-lg z-10"
            aria-label="Next reviews"
          >
            ›
          </button>
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center gap-3 mt-12">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentIndex === index 
                  ? 'bg-black w-8' 
                  : 'bg-black opacity-30 hover:opacity-50'
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Review;