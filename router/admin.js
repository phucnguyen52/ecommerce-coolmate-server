const adminRouter = require("express").Router();

const { authentication } = require("../middleware/authentication");
const {
  createCategory,
  getAllCategory,
  getCategory,
  deleteCategory,
  putCategory,
} = require("../controller/category");
const {
  createProvider,
  getAllProvider,
  deleteProvider,
  putProvider,
} = require("../controller/provider");
const {
  createProduct,
  deleteProduct,
  putProduct,
} = require("../controller/product");
const { getRatingProduct } = require("../controller/rating");
const { getAllOrderForAdmin, getOrder } = require("../controller/order");
const {
  createStore,
  getAllStore,
  getAllStoreDetail,
  getStore,
} = require("../controller/store");
const {
  reportCategoty,
  reportSale,
  topUserSelling,
  topSellingProduct,
} = require("../controller/admin");
const {
  getAllUser,
  postUser,
  putUserForAdmin,
  findUser,
} = require("../controller/user");
const {
  createVoucher,
  updateVoucher,
  updateStatusVoucher,
  getAllVoucher,
} = require("../controller/voucher");
const { getOrderPending } = require("../service/admin");

//user
adminRouter.get("/user", getAllUser);
adminRouter.post("/user", postUser);
adminRouter.put("/user/:id", putUserForAdmin);
adminRouter.get("/user/search", findUser);

//category
adminRouter.post("/category", createCategory);
adminRouter.get("/category", getAllCategory);
adminRouter.get("/category/:id", getCategory);
adminRouter.delete("/category/:id", deleteCategory);
adminRouter.put("/category/:id", putCategory);

//provider
adminRouter.post("/provider", createProvider);
adminRouter.get("/provider", getAllProvider);
adminRouter.delete("/provider/:id", deleteProvider);
adminRouter.put("/provider/:id", putProvider);

//product
adminRouter.post("/product", createProduct);
adminRouter.put("/product/:id", putProduct);
adminRouter.delete("/product/:id", deleteProduct);

//rating
adminRouter.get("/rating/:id", getRatingProduct);

//order
adminRouter.get("/order", getAllOrderForAdmin);
adminRouter.get("/order/:id", getOrder);
adminRouter.get("/order/:status/:day/:month", getOrderPending);

//store
adminRouter.post("/store", authentication, createStore);
adminRouter.get("/store", getAllStore);
adminRouter.get("/stores", getAllStoreDetail);
adminRouter.get("/store/:id", getStore);

//report

adminRouter.get("/report/category", reportCategoty);
adminRouter.get("/report/sale", reportSale);
adminRouter.get("/report/customer", topUserSelling);
adminRouter.get("/report/product", topSellingProduct);

//voucher
adminRouter.get("/voucher", getAllVoucher);
adminRouter.post("/voucher", createVoucher);
adminRouter.put("/voucher/:id/status", updateStatusVoucher);
adminRouter.put("/voucher/:id", updateVoucher);

module.exports = adminRouter;
