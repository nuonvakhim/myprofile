"use client"

import React from 'react';
import TicTacToeGame from "@/components/ui/TicTacToeGame";

const Page = () => {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-800 text-gray-300">
            <style jsx global>{`
                body {
                    font-family: 'Press Start 2P', cursive;
                }
            `}</style>
            <TicTacToeGame/>
        </main>
    );
};

export default Page;