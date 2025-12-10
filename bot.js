require('dotenv').config();
const { Telegraf } = require('telegraf');

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('Error: BOT_TOKEN not set in environment. Fill it from BotFather in .env (or set as Render secret).');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// Helper: is admin
const admins = (process.env.ADMINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
function isAdmin(id) {
  return admins.includes(String(id));
}

// Simple in-memory storage for user IDs (for demo only).
// For production use a DB (Redis/Mongo/Postgres) to persist users.
const knownUsers = new Set();

bot.start(ctx => {
  const name = ctx.from?.first_name || 'friend';
  knownUsers.add(ctx.from?.id);
  return ctx.reply(`Assalam o Alaikum, ${name}! Main DailyViralPKBot hoon. /help likhen agar aap instructions chahte hain.`);
});

bot.help(ctx => {
  return ctx.reply(
    '/start - bot ko start karein\n' +
    '/help - madad\n' +
    '/broadcast <message> - (admin only) broadcast message to stored users\n' +
    'Seedha message bhejen aur bot echo karega.'
  );
});

// Admin broadcast command: /broadcast message text
bot.command('broadcast', async ctx => {
  const fromId = ctx.from?.id;
  if (!isAdmin(fromId)) return ctx.reply('Aap admin nahi hain.');
  const text = ctx.message.text.split(' ').slice(1).join(' ');
  if (!text) return ctx.reply('Usage: /broadcast <message>');

  ctx.reply(`Broadcast started to ${knownUsers.size} users (demo).`);

  // naive broadcast (rate-limits will apply). In production, chunk & wait.
  for (const uid of Array.from(knownUsers)) {
    try {
      await bot.telegram.sendMessage(uid, text);
    } catch (err) {
      console.error('Failed to send to', uid, err?.response?.description || err.message || err);
    }
  }
});

// Echo and store user IDs
bot.on('message', async ctx => {
  try {
    const uid = ctx.from?.id;
    if (uid) knownUsers.add(uid);

    if (ctx.message.text && !ctx.message.text.startsWith('/')) {
      await ctx.reply(`Received: ${ctx.message.text}`);
    } else if (ctx.message.sticker) {
      await ctx.reply('Nice sticker!');
    } else if (ctx.message.photo) {
      await ctx.reply('Thanks for the photo!');
    }
  } catch (err) {
    console.error('Error handling message:', err);
  }
});

bot.catch((err, ctx) => {
  console.error(`Bot error for ${ctx.updateType}`, err);
});

// Start bot: polling by default. If WEBHOOK_URL is set, we attempt to set webhook (note: Render typically uses polling in a background worker).
(async () => {
  const webhookUrl = process.env.WEBHOOK_URL;
  if (webhookUrl) {
    const path = `/telegram-webhook/${BOT_TOKEN.split(':')[0]}`;
    const url = (webhookUrl.endsWith('/')) ? webhookUrl.slice(0,-1) + path : webhookUrl + path;
    try {
      await bot.telegram.setWebhook(url);
      console.log('Webhook set to', url);
      // Note: On Render you can use web services with an HTTP server to accept POSTs.
    } catch (e) {
      console.error('Failed to set webhook', e);
      process.exit(1);
    }
  } else {
    // Polling mode
    bot.launch().then(() => console.log('Bot launched (polling).'))
      .catch(err => { console.error('Failed to launch bot:', err); process.exit(1); });
  }

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
})();
