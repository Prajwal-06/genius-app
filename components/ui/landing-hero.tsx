"use client"
import { useAuth } from "@clerk/nextjs"
import Link from "next/link";
import TypewriterComponent from "typewriter-effect"
import { Button } from "./button";

export const LandingHero = () =>{
    const { isSignedIn} = useAuth();
    return(
        <div className="text-white font-bold py-36 text-center space-y-5">
            <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl space-y-5 font-extrabold">
                <h1>Your AI partner for</h1>
                <div className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                  <TypewriterComponent
                  options = {{
                    strings : [
                        "Student.",
                        "Image generation.",
                        "Text generation.",
                        "Code automation.",
                        "PDF tutoring."
                    ],
                    autoStart:true,
                    loop:true
                  }}
                  />

                </div>
            </div> 
            <div className="text-sm md:text-xl font-light text-zinc-400">
            Your complete AI suite — no switching tabs.

            </div>
            <div>
                <Link href={isSignedIn ? "/dashboard" : ".sign-up"}>
                <Button variant="premium" >
                    Start Generating For Free
                </Button>
                </Link>
            </div>
            <div className="text-zinc-400 text-xs md:text-sm font-normal">
                  No credit card required.
            </div>
        </div>
    )
}