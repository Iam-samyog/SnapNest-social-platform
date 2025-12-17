import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faXTwitter, faLinkedinIn, faInstagram } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer className="bg-yellow-400 text-black pt-16 pb-6 border-t-4 border-black">
      <div className="container mx-auto max-w-7xl px-5">
        {/* Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* About Us - spans 1 column */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-semibold uppercase tracking-wider mb-5">About Us</h3>
            <p className="leading-relaxed mb-4 opacity-90">
              We are dedicated to providing exceptional services and creating lasting relationships with our clients. Excellence is our standard.
            </p>
            <div className="flex space-x-4 mt-6">
              <a
                href="#"
                title="Facebook"
                className="w-10 h-10 bg-black text-yellow-400 flex items-center justify-center rounded-full hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                <FontAwesomeIcon icon={faFacebookF} size="lg" />
              </a>
              <a
                href="#"
                title="Twitter"
                className="w-10 h-10 bg-black text-yellow-400 flex items-center justify-center rounded-full hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                <FontAwesomeIcon icon={faXTwitter} size="lg" />
              </a>
              <a
                href="#"
                title="LinkedIn"
                className="w-10 h-10 bg-black text-yellow-400 flex items-center justify-center rounded-full hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                <FontAwesomeIcon icon={faLinkedinIn} size="lg" />
              </a>
              <a
                href="#"
                title="Instagram"
                className="w-10 h-10 bg-black text-yellow-400 flex items-center justify-center rounded-full hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                <FontAwesomeIcon icon={faInstagram} size="lg" />
              </a>
            </div>
          </div>

          {/* Quick Links - spans 1 column */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-semibold uppercase tracking-wider mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {['Home', 'Services', 'About Us', 'Portfolio', 'Contact'].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="inline-block hover:translate-x-1 hover:opacity-70 transition-all duration-300"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter - spans 2 columns on lg screens for increased width */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold uppercase tracking-wider mb-5">Newsletter</h3>
            <p className="leading-relaxed mb-4 opacity-90">
              Subscribe to our newsletter for updates and exclusive offers.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 mt-4">
              <input
                type="email"
                placeholder="Your email address"
                required
                className="flex-1 px-4 py-3 border-2 border-black bg-white text-black placeholder-gray-600 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-black text-yellow-400 font-semibold hover:bg-gray-800 transition-colors duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t-2 border-black pt-8 flex flex-col sm:flex-row justify-between items-center gap-5">
          <p className="opacity-90">© 2024 Your Company Name. All rights reserved.</p>
          <div className="flex space-x-7">
            <a href="#" className="hover:opacity-70 transition-opacity duration-300">
              Privacy Policy
            </a>
            <a href="#" className="hover:opacity-70 transition-opacity duration-300">
              Terms of Service
            </a>
            <a href="#" className="hover:opacity-70 transition-opacity duration-300">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;