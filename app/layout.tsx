import type {Metadata} from "next";
import {Space_Grotesk} from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "@/components/theme-privider";
import Script from "next/script";

const spaceGrotesk = Space_Grotesk({subsets: ["latin"]});


export const metadata: Metadata = {
    metadataBase: new URL("https://localhost:3000"),

    title: {
        template: "%s | Vakhim Portfolio",
        default: "Vakhim Portfolio",
    },
    authors: {
        name: "nuonvkahim",
    },

    description:"Based in Cambodia, I'm a Fullstack developer with a passion for building beautiful and functional websites. I'm currently looking for a new opportunity to work with a team that values creativity and innovation.",
    openGraph: {
        title: "Vakhim Portfolio",
        description:"Based in Cambodia, I'm a Fullstack developer with a passion for building beautiful and functional websites. I'm currently looking for a new opportunity to work with a team that values creativity and innovation.",
        url: "https://next-supabase-vote.vercel.app/",
        siteName: "Vakhim",
        images: "/og.png",
        type: "website",
    },
    keywords: ["vakhim", "vakhim portfolio", "nuonvakhim"],
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
         <head>
        {/* The Telegram Web App script is included here */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
        <body className={spaceGrotesk.className}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
            {children}
        </ThemeProvider>
        </body>
        </html>
    );
}
