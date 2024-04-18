import React from 'react';
import {SiGithub, SiInstagram, SiLinkedin, SiX} from "react-icons/si";
import Link from "next/link";
import {cn} from "@/lib/utils";

export default function Navbar({className}: { className?: string }) {

    const socials = [
        {
            Label: 'Github',
            Link: 'https://github.com/nuonvakhim',
            Icon: SiGithub,
        },
        {
            Label: 'LinkedIn',
            Link: 'https://www.linkedin.com/in/nuonvakhim/',
            Icon: SiLinkedin,
        },
        {
            Label: 'Twitter',
            Link: 'https://twitter.com/nuonvakhim',
            Icon: SiX,
        },
        {
            Label: 'Instagram',
            Link: 'https://www.instagram.com/nuonvakhim/',
            Icon: SiInstagram,
        }
    ]


    return <nav className={cn(" py-10 flex justify-between items-center text-white ", className)}>
        <h1 className="text-2xl font-bold underline underline-offset-8 decoration-green-500 -rotate-2">
            Vakhim Nuon
        </h1>

        <div className="flex items-center gap-5">
            {socials.map((social, index) => {
                const Icon = social.Icon;
                return (
                    <Link href={social.Link} key={index} aria-label={social.Label}>
                        <Icon className="w-5 h-5 hover:scale-125 transition-all "/>
                    </Link>
                );

            })}
        </div>
    </nav>;

}

;