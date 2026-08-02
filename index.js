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

const TARGET = process.env.TARGET_USER_ID;
const CHANNEL = process.env.CHANNEL_ID;

// Duplicate submissions rokne ke liye
const submittedUsers = new Set();

client.once("ready", async () => {
  console.log(`${client.user.tag} is Online ✅`);

  const channel = await client.channels.fetch(process.env.CHANNEL_ID);

  setInterval(async () => {
    try {
      await channel.send(`
📢 **Craftland Follow Back Event**

@everyone

🔥 Want a **FREE Follow Back** from **Tau Ji**?

✅ Follow **Tau Ji** on Craftland.
📸 Upload a screenshot in this channel.
💬 Type **done** after uploading.

🤖 Mention <@${TARGET}> if you need help.

💙 Thank you for supporting Tau Ji!
      `);
    } catch (err) {
      console.error("Failed to send auto message:", err);
    }
  }, 10 * 60 * 1000); // 10 minutes
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // Sirf verification channel me kaam karega
  if (message.channel.id !== CHANNEL) return;

  // Mention Detect
  if (message.mentions.users.has(TARGET)) {
    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("🤖 Ꭲꫝᴜ Ꭻɪ AI Assistant")
      .setDescription(
`👋 Hello ${message.author},

Want a Follow Back on Craftland?

**Step 1:** Follow **Ꭲꫝᴜ Ꭻɪ** on Craftland.

**Step 2:** Upload a screenshot in this channel.

**Step 3:** Type **done** after uploading.

📌 Once your follow is verified, Ꭲꫝᴜ Ꭻɪ will follow you back.

💙 Thank you for supporting Ꭲꫝᴜ Ꭻɪ!`
      )
      .setFooter({
        text: "Ꭲꫝᴜ Ꭻɪ AI Assistant",
      });

    return message.reply({ embeds: [embed] });
  }

  // Screenshot Detect
  if (message.attachments.size > 0) {

    if (submittedUsers.has(message.author.id)) {
      return message.reply(
        "⚠️ You have already submitted a screenshot.\nPlease wait for verification."
      );
    }

    submittedUsers.add(message.author.id);

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("📸 Screenshot Received")
      .setDescription(
`Thanks ${message.author}!

✅ Your screenshot has been received.

🔍 Your request has been added to the verification queue.

⏳ Estimated review time: ~2 minutes.`
      );

    return message.reply({ embeds: [embed] });
  }

  // Done
  if (message.content.toLowerCase() === "done") {

    if (!submittedUsers.has(message.author.id)) {
      return message.reply(
        "❌ Please upload your screenshot first, then type **done**."
      );
    }

    const embed = new EmbedBuilder()
      .setColor("Yellow")
      .setTitle("⏳ Verification Pending")
      .setDescription(
`Thanks ${message.author}!

Your request is under review.

Please wait while Ꭲꫝᴜ Ꭻɪ verifies your follow.

💙 You'll be notified once verification is complete.`
      );

    return message.reply({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);