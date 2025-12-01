'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: "Home", link: "#home" },
    { name: "About Us", link: "#about" },
    { name: "Features", link: "#feature" },
    { name: "Services", link: "#service" },
    { name: "Testimonals", link: "#testimonal" },
    { name: "Contact", link: "#contact" },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-gray-900/95 backdrop-blur-md border-b border-gray-700/30 shadow-2xl' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.a
            href="#home"
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* <div className={`w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center ${
              scrolled ? 'shadow-lg' : 'shadow-2xl'
            }`}>
              <Phone className="w-6 h-6 text-white" />
            </div> */}
            
            <span className={`text-2xl font-bold tracking-tight ${
              scrolled ? 'text-white' : 'text-white drop-shadow-lg'
            }`}>
              Neurovise Calling<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Agent</span>
            </span>
          </motion.a>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            <ul className="flex space-x-8">
              {menuItems.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="relative"
                >
                  <a 
                    href={item.link} 
                    className={`font-medium transition-all duration-300 hover:text-cyan-400 ${
                      scrolled ? 'text-gray-300 hover:text-cyan-400' : 'text-white hover:text-cyan-300 drop-shadow-md'
                    }`}
                  >
                    {item.name}
                    <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </motion.li>
              ))}
            </ul>
            
            {/* CTA Button */}
            <motion.a
              href="#contact"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                scrolled
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-cyan-500/25'
                  : 'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 hover:shadow-2xl'
              }`}
            >
              Get Started
            </motion.a>

            <motion.button
              onClick={() =>  router.push("login")}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                scrolled
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-cyan-500/25'
                  : 'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 hover:shadow-2xl'
              }`}
            >
              Sign In
            </motion.button>
          </div>

          {/* Mobile Hamburger */}
          <div className="lg:hidden">
            <button 
              onClick={() => setOpen(!open)} 
              className={`p-2 rounded-lg transition-all duration-300 ${
                scrolled 
                  ? 'text-white bg-gray-800 hover:bg-gray-700' 
                  : 'text-white bg-black/20 hover:bg-black/30'
              }`}
            >
              {open ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-700/30"
          >
            <ul className="flex flex-col space-y-4 px-6 py-6">
              {menuItems.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <a
                    href={item.link}
                    className="block py-3 text-lg font-medium text-white hover:text-cyan-400 transition-colors border-b border-gray-700/50"
                    onClick={() => setOpen(false)}
                  >
                    {item.name}
                  </a>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-4"
              >
                <a
                  href="#contact"
                  className="block w-full py-3 text-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-cyan-500/25"
                  onClick={() => setOpen(false)}
                >
                  Get Started
                </a>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="pt-2"
                >
                  <button
                    onClick={() => { setOpen(false); router.push('login'); }}
                    className="block w-full py-3 text-center bg-white/10 backdrop-blur-md text-white border border-white/20 font-semibold rounded-xl transition-all duration-300 hover:bg-white/20 hover:shadow-2xl"
                  >
                    Sign In
                  </button>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <motion.div 
        className="h-1 bg-gradient-to-r from-cyan-500 to-blue-600 origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: scrolled ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </nav>
  );
};

export default Navbar;