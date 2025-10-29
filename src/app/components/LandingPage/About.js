/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const About = () => {
  const videoRef = useRef(null);
  const [isStatsInView, setIsStatsInView] = useState(false);
  const statsRef = useRef(null);

  // Configure stats with target values for counting animation
  const stats = [
    { number: 150, label: 'Projects Completed' },
    { number: 95, label: 'Client Satisfaction' },
    { number: 50, label: 'Team Members' },
    { number: 12, label: 'Years Experience' }
  ];

  // Handle video autoplay
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const playVideo = async () => {
        try {
          video.muted = true;
          video.playsInline = true;
          await video.play();
        } catch (error) {
          console.log("Autoplay prevented:", error);
        }
      };
      
      playVideo();
    }
  }, []);

  // Handle stats counting animation when in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsStatsInView(true);
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  return (
    <section
      id="about"
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-gray-800 flex flex-col relative overflow-hidden py-16 lg:py-24"
    >
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-400/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl opacity-70"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl opacity-70"></div>
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-10 bg-grid-pattern"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 lg:gap-24 relative z-10 items-center">
        {/* Left Side Content */}
        <div className="space-y-10 order-2 lg:order-1">
          {/* Section Title */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-left relative"
          >
            <div className="absolute -left-6 top-3 w-12 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
            <span className="text-sm font-semibold tracking-wider text-cyan-500 uppercase">
              Who We Are
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mt-2 mb-6 text-gray-900">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">Us</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
              We are a team of passionate innovators dedicated to delivering exceptional solutions that drive our clients' success in an ever-evolving digital landscape.
            </p>
          </motion.div>

          {/* Mission Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="p-8 rounded-2xl bg-white/80 backdrop-blur-md border border-gray-100 hover:border-cyan-300 hover:shadow-xl transition-all duration-300 group relative overflow-hidden shadow-md"
          >
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-cyan-100 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Our Mission</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                To empower businesses with innovative solutions that drive growth, efficiency, and competitive advantage through cutting-edge technology and exceptional service.
              </p>
            </div>
          </motion.div>

          {/* Work Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="p-8 rounded-2xl bg-white/80 backdrop-blur-md border border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group relative overflow-hidden shadow-md"
          >
            <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-blue-100 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Our Work</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                We've successfully delivered innovative solutions for leading international clients, combining technical excellence with creative problem-solving to achieve exceptional results.
              </p>
            </div>
          </motion.div>

          {/* Goal Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="p-8 rounded-2xl bg-white/80 backdrop-blur-md border border-gray-100 hover:border-cyan-300 hover:shadow-xl transition-all duration-300 group relative overflow-hidden shadow-md"
          >
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-cyan-100 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Our Goal</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                To continuously innovate and set new industry standards while building lasting partnerships that create sustainable value and transformative growth for our clients.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Side Video - Larger Container */}
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="flex items-center justify-center relative order-1 lg:order-2"
        >
          <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl group border-2 border-white hover:border-cyan-300 transition-all duration-500">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              loop
              muted
              playsInline
              autoPlay
              // poster="/images1/video-poster.jpg"
            >
              <source src="/video/calling-agent.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Subtle gradient overlay for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-50"></div>
          </div>
          
          {/* Floating elements */}
          <motion.div 
            className="absolute -bottom-6 -left-6 w-28 h-28 bg-cyan-400/20 rounded-full"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          ></motion.div>
          <motion.div 
            className="absolute -top-6 -right-6 w-20 h-20 bg-blue-400/20 rounded-full"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          ></motion.div>
        </motion.div>
      </div>
      
      {/* Stats section with counting animation */}
      <motion.div 
        ref={statsRef}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 lg:mt-28 grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10"
      >
        {stats.map((stat, index) => (
          <div key={index} className="text-center p-6 bg-white/80 backdrop-blur-md rounded-xl border border-gray-100 hover:border-cyan-300 hover:shadow-lg transition-all duration-300 shadow-md">
            <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {isStatsInView ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                >
                  {stat.number}{stat.label === 'Client Satisfaction' ? '%' : '+'}
                </motion.span>
              ) : (
                '0' + (stat.label === 'Client Satisfaction' ? '%' : '+')
              )}
            </p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
};

export default About;