const Product = require("../service/product");


const createProduct = async(req, res) => {
    req.body.Image = JSON.stringify(req.body.Image);
    const product = await Product.createProduct(req.body);

    if(product == 0){
        res.status(201).json({
            message : "Tên sản phẩm đã tồn tại",
            succes: false
        }) 
    }
    else{
        res.status(201).json({
            message : "Thêm sản phẩm thành công",
            succes: true
        }) 
    }
}


const getAllProduct = async(req, res) => {
    const product = await Product.getAllProduct(req.query);

    res.status(201).json({
        message : "Danh sách sản phẩm",
        succes: true,
        product
    }) 

}

const getProduct = async(req, res) => {
    const product = await Product.getProduct(req.params.id);

    
    res.status(201).json({
        message : "Thông tin sản phẩm",
        succes: true,
        product
    }) 
}

const getProductDetail = async(req, res) => {
    try{
        const product = await Product.getProductDetail(req.params.id);
        res.status(201).json({
            message : "Thông tin biến thể sản phẩm",
            succes: true,
            product
        }) 
    }catch (error) {
        res.status(505).json("Lỗi hệ thống");
    }
}

const getRelate = async(req, res) => {
    const product = await Product.getRelate(req.params.id);

    res.status(201).json({
        message : "Các sản phẩm liên quan",
        succes: true,
        product
    }) 

}



const deleteProduct = async(req, res) => {

    await Product.deleteProduct(req.params.id);
    res.status(201).json({
        message : "Xóa sản phẩm thành công",
        succes: true,
    }) 

}



const putProduct = async(req, res) => {
    req.body.image = JSON.stringify(req.body.image);
    const product = await Product.putProduct(req.params.id, req.body);

    if(product == 1){
        res.status(400).json({
            message : "Tên sản phẩm đã tồn tại",
            succes: false,
        }) 
    }
    else{
        res.status(201).json({
            message : "Sửa sản phẩm thành công",
            succes: true,
        }) 
    }
}

const searchProduct = async(req, res) => {
    try {
        const product = await Product.searchProduct(req.query.search);

        res.status(201).json({
            message : "Danh sách các sản phẩm tìm kiếm",
            succes: true,
            product
        }) 
    }catch (error) {
        res.status(500).json(error);
    }
}


module.exports = {createProduct, getAllProduct, getProduct, getProductDetail, getRelate, deleteProduct, putProduct, searchProduct}