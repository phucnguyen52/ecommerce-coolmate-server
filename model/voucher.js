const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/mysql");
const { Category } = require("./category");
const { User } = require("./user");
const { Orders } = require("./order");

const Voucher = sequelize.define(
  "voucher",
  {
    discountCode: DataTypes.STRING,
    nameVoucher: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    quantityDiscount: DataTypes.INTEGER,
    usedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    discountUnit: DataTypes.ENUM("percent", "fixedPrice"),
    discountValue: DataTypes.INTEGER,
    condition: DataTypes.INTEGER,
    maximumPrice: DataTypes.INTEGER,
    isAllProduct: DataTypes.BOOLEAN,
    isAllUser: DataTypes.BOOLEAN,
    status: DataTypes.ENUM("draft", "active", "stop"),
  },
  {
    tableName: "voucher",
    timestamps: true,
  }
);

const VoucherCategory = sequelize.define(
  "voucherCategory",
  {},
  { tableName: "voucherCategory" }
);
const VoucherUser = sequelize.define(
  "voucherUser",
  {},
  { tableName: "voucherUser" }
);

Voucher.belongsToMany(Category, { through: VoucherCategory });
Category.belongsToMany(Voucher, { through: VoucherCategory });

Voucher.belongsToMany(User, { through: VoucherUser });
User.belongsToMany(Voucher, { through: VoucherUser });

Voucher.hasMany(Orders);
Orders.belongsTo(Voucher);

module.exports = {
  Voucher,
  VoucherCategory,
  VoucherUser,
};
