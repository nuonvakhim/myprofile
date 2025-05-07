import {cn} from "@/lib/utils";
import {AnimatePresence, motion} from "framer-motion";
import Link from "next/link";
import {useState} from "react";
import {IconType} from "react-icons";

export const HoverEffect = ({
    items,
    className,
    itemClassName,
    iconClassName,
}: {
    items: {
        text: string;
        Icon: IconType;
    }[];
    className?: string;
    itemClassName?: string;
    iconClassName?: string;
}) => {
    let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div
            className={cn(
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-10",
                className
            )}
        >
            {items.map((item, idx) => {
                const Icon = item.Icon;

                return (
                    <div
                        key={idx}
                        className="relative group block p-2 h-full w-full"
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <AnimatePresence>
                            {hoveredIndex === idx && (
                                <motion.span
                                    className="absolute inset-0 h-full w-full bg-neutral-200 dark:bg-slate-800/[0.8] block rounded-lg"
                                    layoutId="hoverBackground"
                                    initial={{opacity: 0}}
                                    animate={{
                                        opacity: 1,
                                        transition: {duration: 0.15},
                                    }}
                                    exit={{
                                        opacity: 0,
                                        transition: {duration: 0.15, delay: 0.2},
                                    }}
                                />
                            )}
                        </AnimatePresence>
                        <div className={cn(
                            "rounded-md w-full p-4 overflow-hidden bg-white dark:bg-gray-800 group-hover:ring-2 ring-green-500 relative z-20 transition-all duration-500 cursor-pointer",
                            itemClassName
                        )}>
                            <div className="py-10 z-50 relative space-y-5">
                                <Icon className={cn("size-8 mx-auto", iconClassName)} />
                                <p className="text-2xl font-bold text-center text-gray-800 dark:text-white">
                                    {item.text}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

