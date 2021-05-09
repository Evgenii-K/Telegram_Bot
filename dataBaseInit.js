const { DataTypes } = require('sequelize');
const sequelize = require('./connect.js');

const users = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER, 
        allowNull: false, unique: true, 
        primaryKey: true, autoIncrement: 
        true
        },
    chatId: {type: DataTypes.STRING, unique: true},
    right: {type: DataTypes.INTEGER, defaultValue: 0},
    wrong: {type: DataTypes.INTEGER, defaultValue: 0}
    });

module.exports = users;

// Если таблица с таким именем уже существует в базе, добавляем опцию:

// {
//     tebleName: 'test_table' 
// }