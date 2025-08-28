const Message = require("../service/message");
const { getReceiverId, io } = require("../socket/socket");

const sendMessage = async (req, res) => {
    if (!req.body.senderId) {
        req.body.senderId = req.user.id;
    }
    req.body.receiverId = req.params.id;

    const message = await Message.sendMessage(req.body);

    const receiverId = getReceiverId(req.params.id);
    if (receiverId) {
        io.to(receiverId).emit("newMessage", message);
    }

    res.status(200).json({
        succes: true,
        message: "Gửi tin nhắn thành công",
    });
};

const getMessage = async (req, res) => {
    let id = req.user.id;
    if (req.query.senderId) {
        id = req.query.senderId;
    }
    if (req.body.senderId) {
        id = req.body.senderId;
    }

    const message = await Message.getMessages(id, req.params.id);

    res.status(200).json({
        succes: true,
        message: "Tất cả tin nhắn",
        message,
    });
};

const getAllMessage = async (req, res) => {
    const message = await Message.getAllMessages();

    res.status(200).json({
        succes: true,
        message: "Tất cả người dùng",
        message,
    });
};

module.exports = { sendMessage, getMessage, getAllMessage };
