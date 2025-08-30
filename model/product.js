const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../config/mysql");
const { ProductDetail } = require("./productDetail");

const Product = sequelize.define(
  "Product",
  {
    nameProduct: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    descriptionProducts: {
      type: DataTypes.TEXT,
    },
    quantitySell: {
      type: DataTypes.INTEGER,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    discount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    image: {
      type: DataTypes.TEXT,
    },
    createDate: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.fn("NOW"),
    },
    brand: DataTypes.TEXT,
  },
  {
    tableName: "product",
  }
);

Product.hasMany(ProductDetail, {
  foreignKey: "ProductId",
  constraints: false,
});
ProductDetail.belongsTo(Product, {
  foreignKey: "ProductId",
  constraints: false,
});

module.exports = { Product };
