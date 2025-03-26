'use client'
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'
import Sidebar from './Sidebar'

const MobileSidebarDoctutor = () => {
    const [isMouted , setIsMounted] = useState(false); //hydration error

    useEffect(()=>{
        setIsMounted(true);
    },[])

    if(!isMouted){
        return null;
    }
  return (
    <Sheet>
        <SheetTrigger>
        <Button variant="ghost" size="icon" >
            <Menu/>
        </Button>
        </SheetTrigger>
        <SheetContent side="left" className='p-0'>
            <Sidebar/>
        </SheetContent>
    </Sheet>
    
  )
}

export default MobileSidebarDoctutor