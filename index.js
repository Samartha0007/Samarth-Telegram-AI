const TelegramBot = require('node-telegram-bot-api');

// Get bot token from Render environment
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

const activeUsers = new Map();

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    if (!activeUsers.has(chatId)) {
        activeUsers.set(chatId, setInterval(() => {
            bot.sendMessage(chatId, "Hello!");
        }, 2000));

        bot.sendMessage(chatId, "Bot started! You'll receive 'Hello' every 20 sec.");
    } else {
        bot.sendMessage(chatId, "You're already receiving messages.");
    }
});

bot.onText(/\/stop/, (msg) => {
    const chatId = msg.chat.id;

    if (activeUsers.has(chatId)) {
        clearInterval(activeUsers.get(chatId));
        activeUsers.delete(chatId);
        bot.sendMessage(chatId, "Stopped sending messages.");
    } else {
        bot.sendMessage(chatId, "You were not receiving messages.");
    }
});

console.log("Bot is running...");