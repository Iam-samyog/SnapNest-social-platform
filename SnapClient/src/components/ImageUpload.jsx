import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTimes, faLink, faBookmark, faCamera, faSync } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../utils/axiosInstance';
import Navbar from './Navbar';

const ImageUpload = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = React.useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null,
    url: ''
  });
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    return () => {
      // Cleanup stream on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlParam = searchParams.get('url');
    const titleParam = searchParams.get('title');

    if (urlParam) {
      setIsUrlMode(true);
      setFormData(prev => ({
        ...prev,
        url: urlParam,
        title: titleParam || ''
      }));
      setPreview(urlParam);
    }
  }, [location]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraMode(true);
      setIsUrlMode(false);
      setPreview(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setErrors({ general: "Could not access camera. Please check permissions." });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraMode(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setFormData(prev => ({ ...prev, image: file, url: '' }));
        setPreview(canvas.toDataURL('image/jpeg'));
        stopCamera();
      }, 'image/jpeg', 0.9);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUrlMode(false);
      setIsCameraMode(false);
      setFormData(prev => ({ ...prev, image: file, url: '' }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }

    if (!isUrlMode && !formData.image) {
      setErrors({ image: 'Image file is required' });
      return;
    }

    setLoading(true);
    setLoadingMessage(isUrlMode ? 'Saving bookmark...' : 'Uploading image to server...');
    
    try {
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      
      if (isUrlMode) {
         uploadData.append('url', formData.url);
      } else {
         uploadData.append('image', formData.image);
      }

      setLoadingMessage('Optimizing and saving details...');
      const response = await axiosInstance.post('images/', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setLoadingMessage('Success! Opening image...');
      setTimeout(() => {
        navigate(`/images/${response.data.id}`);
      }, 800);
      
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'Error uploading image. Please try again.' });
      }
      setLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-yellow-400 py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border-4 border-black rounded-lg shadow-2xl p-8">
            <h1 className="text-4xl font-black text-black mb-6 flex items-center gap-3">
              {isUrlMode ? <FontAwesomeIcon icon={faBookmark} className="w-10 h-10" /> : <FontAwesomeIcon icon={faUpload} className="w-10 h-10" />}
              {isUrlMode ? 'Bookmark Image' : 'Upload an Image'}
            </h1>

            {errors.general && (
              <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
                <p className="font-semibold">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-black font-bold mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 ${
                    errors.title ? 'border-red-500' : 'border-black'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-black`}
                  placeholder="Enter image title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div className="mb-6">
                <label className="block text-black font-bold mb-2">Description (optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  rows="4"
                  placeholder="Enter image description"
                />
              </div>

              <div className="mb-6">
                <label className="block text-black font-bold mb-2">
                  {isUrlMode ? 'Image URL' : 'Image Source *'}
                </label>
                
                {isUrlMode && (
                  <div className="mb-4 bg-gray-100 p-3 rounded border-2 border-gray-300 flex items-center gap-2 overflow-hidden">
                    <FontAwesomeIcon icon={faLink} className="text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600 truncate">{formData.url}</span>
                  </div>
                )}

                <div className={`border-2 border-black border-dashed rounded-lg p-6 text-center ${isUrlMode ? 'bg-gray-50' : ''}`}>
                  {isCameraMode ? (
                    <div className="relative">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full max-h-64 mx-auto rounded-lg border-2 border-black object-cover"
                      />
                      <div className="mt-4 flex justify-center gap-4">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="bg-black text-yellow-400 px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faCamera} /> Capture
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : preview ? (
                    <div className="relative">
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-w-full max-h-64 mx-auto rounded-lg border-2 border-black"
                      />
                      {!isUrlMode && (
                        <button
                          type="button"
                          onClick={() => {
                            setPreview(null);
                            setFormData(prev => ({ ...prev, image: null }));
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <div>
                          <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="image-upload"
                          />
                          <label
                            htmlFor="image-upload"
                            className="w-full sm:w-auto bg-black text-yellow-400 px-6 py-3 rounded-lg font-bold cursor-pointer hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                          >
                            <FontAwesomeIcon icon={faUpload} /> Choose File
                          </label>
                        </div>
                        
                        <button
                          type="button"
                          onClick={startCamera}
                          className="bg-white border-2 border-black text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                        >
                          <FontAwesomeIcon icon={faCamera} /> Take Photo
                        </button>
                      </div>
                      <p className="text-gray-600 text-sm">Upload a file or use your camera</p>
                    </div>
                  )}
                </div>
                {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                {errors.url && <p className="text-red-500 text-sm mt-1">{errors.url}</p>}
                {isUrlMode && (
                    <button 
                        type="button"
                        onClick={() => {
                            setIsUrlMode(false);
                            setFormData(prev => ({ ...prev, url: '', title: '' }));
                            setPreview(null);
                            navigate('/images/upload');
                        }}
                        className="text-sm text-red-500 mt-2 hover:underline"
                    >
                        Cancel URL Upload (Upload File Instead)
                    </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || isCameraMode}
                className="w-full bg-black text-yellow-400 py-3 rounded-lg font-bold text-lg uppercase tracking-wide hover:bg-gray-800 transition-colors duration-300 border-2 border-black disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Upload className="w-5 h-5 animate-bounce" />}
                {loading ? loadingMessage : (isUrlMode ? 'Save Bookmark' : 'Upload Image')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageUpload;

