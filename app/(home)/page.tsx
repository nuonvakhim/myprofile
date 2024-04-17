import React from 'react'
import Navbar from './components/Navbar'
import HeroSection from "@/app/(home)/components/HeroSection";
import Skills from "@/app/(home)/components/Skills";
import Project from "@/app/(home)/components/Project";

export default function page() {

    return (
        <div className="min-h-[4000vh]  bg-black  overflow-hidden">
            <div>
                <div className="dark:bg-black bg-white  dark:bg-grid-white/[0.09] bg-grid-black/[0.2] relative ">

                    <div className="max-w-7xl mx-auto mt-20 p-5 ">

                        <Navbar/>

                        <HeroSection/>

                    </div>

                </div>
                <div className="h-10 xl:h-32 bg-gradient-to-t  from-black  -bottom-5 left-0 xl:bottom-0 w-full"></div>

            </div>

            <div className="max-w-7xl mx-auto p-5 mt-20 ">
                <Skills/>
                <Project/>
            </div>

        </div>
    )
}