const { Sequelize, DataTypes } = require('sequelize');
const {sequelize} = require("../config/mysql");
const {Ratings} = require("./rating");
const {ProductDetail} = require("./productDetail");

const OrderDetail = sequelize.define("OrderDetail",
    {
        quantity: DataTypes.BIGINT,
        price : DataTypes.BIGINT
    },
    {
        tableName : "orderdetail"
    }
);

OrderDetail.hasMany(Ratings);
Ratings.belongsTo(OrderDetail);


ProductDetail.hasMany(OrderDetail);
OrderDetail.belongsTo(ProductDetail);


module.exports = {OrderDetail};