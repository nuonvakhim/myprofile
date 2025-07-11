'use client'	
// Add TypeScript declaration for window.Telegram
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        // Add more methods/properties as needed
      };
    };
  }
}

import React, { useEffect } from 'react';

export default function TelegramWebApp() {
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      // You can now use the Telegram WebApp API
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Welcome to my Telegram Web App!</h1>
      <p className="text-lg">This page is loaded inside Telegram.</p>
    </div>
  );
}
