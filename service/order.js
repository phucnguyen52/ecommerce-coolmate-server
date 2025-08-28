const { Orders } = require("../model/order");
const { OrderDetail } = require("../model/orderDetail");
const { ProductDetail } = require("../model/productDetail");
const { Product } = require("../model/product");

const { Sequelize, Op, QueryTypes } = require("sequelize");
const { sequelize } = require("../config/mysql");
const { Voucher } = require("../model/voucher");

// const createOrder = async (data, id) => {
//     try {
//         await sequelize.query(
//             "CALL Checkorder(:productIds, :quantities, :id, @result);",
//             {
//                 replacements: {
//                     productIds: JSON.stringify(data.ProductId),
//                     quantities: JSON.stringify(data.quantity),
//                     id: data.voucherID,
//                 },
//                 type: Sequelize.QueryTypes.RAW,
//             }
//         );

//         const result = await sequelize.query("SELECT @result;", {
//             type: Sequelize.QueryTypes.SELECT,
//         });

//         if (result[0]["@result"]) {
//             const order = await Orders.create({
//                 note: data.note,
//                 UserId: id,
//                 voucherId: data.voucherID,
//                 totalPrice: data.totalPrice,
//             });

//             const orderItems = data.price.map((_, index) => {
//                 return {
//                     quantity: data.quantity[index],
//                     ProductDetailId: data.ProductId[index],
//                     OrderId: order.id,
//                     price: data.price[index],
//                 };
//             });

//             await OrderDetail.bulkCreate(orderItems);
//         } else {
//             return "0";
//         }
//     } catch (error) {
//         console.log(error);
//         return "error";
//     }
// };

