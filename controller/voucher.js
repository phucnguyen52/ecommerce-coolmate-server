const {
  create,
  update,
  updateStatus,
  getAll,
  deleteById,
  calculate,
  getAllByUser,
} = require("../service/voucher");

const createVoucher = async (req, res) => {
  try {
    const voucher = await create(req.body);
    if (voucher) {
      res.status(201).send({
        success: true,
        message: "Tạo voucher thành công",
        voucher,
      });
    }
  } catch (error) {
    res.status(404).send({
      success: false,
      message: error.message,
    });
  }
};

const updateVoucher = async (req, res) => {
  try {
    const voucher = await update(req.params.id, req.body);
    if (voucher) {
      res.status(200).send({
        success: true,
        message: "Cập nhật voucher thành công",
        voucher: voucher,
      });
    }
  } catch (error) {
    res.status(404).send({
      success: false,
      message: error.message,
    });
  }
};

const getCalculate = async (req, res) => {
  try {
    const result = await calculate(req.query);
    if (result) {
      res.status(200).send({
        success: true,
        message: "Giảm giá",
        result,
      });
    }
  } catch (error) {
    res.status(404).send({
      success: false,
      message: error.message,
    });
  }
};

const updateStatusVoucher = async (req, res) => {
  try {
    const voucher = await updateStatus(req.params.id, req.body.status);
    if (voucher) {
      res.status(200).send({
        success: true,
        message: "Cập nhật trạng thái voucher thành công",
        voucher: voucher,
      });
    }
  } catch (error) {
    res.status(404).send({
      success: false,
      message: error.message,
    });
  }
};

const getVoucherByUser = async (req, res) => {
  try {
    const voucher = await getAllByUser(req.query, req.user.id);
    if (voucher) {
      res.status(200).send({
        success: true,
        message: "Danh sách voucher: ",
        voucher,
      });
    }
  } catch (error) {
    res.status(404).send({
      success: false,
      message: error.message,
    });
  }
};

const getVoucherNotUser = async (req, res) => {
  try {
    const voucher = await getAllByUser(req.query, null);
    if (voucher) {
      res.status(200).send({
        success: true,
        message: "Danh sách voucher: ",
        voucher,
      });
    }
  } catch (error) {
    res.status(404).send({
      success: false,
      message: error.message,
    });
  }
};

const getAllVoucher = async (req, res) => {
  try {
    const voucher = await getAll(req.query);
    if (voucher) {
      res.status(200).send({
        success: true,
        message: "Danh sách voucher: ",
        voucher,
      });
    }
  } catch (error) {
    res.status(404).send({
      success: false,
      message: error.message,
    });
  }
};

const deleteVoucher = async (req, res) => {
  const { id } = req.params;
  try {
    const voucher = await deleteById(id);
    if (voucher) {
      res.status(200).send({
        success: true,
        message: "Xoá voucher thành công",
      });
    }
  } catch (error) {
    res.status(404).send({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createVoucher,
  updateVoucher,
  updateStatusVoucher,
  getCalculate,
  getAllVoucher,
  getVoucherByUser,
  getVoucherNotUser,
  deleteVoucher,
};
