const {User} = require("./user");

const { Sequelize, DataTypes } = require('sequelize');
const {sequelize} = require("../config/mysql");

const Messenger = sequelize.define("Messenger",
    {
        messengerContent: {
            type: DataTypes.TEXT,
        },
        messengerTime: {
            type: DataTypes.DATE,
            defaultValue : Sequelize.fn("NOW"),
        },
        
    },
    {
        tableName : "messenger"
    }
);

User.hasMany(Messenger, {foreignKey : "senderId"});
User.hasMany(Messenger, {foreignKey : "receiverId"});

Messenger.belongsTo(User, { foreignKey: "senderId", as: 'sender' });
Messenger.belongsTo(User, { foreignKey: "receiverId", as: 'receiver' });

module.exports = {Messenger};