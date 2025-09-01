'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const images = [
    '/images/ai-agent1.jpg',
    '/images/ai-agent2.jpg',
    '/images/ai-agent3.jpg',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="relative flex items-center justify-center w-full min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Image Slideshow with gradient overlay */}
      {images.map((image, index) => (
        <motion.div
          key={index}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
          initial={{ opacity: 0 }}
          animate={currentSlide === index ? { opacity: 0.7 } : { opacity: 0 }}
          transition={{ duration: 1.5 }}
        />
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-80"></div>
      
      {/* Geometric pattern overlay */}
      <div className="absolute inset-0 opacity-10 bg-geometric-pattern"></div>
    </section>
  );
};

export default Hero;