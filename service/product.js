const { Product } = require("../model/product");
const { ProductDetail } = require("../model/productDetail");

const { sequelize } = require("../config/mysql");
const { Sequelize, Op, fn, col, literal } = require("sequelize");

const createProduct = async (data) => {
  try {
    const check = await Product.findOne({
      where: {
        nameProduct: data.nameProduct,
      },
    });
    if (check) {
      return 0;
    }
    const product = await Product.create(data);
    return product;
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const getAllProduct = async (data) => {
  const { category, min, max, sort, size, percent, type } = data;

  let where = "";
  if (category) {
    where += `and c.id IN (${category})`;
  }
  if (size) {
    where += `and pd.size IN (${size})`;
  }
  if (percent) {
    where += `and p.discount >= ${percent} `;
  }
  //order by
  let b = "";
  if (sort == "price") {
    b = "p.price";
  } else if (sort == "sale") {
    b = "p.quantitySell";
  } else if (sort == "new") {
    b = "p.createDate";
  }

  const sql = `SELECT 
                    p.id,
                    p.nameProduct,
                    p.descriptionProducts,
                    p.quantitySell,
                    p.price,
                    p.discount,
                    p.image,
                    p.createDate,
                    p.brand,
                    c.categoryName,
                    c.categoryImage,
                    SUM(pd.quantity) AS remainingQuantity, 
                    COUNT(*) OVER() AS totalRecords
                FROM 
                    product p
                JOIN 
                    category c ON p.CategoryId = c.id
                JOIN
	                  productDetail pd ON pd.ProductId = p.id
                WHERE 
                    p.price between ${min} and ${max} ${where}
                GROUP BY
	                p.id, p.nameProduct, p.descriptionProducts, p.quantitySell, p.price, p.discount, p.image, p.createDate, p.brand, c.categoryName, c.categoryImage
                ORDER BY 
                    ${b} ${type};`;

  const product = await sequelize.query(sql, {
    type: Sequelize.QueryTypes.SELECT,
  });

  return product;
};

const getProduct = async (id) => {
  const sql = `SELECT 	
                        p.id AS product,
                        p.nameProduct as product_name,
                        p.descriptionProducts as descriptionProducts,
                        p.quantitySell as quantitySell,
                        p.price as price,
                        p.discount as discount,
                        p.image as image,
                        p.createDate as createDate,
                        p.brand as brand,
                        p.CategoryId as CategoryId,
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'size', pd.size,
                                'color', pd.color,
                                'quantity', pd.quantity
                            )
                        ) AS details
                FROM 
                    product as p
                JOIN 
                    productDetail as pd ON p.id = pd.ProductId
                WHERE
                    p.id = ${id}
                GROUP BY 
                    p.id, p.nameProduct, p.descriptionProducts, p.quantitySell, p.price, p.discount, p.image, p.createDate, p.brand;`;

  const product = await sequelize.query(sql, {
    type: Sequelize.QueryTypes.SELECT,
  });

  return product[0];
};

const getProductDetail = async (id) => {
  try {
    const product = await ProductDetail.findAll({
      where: {
        ProductId: id,
        quantity: {
          [Op.gt]: 0,
        },
      },
      attributes: ["color", "size", "quantity", "id"],
    });
    return product;
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const getRelate = async (id) => {
  try {
    const category = await Product.findOne({
      where: {
        id: id,
      },
    });

    const product = await Product.findAll({
      attributes: [
        "nameProduct",
        "id",
        "quantitySell",
        "price",
        "discount",
        "image",
      ],
      where: {
        brand: category.brand,
        id: { [Sequelize.Op.not]: id },
      },
    });
    return product;
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const deleteProduct = async (id) => {
  try {
    await Product.destroy({
      where: {
        id: id,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

const putProduct = async (id, data) => {
  try {
    if (data.nameProduct) {
      const check = await Product.findOne({
        where: {
          nameProduct: data.nameProduct,
          id: {
            [Op.ne]: id,
          },
        },
      });
      if (check) {
        return 1;
      }
    }

    const product = await Product.findByPk(id);
    product.update(data);
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const searchProduct = async (search) => {
  let value = search.replace(/\s+/g, " ").trim();
  value = value.toLowerCase().replace(/\s+/g, " ");

  const sql = `SELECT p.*, COUNT(*) OVER() AS totalRecords 
                FROM product p
                WHERE LOWER(p.nameProduct) like '%${value}%';`;

  const product = await sequelize.query(sql, {
    type: Sequelize.QueryTypes.SELECT,
  });
  return product;
};

module.exports = {
  createProduct,
  getAllProduct,
  getProduct,
  getProductDetail,
  getRelate,
  deleteProduct,
  putProduct,
  searchProduct,
};
