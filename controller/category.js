const Category = require("../service/category");


const createCategory = async(req, res) =>{
    const category = await Category.createCategory(req.body);

    if(category == 0){
        res.status(404).json({
            succes : false,
            message : "Tên danh mục đã tồn tại",
        })
    }
    else if(category == "error"){
        res.status(505).json("Lỗi hệ thống");
    }
    else{
        res.status(200).json({
            succes : true,
            message : "Thêm danh mục thành công"
        })
    }
}

const getAllCategory = async(req, res) =>{
    const category = await Category.getAllCategory();

    if(category == "error"){
        res.status(505).json("Lỗi hệ thống");
    }
    else{
        res.status(200).json({
            succes : true,
            message : "Danh mục sản phẩm",
            category
        })
    }

}

const getCategory = async(req, res) =>{
    const category = await Category.getCategory(req.params.id);

    res.status(200).json({
        succes : true,
        message : "Thông tin danh mục",
        category
    })
}


const deleteCategory = async(req, res) =>{
    await Category.deleteCategory(req.params.id);

    res.status(200).json({
        succes : true,
        message : "Xóa danh mục thành công",
    })
}


const putCategory = async(req, res) =>{
    const category = await Category.putCategory(req.params.id, req.body);
    
    if(category == 0){
        res.status(400).json({
            succes : false,
            message : "Tên danh mục đã tồn tại",
        })
    }
    else{
        res.status(200).json({
            succes : true,
            message : "Sửa danh mục thành công",
            category
        })
    }

}

module.exports = {createCategory, getAllCategory, getCategory, deleteCategory, putCategory}