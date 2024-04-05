import express from "express";
import { productService } from "../repositories/index.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const products = await productService.get(req.query);
    res.status(200).send(products);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const product = await productService.getById(req.params.pid);
    res.status(200).send(product);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/", async (req, res) => {
  try {
    await productService.add(req.body);
    res.status(200).send(`Producto agregado`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.put("/:pid", async (req, res) => {
  try {
    await productService.update(req.params.pid, req.body);
    res.status(200).send(`Producto actualizado`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    await productService.delete(req.params.pid);
    res.status(200).send(`Producto eliminado`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default router;
