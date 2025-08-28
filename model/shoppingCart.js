const { Sequelize, DataTypes } = require('sequelize');
const {sequelize} = require("../config/mysql");
const {Product} = require("./product");
const {User} = require("./user");

const ShoppingCart = sequelize.define("ShoppingCart",
    {
        color: DataTypes.TEXT,
        size : DataTypes.TEXT,
        quantity : DataTypes.INTEGER,
        isOrder : {
            type : DataTypes.BOOLEAN,
            defaultValue : false
        }
    },
    {
        tableName : "shoppingCart"
    }
);


User.hasMany(ShoppingCart);
ShoppingCart.belongsTo(User);

Product.hasMany(ShoppingCart);
ShoppingCart.belongsTo(Product);


module.exports = {ShoppingCart};