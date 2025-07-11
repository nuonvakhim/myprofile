import { NextRequest, NextResponse } from 'next/server';
import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN!;
const bot = new TelegramBot(token);

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Handle incoming message
  if (body.message) {
    const chatId = body.message.chat.id;
    await bot.sendMessage(chatId, 'Open the web app:', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Open Web App',
              web_app: { url: 'https://vakhim.vercel.app/(home)/telegram' },
            },
          ],
        ],
      },
    });
  }

  return NextResponse.json({ status: 'ok' });
}

// Run this once (e.g., in a script or locally)
// const TelegramBot = require('node-telegram-bot-api');
// const bot = new TelegramBot(token);
// bot.setWebHook('https://your-domain.com/api/bot');