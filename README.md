# Craftland Discord Bot

Discord bot that replies with Free Fire Craftland follow instructions when someone mentions the owner, mentions the bot, or types `!craftland`.

## Local setup

1. Copy `.env.example` to `.env`.
2. Put your real Discord bot token in `TOKEN`.
3. Run:

```bash
npm install
npm start
```

## Deployment

Do not deploy `.env`. It is ignored for safety.

Add these values in your hosting provider's environment variables or secrets page:

- `TOKEN`
- `TARGET_USER_ID`
- `CHANNEL_ID`
- `CRAFTLAND_UID`
- `COMMAND_PREFIX`
- `AUTO_POST_MINUTES`
- `REPLY_COOLDOWN_SECONDS`

Use this start command:

```bash
npm start
```

If your host asks for a port, set `PORT` to any allowed port. The bot will start a small health page automatically.

For Render, Fly.io, Railway, or similar hosts, run this as a worker/background service when possible. Discord bots are long-running processes, not serverless functions.
