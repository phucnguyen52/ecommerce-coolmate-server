const Rating = require("../service/rating");


const createRating = async(req, res) =>{
    await Rating.createRating(req.body);

    res.status(201).json({
        message : "Thêm đánh giá thành công",
        succes: true
    }) 
}


const getRatingProduct = async(req, res) =>{
    const rating = await Rating.getRatingProduct(req.params.id);
    
    res.status(200).json({
        succes : true,
        message : "đánh giá",
        rating
    })
}



module.exports = {createRating, getRatingProduct}