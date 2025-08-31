const { Ratings } = require("../model/rating");
const { ShoppingCart } = require("../model/shoppingCart");

const { Sequelize, Op } = require("sequelize");
const { sequelize } = require("../config/mysql");

const createRating = async (data) => {
  try {
    await Ratings.create(data);
  } catch (error) {
    console.log(error);
  }
};

const getRatingProduct = async (id) => {
  const sql = `WITH ReviewSummary AS (
                    SELECT 
                        u.fullname AS userName,
                        u.picture AS userImage,
                        r.comment AS reviewComment,
                        r.startPoint AS reviewStars,
                        r.image AS reviewImage,
                        r.dateRating AS reviewDate,
                        pd.color AS color,
                        pd.size AS size
                    FROM 
                        product p
                    JOIN 
                        productDetail pd ON p.id = pd.ProductId
                    JOIN 
                        orderdetail od ON pd.id = od.ProductDetailId
                    JOIN 
                        rating r ON od.id = r.OrderDetailId
                    JOIN 
                        \`order\` o ON od.OrderId = o.id
                    JOIN 
                        \`user\` u ON o.UserId = u.id
                    WHERE 
                        p.id = ${id}
                )

                SELECT 
                    COUNT(*) AS totalRecords,
                    COALESCE(SUM(reviewStars), 0) AS totalStars,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'userName', userName,
                            'userImage', userImage,
                            'reviewComment', reviewComment,
                            'reviewStars', reviewStars,
                            'reviewImage', reviewImage,
                            'reviewDate', reviewDate
                        )
                    ) AS reviews
                FROM 
                    ReviewSummary;`;

  const rating = await sequelize.query(sql, {
    type: Sequelize.QueryTypes.SELECT,
  });

  return rating;
};

module.exports = { createRating, getRatingProduct };
