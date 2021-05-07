//npm i node-telegram-bot-api nodemon

const TelegramApi = require('node-telegram-bot-api');
const { gameOptions, gameAgain } = require('./options');

const token = '1896571128:AAGeEdTZdjC6X5OoVRQOr6nOkoQqKCYsvsQ';

const bot = new TelegramApi(token, {polling: true});

const chats = {};

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Сейчас я закадаю число от 0 до 9, попробуй отгадать');
    const randomNumber = Math.floor(Math.random() * 10);
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Попробуй отгадать', gameOptions);
};

const start = () => {
    bot.setMyCommands([
        {command: '/start', description: 'Приветствие'},
        {command: '/info', description: 'Информация'},
        {command: '/game', description: 'Игра угадай число'}
    ]);

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
    
        if (text === '/start') {
            await bot.sendSticker(chatId, 'https://cdn.tlgrm.ru/stickers/149/0b9/1490b970-e511-4165-b2bc-8846c783854c/192/5.webp');
            return bot.sendMessage(chatId, 'Добро пожаловать в телеграмм бот!');
        }
    
        if (text === '/info') {
            return bot.sendMessage(chatId, 'Да что тут можно сказать?! Это просто недоделанный бот.');
        }

        if (text === '/game') {
            return startGame(chatId);
        }

        return bot.sendMessage(chatId, 'Я вас не понимаю, попробуйте ввести другую команду');
    });

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;

        if (data === '/again') {
            return startGame(chatId);
        }

        if (data === chats[chatId]) {
            await bot.sendMessage(chatId, `Вы угадали! Это цифра ${chats[chatId]}`, gameAgain);
        } else {
            await bot.sendMessage(chatId, `Вы не угадали, я загадал число ${chats[chatId]}`, gameAgain);
        }
    });
};

start();