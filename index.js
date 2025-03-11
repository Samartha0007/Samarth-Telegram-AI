const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

// Load environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Function to get response from Gemini AI
async function getGeminiResponse(userMessage) {
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateText?key=${GEMINI_API_KEY}`,
            {
                prompt: { text: userMessage }
            }
        );

        if (response.data && response.data.candidates && response.data.candidates.length > 0) {
            return response.data.candidates[0].output;
        } else {
            return "Sorry, I couldn't generate a response.";
        }
    } catch (error) {
        console.error("Gemini API Error:", error.response ? error.response.data : error.message);
        return "Error: Unable to process your request.";
    }
}

// Handle messages
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text;

    if (!userMessage) return;

    // Send typing indicator
    bot.sendChatAction(chatId, "typing");

    // Get AI response
    const botReply = await getGeminiResponse(userMessage);

    // Send response
    bot.sendMessage(chatId, botReply);
});

console.log("AI Telegram Bot is running...");