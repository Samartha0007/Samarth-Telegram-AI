require('dotenv').config();
const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');

const bot = new Telegraf(process.env.TOKEN);
const API_KEY = process.env.API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;

const predefinedResponses = {
  "who are you": "I am Duo, your personal assistant created to assist you. I was developed by Samartha GS. Learn more at [samarthags.cloud](https://samarthags.cloud).",
  "who developed you": "I was developed by Samartha GS, a 16-year-old tech enthusiast who loves web development, IoT, and AI. He has completed over 50 amazing projects!",
  "where are you from": "I am from Golagodu, a beautiful village near Sagara in Karnataka, India.",
  "what can you do": "I can answer your questions, provide information, and chat about various topics. Let me know how I can assist you!",
  "who is samartha gs": "Samartha GS is a talented 16-year-old passionate about web development, IoT, and AI. He has completed over 50 projects, including websites and apps.",
  "do you know samartha gs": "Yes, Samartha GS is my creator! A skilled individual passionate about technology and innovation. Learn more about him at [samarthags.cloud](https://samarthags.cloud).",
  "samartha gs": "Samartha GS - I am here because of him!",
  "hi": "Hi, I'm Duo - Developed by Samartha. How can I help you today?",
  "hello": "Hello, I'm Duo - Developed by Samartha. How can I help you today?",
};

const findPredefinedResponse = (message) => {
  message = message.toLowerCase();

  const commonPrefixes = [
    "tell me about", "can you explain", "what do you know about",
    "do you know about", "i want to know about"
  ];

  for (const prefix of commonPrefixes) {
    if (message.startsWith(prefix)) {
      message = message.replace(prefix, "").trim();
      break;
    }
  }

  return predefinedResponses[message] || null;
};

const generateAIResponse = async (userMessage) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: userMessage }] }]
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    return data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1");
  } catch (error) {
    return "Sorry, I couldn't process your request.";
  }
};

bot.start((ctx) => ctx.reply("Hello! Your bot is now running on Render."));

bot.on("text", async (ctx) => {
  const userMessage = ctx.message.text;
  const predefinedResponse = findPredefinedResponse(userMessage);

  if (predefinedResponse) {
    ctx.reply(predefinedResponse);
  } else {
    ctx.reply("Thinking...");
    const aiResponse = await generateAIResponse(userMessage);
    ctx.reply(aiResponse);
  }
});

bot.launch();
console.log("Bot is running...");

// Graceful shutdown
process.on("SIGINT", () => {
  bot.stop("SIGINT");
  console.log("Bot stopped");
});
process.on("SIGTERM", () => {
  bot.stop("SIGTERM");
  console.log("Bot stopped");
});