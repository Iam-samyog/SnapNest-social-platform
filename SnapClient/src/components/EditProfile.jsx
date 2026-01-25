import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Save, X } from 'lucide-react';
import axiosInstance, { API_BASE_URL, getFullMediaUrl } from '../utils/axiosInstance';
import Navbar from './Navbar';

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    date_of_birth: '',
    photo: null
  });
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isPhotoDeleted, setIsPhotoDeleted] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get('profile/');
      const profile = response.data;
      const user = profile.user || {};
      
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        date_of_birth: profile.date_of_birth || '',
        photo: null
      });
      
      if (profile.photo) {
        setPreview(getFullMediaUrl(profile.photo));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
      setIsPhotoDeleted(false);
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
    setLoading(true);
    setLoadingMessage('Uploading your data...');

    try {
      const uploadData = new FormData();
      uploadData.append('first_name', formData.first_name);
      uploadData.append('last_name', formData.last_name);
      uploadData.append('email', formData.email);
      
      if (formData.date_of_birth) {
        uploadData.append('date_of_birth', formData.date_of_birth);
      }
      
      if (formData.photo) {
        uploadData.append('photo', formData.photo);
      } else if (isPhotoDeleted) {
        // Send empty string to clear the photo on the backend
        uploadData.append('photo', '');
      }

      setLoadingMessage('Saving changes to server...');
      await axiosInstance.patch('profile/', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setLoadingMessage('Profile updated! Redirecting...');
      // Small delay so user can see the success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'Error updating profile. Please try again.' });
      }
      setLoading(false);
      setLoadingMessage('');
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black font-semibold">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-yellow-400 py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border-4 border-black rounded-lg shadow-2xl p-8">
            <h1 className="text-4xl font-black text-black mb-6">Edit your account</h1>
            <p className="text-black mb-6">You can edit your account using the following form:</p>

            {errors.general && (
              <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
                <p className="font-semibold">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-black font-bold mb-2">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 ${
                    errors.first_name ? 'border-red-500' : 'border-black'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-black`}
                />
                {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
              </div>

              <div className="mb-6">
                <label className="block text-black font-bold mb-2">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 ${
                    errors.last_name ? 'border-red-500' : 'border-black'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-black`}
                />
                {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
              </div>

              <div className="mb-6">
                <label className="block text-black font-bold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 ${
                    errors.email ? 'border-red-500' : 'border-black'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-black`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="mb-6">
                <label className="block text-black font-bold mb-2">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="mb-6">
                <label className="block text-black font-bold mb-2">Profile Photo</label>
                <div className="border-2 border-black border-dashed rounded-lg p-6 text-center">
                  {preview ? (
                    <div className="relative inline-block">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-32 h-32 rounded-full border-4 border-black object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreview(null);
                          setFormData(prev => ({ ...prev, photo: null }));
                          setIsPhotoDeleted(true);
                        }}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <input
                        type="file"
                        name="photo"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="bg-black text-yellow-400 px-6 py-2 rounded-lg font-bold cursor-pointer hover:bg-gray-800 transition-colors inline-block"
                      >
                        Choose Photo
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-black text-yellow-400 py-3 rounded-lg font-bold text-lg uppercase tracking-wide hover:bg-gray-800 transition-colors duration-300 border-2 border-black disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className={`w-5 h-5 ${loading ? 'animate-bounce' : ''}`} />
                  {loading ? loadingMessage : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="bg-gray-200 text-black px-6 py-3 rounded-lg font-bold border-2 border-black hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;



