const {ProductDetail} = require("../model/productDetail");
const {ShoppingCart} = require("../model/shoppingCart");
const { Sequelize, Op } = require('sequelize');


const createShoppingCart = async (data) => {
    try {
        const check = await ShoppingCart.findOne({
            where : {
                UserId : data.UserId,
                ProductId : data.ProductId,
                size : data.size,
                color : data.color,
            }
        });
        if(check){
            await check.update({quantity : check.quantity + data.quantity});
        }
        else{
            await ShoppingCart.create(data);
        }

    } catch (error) {
        console.log(error);
    }
}

const putShoppingCart = async(id, data) => {
    try {
        const {color, size, ProductId, quantity} = data;

        const cart = await ShoppingCart.findOne({
            where : {
                color : color,
                size : size,
                ProductId : ProductId,
                id: {
                    [Sequelize.Op.not]: id
                },
                UserId : data.UserId
            }
        })
        if(cart){
            cart.update({quantity : quantity + cart.dataValues.quantity});
            await ShoppingCart.destroy({
                where: {
                    id: id
                }
            });
        }
        else {
            const cartUpdate = await ShoppingCart.findByPk(id);
            cartUpdate.update(data);
        }
    } catch (error) {
        console.log(error);
    }

}


const deleteShoppingCart = async(id) => {
    try {
        await ShoppingCart.destroy({
            where: {
                id: id
            }
        });
    } catch (error) {
        console.log(error);
    }
}

const getAllShoppingCart = async(id) => {
    try {
        let cart = await ShoppingCart.findAll({
            where : {
                userID : id
            }
        })
        
        
        cart = await Promise.all(cart.map(async (value) => {
            const quantity = await ProductDetail.findOne({
                attributes : ["quantity"],
                where : {
                    color : value.color,
                    size : value.size,
                    ProductId : value.ProductId
                }
            })

            return {
                ...value.dataValues,
                quantitySub : quantity
            }
        }))

        return cart;
    } catch (error) {
        console.log(error);
    }
}

module.exports = {createShoppingCart, putShoppingCart, deleteShoppingCart, getAllShoppingCart}