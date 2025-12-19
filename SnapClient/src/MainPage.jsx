import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowToSnapNest from './components/HowToSnapNest'
import Footer from './components/Footer'
import Review from './components/Reviews'
import CTASection from './components/CTASection'

const MainPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      navigate('/dashboard');
    }
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