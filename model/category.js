const { Sequelize, DataTypes } = require('sequelize');
const {sequelize} = require("../config/mysql");
const {Product} = require("./product");


const Category = sequelize.define("Category",
    {
        categoryName: {
            type: DataTypes.TEXT,
        },
        categoryImage: {
            type: DataTypes.TEXT,
        }
    },
    {
        tableName : "category"
    }
);



Category.hasMany(Product);
Product.belongsTo(Category);


module.exports = {Category};