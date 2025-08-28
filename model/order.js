const { Sequelize, DataTypes } = require('sequelize');
const {sequelize} = require("../config/mysql");
const {User} = require("./user");
const {OrderDetail} = require("./orderDetail");

const Orders = sequelize.define("Orders",
    {
        note: DataTypes.TEXT,
        paymentMethod : {
            type : DataTypes.TEXT,
            defaultValue : "Thanh toán khi nhận hàng",
        },
        orderDate : {
            type : DataTypes.DATE,
            defaultValue : Sequelize.fn("NOW"),
        },
        statusOrder : {
            type : DataTypes.TEXT,
            defaultValue : "Đang chờ xác nhận",
        },
        totalPrice : {
            type : DataTypes.INTEGER
        }
    },
    {
        tableName : "order"
    }
);


User.hasMany(Orders);
Orders.belongsTo(User);


Orders.hasMany(OrderDetail);
OrderDetail.belongsTo(Orders);


module.exports = {Orders};