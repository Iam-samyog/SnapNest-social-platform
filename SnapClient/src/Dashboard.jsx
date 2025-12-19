import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faPlus, faCog, faBookmark, faHeart, faEye, faTimes, faUser } from '@fortawesome/free-solid-svg-icons';
import Navbar from './components/Navbar';
import ImageModal from './components/ImageModal';
import axiosInstance, { API_BASE_URL, getFullMediaUrl } from './utils/axiosInstance';

const Dashboard = () => {
  const [showAlert, setShowAlert] = useState(true);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const bookmarkletRef = useRef(null);

  useEffect(() => {
    if (bookmarkletRef.current) {
      const bookmarkletCode = `javascript:(function(){
        var frontendUrl = '${window.location.origin}/';
        var minWidth = 200;
        var minHeight = 200;

        if (window.__snapnest_open) {
          var el = document.getElementById('snapnest-bookmarklet');
          if(el) el.remove();
          window.__snapnest_open = false;
          return;
        }
        window.__snapnest_open = true;

        var css = \`
          #snapnest-bookmarklet { position: fixed; top: 20px; right: 20px; width: 380px; max-height: 80vh; background: #ffffff; border: 4px solid #000000; border-radius: 12px; box-shadow: 8px 8px 0px 0px #000000; z-index: 2147483647; font-family: sans-serif; display: flex; flex-direction: column; overflow: hidden; }
          #snapnest-bookmarklet .snapnest-header { background: #fbbf24; border-bottom: 4px solid #000000; padding: 16px; display: flex; justify-content: space-between; align-items: center; }
          #snapnest-bookmarklet .snapnest-logo { font-weight: 900; font-size: 20px; color: #000000; text-transform: uppercase; }
          #snapnest-bookmarklet #snapnest-close { font-size: 28px; line-height: 1; color: #000000; text-decoration: none; font-weight: bold; cursor: pointer; }
          #snapnest-bookmarklet .snapnest-content { padding: 16px; overflow-y: auto; background: #fff; }
          #snapnest-bookmarklet h1 { font-size: 16px; font-weight: 700; margin: 0 0 16px 0; color: #000000; }
          #snapnest-bookmarklet .snapnest-images { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px; }
          #snapnest-bookmarklet .snapnest-img-wrapper { aspect-ratio: 1; border: 2px solid #e5e7eb; border-radius: 8px; overflow: hidden; cursor: pointer; position: relative; }
          #snapnest-bookmarklet .snapnest-img-wrapper:hover { border-color: #000000; box-shadow: 2px 2px 0px 0px #000000; }
          #snapnest-bookmarklet .snapnest-img-wrapper img { width: 100%; height: 100%; object-fit: cover; display: block; }
          #snapnest-bookmarklet .snapnest-info { font-size: 13px; color: #6b7280; text-align: center; }
        \`;

        var style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);

        var boxHtml = \`
          <div id="snapnest-bookmarklet">
            <div class="snapnest-header">
                <span class="snapnest-logo">SnapNest</span>
                <a href="#" id="snapnest-close">&times;</a>
            </div>
            <div class="snapnest-content">
                <h1>Select an image to bookmark:</h1>
                <div class="snapnest-images"></div>
                <p class="snapnest-info"></p>
            </div>
          </div>\`;
        
        var div = document.createElement('div');
        div.innerHTML = boxHtml;
        document.body.appendChild(div.firstElementChild);

        var bookmarklet = document.getElementById('snapnest-bookmarklet');
        var imagesContainer = bookmarklet.querySelector('.snapnest-images');
        var imagesInfo = bookmarklet.querySelector('.snapnest-info');

        bookmarklet.querySelector('#snapnest-close').addEventListener('click', function(e){
          e.preventDefault();
          bookmarklet.remove();
          window.__snapnest_open = false;
        });

        var validCount = 0;
        var images = document.querySelectorAll('img');
        
        for(var i=0; i<images.length; i++) {
          var img = images[i];
          if(img.naturalWidth >= minWidth && img.naturalHeight >= minHeight && img.src.startsWith('http')) {
             var wrapper = document.createElement('div');
             wrapper.className = 'snapnest-img-wrapper';
             var newImg = document.createElement('img');
             newImg.src = img.src;
             newImg.onclick = function(e) {
                bookmarklet.remove();
                window.__snapnest_open = false;
                window.open(frontendUrl + 'images/upload?url=' + encodeURIComponent(e.target.src) + '&title=' + encodeURIComponent(document.title), '_blank');
             };
             wrapper.appendChild(newImg);
             imagesContainer.appendChild(wrapper);
             validCount++;
          }
        }
        
        imagesInfo.textContent = validCount === 0 ? 'No large images found.' : 'Found ' + validCount + ' image(s).';
      })()`;
      
      const cleanCode = bookmarkletCode.replace(/\s+/g, ' ').trim();
      bookmarkletRef.current.setAttribute('href', cleanCode);
    }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Check if user is authenticated
        const token = localStorage.getItem('access');
        if (!token) {
          navigate('/auth');
          return;
        }

        // Fetch user profile
        const profileRes = await axiosInstance.get('profile/');
        const profileData = profileRes.data;
        
        // Extract user data from profile response
        const userData = {
          username: profileData.user?.username || 'User',
          firstName: profileData.user?.first_name || profileData.user?.username || 'User',
          photo: profileData.photo || null,
          followers: profileData.followers_count || 0,
          following: profileData.following_count || 0,
        };

        // Fetch user's images
        try {
          const imagesRes = await axiosInstance.get('images/');
          // Get all images and filter by current user
          let allImages = imagesRes.data.results || imagesRes.data || [];
          // Filter images by current user
          if (profileData.user?.username) {
            allImages = allImages.filter(img => img.user === profileData.user.username);
          }
          // Transform images to match our format
          const transformedImages = allImages.map(img => {
            // Priority: img.image (local/Cloudinary copy) > img.url (external source)
            const imageUrl = getFullMediaUrl(img.image || img.url);
            
            return {
              id: img.id,
              title: img.title || 'Untitled',
              url: imageUrl,
              likes: img.total_likes || 0,
              views: img.total_views || 0,
            };
          });
          setImages(transformedImages);
        } catch (imgError) {
          console.error('Error fetching images:', imgError);
          setImages([]);
        }

        // For now, activities will be empty until we have an actions API
        setActivities([]);
        setUser(userData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          navigate('/auth');
        } else {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="max-w-8xl mx-auto bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }



  if (!user) {
    return null;
  }

  return (
    <>
      <div className="max-w-8xl mx-auto bg-gray-50 min-h-screen pb-8">
        <Navbar/>
        {/* Profile Header */}
        <div className="bg-yellow-400 border-b-4 border-black p-4 py-10 mb-4 sticky top-0 z-20 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {user.photo ? (
                <img 
                  src={getFullMediaUrl(user.photo)} 
                  alt="Avatar" 
                  className="w-35 h-35 rounded-full border-4 border-black object-cover" 
                />
              ) : (
                <div className="w-35 h-35 rounded-full bg-white border-4 border-black flex items-center justify-center">
                  <FontAwesomeIcon icon={faUser} className="text-black text-2xl" />
                </div>
              )}
              <div>
                <h5 className="text-2xl font-bold text-black mb-1">{user.firstName || user.username}</h5>
                <p className="text-black text-sm">
                  <span className="font-semibold text-xl">{user.followers}</span> followers • 
                  <span className="font-semibold ml-1 text-xl">{user.following}</span> following
                </p>
                <p>
                <div className="flex gap-2">
              <a 
                ref={bookmarkletRef}
                className="bg-white border-2 border-black text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2 cursor-grab active:cursor-grabbing"
                title="Drag me to your bookmarks bar or click to test!"
              >
                <FontAwesomeIcon icon={faBookmark} />
                <span className="hidden sm:inline">SnapNest Bookmark</span>
              </a>
              <button 
                onClick={() => navigate('/images/upload')}
                className="bg-black text-yellow-400 px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span className="hidden sm:inline">Upload</span>
              </button>
              <button 
                onClick={() => navigate('/profile/edit')}
                className="bg-white border-2 border-black text-black px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FontAwesomeIcon icon={faCog} className="text-xl" />
              </button>
            </div>  
                </p>
              </div>
              
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
                  If the bookmark is not visible, click on the <strong>Cmd + shift + B</strong> to show the bookmark bar .</p>
              </div>
            </div>
            <button onClick={() => setShowAlert(false)} className="text-black hover:text-gray-700">
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
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
                        <FontAwesomeIcon icon={faUser} className="text-gray-500" />
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
                <div 
                  key={image.id} 
                  onClick={() => {
                    setSelectedImageId(image.id);
                    setIsModalOpen(true);
                  }}
                  className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg border-2 border-black"
                >
                  <img 
                    src={image.url} 
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
                    <div className="flex items-center gap-2 text-white text-sm font-semibold">
                      <FontAwesomeIcon icon={faHeart} />
                      <span>{image.likes}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white text-sm font-semibold">
                      <FontAwesomeIcon icon={faEye} />
                      <span>{image.views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border-4 border-black">
              <FontAwesomeIcon icon={faCamera} className="text-gray-400 text-6xl mx-auto mb-4" />
              <h5 className="text-xl font-bold text-black mb-2">No images yet</h5>
              <p className="text-gray-600 mb-6">Start by uploading or bookmarking images!</p>
              <button 
                onClick={() => navigate('/images/upload')}
                className="bg-black text-yellow-400 px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
              >
                Upload Your First Image
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Image Modal */}
      <ImageModal
        imageId={selectedImageId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedImageId(null);
        }}
      />
      </>

   
  );
};

export default Dashboard;