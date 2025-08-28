const ShoppingCart = require("../service/shoppingcart");

const createShoppingCart = async(req, res) =>{
    req.body.UserId = req.user.id;
    await ShoppingCart.createShoppingCart(req.body);

    res.status(201).json({
        succes : true,
        message : "Thêm sản phẩm vào giỏ hàng thành công"
    })
}

const putShoppingCart = async(req, res) =>{
    req.body.UserId = req.user.id;
    await ShoppingCart.putShoppingCart(req.params.id, req.body);

    res.status(200).json({
        succes : true,
        message : "Cập nhật giỏ hàng thành công",
    })
}


const deleteShoppingCart = async(req, res) =>{
    await ShoppingCart.deleteShoppingCart(req.params.id);

    res.status(200).json({
        succes : true,
        message : "Xóa giỏ hàng thành công",
    })

}

const getAllShoppingCart = async(req, res) =>{
    const cart = await ShoppingCart.getAllShoppingCart(req.user.id);
    
    res.status(200).json({
        succes : true,
        message : "Danh sách sản phẩm",
        cart
    })

}

module.exports = {createShoppingCart, putShoppingCart, getAllShoppingCart, deleteShoppingCart}