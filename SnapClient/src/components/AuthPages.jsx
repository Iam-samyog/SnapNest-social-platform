import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const AuthPages = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
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
      if (isSignIn) {
        // Login: use JWT endpoint
        const res = await axiosInstance.post('auth/token/', {
          username: formData.username,
          password: formData.password,
        });
        localStorage.setItem('access', res.data.access);
        localStorage.setItem('refresh', res.data.refresh);
        navigate('/dashboard');
      } else {
        // Register: use register endpoint
        await axiosInstance.post('auth/register/', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
        // After registration, log in automatically
        const res = await axiosInstance.post('auth/token/', {
          username: formData.username,
          password: formData.password,
        });
        localStorage.setItem('access', res.data.access);
        localStorage.setItem('refresh', res.data.refresh);
        navigate('/dashboard');
      }
    } catch (error) {
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
    }
  };


   
  const handleSocialLogin = (provider) => {
    alert(`Sign in with ${provider} clicked!`);
  };

  const toggleAuthMode = () => {
    setIsSignIn(!isSignIn);
    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
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
            {isSignIn ? 'Log-in' : 'Sign Up'}
          </h2>

          {/* Error Message */}
          {errors.general && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-semibold">{errors.general}</p>
            </div>
          )}
          {Object.keys(errors).length > 0 && isSignIn && !errors.general && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-semibold">
                Your username and password didn't match. Please try again.
              </p>
            </div>
          )}

          {/* Description */}
          <p className="text-black mb-6">
            {isSignIn ? (
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

          {/* Form fields... (unchanged for brevity) */}
          <div className="space-y-4 mb-6">
            {/* Username */}
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

            {/* Confirm Password (Sign Up only) */}
            {!isSignIn && (
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
              className="w-full bg-black text-yellow-400 py-3 rounded-lg font-bold text-lg uppercase tracking-wide hover:bg-gray-800 transition-colors duration-300 border-2 border-black"
            >
              {isSignIn ? 'Log-in' : 'Sign Up'}
            </button>
          </div>

          {/* Forgot Password, Divider, Social Login, Footer... (unchanged) */}
          {isSignIn && (
            <div className="text-center mb-6">
              <button className="text-black underline hover:opacity-70">
                Forgotten your password?
              </button>
            </div>
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
            <button
              onClick={() => handleSocialLogin('Google')}
              className="w-full bg-white border-2 border-black text-black py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>

            <button
              onClick={() => handleSocialLogin('GitHub')}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              Sign in with GitHub
            </button>
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