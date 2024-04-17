'use client';
import React from 'react';
import Title from "@/app/(home)/components/Title";
import {HoverEffect} from "@/components/ui/card-hoover-effect";
import {
    SiBlockchaindotcom,
    SiDocker,
    SiGithub,
    SiMysql,
    SiNextdotjs,
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
            text: "My SQL",
            Icon: SiMysql
        },
        {
            text: "Spring Boot",
            Icon: SiSpringboot
        }, {
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
        <div
            className="max-w-5xl mx-auto px-8 ">
            <div className="flex flex-col justify-center items-center">
                <Title text="Skills </>" className=" -rotate-6"/>

            </div>
            <br/>
            <HoverEffect items={skills} className=""/>
        </div>
    );
};

export default Skills;