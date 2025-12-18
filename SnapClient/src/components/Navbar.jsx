import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import ImageModal from './ImageModal';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('access');

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/auth');
  };

  const publicNavLinks = [
    { href: '/', label: 'HOME' },
    { href: '/auth', label: 'LOGIN' },
  ];

  const authNavLinks = [
    { href: '/dashboard', label: 'DASHBOARD' },
    { href: '/images', label: 'IMAGES' },
    { href: '/users', label: 'PEOPLE' },
    { href: '/images/ranking', label: 'RANKING' },
  ];

  return (
    <>
      <nav className="relative z-50 px-6 md:px-12 py-8 flex items-center justify-between bg-white/10 backdrop-blur-md">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="text-2xl md:text-4xl font-bold text-black tracking-wide hover:opacity-80 transition-opacity">
            SNAPNEST
          </Link>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6 lg:space-x-10 flex-1 justify-center">
          {(isAuthenticated ? authNavLinks : publicNavLinks).map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-semibold text-black tracking-wide hover:text-amber-500 transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <>
              <SearchBar onImageClick={(imageId) => {
                setSelectedImageId(imageId);
                setIsModalOpen(true);
              }} />
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-black tracking-wide hover:text-red-500 transition-colors duration-300"
              >
                LOGOUT
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-blue-800 focus:outline-none p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300">
            <div className="flex flex-col p-6">
              {/* Close Button */}
              <button
                className="self-end text-black p-2 mb-8"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Menu Links */}
              <div className="flex flex-col space-y-6">
                {(isAuthenticated ? authNavLinks : publicNavLinks).map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-black font-semibold hover:text-amber-500 transition-colors duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated && (
                  <>
                    <div className="py-2">
                      <SearchBar onImageClick={(imageId) => {
                        setSelectedImageId(imageId);
                        setIsModalOpen(true);
                        setIsOpen(false);
                      }} />
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="text-black font-semibold hover:text-red-500 transition-colors duration-300 text-left"
                    >
                      LOGOUT
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

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

export default Navbar;