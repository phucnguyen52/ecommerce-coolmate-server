const { Messenger } = require("../model/message");

const { Sequelize, Op, fn, col, literal } = require("sequelize");
const { sequelize } = require("../config/mysql");

const sendMessage = async (data) => {
  try {
    const messenger = await Messenger.create(data);
    return messenger;
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const getMessages = async (user1, user2) => {
  try {
    const message = await Messenger.findAll({
      where: {
        [Sequelize.Op.or]: [
          { senderId: user1, receiverId: user2 },
          { senderId: user2, receiverId: user1 },
        ],
      },
      order: [["messengerTime", "ASC"]],
    });
    return message;
  } catch (error) {
    console.log(error);
  }
};

const getAllMessages = async () => {
  const sql = `SELECT DISTINCT 
                    u.id,
                    u.fullName,
                    u.picture,
                    MAX(m.messengerTime) AS lastMessageTime
                FROM messenger m
                JOIN user u ON (u.id = CASE 
                                        WHEN m.senderId = 4 THEN m.receiverId
                                        WHEN m.receiverId = 4 THEN m.senderId
                                    END)
                WHERE m.senderId = 4 OR m.receiverId = 4
                GROUP BY u.id, u.fullName, u.picture
                ORDER BY lastMessageTime DESC;`;

  const order = await sequelize.query(sql, {
    type: Sequelize.QueryTypes.SELECT,
  });

  return order;
};

module.exports = { sendMessage, getMessages, getAllMessages };
