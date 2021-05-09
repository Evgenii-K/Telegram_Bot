const TelegramApi = require('node-telegram-bot-api');
const { gameOptions, gameAgain } = require('./options');
const sequelize = require('./connect.js');
const UsersData = require('./dataBaseInit');

const token = '1896571128:AAGeEdTZdjC6X5OoVRQOr6nOkoQqKCYsvsQ';
const bot = new TelegramApi(token, {polling: true});

const chats = {};

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Сейчас я закадаю число от 0 до 9, попробуй отгадать');
    const randomNumber = Math.floor(Math.random() * 10);
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Попробуй отгадать', gameOptions);
};

const start = async () => {

    // Подключение к db

    try {
        await sequelize
            .authenticate()
            .then(() => console.log('Connected.'))
            .catch((err) => console.error('Connection error: ', err));
        await sequelize
            .sync();
    } catch (err) {
        console.log('Ошибка подключения к db', err);
    }

    // Справочник команд в чате с ботом в telegram

    bot.setMyCommands([
        {command: '/start', description: 'Приветствие'},
        {command: '/info', description: 'Информация'},
        {command: '/game', description: 'Игра угадай число'}
    ]);

    // Действия при вводе сообщения пользователем

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        const firstName = msg.from.first_name;
        const lastName = msg.from.last_name;

        try {
            if (text === '/start') {
                if (await !UsersData.findOne({chatId})) {
                    await UsersData.create({chatId});
                }
                await bot.sendSticker(chatId, 'https://cdn.tlgrm.ru/stickers/149/0b9/1490b970-e511-4165-b2bc-8846c783854c/192/5.webp');
                return bot.sendMessage(chatId, 'Добро пожаловать в телеграмм бот!');
            }
        
            if (text === '/info') {
                const userInfo = await UsersData.findOne({chatId});
                return bot.sendMessage(chatId, `Привет ${firstName} ${lastName} ! В игре у тебя ${userInfo.right} правильных и ${userInfo.wrong} неправильных ответов.`);
            }
    
            if (text === '/game') {
                return startGame(chatId);
            }
    
            return bot.sendMessage(chatId, 'Я вас не понимаю, попробуйте ввести другую команду');

        } catch (err) {
            return bot.sendMessage(chatId, 'Произошла ошибка!');
        }
    });

    // Действия при нажатии кнопки 

    bot.on('callback_query', async msg => {
        // Значение нажатой кнопки
        const data = msg.data;
        // id чата пользователя
        const chatId = msg.message.chat.id;

        // Если нажата кнопка "Играть еще раз"

        if (data === '/again') {
            return startGame(chatId);
        }

        // Получаем информацию пользователя по id
        const userInfo = await UsersData.findOne({chatId});

        if (data == chats[chatId]) {
            userInfo.right++;
            await bot.sendMessage(chatId, `Вы угадали! Это цифра ${chats[chatId]}`, gameAgain);
        } else {
            userInfo.wrong++;
            await bot.sendMessage(chatId, `Вы не угадали, я загадал число ${chats[chatId]}`, gameAgain);
        }

        // Сохроняем измененные данные в таблицу
        await userInfo.save();
    });
};

start();