const { Sequelize, DataTypes } = require('sequelize');
const {sequelize} = require("../config/mysql");

const {Store} = require("./store");


const Provider = sequelize.define("Provider",
    {
        address: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        numberPhone : DataTypes.TEXT,
        fullname : DataTypes.TEXT
    },
    {
        tableName : "provider"
    }
);


Provider.hasMany(Store);
Store.belongsTo(Provider);


module.exports = {Provider};