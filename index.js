require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const TOKEN = process.env.TOKEN;
const TARGET = process.env.TARGET_USER_ID;
const CHANNEL = process.env.CHANNEL_ID;
const CRAFTLAND_UID = process.env.CRAFTLAND_UID || "2088082744";
const COMMAND_PREFIX = process.env.COMMAND_PREFIX || "!";
const AUTO_POST_MINUTES = Number(process.env.AUTO_POST_MINUTES || 10);
const REPLY_COOLDOWN_SECONDS = Number(process.env.REPLY_COOLDOWN_SECONDS || 30);

const submittedUsers = new Set();
const replyCooldowns = new Map();

function validateConfig() {
  const missing = [];

  if (!TOKEN) missing.push("TOKEN");
  if (!TARGET) missing.push("TARGET_USER_ID");

  if (missing.length > 0) {
    console.error(`Missing required .env value(s): ${missing.join(", ")}`);
    process.exit(1);
  }
}

function hasCooldown(userId) {
  const expiresAt = replyCooldowns.get(userId);
  return expiresAt && Date.now() < expiresAt;
}

function setCooldown(userId) {
  replyCooldowns.set(userId, Date.now() + REPLY_COOLDOWN_SECONDS * 1000);
}

function createCraftlandEmbed(requester) {
  return new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle("Craftland Follow Assistant")
    .setDescription(
`Hello ${requester},

Please follow my **Free Fire Craftland** map.

**Craftland UID:** \`${CRAFTLAND_UID}\`

**Step 1:** Open Free Fire Craftland.
**Step 2:** Search this UID: \`${CRAFTLAND_UID}\`
**Step 3:** Follow my Craftland map.

If this server has a verification channel, upload a screenshot there and type **done**.

Thank you for supporting my Craftland map!`
    )
    .setFooter({
      text: `Tip: type ${COMMAND_PREFIX}craftland anytime`,
    });
}

function createAutoPostMessage() {
  return `
**Craftland Follow Event**

@everyone

Please follow my **Free Fire Craftland** map!

**Craftland UID:** \`${CRAFTLAND_UID}\`
Follow the map in Free Fire Craftland.
Upload a screenshot in this channel.
Type **done** after uploading.

Mention <@${TARGET}> or type \`${COMMAND_PREFIX}craftland\` if you need help.

Thank you for supporting my Craftland map!
  `;
}

async function sendCraftlandReply(message) {
  if (hasCooldown(message.author.id)) return;

  setCooldown(message.author.id);
  return message.reply({ embeds: [createCraftlandEmbed(message.author)] });
}

validateConfig();

client.once("ready", async () => {
  console.log(`${client.user.tag} is Online`);
  console.log(`Craftland UID: ${CRAFTLAND_UID}`);
  console.log(`Help command: ${COMMAND_PREFIX}craftland`);

  let channel = null;

  if (CHANNEL) {
    try {
      channel = await client.channels.fetch(CHANNEL);
    } catch (err) {
      console.error("Failed to fetch auto-message channel:", err);
    }
  }

  setInterval(async () => {
    if (!channel) return;

    try {
      await channel.send(createAutoPostMessage());
    } catch (err) {
      console.error("Failed to send auto message:", err);
    }
  }, AUTO_POST_MINUTES * 60 * 1000);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim().toLowerCase();
  const askedForCraftland = content === `${COMMAND_PREFIX}craftland`;
  const mentionedOwner = TARGET && message.mentions.users.has(TARGET);
  const mentionedBot = client.user && message.mentions.users.has(client.user.id);

  // Replies in any server/channel where this bot is present.
  if (mentionedOwner || mentionedBot || askedForCraftland) {
    return sendCraftlandReply(message);
  }

  // Verification flow works only in the configured verification channel.
  if (!CHANNEL || message.channel.id !== CHANNEL) return;

  if (message.attachments.size > 0) {
    if (submittedUsers.has(message.author.id)) {
      return message.reply(
        "You have already submitted a screenshot.\nPlease wait for verification."
      );
    }

    submittedUsers.add(message.author.id);

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("Screenshot Received")
      .setDescription(
`Thanks ${message.author}!

Your screenshot has been received.

Your request has been added to the verification queue.

Estimated review time: ~2 minutes.`
      );

    return message.reply({ embeds: [embed] });
  }

  if (content === "done") {
    if (!submittedUsers.has(message.author.id)) {
      return message.reply(
        "Please upload your screenshot first, then type **done**."
      );
    }

    const embed = new EmbedBuilder()
      .setColor("Yellow")
      .setTitle("Verification Pending")
      .setDescription(
`Thanks ${message.author}!

Your request is under review.

Please wait while your Craftland follow is verified.

You'll be notified once verification is complete.`
      );

    return message.reply({ embeds: [embed] });
  }
});

client.login(TOKEN);
