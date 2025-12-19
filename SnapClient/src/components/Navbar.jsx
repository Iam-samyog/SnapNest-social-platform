import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
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
    navigate('/');
  };

  const publicNavLinks = [
    { href: '/', label: 'HOME' },
    { href: 'https://www.samyogm.com.np/', label: 'PORTFOLIO' },
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
        {/* Desktop Menu */}
<div className="hidden md:flex items-center w-full">
  
  {/* Center (Authenticated only) */}
  {isAuthenticated && (
    <div className="flex items-center space-x-6 lg:space-x-10 flex-1 justify-center">
      {authNavLinks.map((link) => (
        <Link
          key={link.href}
          to={link.href}
          className="text-sm font-semibold text-black hover:text-amber-500 transition-colors"
        >
          {link.label}
        </Link>
      ))}

      <SearchBar
        onImageClick={(imageId) => {
          setSelectedImageId(imageId);
          setIsModalOpen(true);
        }}
      />
    </div>
  )}

  {/* Right side */}
  <div className="flex items-center space-x-6 ml-auto">
    {!isAuthenticated &&
      publicNavLinks.map((link) => (
        <Link
          key={link.href}
          to={link.href}
          className="text-sm font-semibold text-black hover:text-amber-500 transition-colors"
        >
          {link.label}
        </Link>
      ))}

    {isAuthenticated && (
      <button
        onClick={handleLogout}
        className="text-sm font-semibold text-black hover:text-red-500 transition-colors"
      >
        LOGOUT
      </button>
    )}
  </div>
</div>


        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-blue-800 focus:outline-none p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="w-6 h-6" />
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
                <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
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