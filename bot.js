require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Botni ishga tushirish
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Gemini API sozlamasi
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// /start komandasi
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = 'Assalomu aleykum, Ziyo AI botiga hush kelibsiz! Mendan istalgan narsani so\'rang, men sizga javob beraman.';
  bot.sendMessage(chatId, welcomeMessage);
});

// Bot xabar olayotganda
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userText = msg.text;

  try {
    // Typing... holatini ko'rsatish
    await bot.sendChatAction(chatId, 'typing');

    // Gemini API ga so'rov yuborish
    const response = await axios.post(
      GEMINI_URL,
      {
        contents: [
          {
            parts: [{ text: userText }],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Gemini'dan javobni olish
    const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Kechirasiz, javob topilmadi.';

    // Foydalanuvchining xabariga reply qilib yuborish
    await bot.sendMessage(chatId, reply, {
      reply_to_message_id: msg.message_id,
    });

  } catch (error) {
    console.error("Xatolik:", error?.response?.data || error.message);
    await bot.sendMessage(chatId, "Xatolik yuz berdi. Keyinroq urinib ko'ring.", {
      reply_to_message_id: msg.message_id,
    });
  }
});
