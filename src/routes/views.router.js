import express from "express";
import {
  chat,
  failRegisterView,
  failloginView,
  getUserCart,
  loginView,
  passwordRestoreView,
  productsView,
  profileView,
  realTimeProducts,
  registerView,
  rootView,
  socketView,
} from "../controllers/views.controller.js";

const router = express.Router();

router.get("/", rootView);
router.get("/socket", socketView);
router.get("/realTimeProducts", realTimeProducts);
router.get("/chat", chat);
router.get("/carts/:cid", getUserCart);
router.get("/products", productsView);
router.get("/register", registerView);
router.get("/login", loginView);
router.get("/profile", profileView);
router.get("/failRegister", failRegisterView);
router.get("/faillogin", failloginView);
router.get("/passwordRestore", passwordRestoreView);

export default router;
