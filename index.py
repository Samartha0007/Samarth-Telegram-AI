import telebot
import google.generativeai as genai
import os

# Load API keys from environment variables
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize bot
bot = telebot.TeleBot(TELEGRAM_BOT_TOKEN, parse_mode="Markdown")

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

# Set up the model
generation_config = {
    "temperature": 0.9,
    "top_p": 1,
    "top_k": 1,
    "max_output_tokens": 2048,
}

safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]

# Initialize Gemini model
model = genai.GenerativeModel(
    model_name="gemini-1.0-pro",
    generation_config=generation_config,
    safety_settings=safety_settings,
)

# Start a conversation with history
convo = model.start_chat(history=[])


@bot.message_handler(commands=["start", "help"])
def send_welcome(message):
    bot.reply_to(message, "🤖 **Hello! I am an AI chatbot powered by Gemini.**\n\n"
                          "Ask me anything, and I'll try to help! 🚀")


@bot.message_handler(func=lambda message: True)
def chat_with_ai(message):
    chat_id = message.chat.id
    user_text = message.text

    # Send "typing..." indicator
    bot.send_chat_action(chat_id, "typing")

    try:
        convo.send_message(user_text)
        response = convo.last.text

        if not response:
            response = "Sorry, I couldn't generate a response. Try again!"

        bot.reply_to(message, response)

    except Exception as e:
        bot.reply_to(message, "⚠️ Error processing your request. Please try again later.")
        print("Error:", e)


# Start polling
bot.infinity_polling()