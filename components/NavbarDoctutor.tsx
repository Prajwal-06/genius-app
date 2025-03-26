import React from 'react'
import MobileSidebar from './MobileSidebarDoctutor'
import { UserButton } from '@clerk/nextjs'
import MobileSidebarDoctutor from './MobileSidebarDoctutor'

const NavbarDoctutor = () => {
  return (
    <div className='flex item-center p-4 '>
        <MobileSidebarDoctutor/>
        <div className='flex w-full justify-end '>
            <UserButton />

        </div>
    </div>
  )
}

export default NavbarDoctutor