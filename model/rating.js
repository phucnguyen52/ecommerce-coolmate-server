const { Sequelize, DataTypes } = require('sequelize');
const {sequelize} = require("../config/mysql");


const Ratings = sequelize.define("Ratings",
    {
        startPoint: DataTypes.INTEGER,
        comment : DataTypes.TEXT,
        image : DataTypes.TEXT,
        dateRating : {
            type : DataTypes.DATE,
            defaultValue : Sequelize.fn("NOW"),
        }
    },
    {
        tableName : "rating"
    }
);


module.exports = {Ratings};