const { Sequelize, Op } = require("sequelize");
const { sequelize } = require("../config/mysql");
const { StoreDetail } = require("../model/storeDetail");
const { Store } = require("../model/store");
const { ProductDetail } = require("../model/productDetail");

const createStore = async (data, UserId, ProviderId) => {
  // Tính tổng tiền từ chi tiết nhập
  const totalPrice = data.data.reduce(
    (sum, item) => sum + item.price * item.stock,
    0
  );

  // Tạo phiếu nhập (Store)
  const store = await Store.create({
    UserId,
    totalPrice,
    ProviderId,
  });

  // Duyệt từng sản phẩm nhập
  for (const item of data.data) {
    // Tạo chi tiết nhập kho
    await StoreDetail.create({
      price: item.price,
      stock: item.stock,
      StoreId: store.id,
      ProductDetailId: item.productDetailID,
    });

    // Update tồn kho trong bảng ProductDetail
    const productDetail = await ProductDetail.findByPk(item.productDetailID);
    if (productDetail) {
      productDetail.quantity += item.stock; // cộng thêm số lượng nhập
      await productDetail.save();
    }
  }

  return store;
};

const getStore = async (id) => {
  const sql = `SELECT 
                    p.id AS product,
                    p.nameProduct as product_name,
                    s.totalPrice as totalPrice,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'color', pd.color,
                            'size', pd.size,
                            'stock', sd.stock,
                            'price', sd.price,
                            'total_price', sd.stock * sd.price
                        )
                    ) AS product_details
                FROM 
                    store as s
                JOIN 
                    storedetail as sd ON s.id = sd.StoreId
                JOIN
                    productdetail as pd ON pd.id = sd.ProductDetailId
                JOIN
                    product as p ON p.id = pd.ProductId
                WHERE
                    s.id = ${id}
                GROUP BY 
                    p.id, p.nameProduct, s.totalPrice;`;

  const store = await sequelize.query(sql, {
    type: Sequelize.QueryTypes.SELECT,
  });

  return store;
};

//Báo cáo ở trang nhập hàng
const getAllStore = async (data) => {
  const sql = `WITH Details AS (
                    SELECT 
                        s.id AS store_id,
                        pr.id AS product_id,
                        pr.nameProduct AS product_name,
                        SUM(sd.stock) AS total_stock,
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'color', pd.color,
                                'size', pd.size,
                                'stock', sd.stock,
                                'price', sd.price,
                                'total_price', sd.stock * sd.price
                            )
                        ) AS details
                    FROM 
                        store AS s
                    JOIN 
                        storedetail AS sd ON s.id = sd.StoreId
                    JOIN 
                        productdetail AS pd ON pd.id = sd.ProductDetailId
                    JOIN 
                        product AS pr ON pr.id = pd.ProductId
                    WHERE 
                        date(s.storeDate) BETWEEN ${data.start} and ${data.end}
                    GROUP BY 
                        s.id, pr.id, pr.nameProduct
                )



                SELECT 
                    s.id AS store_id,
                    s.storeDate AS store_date,
                    u.fullName AS employee,
                    p.fullname AS provider,
                    s.totalPrice AS total_price,
                    SUM(pd.total_stock) AS total_stock,
                    COUNT(*) OVER() AS totalRecords,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'product_id', pd.product_id,
                            'product_name', pd.product_name,
                            'details', pd.details
                        )
                    ) AS products
                FROM 
                    store AS s
                JOIN 
                    Details AS pd ON s.id = pd.store_id
                JOIN 
                    provider AS p ON p.id = s.ProviderId
                JOIN 
                    user AS u ON u.id = s.UserId
                GROUP BY 
                    s.id, s.storeDate, u.fullName, p.fullname, s.totalPrice
                ORDER BY 
                    s.storeDate DESC;`;

  const store = await sequelize.query(sql, {
    type: Sequelize.QueryTypes.SELECT,
  });

  return store;
};

//Báo cáo ở trang kho hàng
const getAllStoreDetail = async (data) => {
  let having = "";

  if (data.type == "stock") {
    having = `HAVING total_stock <= 10;`;
  }
  const sql = `WITH LatestPrice AS (
                    SELECT 
                        p.id AS product_id, 
                        sd.price AS latest_price,
                        ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY s.storeDate DESC) AS rn
                    FROM 
                        storedetail sd
                    JOIN 
                        store s ON sd.StoreId = s.id
                    JOIN 
                        productdetail pd ON sd.ProductDetailId = pd.id
                    JOIN 
                        product p ON pd.ProductId = p.id
                )

                SELECT 
                    p.id AS product_id, 
                    p.nameProduct AS product_name,  
                    SUM(pd.quantity) AS total_stock, 
                    SUM(pd.quantity) * lp.latest_price AS cost_price, 
                    SUM(pd.quantity) * p.price AS total_value    
                FROM 
                    product p
                JOIN 
                    productdetail pd ON p.id = pd.ProductId 
                LEFT JOIN (
                    SELECT 
                        product_id,
                        latest_price
                    FROM 
                        LatestPrice
                    WHERE 
                        rn = 1 
                ) AS lp ON p.id = lp.product_id
                GROUP BY 
                    p.id, p.nameProduct, lp.latest_price
                ${having}`;

  const store = await sequelize.query(sql, {
    type: Sequelize.QueryTypes.SELECT,
  });

  return store;
};

module.exports = { createStore, getStore, getAllStore, getAllStoreDetail };
