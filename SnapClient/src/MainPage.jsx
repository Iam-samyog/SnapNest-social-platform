import React from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowToSnapNest from './components/HowToSnapNest'
import Footer from './components/Footer'
import Review from './components/Reviews'
import CTASection from './components/CTAsection'

const MainPage = () => {
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