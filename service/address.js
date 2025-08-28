const {Address} = require("../model/address");
const {User} = require("../model/user");

const { Sequelize, Op, fn, col, literal } = require("sequelize");


const createAddress = async (data) => {
    try {
        const address = await Address.findOne({
            where : {
                UserId : data.UserId
            }
        })
        if(address){
            await Address.create(data);
        }
        else{
            data.isAddress = true;
            await Address.create(data);
            const user = await User.findByPk(data.UserId);
            if(user.isAddress == false){
                await user.update({isAddress : true});
            }
        }
    } catch (error) {
        console.log(error);
        return "error";
    }
}

const putAddress = async(userID, id, data) => {
    try {
        if(data.isAddress == true){
            const user = await Address.findOne({
                where : {
                    isAddress : true,
                    id :  {[Sequelize.Op.not]  : id},
                    UserId : userID
                }
            })
            
            user.update({isAddress : false});
        }

        const address = await Address.findByPk(id);
        address.update(data);
        return address;
    } catch (error) {
        console.log(error);
    }

}

const deleteAddress = async(id) => {
    try {
        await Address.destroy({
            where: {
                id: id
            }
        });
    } catch (error) {
        console.log(error);
    }
}


const getAllAddress = async(id) => {
    try {
        const address = await Address.findAll({
            where : {
                UserID : id
            }
        })
        return address;
    } catch (error) {
        console.log(error);
    }
}

module.exports = {createAddress, putAddress, deleteAddress, getAllAddress}