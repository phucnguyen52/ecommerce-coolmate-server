const Store = require("../service/store");

const createStore = async (req, res) => {
  try {
    await Store.createStore(req.body, req.user.id, req.body.ProviderId);
    res.status(200).json({
      success: true,
      message: "Nhập kho thành công",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi nhập kho",
    });
  }
};

const getStore = async (req, res) => {
  const store = await Store.getStore(req.params.id);
  res.status(200).json({
    succes: true,
    message: "Hóa đơn nhập kho",
    store,
  });
};

const getAllStore = async (req, res) => {
  const store = await Store.getAllStore(req.query);

  res.status(200).json({
    succes: true,
    message: "Kho hàng",
    store,
  });
};

const getAllStoreDetail = async (req, res) => {
  const store = await Store.getAllStoreDetail(req.query);
  res.status(200).json({
    succes: true,
    message: "Kho hàng",
    store,
  });
};

module.exports = { createStore, getAllStore, getAllStoreDetail, getStore };
