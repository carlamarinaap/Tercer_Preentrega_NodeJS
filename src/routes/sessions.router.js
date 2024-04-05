import express from "express";
import UserManager from "../dao/controllers_mongo/userManager.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

const um = new UserManager();
const router = express.Router();

router.post("/register", async (req, res, next) => {
  passport.authenticate("register", async (err, user) => {
    try {
      if (err) {
        return res.redirect(`/failRegister?msg=${err}`);
      }
      if (!user) {
        return res.redirect("/failRegister?msg=Debe completar todos los campos");
      }
      res.cookie("jwt", user.token, {
        signed: true,
        httpOnly: true,
        maxAge: 1000 * 60 * 60,
      });
      res.redirect("/products");
    } catch (error) {
      next(error);
    }
  })(req, res, next);
});

router.post("/login", async (req, res, next) => {
  passport.authenticate("login", async (err, user, info) => {
    try {
      if (err) {
        return res.redirect(`/faillogin?msg=${err}`);
      }
      if (!user) {
        console.log(info);
        return res.redirect(`/faillogin?msg=${info.message}`);
      }
      res
        .cookie("jwt", user.token, {
          signed: true,
          httpOnly: true,
          maxAge: 1000 * 60 * 60,
        })
        .redirect("/products");
    } catch (error) {
      next(error);
    }
  })(req, res, next);
});

router.post("/passwordRestore", async (req, res) => {
  let { email, password, confirm } = req.body;
  const user = await um.getUserByEmail(email);
  if (user && password && confirm && password === confirm) {
    await um.updatePassword(email, password);
    res.redirect("/login");
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  let msg = "Se cerró la sesión";
  res.render("login", { msg });
});

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  async (req, res) => {}
);

router.get(
  "/githubcallbackapata",
  passport.authenticate("github", { failureRedirect: "/login" }),
  async (req, res) => {
    res.cookie("jwt", req.user.token, {
      signed: true,
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    });
    res.redirect("/products");
  }
);
router.get("/current", async (req, res) => {
  let user;
  if (req.signedCookies.jwt) {
    const userId = jwt.verify(req.signedCookies.jwt, config.privateKey).id;
    user = await um.getUserById(userId);
  }
  if (!req.signedCookies.jwt && !req.session.user) {
    res.status(400).json("Nadie logueado");
  }
  res.status(200).json(user);
});

export default router;
