export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
import { Bot, webhookCallback} from 'grammy'


const token = process.env.TELEGRAM_BOT_TOKEN

if (!token) {
  console.error('Please provide a valid bot token!')
  process.exit(1)
}

const bot = new Bot(token)
bot.on('message:text', async (ctx) => {
    await ctx.reply(ctx.message.text)
})

export const POST = webhookCallback(bot, 'std/http')