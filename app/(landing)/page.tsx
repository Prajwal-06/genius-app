import { LandingHero } from '@/components/ui/landing-hero'
import { LandingNavbar } from '@/components/ui/landing-navbar'
import React from 'react'


const LandingPage = () => {
  return (
    <div className="h-full">
      <LandingNavbar />
      <LandingHero/>
    </div>
  )
}

export default LandingPage
