const { Sequelize, DataTypes } = require('sequelize');
const {sequelize} = require("../config/mysql");

const {Store} = require("./store");
const {ProductDetail} = require("./productDetail");

const StoreDetail = sequelize.define("StoreDetail",
    {
        price: DataTypes.INTEGER,
        stock: DataTypes.INTEGER,
    },
    {
        tableName : "storeDetail"
    }
);

Store.hasMany(StoreDetail);
StoreDetail.belongsTo(Store);

ProductDetail.hasMany(StoreDetail);
StoreDetail.belongsTo(ProductDetail);

module.exports = {StoreDetail};