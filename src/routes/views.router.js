import express from "express";
import ProductManager from "../dao/controllers_mongo/productManager.js";
import MessageManager from "../dao/controllers_mongo/messageManager.js";
import CartsManager from "../dao/controllers_mongo/cartsManager.js";
import jwt from "jsonwebtoken";
import userSchema from "../dao/models/user.schema.js";
import config from "../config/config.js";
import { port } from "../app.js";

const router = express.Router();
const pm = new ProductManager();
const mm = new MessageManager();
const cm = new CartsManager();

router.get("/", async (req, res) => {
  res.redirect("/login");
});

router.get("/socket", (req, res) => {
  res.render("socket");
});

router.get("/realTimeProducts", async (req, res) => {
  if (req.signedCookies.jwt) {
    const userId = jwt.verify(req.signedCookies.jwt, config.privateKey).id;
    if (userId === 1) {
      const products = await pm.getProducts();
      const allProducts = await pm.getProducts(products.totalDocs);
      res.render("realTimeProducts", { allProducts });
    }
  } else {
    res.status(200).redirect("/products");
  }
});

router.get("/chat", async (req, res) => {
  if (req.signedCookies.jwt) {
    const userId = jwt.verify(req.signedCookies.jwt, config.privateKey).id;
    if (userId === 1) {
      res.status(200).redirect("/products");
    }
  }
  const messages = await mm.getMessages();
  res.render("chat", { messages });
});

router.get("/carts/:cid", async (req, res) => {
  let cartId = req.params.cid;
  const cart = await cm.getCartById(cartId);
  const cartStringify = JSON.stringify(cart);
  const cartJSON = JSON.parse(cartStringify);
  cartJSON.products.forEach((prod) => {
    prod.total = prod.quantity * prod.product.price;
  });
  res.render("inCart", { cartJSON });
});

router.get("/products", async (req, res) => {
  let user;
  let isAdmin = false;
  if (req.signedCookies.jwt) {
    const userId = jwt.verify(req.signedCookies.jwt, config.privateKey).id;
    if (userId === 1) {
      user = config.userAdmin;
      isAdmin = true;
    } else {
      user = await userSchema.findById(userId);
    }
  } else {
    user = req.session.user;
  }
  if (user) {
    let { limit, page, sort, filter } = req.query;
    const products = await pm.getProducts(limit, page, sort, filter);
    page ? page : (page = 1);
    let isValid = page > 0 && page <= products.totalPages;
    products.prevLink = products.hasPrevPage
      ? `http://localhost:${port}/products?page=${products.prevPage}`
      : null;
    products.nextLink = products.hasNextPage
      ? `http://localhost:${port}/products?page=${products.nextPage}`
      : null;
    res.render("products", { products, limit, page, isValid, user, isAdmin, port });
  } else {
    let msg = "Inicie sesión para ver los productos";
    res.status(401).render("login", { msg });
  }
});

router.get("/register", async (req, res) => {
  if (req.signedCookies.jwt) {
    res.redirect("/products");
  } else {
    res.render("register");
  }
});
router.get("/failRegister", async (req, res) => {
  let msg = req.query.msg;
  res.render("register", { msg });
});

router.get("/faillogin", async (req, res) => {
  let msg = req.query.msg;
  res.render("login", { msg });
});

router.get("/login", async (req, res) => {
  if (req.signedCookies.jwt) {
    res.redirect("/products");
  } else {
    res.render("login");
  }
});

router.get("/profile", async (req, res) => {
  let user, isAdmin;
  const userId = jwt.verify(req.signedCookies.jwt, config.privateKey).id;
  if (userId === 1) {
    user = config.userAdmin;
    isAdmin = true;
  } else {
    user = await userSchema.findById(userId);
    isAdmin = false;
  }
  if (req.signedCookies.jwt) {
    res.render("profile", { user, isAdmin });
  } else {
    let msg = "Inicie sesión para ver su perfil";
    res.status(401).render("login", { msg });
  }
});

router.get("/passwordRestore", async (req, res) => {
  res.render("passwordRestore");
});

export default router;
