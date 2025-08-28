const { Sequelize, DataTypes } = require('sequelize');
const {sequelize} = require("../config/mysql");

const {User} = require("./user");

const Store = sequelize.define("Store",
    {   
        storeDate : {
            type : DataTypes.DATE,
            defaultValue : Sequelize.fn("NOW"),
        },
        totalPrice : {
            type : DataTypes.INTEGER
        }
    },
    {
        tableName : "store"
    }
);


User.hasMany(Store);
Store.belongsTo(User);

module.exports = {Store};