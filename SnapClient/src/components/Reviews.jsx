import React, { useState } from 'react';

const Review = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

const reviews = [
  {
    id: 1,
    name: "Anupa Pandey",
    position: "University Student",
    rating: 5,
    text: "SnapNest feels incredibly smooth and intuitive. The UI is clean, modern, and easy to navigate. Infinite scrolling and image layouts are well thought out, making the overall user experience very engaging.",
    image: "AP"
  },
  {
    id: 2,
    name: "Samrakhsyan",
    position: "University Student",
    rating: 5,
    text: "The technical quality behind SnapNest is impressive. Features like Redis-powered image ranking and Django authentication work seamlessly, making the platform both scalable and reliable.",
    image: "SM"
  },
  {
    id: 3,
    name: "Abhinav",
    position: "University Student",
    rating: 5,
    text: "SnapNest is well-architected and polished. The integration of Google OAuth, activity feeds, and bookmarking is smooth and secure. It feels like a production-ready social platform.",
    image: "AB"
  },
  {
    id: 4,
    name: "Sujan",
    position: "University Student",
    rating: 5,
    text: "The overall quality of SnapNest stands out. From performance to usability, everything feels refined. It’s clear a lot of thought went into both the user journey and technical implementation.",
    image: "SJ"
  },
  {
    id: 5,
    name: "Arjit",
    position: "University Student",
    rating: 5,
    text: "SnapNest delivers a premium experience. Image loading is fast, interactions are smooth, and the platform remains stable even with continuous scrolling and heavy usage.",
    image: "AR"
  },
  {
    id: 6,
    name: "Krishal",
    position: "University Student",
    rating: 5,
    text: "As a user, SnapNest feels intuitive and enjoyable. The bookmarking and sharing features are easy to use, and the clean design makes browsing images a great experience.",
    image: "KR"
  },
  {
    id: 7,
    name: "Prayash",
    position: "University Student",
    rating: 5,
    text: "SnapNest showcases strong full-stack engineering. The Django backend pairs nicely with the frontend, and features like activity feeds and rankings feel smooth and well-optimized.",
    image: "PR"
  },
  {
    id: 8,
    name: "Grishma",
    position: "University Student",
    rating: 5,
    text: "I love how easy SnapNest makes it to discover and save images. The design is elegant, the experience is seamless, and it feels like a modern social platform built with care.",
    image: "GR"
  },
  {
    id: 9,
    name: "Shreyak",
    position: "University Student",
    rating: 5,
    text: "SnapNest stands out for its clean design and smooth performance. Browsing, saving, and discovering images feels effortless and well-optimized.",
    image: "SH"
  },
  {
    id: 10,
    name: "Jeetan",
    position: "University Student",
    rating: 5,
    text: "The platform feels fast and reliable. SnapNest handles infinite scrolling and image loading really well without any lag or clutter.",
    image: "JE"
  },
  {
    id: 11,
    name: "Kriti",
    position: "University Student",
    rating: 5,
    text: "SnapNest offers a very pleasant user experience. The layout is minimal yet powerful, and the features feel thoughtfully designed for everyday use.",
    image: "KR"
  },
  {
    id: 12,
    name: "Anamika",
    position: "University Student",
    rating: 5,
    text: "I really enjoy using SnapNest. The interface is modern, the interactions are smooth, and the platform feels both creative and professional.",
    image: "AN"
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