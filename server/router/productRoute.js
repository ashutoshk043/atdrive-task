const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controller/productController");

router.get("/product-test", (req, res) => {
  return res.send("Product-Test Success!!");
});

router.post("/create-product", createProduct);

router.get("/get-all-products", getProducts);

router.get("/get-product/:id", getProductById);

router.put("/update-product/:id", updateProduct);

router.delete("/delete-product/:id", deleteProduct);

module.exports = router;