const { Sequelize } = require('sequelize');

module.exports = new Sequelize(
    'telegram_bot',
    'root',
    'root', // Необходимо ввести валидный пароль
    {
        dialect: 'mysql',
        port: '3306',
    }
);