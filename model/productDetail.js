const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../config/mysql");

const ProductDetail = sequelize.define(
  "ProductDetail",
  {
    color: DataTypes.TEXT,
    size: DataTypes.TEXT,
    quantity: DataTypes.BIGINT,
  },
  {
    tableName: "productDetail",
    timestamps: false,
  }
);

module.exports = { ProductDetail };
