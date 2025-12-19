import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import SocialLogin from './SocialLogin';

const AuthPages = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const [isSignIn, setIsSignIn] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!isForgotPassword) {
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      }
      if (!isSignIn && !formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!isSignIn && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (!isSignIn && formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (!isSignIn && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
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

    setLoading(true);
    setLoadingMessage(isForgotPassword ? 'Sending reset link...' : (isSignIn ? 'Verifying credentials...' : 'Creating your account...'));
    setErrors({});
    
    try {
      if (isForgotPassword) {
        await axiosInstance.post('auth/password-reset/', {
          email: formData.email,
        });
        setSuccessMessage('If an account exists with this email, a reset link has been sent.');
        setErrors({});
      } else if (isSignIn) {
        // Login: use JWT endpoint
        const res = await axiosInstance.post('auth/token/', {
          username: formData.username,
          password: formData.password,
        });
        
        setLoadingMessage('Success! Prepping dashboard...');
        localStorage.setItem('access', res.data.access);
        localStorage.setItem('refresh', res.data.refresh);
        
        setTimeout(() => {
            navigate('/dashboard');
        }, 800);
      } else {
        // Register: use register endpoint
        setLoadingMessage('Finalizing registration...');
        await axiosInstance.post('auth/register/', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
        // After registration, log in automatically
        setLoadingMessage('Syncing your profile...');
        const res = await axiosInstance.post('auth/token/', {
          username: formData.username,
          password: formData.password,
        });
        
        setLoadingMessage('Welcome to SnapNest! Redirecting...');
        localStorage.setItem('access', res.data.access);
        localStorage.setItem('refresh', res.data.refresh);
        
        setTimeout(() => {
            navigate('/dashboard');
        }, 1000);
      }
    } catch (error) {
      // ... error handling ...
      console.error("Auth Error:", error);
      if (error.response && error.response.data) {
        // Handle different error formats
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          setErrors({ general: errorData });
        } else if (errorData.detail) {
          setErrors({ general: errorData.detail });
        } else if (errorData.non_field_errors) {
          setErrors({ general: errorData.non_field_errors[0] });
        } else {
          setErrors(errorData);
        }
      } else {
        setErrors({ general: 'Server error. Try again.' });
      }
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleSocialLogin = (provider) => {
    alert(`Sign in with ${provider} clicked!`);
  };

  const toggleAuthMode = () => {
    setIsSignIn(!isSignIn);
    setIsForgotPassword(false);
    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
    setSuccessMessage('');
  };

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
    setSuccessMessage('');
  };

  const goToHomepage = () => {
    navigate('/');
  };

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
          {/* Title */}
          <h2 className="text-3xl font-bold text-black mb-2">
            {isForgotPassword ? 'Reset Password' : (isSignIn ? 'Log-in' : 'Sign Up')}
          </h2>

          {/* Success Interface for Forgot Password */}
          {isForgotPassword && successMessage ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Check Your Email</h3>
              <div className="bg-green-50 border-2 border-green-200 text-green-800 px-4 py-3 rounded mb-6">
                 <p>{successMessage}</p>
              </div>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to your email address. Please follow the link to reset your password.
              </p>
              <button
                onClick={toggleAuthMode}
                className="w-full bg-black text-yellow-400 py-3 rounded-lg font-bold text-lg uppercase tracking-wide hover:bg-gray-800 transition-colors duration-300 border-2 border-black"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              {/* Standard Form Content */}
              {/* Success Message for other actions */}
              {!isForgotPassword && successMessage && (
                <div className="bg-green-100 border-2 border-green-500 text-green-700 px-4 py-3 rounded mb-4">
                  <p className="font-semibold">{successMessage}</p>
                </div>
              )}

              {/* Error Message */}
              {errors.general && (
                <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
                  <p className="font-semibold">{errors.general}</p>
                </div>
              )}
              {Object.keys(errors).length > 0 && isSignIn && !isForgotPassword && !errors.general && (
                <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
                  <p className="font-semibold">
                    Your username and password didn't match. Please try again.
                  </p>
                </div>
              )}

              {/* Description */}
              <p className="text-black mb-6">
                {isForgotPassword ? (
                   <>
                    Enter your email address and we'll send you a link to reset your password.{' '}
                    <button
                      onClick={toggleForgotPassword}
                      className="text-black font-bold underline hover:opacity-70"
                    >
                      Back to Log-in
                    </button>
                  </>
                ) : isSignIn ? (
                  <>
                    Please use the following form to log-in. If you don't have an account{' '}
                    <button
                      onClick={toggleAuthMode}
                      className="text-black font-bold underline hover:opacity-70"
                    >
                      Register Here
                    </button>
                  </>
                ) : (
                  <>
                    Create your account to get started. Already have an account?{' '}
                    <button
                      onClick={toggleAuthMode}
                      className="text-black font-bold underline hover:opacity-70"
                    >
                      Sign In Here
                    </button>
                  </>
                )}
              </p>

              <div className="space-y-4 mb-6">
                {/* Feature Unavailable Message for Forgot Password */}
                {isForgotPassword ? (
                  <div className="text-center py-4">
                    <div className="bg-yellow-100 border-2 border-yellow-500 text-yellow-800 p-4 rounded-lg mb-6">
                      <h3 className="font-bold text-lg mb-2">Feature Unavailable</h3>
                      <p className="mb-2">
                        The server does not support email sending at this location currently.
                      </p>
                      <p className="font-semibold mb-2">
                        It will be working soon!
                      </p>
                      <p className="text-sm">
                        In the meantime, please contact the developer directly to request a password reset:
                      </p>
                      <a href="mailto:msamyog37@gmail.com" className="block mt-2 font-bold underline text-black">
                        msamyog37@gmail.com
                      </a>
                    </div>
                    <button
                      onClick={toggleForgotPassword}
                      className="w-full bg-black text-yellow-400 py-3 rounded-lg font-bold text-lg uppercase tracking-wide hover:bg-gray-800 transition-colors duration-300 border-2 border-black"
                    >
                      Back to Log-in
                    </button>
                  </div>
                ) : (
                  /* Standard Auth Forms (Login/Register) */
                   <>
                    {/* Username */}
                    {!isForgotPassword && (
                      <div>
                        <label className="block text-black font-semibold mb-2">Username:</label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border-2 ${
                            errors.username ? 'border-red-500' : 'border-black'
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-black`}
                          placeholder="Enter your username"
                        />
                        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                      </div>
                    )}
    
                    {/* Email (Sign Up only) */}
                    {!isSignIn && (
                      <div>
                        <label className="block text-black font-semibold mb-2">Email:</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border-2 ${
                            errors.email ? 'border-red-500' : 'border-black'
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-black`}
                          placeholder="Enter your email"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                      </div>
                    )}
    
                    {/* Password */}
                    {!isForgotPassword && (
                      <div>
                        <label className="block text-black font-semibold mb-2">Password:</label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border-2 ${
                            errors.password ? 'border-red-500' : 'border-black'
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-black`}
                          placeholder="Enter your password"
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                      </div>
                    )}
    
                    {/* Confirm Password (Sign Up only) */}
                    {!isSignIn && !isForgotPassword && (
                      <div>
                        <label className="block text-black font-semibold mb-2">Confirm Password:</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border-2 ${
                            errors.confirmPassword ? 'border-red-500' : 'border-black'
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-black`}
                          placeholder="Confirm your password"
                        />
                        {errors.confirmPassword && (
                          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                      </div>
                    )}
    
                    {/* Submit Button */}
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className={`w-full bg-black text-yellow-400 py-3 rounded-lg font-bold text-lg uppercase tracking-wide transition-colors duration-300 border-2 border-black flex items-center justify-center gap-2 ${
                        loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
                      }`}
                    >
                        {loading && (
                            <svg className="animate-spin h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {loading 
                            ? loadingMessage 
                            : (isSignIn ? 'Log-in' : 'Sign Up')
                        }
                    </button>
                   </>
                )}
              </div>

              {/* Forgot Password Link */}
              {isSignIn && !isForgotPassword && (
                <div className="text-center mb-6">
                  <button 
                    onClick={toggleForgotPassword} 
                    className="text-black underline hover:opacity-70"
                  >
                    Forgotten your password?
                  </button>
                </div>
              )}
            </>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-black"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-black font-semibold">OR</span>
            </div>
          </div>

          <div className="space-y-3">
            <SocialLogin 
              onError={(msg) => setErrors({ general: msg })}
            />
          </div>

          <p className="text-center text-black text-sm mt-6 opacity-75">
            By continuing, you agree to SnapNest's Terms of Service and Privacy Policy
          </p>
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

export default AuthPages;