const Address = require("../service/address");

const createAddress = async(req, res) =>{
    req.body.UserId = req.user.id;
    const data = await Address.createAddress(req.body);

    if(data != "error"){
        res.status(201).json({
            succes : true,
            message : "Thêm địa chỉ thành công"
        })
    }
    else{
        res.status(505).json("Lỗi hệ thống");
    }
    
}

const putAddress = async(req, res) =>{
    await Address.putAddress(req.user.id, req.params.id, req.body);
    res.status(200).json({
        succes : true,
        message : "Cập nhật địa chỉ thành công",
    })

}

const deleteAddress = async(req, res) =>{
    await Address.deleteAddress(req.params.id);
    res.status(200).json({
        succes : true,
        message : "Xóa địa chỉ thành công",
    })

}

const getAllAddress = async(req, res) =>{
    const address = await Address.getAllAddress(req.user.id);
    res.status(200).json({
        succes : true,
        message : "Danh sách địa chỉ",
        address
    })
}

module.exports = {createAddress, putAddress, getAllAddress, deleteAddress}