import React from 'react'
import Hero from './components/Hero'
import Navbar from './components/Navbar'  
import About from './components/About' 
import Feature from './components/Feature' 
import Service from './components/Service' 
import Testimonal from './components/Testimonal' 
import ContactUs from './components/ContactUs' 
import Footer from './components/Footer'


export default function Page() {
  return (
    <div>
      <>
        {/* Navbar at the top */}
        <Navbar />  

        <main>
          <section id="home">
          <Hero />
          </section>
          <section id="about">
          <About />
          </section>
          <section id="feature">
          <Feature />
          </section>

          <section id="service">
          <Service />
          </section>
          <section id="testimonal">
          <Testimonal />
          </section>
          <section id="contactus">
          <ContactUs />
          </section>
        </main>
         <Footer />
      </>
    </div>
  );
};
