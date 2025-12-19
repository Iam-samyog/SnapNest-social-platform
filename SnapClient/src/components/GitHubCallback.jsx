import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

const GitHubCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [loadingMessage, setLoadingMessage] = useState('Validating GitHub code...');
    const code = searchParams.get('code');

    useEffect(() => {
        if (code) {
            handleGitHubCallback();
        } else {
            setError('No authorization code found.');
            setTimeout(() => navigate('/auth'), 3000);
        }
    }, [code]);

    const handleGitHubCallback = async () => {
        try {
            setLoadingMessage('Handshaking with SnapNest...');
            const response = await axiosInstance.post('auth/social/github/', {
                code: code
            });

            // Store tokens
            localStorage.setItem('access', response.data.access);
            localStorage.setItem('refresh', response.data.refresh);
            
            setLoadingMessage('Identity verified! Redirecting...');
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } catch (err) {
            console.error('GitHub Callback Error:', err);
            setError(err.response?.data?.error || 'GitHub login failed.');
            setTimeout(() => navigate('/auth'), 3000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white border-4 border-black p-8 rounded-lg shadow-lg text-center max-w-sm w-full">
                <FontAwesomeIcon icon={faGithub} className="text-5xl mb-4" />
                {error ? (
                    <div>
                        <h2 className="text-xl font-bold text-red-600 mb-2">Login Failed</h2>
                        <p className="text-gray-600">{error}</p>
                        <p className="text-sm mt-4">Redirecting...</p>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-xl font-bold mb-2 uppercase tracking-tight">{loadingMessage}</h2>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mt-4"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GitHubCallback;
