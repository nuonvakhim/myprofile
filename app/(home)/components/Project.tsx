import React from 'react';
import {SiDocker, SiReact, SiSpringboot, SiTailwindcss} from "react-icons/si";
import Title from "@/app/(home)/components/Title";
import Link from "next/link";
import {cn} from "@/lib/utils";
import {DirectionAwareHover} from "@/components/ui/direction-aware-hover";

const Project = () => {
    const projects = [
        {
            title: "Portify - A Portfolio Website",
            tech: [SiReact, SiDocker, SiTailwindcss, SiSpringboot],
            link: "http://portify.vercel.app",
            cover: "/img.png",
            background: "bg-indigo-500",
        },
        {
            title: "Portify - A Portfolio Website",
            tech: [SiReact, SiDocker, SiTailwindcss, SiSpringboot],
            link: "http://portify.vercel.app",
            cover: "/portify.png",
            background: "bg-green-500",
        },
        {
            title: "Portify - A Portfolio Website",
            tech: [SiReact, SiDocker, SiTailwindcss, SiSpringboot],
            link: "http://portify.vercel.app",
            cover: "/portify.png",
            background: "bg-indigo-500",
        },
        {
            title: "Portify - A Portfolio Website",
            tech: [SiReact, SiDocker, SiTailwindcss, SiSpringboot],
            link: "http://portify.vercel.app",
            cover: "/portify.png",
            background: "bg-indigo-500",
        },
    ]
    return (
        <div className="py-10 p-5 sm:p-0 ">
            <div className="flex flex-col items-center justify-center">

                <Title text="Project" className=" rotate-6"/>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 pt-20 gap-5  ">
                {projects.map((project, index) => {
                    return (
                        <Link href={project.link} key={index}>
                            <div className={cn("p-5  rounded-md ", project.background)}>
                                <DirectionAwareHover imageUrl={project.cover} className="w-full space-y-5 cursor-pointer">
                                    <div className="space-y-5">
                                        <h1 className="text-2xl font-bold">{project.title}</h1>
                                        <div className="flex items-center gap-5 ">
                                            {
                                                project.tech.map((Tech, index) => {
                                                    return <Tech key={index} className="size-8 "/>
                                                })

                                            }
                                        </div>
                                    </div>

                                </DirectionAwareHover>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default Project;