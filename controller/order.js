const Order = require("../service/order");

const createOrder = async(req, res) =>{
    const order = await Order.createOrder(req.body, req.user.id);
    if(order == "error"){
        res.status(505).json("Lỗi hệ thống");
    }

    else if(order == "0"){
        res.status(500).json("Số lượng của sản phẩm đã thay đổi, vui lòng thử hết");
    }

    else{
        res.status(200).json({
            succes : true,
            message : "Đặt hàng thành công",
        })
    }
}


const deleteOrder = async(req, res) =>{
    await Order.deleteOrder(req.params.id);
    res.status(200).json({
        succes : true,
        message : "Hủy đơn đặt hàng thành công",
    })
}


const putOrder = async(req, res) =>{
    await Order.putOrder(req.params.id, req.body);
    res.status(200).json({
        succes : true,
        message : "Cập nhật trạng thái thành công",
        
    })
    
}


const getAllOrderForAdmin = async(req, res) =>{
    const order = await Order.getAllOrderForAdmin(req.query);

    res.status(200).json({
        succes : true,
        message : "Danh sách các đơn hàng",
        order
    })
}


const getAllOrderForUser = async(req, res) =>{

    const order = await Order.getAllOrderForUser(req.user.id, req.params.id);

    res.status(200).json({
        succes : true,
        message : "Danh sách các đơn hàng của bạn",
        order
    })
}


const getOrder = async(req, res) =>{

    const order = await Order.getOrder(req.params.id);

    res.status(200).json({
        succes : true,
        message : "Chi tiết đơn hàng",
        order
    })
}

module.exports = {createOrder, deleteOrder, putOrder, getAllOrderForAdmin, getAllOrderForUser, getOrder}