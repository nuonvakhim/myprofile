import React from 'react';
import Link from "next/link";
import {MovingBorderBtn} from "@/components/ui/moving-border";
import Title from "@/app/(home)/components/Title";

const HeroSection = () => {
    return (
        <div className="min-h[60vh] flex flex-col-reverse gap-14 lg:gap-0 lg:flex-row items-center justify-between ">
            <div className="space-y-10 text-center lg:text-left">
                <h1 className="text-4xl lg:text-7xl font-bold text-gray-800 dark:text-white">Nice to meet you ! <br/>
                    <span className="underline underline-offset-8 decoration-green-500"> {"I'm Vakhim"} </span>
                </h1>

                <p className="md:w-96 text-lg text-gray-600 dark:text-gray-300">
                    {
                        "Based in Cambodia, I'm Web Fullstack developer with a passion for building beautiful and functional websites. " +
                        "I'm currently looking for a new opportunity to work with a team that values creativity and innovation."
                    }
                </p>
                <Link href={"https://t.me/vakhimnuon"} className="inline-block group" target="_blank">

                    <Title text="Contact Me 📩" className=""/>
                </Link>
            </div>
            <div className="relative">
                <div className="w-72 h-72 space-y-3 -rotate-[30deg] relative ">
                    <div className="flex gap-3 translate-x-8">
                        <div className="w-32 h-32 rounded-2xl bg-green-500"></div>
                        <div className="w-32 h-32 rounded-full bg-indigo-500"></div>

                    </div>
                    <div className="flex gap-3 -translate-x-8">
                        <div className="w-32 h-32 rounded-2xl bg-indigo-500"></div>
                        <div className="w-32 h-32 rounded-full bg-green-500"></div>
                    </div>
                    <div className="grow absolute top-[40%] right-1/2 -z-10">

                    </div>
                </div>
                <div className="absolute bottom-5 sm:bottom-14 left-0 sm:-left-10 ">
                    <MovingBorderBtn borderRadius="0.5rem" className="p-3 font-semibold">
                        <p> 📢 Available for Work </p>
                    </MovingBorderBtn>
                </div>

            </div>


        </div>
    );
};

export default HeroSection;