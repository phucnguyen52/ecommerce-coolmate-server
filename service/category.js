const { Op } = require("sequelize");
const {Category} = require("../model/category");

const createCategory = async (data) => {
    try {
        const check = await Category.findOne({
            where : {
                categoryName : data.categoryName
            }
        })
        if(check){
            return 0;
        }
        await Category.create(data);
    } catch (error) {
        console.log(error);
        return "error";
    }
}

const getAllCategory = async () =>{
    try {
        const category = await Category.findAll();
        return category;
    } catch (error) {
        console.log(error);
    }
}

const getCategory = async (id) =>{
    try {
        const category = await Category.findByPk(id);
        return category;
    } catch (error) {
        console.log(error);
    }
}

const deleteCategory = async (id) => {
    try {
        const category = await Category.findByPk(id);
        await category.destroy();
    } catch (error) {
        console.log(error);
    }
}



const putCategory = async (id, data) => {
    try {
        const check = await Category.findOne({
            where : {
                categoryName : data.categoryName,
                id:{
                    [Op.ne]: id
                }
            }
        })
        if(check){
            return 0;
        }
        const category = await Category.findByPk(id);
        category.update(data);
    } catch (error) {
        console.log(error);
    }
}


module.exports = {createCategory, getAllCategory, getCategory, putCategory, deleteCategory}