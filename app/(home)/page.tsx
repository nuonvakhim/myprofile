import React from 'react'
import Navbar from './components/Navbar'
import HeroSection from "@/app/(home)/components/HeroSection";
import Skills from "@/app/(home)/components/Skills";
import Project from "@/app/(home)/components/Project";
import Footer from "@/app/(home)/components/Footer";

export default function page() {
    return (
        <div className="min-h-screen bg-white dark:bg-black overflow-hidden">
            <div>
                <div className="bg-white dark:bg-black bg-grid-black/[0.1] dark:bg-grid-white/[0.1] relative">
                    <div className="max-w-7xl mx-auto mt-20 p-5">
                        <Navbar/>
                        <HeroSection/>
                    </div>
                </div>
                <div className="h-10 xl:h-32 bg-gradient-to-t from-white dark:from-black -bottom-5 left-0 xl:bottom-0 w-full"></div>
            </div>

            <div className="max-w-7xl mx-auto p-5 mt-20">
                <Skills/>
                <Project/>
                <Footer/>
            </div>
        </div>
    )
}