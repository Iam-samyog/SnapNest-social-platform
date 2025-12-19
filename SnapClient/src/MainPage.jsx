import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowToSnapNest from './components/HowToSnapNest'
import Footer from './components/Footer'
import Review from './components/Reviews'
import CTASection from './components/CTASection'
import AOS from 'aos'
import 'aos/dist/aos.css'

const MainPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    const token = localStorage.getItem('access');
    if (token) {
      navigate('/dashboard');
    }

    // Initialize Animate On Scroll
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-in-out',
      offset: 100,
    });
  }, [navigate]);

  return (
    <>
    <div className='container mx-auto max-w-[1450px]'>
    <Navbar/>
     </div>
    <Hero/>
    <HowToSnapNest></HowToSnapNest>

    <Review></Review>
    <CTASection></CTASection>
    <Footer></Footer>

   
    
    </>
  )
}

export default MainPage