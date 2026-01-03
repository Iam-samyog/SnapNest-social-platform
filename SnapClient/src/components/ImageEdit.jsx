import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Image as ImageIcon } from 'lucide-react';
import axiosInstance, { getFullMediaUrl } from '../utils/axiosInstance';
import Navbar from './Navbar';

const ImageEdit = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchImageDetails();
  }, [uuid]);

  const fetchImageDetails = async () => {
    try {
      const response = await axiosInstance.get(`images/${uuid}/`);
      const data = response.data;
      setImage(data);
      setFormData({
        title: data.title || '',
        description: data.description || '',
      });
    } catch (error) {
      console.error('Error fetching image for edit:', error);
      if (error.response?.status === 404) {
        alert('Image not found');
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }

    setSaving(true);
    try {
      await axiosInstance.patch(`images/${uuid}/`, {
        title: formData.title,
        description: formData.description,
      });
      navigate(`/images/${uuid}`);
    } catch (error) {
      console.error('Error updating image:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'Error updating image. Please try again.' });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black font-semibold">Loading details...</p>
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
            <h1 className="text-4xl font-black text-black mb-6 flex items-center gap-3">
              <ImageIcon className="w-10 h-10" />
              Edit Image
            </h1>

            {errors.general && (
              <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
                <p className="font-semibold">{errors.general}</p>
              </div>
            )}

            <div className="mb-8">
              <p className="text-black font-bold mb-2">Image Preview</p>
              <div className="aspect-video relative rounded-lg overflow-hidden border-4 border-black bg-gray-100">
                <img
                  src={getFullMediaUrl(image.image || image.url)}
                  alt={image.title}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

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
                <label className="block text-black font-bold mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  rows="4"
                  placeholder="Enter image description"
                />
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-black text-yellow-400 py-4 rounded-lg font-bold text-lg uppercase tracking-wide hover:bg-gray-800 transition-colors duration-300 border-2 border-black disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-6 h-6" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/images/${uuid}`)}
                  className="bg-gray-200 text-black px-8 py-4 rounded-lg font-bold border-2 border-black hover:bg-gray-300 transition-colors"
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

export default ImageEdit;
