import React from 'react'
import MobileSidebar from './MobileSidebarDoctutor'
import { UserButton } from '@clerk/nextjs'

const Navbar = () => {
  return (
    <div className='flex item-center p-4'>
        <MobileSidebar/>
        <div className='flex w-full justify-end'>
            <UserButton />

        </div>
    </div>
  )
}

export default Navbar