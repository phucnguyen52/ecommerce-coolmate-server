const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    dialect: "mysql",
    timezone: "+07:00",
    define: {
      timestamps: false,
    },
    dialectOptions: {
      charset: "utf8mb4",
    },
    logging: false,
  }
);

const connectToDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Kết nối thành công DATABASE");

    // sync sau khi connect
    await sequelize.sync({ alter: true }); // khi muốn xóa hết bảng
    // hoặc: await sequelize.sync({ alter: true }); // khi chỉ muốn update cấu trúc bảng
  } catch (error) {
    console.log("❌ Lỗi kết nối DB:", error);
  }
};

module.exports = { sequelize, connectToDB };
