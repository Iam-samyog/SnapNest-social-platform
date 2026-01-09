import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance, { API_BASE_URL, getFullMediaUrl } from '../utils/axiosInstance';
import { useDebounce } from '../hooks/useDebounce';

const SearchBar = ({ onImageClick, className = "relative flex-1 max-w-md mx-4" }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], images: [] });
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const abortControllerRef = useRef(null);
  
  // Debounce the search query to reduce API calls
  const debouncedQuery = useDebounce(query, 300);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      handleSearch(debouncedQuery);
    } else {
      setResults({ users: [], images: [] });
      setShowResults(false);
    }
    
    // Cleanup function to abort pending requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedQuery]);

  const handleSearch = async (searchQuery) => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      // Search users and images in parallel
      const [usersRes, imagesRes] = await Promise.all([
        axiosInstance.get('users/', {
          params: { search: searchQuery },
          signal: abortControllerRef.current.signal
        }),
        axiosInstance.get('images/', {
          params: { search: searchQuery },
          signal: abortControllerRef.current.signal
        })
      ]);
      
      const allUsers = usersRes.data.results || usersRes.data || [];
      const filteredUsers = allUsers.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const allImages = imagesRes.data.results || imagesRes.data || [];
      const filteredImages = allImages.filter(image =>
        image.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setResults({
        users: filteredUsers.slice(0, 5),
        images: filteredImages.slice(0, 6)
      });
      setShowResults(true);
    } catch (error) {
      // Ignore abort errors
      if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
        console.error('Error searching:', error);
        setResults({ users: [], images: [] });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    // Show loading immediately when typing
    if (value.trim()) {
      setLoading(true);
    }
  };

  const handleImageClick = (imageUuid) => {
    setShowResults(false);
    setQuery('');
    // Use callback if provided, otherwise navigate
    if (onImageClick) {
      onImageClick(imageUuid);
    } else {
      navigate(`/images/${imageUuid}`);
    }
  };

  const handleUserClick = (username) => {
    setShowResults(false);
    setQuery('');
    navigate(`/users/${username}`);
  };

  return (
    <div ref={searchRef} className={className}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query && setShowResults(true)}
          placeholder="Search users or images..."
          className="block w-full pl-10 pr-10 py-2 border-2 border-black rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setShowResults(false);
              setResults({ users: [], images: [] });
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-black" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (results.users.length > 0 || results.images.length > 0) && (
        <div className="absolute z-50 w-full mt-2 bg-white border-4 border-black rounded-lg shadow-2xl max-h-96 overflow-y-auto">
          {/* Users Results */}
          {results.users.length > 0 && (
            <div className="p-4 border-b-2 border-black">
              <h3 className="text-sm font-bold text-black mb-2">Users</h3>
              <div className="space-y-2">
                {results.users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserClick(user.username)}
                    className="w-full text-left p-2 hover:bg-yellow-400 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-yellow-400 border-2 border-black flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {user.profile?.photo ? (
                        <img 
                          src={getFullMediaUrl(user.profile.photo)} 
                          alt={user.username} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-black font-bold">
                          {user.first_name?.[0] || user.username[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-black">{user.username}</p>
                      {user.first_name && (
                        <p className="text-sm text-gray-600">{user.first_name} {user.last_name}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Images Results */}
          {results.images.length > 0 && (
            <div className="p-4">
              <h3 className="text-sm font-bold text-black mb-2">📸 Images</h3>
              <div className="grid grid-cols-3 gap-2">
                {results.images.map((image) => (
                  <button
                    key={image.uuid}
                    onClick={() => handleImageClick(image.uuid)}
                    className="aspect-square relative overflow-hidden rounded-lg border-2 border-black hover:scale-105 transition-transform"
                  >
                    <img
                      src={getFullMediaUrl(image.image || image.url)}
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-xs font-bold text-center px-2">{image.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="absolute z-50 w-full mt-2 bg-white border-4 border-black rounded-lg shadow-2xl p-4">
          <p className="text-black text-center">Searching...</p>
        </div>
      )}

      {/* No Results */}
      {showResults && !loading && query && results.users.length === 0 && results.images.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-4 border-black rounded-lg shadow-2xl p-4">
          <p className="text-black text-center">No results found</p>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
