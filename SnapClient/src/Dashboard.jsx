import React, { useState } from 'react';
import { Camera, Plus, Settings, Bookmark, Heart, Eye, X, User } from 'lucide-react';
import Navbar from './components/Navbar';

const Dashboard = () => {
  const [showAlert, setShowAlert] = useState(true);

  // Mock data
  const user = {
    username: "john_doe",
    firstName: "John",
    photo: null,
    followers: 1234,
    following: 567
  };

  const activities = [
    { id: 1, user: { firstName: "Sarah", photo: null }, verb: "liked" },
    { id: 2, user: { firstName: "Mike", photo: null }, verb: "bookmarked" },
    { id: 3, user: { firstName: "Emma", photo: null }, verb: "followed" },
    { id: 4, user: { firstName: "Alex", photo: null }, verb: "shared" },
    { id: 5, user: { firstName: "Lisa", photo: null }, verb: "commented" }
  ];

  const images = [
    { id: 1, title: "Sunset Beach", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=300&fit=crop", likes: 245, views: 1203 },
    { id: 2, title: "Mountain Peak", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop", likes: 189, views: 892 },
    { id: 3, title: "City Lights", url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=300&h=300&fit=crop", likes: 432, views: 2104 },
    { id: 4, title: "Forest Path", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop", likes: 321, views: 1567 },
    { id: 5, title: "Ocean Wave", url: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=300&h=300&fit=crop", likes: 567, views: 2890 },
    { id: 6, title: "Desert Dunes", url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=300&h=300&fit=crop", likes: 198, views: 945 },
    { id: 7, title: "Northern Lights", url: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=300&h=300&fit=crop", likes: 789, views: 3421 },
    { id: 8, title: "Waterfall", url: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=300&h=300&fit=crop", likes: 412, views: 1876 },
    { id: 9, title: "Starry Night", url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=300&h=300&fit=crop", likes: 634, views: 2567 }
  ];

  return (
    <>
    
      <div className="max-w-8xl mx-auto bg-gray-50 min-h-screen pb-8">
       <Navbar/>
        {/* Profile Header */}
        <div className="bg-yellow-400 border-b-4 border-black p-4 mb-4 sticky top-0 z-20 shadow-lg">
             
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {user.photo ? (
                <img src={user.photo} alt="Avatar" className="w-16 h-16 rounded-full border-4 border-black" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white border-4 border-black flex items-center justify-center">
                  <User className="w-8 h-8 text-black" />
                </div>
              )}
              <div>
                <h5 className="text-xl font-bold text-black mb-1">{user.firstName || user.username}</h5>
                <p className="text-black text-sm">
                  <span className="font-semibold">{user.followers}</span> followers • 
                  <span className="font-semibold ml-1">{user.following}</span> following
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="bg-white border-2 border-black text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:inline">Bookmark</span>
              </button>
              <button className="bg-black text-yellow-400 px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Upload</span>
              </button>
              <button className="bg-white border-2 border-black text-black px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Alert */}
        {showAlert && (
          <div className="mx-4 mb-4 bg-blue-100 border-2 border-blue-500 rounded-lg p-4 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500 rounded-full p-1 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-black text-sm">
                  <strong>Tip:</strong> Drag the <strong>Bookmark</strong> button to your browser's bookmark bar for quick image sharing from any website!
                </p>
              </div>
            </div>
            <button onClick={() => setShowAlert(false)} className="text-black hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Stories/Activity Section */}
        <div className="bg-white border-b-4 border-black p-4 mb-4 mx-4 rounded-lg shadow-lg">
          <h6 className="text-lg font-bold text-black mb-4">What's Happening</h6>
          <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
            {activities.length > 0 ? (
              activities.map((action) => (
                <div key={action.id} className="flex-shrink-0 text-center" style={{ minWidth: '80px' }}>
                  <div className="w-16 h-16 rounded-full border-4 border-yellow-400 p-1 mx-auto mb-2">
                    {action.user.photo ? (
                      <img src={action.user.photo} alt="User" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-black truncate">{action.user.firstName}</p>
                  <p className="text-xs text-gray-600">{action.verb}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recent activity. Follow users to see updates!</p>
            )}
          </div>
        </div>

        {/* Image Feed Grid */}
        <div className="px-4">
          {images.length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
              {images.map((image) => (
                <div key={image.id} className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg border-2 border-black">
                  <img 
                    src={image.url} 
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
                    <div className="flex items-center gap-2 text-white text-sm font-semibold">
                      <Heart className="w-4 h-4" />
                      <span>{image.likes}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white text-sm font-semibold">
                      <Eye className="w-4 h-4" />
                      <span>{image.views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border-4 border-black">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h5 className="text-xl font-bold text-black mb-2">No images yet</h5>
              <p className="text-gray-600 mb-6">Start by uploading or bookmarking images!</p>
              <button className="bg-black text-yellow-400 px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors">
                Upload Your First Image
              </button>
            </div>
          )}
        </div>
      </div>
      </>

   
  );
};

export default Dashboard;