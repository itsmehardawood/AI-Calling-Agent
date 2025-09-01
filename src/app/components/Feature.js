'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const FeaturedSection = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const features = [
    {
      id: 1,
      title: "AI-Powered Calling",
      description: "Intelligent call routing and handling with natural language processing for seamless customer interactions.",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.5 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20H7.5M16.5 4H19C20.1046 4 21 4.89543 21 6V18C21 19.1046 20.1046 20 19 20H16.5M12 17.5H12.01M7.5 2V6M16.5 2V6M7 14H17C17.5523 14 18 13.5523 18 13V9C18 8.44772 17.5523 8 17 8H7C6.44772 8 6 8.44772 6 9V13C6 13.5523 6.44772 14 7 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "from-cyan-400 to-cyan-600"
    },
    {
      id: 2,
      title: "Smart Analytics",
      description: "Real-time call analytics and insights to optimize performance and customer satisfaction metrics.",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3V19C3 20.1046 3.89543 21 5 21H21M7 13V17M11 9V17M15 5V17M19 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "from-blue-400 to-blue-600"
    },
    {
      id: 3,
      title: "24/7 Availability",
      description: "Round-the-clock customer support with our AI agents that never sleep or take breaks.",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "from-purple-400 to-purple-600"
    },
    {
      id: 4,
      title: "Multi-Language Support",
      description: "Communicate with customers in their preferred language with our advanced translation capabilities.",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 5H15M9 3V5M10.5 3L12 21M7 7.5H13.5M7 11H13.5M7 14.5H13.5M17.5 11.5C17.5 12.4283 17.1313 13.3185 16.4749 13.9749C15.8185 14.6313 14.9283 15 14 15C13.0717 15 12.1815 14.6313 11.5251 13.9749C10.8687 13.3185 10.5 12.4283 10.5 11.5C10.5 10.5717 10.8687 9.6815 11.5251 9.02513C12.1815 8.36875 13.0717 8 14 8C14.9283 8 15.8185 8.36875 16.4749 9.02513C17.1313 9.6815 17.5 10.5717 17.5 11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "from-pink-400 to-pink-600"
    },
    {
      id: 5,
      title: "Seamless Integration",
      description: "Easy integration with your existing CRM, helpdesk, and business tools for a unified workflow.",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 10L12 14L16 10M3 4H21M3 8H21M3 12H21M3 16H21M3 20H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "from-amber-400 to-amber-600"
    }
  ];

  return (
    <section className="relative py-16 lg:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-cyan-500/10 to-transparent"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-400/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-sm font-medium mb-6 shadow-md">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Our Features
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">Calling Agent</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the powerful features that make our AI calling agent the perfect solution for your business communication needs.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              onHoverStart={() => setHoveredCard(feature.id)}
              onHoverEnd={() => setHoveredCard(null)}
              className={`group relative overflow-hidden rounded-2xl p-6 backdrop-blur-sm border ${
                hoveredCard === feature.id 
                  ? `border-cyan-300 bg-white shadow-xl shadow-cyan-100` 
                  : 'border-gray-200 bg-white/80 shadow-md'
              } transition-all duration-300`}
            >
              {/* Animated gradient border */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}></div>
              
              {/* Icon container */}
              <div className={`relative z-10 inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${
                hoveredCard === feature.id 
                  ? `bg-gradient-to-r ${feature.color} text-white shadow-lg` 
                  : 'bg-cyan-50 text-cyan-500'
              } transition-all duration-300`}>
                {feature.icon}
              </div>
              
              {/* Content */}
              <h3 className={`text-xl font-bold mb-3 ${
                hoveredCard === feature.id ? 'text-gray-900' : 'text-gray-800'
              } transition-colors duration-300`}>
                {feature.title}
              </h3>
              <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                {feature.description}
              </p>
              
              {/* Hover indicator */}
              <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.color} transition-all duration-300 ${
                hoveredCard === feature.id ? 'w-full' : 'w-0'
              }`}></div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <button className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-cyan-500/30">
            Explore All Features
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedSection;