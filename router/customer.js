const customerRouter = require("express").Router();
const {authentication} = require("../middleware/authentication");

const {registerUser, activeUser, loginUser, getUser, putUser} = require("../controller/user");
const {createAddress, putAddress, getAllAddress, deleteAddress} = require("../controller/address");
const {getAllProduct, getProduct, getProductDetail, getRelate, searchProduct} = require("../controller/product");
const {createRating, getRatingProduct} = require("../controller/rating");
const {createShoppingCart, putShoppingCart, deleteShoppingCart, getAllShoppingCart} = require("../controller/shoppingcart");
const {sendMessage, getMessage, getAllMessage} = require("../controller/message");
const {createOrder, getAllOrderForUser, deleteOrder, putOrder} = require("../controller/order");
const { getCalculate, getVoucherByUser, getVoucherNotUser } = require("../controller/voucher");



//login
customerRouter.post("/signup", registerUser);
customerRouter.post("/active", activeUser);
customerRouter.post("/login", loginUser);
customerRouter.get("/", authentication, getUser);
customerRouter.put("/", authentication, putUser);


//address
customerRouter.post("/address", authentication, createAddress);
customerRouter.put("/address/:id", authentication, putAddress);
customerRouter.get("/address", authentication, getAllAddress);
customerRouter.delete("/address/:id", authentication, deleteAddress);



//product
customerRouter.get("/product/:id/detail", getProductDetail);
customerRouter.get("/product", getAllProduct);
customerRouter.get("/product/:id", getProduct);
customerRouter.get("/product/:id/relate", getRelate);
customerRouter.get("/search", searchProduct);



//rating
customerRouter.post("/rating", createRating);
customerRouter.get("/rating/:id", getRatingProduct);



//cart
customerRouter.post("/cart", authentication, createShoppingCart);
customerRouter.put("/cart/:id", authentication, putShoppingCart);
customerRouter.delete("/cart/:id", authentication, deleteShoppingCart);
customerRouter.get("/cart", authentication, getAllShoppingCart);


//message
customerRouter.post("/messenger/:id", authentication, sendMessage);
customerRouter.get("/messenger/:id", authentication, getMessage);
customerRouter.get("/messenger", getAllMessage);



//order
customerRouter.post("/order", authentication, createOrder);
customerRouter.get("/order/:id", authentication, getAllOrderForUser);
customerRouter.delete("/order/:id", deleteOrder);
customerRouter.put("/order/:id", putOrder);


//voucher
customerRouter.get("/voucher", authentication, getVoucherByUser);
customerRouter.get("/voucher/active", getVoucherNotUser);
customerRouter.get("/voucher/calculate", getCalculate);


module.exports = customerRouter;