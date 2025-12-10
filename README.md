# DailyViralPKBot

This repository is a simple Telegram bot starter (Node.js + Telegraf) ready to deploy on Render (or run locally).

Quick start (local)
1. Clone the repo
2. npm install
3. Copy `.env.example` to `.env` and set BOT_TOKEN and ADMINS (comma-separated Telegram user IDs).
4. npm start

Run on Render (recommended for easy hosting)
1. Go to https://dashboard.render.com and sign in.
2. Click "New+" → "Web Service" if you prefer webhook + HTTP endpoint, or "Background Worker" for polling. For polling, choose "Background Worker".
3. Connect your GitHub account and select the `rehmantts2211/dailyviralpkbot` repository.
4. For a Background Worker, set the Start Command to: `npm start`.
5. Add environment variables in Render's dashboard for the service:
   - BOT_TOKEN: (your Telegram bot token from BotFather)
   - ADMINS: comma-separated Telegram user IDs allowed to run admin commands (e.g. 123456789)
   - (Optional) WEBHOOK_URL if you want webhook mode
6. Deploy. The worker will run and the bot will use long polling to receive updates.

Notes & next steps
- This starter stores user IDs in memory (demo). For production use a persistent DB (Redis/Mongo/Postgres) to keep user lists across deploys.
- Respect Telegram rate limits when broadcasting: chunk messages and add delays.
- Do not commit BOT_TOKEN to the repository. Use Render's environment variables/secrets.

License: MIT
