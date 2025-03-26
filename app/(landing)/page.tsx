
import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const LandingPage = () => {
  return (
    <div>
        <h3>Landing Page (unproteced)</h3>
        <Link  href="/sign-in">
            <Button>Log in</Button>
        </Link>
       
        <Link href="/sign-up">
            <Button>Sign up</Button>
        </Link>
    </div>
  )
}

export default LandingPage
