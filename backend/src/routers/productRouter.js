const express = require("express");
const productController = require("../controllers/productController");
const checkToken = require("../middlewares/checkToken");
const router = express.Router();

router.get("/", productController.read);
router.post("/create", checkToken, productController.create);
router.put("/update/:productId", checkToken, productController.update);
router.delete("/delete/:productId", checkToken, productController.deletePost);

// Lu' @@
module.exports = router;
