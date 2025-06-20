"use client"
import { Montserrat } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@clerk/nextjs"

import { cn } from "@/lib/utils"
import { Button } from "./button"

const font = Montserrat({
    weight: "600",
    subsets: ["latin"]
});

export const LandingNavbar = () => {
    const {isSignedIn} = useAuth();

    return (
        <nav className="p-4 bg-transparent flex item-center justify-between">
            <Link href="/" className="flex iten-center">
            <div className="relative h-8 w-8 mr-4">
                <Image fill alt="logo" src="/logo.png" />

                
            </div>
            <h1 className={cn("text-2xl font-bold text-white" , font.className)}>
            Genius
            </h1>
            </Link>
            <div className=".flex items-center gap-x-2">
                <Link href={isSignedIn ? "/dasboard" : "sign-up"}>
                    <Button variant="outline" className="rounded-full">
                        Get Started
                    </Button>
                
                </Link>
            </div>
        </nav>
    )
}