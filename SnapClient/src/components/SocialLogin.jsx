import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const SocialLogin = ({ onSuccess, onError }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Google Login Success Handler
    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            // Send the access token (credential) to backend
            const response = await axiosInstance.post('auth/social/google-oauth2/', {
                access_token: credentialResponse.credential 
            });
            
            // Store tokens
            localStorage.setItem('access', response.data.access);
            localStorage.setItem('refresh', response.data.refresh);
            
            if (onSuccess) onSuccess(response.data);
            navigate('/dashboard');
        } catch (error) {
            console.error('Google Login Error:', error);
            if (onError) onError(error.response?.data?.error || 'Google login failed');
        } finally {
            setLoading(false);
        }
    };

    // GitHub Login Handler (Redirect Flow)
    const handleGitHubLogin = () => {
        setLoading(true);
        const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
        // The redirect URI should point to a simplified callback route in your frontend
        // e.g., http://localhost:3000/auth/callback/github
        const REDIRECT_URI = `${window.location.origin}/auth/callback/github`;
        
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user:email`;
    };

    return (
        <div className="flex flex-col gap-3 mt-4 w-full">
            <div className="flex flex-col gap-3">
                 {/* Google Login Button managed by the library */}
                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => onError && onError('Google Login Failed')}
                        useOneTap
                        shape="rectangular"
                        theme="outline"
                        width="100%"
                    />
                </div>

                {/* GitHub Login Button (Custom) */}
                <button
                    type="button"
                    onClick={handleGitHubLogin}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 w-full bg-[#24292e] text-white py-2 px-4 rounded-[4px] font-semibold hover:bg-[#1b1f23] transition-colors border border-[#24292e] shadow-sm text-sm"
                    style={{ height: '40px' }} 
                >
                    <FontAwesomeIcon icon={faGithub} className="text-lg" />
                    <span>Continue with GitHub</span>
                </button>
            </div>
            {loading && <p className="text-center text-sm text-gray-500">Authenticating...</p>}
        </div>
    );
};

export default SocialLogin;
