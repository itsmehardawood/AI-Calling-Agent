'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'John Doe',
    initials: 'JD',
    role: 'CEO, Tech Corp',
    quote: 'This AI agent has revolutionized our workflow. The seamless integration and intelligent responses have significantly improved our customer satisfaction metrics.',
    rating: 5,
  },
  {
    name: 'Jane Smith',
    initials: 'JS',
    role: 'Developer, Innovate Ltd',
    quote: 'Incredible performance and ease of use. The natural language processing capabilities are truly impressive and have transformed how we handle customer interactions.',
    rating: 5,
  },
  {
    name: 'Alex Johnson',
    initials: 'AJ',
    role: 'Manager, Future AI',
    quote: 'The best AI solution we\'ve implemented. The support team is exceptional and the continuous improvements keep us ahead of the competition.',
    rating: 4,
  },
  {
    name: 'Sarah Wilson',
    initials: 'SW',
    role: 'CTO, Digital Solutions',
    quote: 'A game-changing platform that has reduced our response time by 70%. The analytics dashboard provides invaluable insights into customer behavior.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    initials: 'MC',
    role: 'Product Lead, TechVision',
    quote: 'The multilingual support is flawless. We\'ve expanded to three new markets thanks to this AI agent\'s capabilities.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    initials: 'ER',
    role: 'Customer Success Director',
    quote: 'Our team loves working with this platform. The customization options allow us to tailor the experience perfectly for each client.',
    rating: 4,
  },
];

const Testimonials = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section
      ref={ref}
      className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-400/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium mb-6 shadow-md">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Client Testimonials
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">Clients Say</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover why businesses worldwide trust our AI calling agent to transform their customer communication.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative h-full bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-cyan-300 transition-all duration-300 shadow-lg hover:shadow-xl">
                {/* Quote icon */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                  <Quote className="w-4 h-4 text-cyan-600" />
                </div>
                
                {/* Rating */}
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>

                {/* Testimonial text */}
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>

                {/* Client info */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.initials}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>

                {/* Hover effect indicator */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 group-hover:w-full transition-all duration-500 rounded-full"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-12 border-t border-gray-200"
        >
          {[
            { number: '95%', label: 'Client Satisfaction' },
            { number: '500+', label: 'Happy Clients' },
            { number: '24/7', label: 'Support Available' },
            { number: '99.9%', label: 'Uptime Guarantee' }
          ].map((stat, index) => (
            <div key={index} className="text-center p-4 bg-white/50 rounded-xl backdrop-blur-sm border border-gray-100 shadow-sm">
              <p className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;