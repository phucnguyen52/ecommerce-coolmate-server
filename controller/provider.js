const Provider = require("../service/provider");


const createProvider = async(req, res) =>{
    const provider = await Provider.createProvider(req.body);

    if(provider == -1){
        res.status(404).json({
            succes : false,
            message : "Nhà cung cấp đã tồn tại",
        })
    }
    else{
        res.status(200).json({
            succes : true,
            message : "Thêm nhà cung cấp thành công"
        })
    }
}

const getAllProvider = async(req, res) =>{
    const provider = await Provider.getAllProvider();

    res.status(200).json({
        succes : true,
        message : "Danh sách các nhà cung cấp",
        provider
    })

}




const deleteProvider = async(req, res) =>{ 
    await Provider.deleteProvider(req.params.id);

    res.status(200).json({
        succes : true,
        message : "Xóa nhà cung cấp thành công",
    })
}


const putProvider = async(req, res) =>{
    await Provider.putProvider(req.params.id, req.body);
    
    res.status(200).json({
        succes : true,
        message : "Sửa thành công",
    })

}
module.exports = {createProvider, getAllProvider, deleteProvider, putProvider}