const createOrder = async (data, userId) => {
  console.log(data);
  try {
    // Tạo đơn hàng trực tiếp, không cần Checkorder
    const order = await Orders.create({
      note: data.note,
      UserId: userId,
      voucherId: data.voucherID,
      totalPrice: data.totalPrice,
    });

    // Tạo order items
    const orderItems = data.price.map((_, index) => ({
      quantity: data.quantity[index],
      ProductDetailId: data.ProductId[index],
      OrderId: order.id,
      price: data.price[index],
    }));

    await OrderDetail.bulkCreate(orderItems);

    // Nếu muốn, bạn có thể giảm tồn kho ở đây (tùy logic)
    // for (let i = 0; i < data.ProductId.length; i++) {
    //     await ProductDetail.decrement('quantity', {
    //         by: data.quantity[i],
    //         where: { id: data.ProductId[i] },
    //     });
    // }
    if (data.voucherID) {
      await Voucher.decrement("quantityDiscount", {
        by: data.totalVoucher || 1, // số lượng voucher đã áp dụng, bạn đang gửi totalVoucher = 2
        where: { id: data.voucherID },
      });
    }
    return order; // trả về đơn hàng vừa tạo
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const getOrder = async (id) => {
  const sql = `SELECT p.id AS product,
                        p.nameProduct as product_name,
                        o.totalPrice as totalPrice,
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'size', pd.size,
                                'color', pd.color,
                                'price', od.price,
                                'quantity', od.quantity,
                                'price', od.price
                            )
                        ) AS OrderDetail
                FROM 
                    \`order\` as o
                JOIN 
                    orderdetail as od ON o.id = od.OrderId
                JOIN
                    productdetail as pd ON pd.id = od.ProductDetailId
                JOIN
                    product as p ON p.id = pd.ProductId
                WHERE
                    o.id = ${id}
                GROUP BY 
                    p.id, p.nameProduct, o.totalPrice;`;

  const order = await sequelize.query(sql, {
    type: Sequelize.QueryTypes.SELECT,
  });

  return order;
};

const deleteOrder = async (id) => {
  try {
    await OrderDetail.destroy({
      where: {
        orderID: id,
      },
    });

    await Orders.destroy({
      where: {
        id: id,
      },
    });
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const getAllOrderForAdmin = async (data) => {
  const sql = `
    WITH Details AS (
        SELECT
            o.id AS id,
            p.id AS product_id,
            p.nameProduct as product_name,
            o.totalPrice as totalPrice,
            SUM(od.quantity) as total_quantity,
            SUM(od.price * od.quantity) AS product_total,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'size', pd.size,
                    'color', pd.color,
                    'price', od.price,
                    'quantity', od.quantity,
                    'total_price', od.quantity * od.price
                )
            ) AS details
        FROM 
            \`order\` as o
        JOIN 
            orderdetail as od ON o.id = od.OrderId
        JOIN
            productdetail as pd ON pd.id = od.ProductDetailId
        JOIN
            product as p ON p.id = pd.ProductId
        WHERE 
            DATE(o.orderDate) BETWEEN ${data.start} and ${data.end}
        GROUP BY 
            o.id, p.id, p.nameProduct, o.totalPrice
    )
    SELECT 
        o.id AS order_id,
        u.fullName AS customer_name,
        o.orderDate,
        o.statusOrder,
        o.totalPrice AS total_amount,
         SUM(d.product_total) AS total_amount, 
        SUM(d.total_quantity) AS total_quantity,
        COUNT(*) OVER() AS totalRecords,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'product_id', d.product_id,
                'product_name', d.product_name,
                'details', d.details
            )
        ) AS product
    FROM 
        \`order\` as o
    JOIN
        Details as d ON d.id = o.id
    JOIN 
        \`user\` as u ON o.UserId = u.id
    GROUP BY 
        o.id, u.fullName, o.orderDate, o.statusOrder;
  `;

  const order = await sequelize.query(sql, {
    type: Sequelize.QueryTypes.SELECT,
  });

  return order;
};

const putOrder = async (id, data) => {
  if (data.statusOrder === "Đã giao hàng") {
    const orderDetails = await OrderDetail.findAll({
      where: { OrderId: id },
    });

    await Promise.all(
      orderDetails.map(async (value) => {
        const productdetail = await ProductDetail.findByPk(
          value.ProductDetailId
        );

        // Giảm tồn kho
        await productdetail.update({
          quantity: productdetail.quantity - value.quantity,
        });

        // Tăng số lượng đã bán
        const product = await Product.findByPk(productdetail.ProductId);
        await product.update({
          quantitySell: product.quantitySell + value.quantity,
        });
      })
    );
  }

  const order = await Orders.findByPk(id);
  await order.update(data);
};

const getAllOrderForUser = async (id, type) => {
  let conditions = [`u.id = ${id}`];

  if (type == 1) conditions.push(`o.statusOrder = 'Đang chờ xác nhận'`);
  if (type == 2) conditions.push(`o.statusOrder = 'Đang chờ vận chuyển'`);
  if (type == 3) conditions.push(`o.statusOrder = 'Đang giao hàng'`);
  if (type == 4) conditions.push(`o.statusOrder = 'Đã giao hàng'`);

  const sql = `
  SELECT o.id as id,
         JSON_ARRAYAGG(
            JSON_OBJECT(
              'orderDetailID', od.id,
              'productID', p.id,
              'product', p.nameProduct,
              'size', pd.size,
              'color', pd.color,
              'price', od.price,
              'picture', p.image,
              'quantity', od.quantity,
              'dayOrder', o.orderDate
            )
         ) AS OrderDetail
  FROM \`user\` as u
  JOIN \`order\` as o ON o.UserId = u.id
  JOIN orderdetail as od ON od.OrderId = o.id
  JOIN productdetail as pd on pd.id = od.ProductDetailId
  JOIN product as p on p.id = pd.ProductId
  WHERE ${conditions.join(" AND ")}
  GROUP BY o.id;
`;

  const order = await sequelize.query(sql, {
    type: Sequelize.QueryTypes.SELECT,
  });

  return order;
};

module.exports = {
  createOrder,
  deleteOrder,
  putOrder,
  getAllOrderForAdmin,
  getAllOrderForUser,
  getOrder,
};
