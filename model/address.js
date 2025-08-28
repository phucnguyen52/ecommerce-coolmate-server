const { Sequelize, DataTypes } = require('sequelize');
const {sequelize} = require("../config/mysql");
const {User} = require("./user");


const Address = sequelize.define("Address",
    {
        address: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        numberPhone : DataTypes.TEXT,
        isAddress : {
            type : DataTypes.BOOLEAN,
            defaultValue : false
        }
    },
    {
        tableName : "address"
    }
);

User.hasMany(Address);
Address.belongsTo(User);


module.exports = {Address};