const { Sequelize, Op, QueryTypes } = require("sequelize");
const { sequelize } = require("../config/mysql");

const reportCategoty = async (data) => {
  const sql = `SELECT 
                    c.categoryname AS categoryname,
                    SUM(od.quantity) AS total_quantity,
                    SUM(od.quantity * od.price) AS total_revenue
                FROM 
                    category as c
                JOIN 
                    product as p ON p.CategoryId = c.id
                JOIN 
                    productDetail as pd ON pd.ProductId = p.id
                JOIN
                    orderdetail as od ON od.ProductDetailId = pd.id
                JOIN
                    \`order\` as o ON o.id = od.OrderId
                WHERE 
                    date(o.orderDate) BETWEEN ${data.start} AND ${data.end}
                GROUP BY 
                    c.categoryname
                HAVING 
                    total_revenue > 0;`;

  const report = await sequelize.query(sql, {
    type: Sequelize.QueryTypes.SELECT,
  });

  return report;
};

const reportSale = async (data) => {
  const sql = `SELECT 
                    o.id AS order_id,
                    o.orderDate AS orderDate,
                    o.totalPrice AS totalPrice,
                    SUM(od.quantity) AS total_quantity
                FROM 
                    \`order\` as o
                JOIN 
                    \`orderdetail\` as od ON o.id = od.OrderId
                WHERE 
                    date(o.orderDate) BETWEEN ${data.start} AND ${data.end}
                GROUP BY 
                    o.id, o.totalPrice, o.orderDate;`;

  const report = await sequelize.query(sql, {
    type: Sequelize.QueryTypes.SELECT,
  });

  return report;
};

const topSellingProduct = async () => {
  const sql = `SELECT 
                    p.id as id,
                    p.nameProduct as nameProduct,
                    p.image as image,
                    SUM(od.quantity) as quantity
                FROM \`order\` as o
                JOIN orderdetail as od ON o.id = od.OrderId
                JOIN productDetail as pd ON od.ProductDetailId = pd.id
                JOIN product as p ON pd.ProductId = p.id
                where month(o.orderDate) = month(NOW()) and o.statusOrder = 'Đã giao hàng' and YEAR(o.orderDate) = YEAR(NOW())
                GROUP BY p.nameProduct, p.id, p.image
                ORDER BY quantity DESC
                LIMIT 5;`;

  const sale = await sequelize.query(sql, {
    type: Sequelize.QueryTypes.SELECT,
  });
  return sale;
};

const topUserSelling = async () => {
  const sql = `SELECT 
                    u.fullName AS fullName,
                    u.picture AS picture,
                    COUNT(DISTINCT o.id) as total,
                    SUM(o.totalPrice) as totalPrice
                FROM \`user\` as u
                JOIN \`order\` as o ON o.UserId = u.id
                JOIN orderdetail as od ON o.id = od.OrderId
                WHERE o.statusOrder = 'Đã giao hàng' 
                AND MONTH(o.orderDate) = MONTH(NOW()) 
                AND YEAR(o.orderDate) = YEAR(NOW())
                GROUP BY u.fullName, u.picture
                LIMIT 5;`;

  const sale = await sequelize.query(sql, {
    type: Sequelize.QueryTypes.SELECT,
  });
  return sale;
};

const getOrderPending = async (req, res) => {
  try {
    let { status, day, month } = req.params;
    day = parseInt(day, 10);
    month = parseInt(month, 10);

    // Map status number -> string
    const statusMap = {
      1: "Đang chờ xác nhận",
      2: "Đã xác nhận",
      3: "Đang giao",
      4: "Hoàn thành",
      5: "Đã hủy",
    };

    const statusText = status ? statusMap[status] : null;

    const sql = `
      SELECT
        o.id           AS orderID,
        u.fullName     AS userName,         
        o.orderDate,
        o.paymentMethod,
        o.statusOrder,
        o.totalPrice,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'productID',   p.id,
                'nameProduct', p.nameProduct,
                'color',       pd.color,
                'size',        pd.size,
                'quantity',    od.quantity,
                'price',       od.price
            )
        ) AS products
      FROM \`order\` o
      JOIN \`user\` u         ON u.id = o.UserId        
      JOIN orderdetail od     ON od.OrderId = o.id
      JOIN productDetail pd   ON pd.id = od.ProductDetailId
      JOIN product p          ON p.id = pd.ProductId
      WHERE DAY(o.orderDate) = :day
        AND MONTH(o.orderDate) = :month
        AND (:statusText IS NULL OR o.statusOrder = :statusText)
      GROUP BY
          o.id, u.fullName, o.orderDate, o.paymentMethod, o.statusOrder, o.totalPrice
      ORDER BY o.orderDate DESC;
    `;

    const orders = await sequelize.query(sql, {
      replacements: { statusText, day, month },
      type: Sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      message: "Danh sách đơn hàng theo trạng thái và ngày/tháng",
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

module.exports = {
  reportCategoty,
  reportSale,
  topUserSelling,
  topSellingProduct,
  getOrderPending,
};
