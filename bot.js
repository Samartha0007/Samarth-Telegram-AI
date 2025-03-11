require("dotenv").config();
const { Telegraf } = require("telegraf");
const fetch = require("node-fetch");

const bot = new Telegraf(process.env.BOT_TOKEN);
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;

const predefinedResponses = {
  "who are you": "I am Duo, your personal assistant created to assist you. I was developed by Samartha GS. Learn more at [samarthags.cloud](https://samarthags.cloud).",
  "who developed you": "I was developed by Samartha GS, a 16-year-old tech enthusiast who loves web development, IoT, and AI.",
  "where are you from": "I am from Golagodu, a beautiful village near Sagara in Karnataka, India.",
  "what can you do": "I can answer your questions, provide information, and chat about various topics. Let me know how I can assist you!",
  "who is samartha gs": "Samartha GS is a talented 16-year-old passionate about web development, IoT, and AI. He has completed over 50 projects!",
  "do you know samartha gs": "Yes, Samartha GS is my creator! Learn more at [samarthags.cloud](https://samarthags.cloud).",
  "samartha gs": "Samartha GS - I am here because of him!",
  "hi": "Hi, I'm Duo - Developed by Samartha! How can I help you today?",
  "hello": "Hello, I'm Duo - Developed by Samartha! How can I help you today?",
};

// Function to find predefined response
const findPredefinedResponse = (message) => {
  message = message.toLowerCase();
  return predefinedResponses[message] || null;
};

// Function to call Gemini API
const getAIResponse = async (text) => {
  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text }] }],
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    return `Error: ${error.message}`;
  }
};

// Typing Effect Simulation
const sendTypingEffect = async (ctx, message) => {
  await ctx.sendChatAction("typing");
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate typing delay
  await ctx.reply(message, { parse_mode: "Markdown" });
};

// Handle user messages
bot.on("text", async (ctx) => {
  const userMessage = ctx.message.text.trim();
  const predefinedResponse = findPredefinedResponse(userMessage);

  if (predefinedResponse) {
    await sendTypingEffect(ctx, predefinedResponse);
  } else {
    const aiResponse = await getAIResponse(userMessage);
    await sendTypingEffect(ctx, aiResponse);
  }
});

// Start the bot
bot.launch().then(() => console.log("Bot is running..."));

// Graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));