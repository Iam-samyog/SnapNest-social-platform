import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import SearchBar from './SearchBar';
import ImageModal from './ImageModal';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImageUuid, setSelectedImageUuid] = useState(null);
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
    { href: '/messages', label: 'MESSAGES' },
  ];

  return (
    <>
      <nav className="relative z-50 px-4 md:px-12 py-4 md:py-8 flex items-center justify-between bg-white/10 backdrop-blur-md border-b-2 border-black/5 md:border-none">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="text-xl md:text-4xl font-black text-black tracking-tighter hover:scale-105 transition-transform">
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
        onImageClick={(uuid) => {
          setSelectedImageUuid(uuid);
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


          {/* Mobile Search - Visible only on mobile */}
          {isAuthenticated && (
            <div className="md:hidden flex-1 mx-2 flex justify-end">
               <SearchBar
                onImageClick={(uuid) => {
                  setSelectedImageUuid(uuid);
                  setIsModalOpen(true);
                }}
                className="relative w-full max-w-[200px]"
              />
            </div>
          )}

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-blue-800 focus:outline-none p-2 ml-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="w-6 h-6" />
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="fixed right-0 top-0 bottom-0 w-[75%] max-w-[320px] bg-yellow-400 z-[70] p-8 space-y-8 shadow-2xl flex flex-col border-l-4 border-black">
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-black text-black tracking-tighter">MENU</span>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 flex items-center justify-center bg-black text-yellow-400 rounded-full"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="flex flex-col space-y-6">
              {(isAuthenticated ? authNavLinks : publicNavLinks).map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-2xl font-black text-black hover:translate-x-2 transition-transform uppercase"
                >
                  {link.label}
                </Link>
              ))}
              
              {isAuthenticated && (
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="text-2xl font-black text-red-600 text-left hover:translate-x-2 transition-transform uppercase"
                >
                  LOGOUT
                </button>
              )}
            </div>

            {/* Removed SearchBar from here */}

            <div className="mt-auto">
              {!isAuthenticated && (
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <button className="w-full bg-black text-yellow-400 py-4 rounded-xl font-black text-lg shadow-xl uppercase">
                    GET STARTED
                  </button>
                </Link>
              )}
            </div>
          </div>
        </>
      )}

      {/* Image Modal */}
      <ImageModal
        imageUuid={selectedImageUuid}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedImageUuid(null);
        }}
      />
    </>
  );
};

export default Navbar;