import { productService } from "../repositories/index.js";

export async function getProducts(req, res) {
  try {
    const products = await productService.get(req.query);
    res.status(200).send(products);
  } catch (error) {
    res.status(500).send(`Hubo un error obteniendo los productos: ${error.message}`);
  }
}

export async function getProductById(req, res) {
  try {
    const product = await productService.getById(req.params.pid);
    res.status(200).send(product);
  } catch (error) {
    res.status(500).send(`Error al encontrar el producto ${error.message}`);
  }
}

export async function addProduct(req, res) {
  try {
    const product = await productService.add(req.body);
    res.status(200).send(`Se agregó el producto ${product.title}`);
  } catch (error) {
    res.status(500).send(`Error al agregar producto: ${error.message}`);
  }
}

export async function updateProduct(req, res) {
  try {
    await productService.update(req.params.pid, req.body);
    res.status(200).send(`Producto actualizado`);
  } catch (error) {
    res.status(500).send(`Error al actualizar el producto: ${error.message}`);
  }
}

export async function deleteProduct(req, res) {
  try {
    await productService.delete(req.params.pid);
    res.status(200).send(`Producto eliminado`);
  } catch (error) {
    res.status(500).send(`Error al eliminar producto ${error.messages}`);
  }
}
