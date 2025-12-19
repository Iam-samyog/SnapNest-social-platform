import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const ResetPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await axiosInstance.post('auth/password-reset-confirm/', {
        uid,
        token,
        password: formData.password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/auth'), 3000);
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'An error occurred. The link may be invalid or expired.' });
      }
    }
  };

  const goToHomepage = () => {
    navigate('/');
  };

  if (success) {
    return (
      <div className="min-h-screen bg-yellow-400 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full bg-white border-4 border-black rounded-lg shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-black mb-4">Password Reset!</h2>
          <p className="text-black text-lg mb-4">Your password has been successfully reset.</p>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-400 flex items-center justify-center px-6 py-12 relative">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-black mb-2">SnapNest</h1>
          <p className="text-black opacity-75">Capture & Share Your Moments</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white border-4 border-black rounded-lg shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-black mb-6">Reset Password</h2>

          {/* Error Message */}
          {errors.general && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-semibold">{errors.general}</p>
            </div>
          )}

           {/* Error Message (Invalid Token which usually comes as detail or error) */}
           {errors.error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-semibold">{errors.error}</p>
            </div>
           )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-black font-semibold mb-2">New Password:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border-2 ${
                  errors.password ? 'border-red-500' : 'border-black'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-black`}
                placeholder="Enter new password"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-black font-semibold mb-2">Confirm New Password:</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border-2 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-black'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-black`}
                placeholder="Confirm new password"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-black text-yellow-400 py-3 rounded-lg font-bold text-lg uppercase tracking-wide hover:bg-gray-800 transition-colors duration-300 border-2 border-black"
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>

       {/* Floating Homepage Button */}
       <button
        onClick={goToHomepage}
        className="fixed bottom-8 right-8 bg-black text-yellow-400 px-6 py-4 rounded-full font-bold text-lg uppercase tracking-wide shadow-2xl border-4 border-black hover:bg-gray-800 hover:scale-110 transition-all duration-300 z-50 flex items-center gap-3"
        aria-label="Go to homepage"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        Home
      </button>
    </div>
  );
};

export default ResetPassword;
