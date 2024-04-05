import express from "express";
import ProductManager from "../dao/controllers_mongo/productManager.js";
import ProductDTO from "../dao/dto/products.dto.js";

const pm = new ProductManager();
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { limit, page, sort, category, stock } = req.query;
    const products = await pm.getProducts(limit, page, sort, category, stock);
    res.status(200).send(products);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const productId = req.params.pid;
    const product = await pm.getProductById(productId);
    res.status(200).send(product);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/", async (req, res) => {
  try {
    const product = new ProductDTO(req.body);
    await pm.addProduct(product);
    res.status(200).send(`Producto agregado: ${JSON.stringify(product)}`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.put("/:pid", async (req, res) => {
  try {
    const productId = req.params.pid;
    const product = await pm.updateProduct(productId, req.body);
    res.status(200).send(`Producto actualizado: ${JSON.stringify(product)}`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const productId = req.params.pid;
    const prod = await pm.deleteProduct(productId);
    console.log(prod);
    res.status(200).send(`Producto con id ${productId} eliminado`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default router;
