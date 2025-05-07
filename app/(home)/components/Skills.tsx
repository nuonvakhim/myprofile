'use client';
import React from 'react';
import Title from "@/app/(home)/components/Title";
import {HoverEffect} from "@/components/ui/card-hoover-effect";
import {
    SiBlockchaindotcom,
    SiDocker,
    SiGithub,
    SiNextdotjs,
    SiPostgresql,
    SiReact,
    SiSpringboot,
    SiTailwindcss,
    SiTypescript
} from "react-icons/si";

const Skills = () => {
    const skills = [
        {
            text: "NextJS",
            Icon: SiNextdotjs
        },
        {
            text: "TailwindCSS",
            Icon: SiTailwindcss
        },
        {
            text: "TypeScript",
            Icon: SiTypescript
        },
        {
            text: "Postgresql",
            Icon: SiPostgresql
        },
        {
            text: "Spring Boot",
            Icon: SiSpringboot
        },
        {
            text: "Docker",
            Icon: SiDocker
        },
        {
            text: "Blockchain",
            Icon: SiBlockchaindotcom
        },
        {
            text: "Github",
            Icon: SiGithub
        },
        {
            text: "React",
            Icon: SiReact
        },
    ]
    return (
        <div className="max-w-5xl mx-auto px-8">
            <div className="flex flex-col justify-center items-center">
                <Title text="Skills </>" className="-rotate-6"/>
            </div>
            <br/>
            <HoverEffect 
                items={skills} 
                className="text-gray-800 dark:text-white"
                itemClassName="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                iconClassName="text-gray-800 dark:text-white group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors duration-300"
            />
        </div>
    );
};

export default Skills;