import passport from "passport";
import { Strategy } from "passport-local";
import StrategyGitHub from "passport-github2";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import userManager from "../dao/controllers_mongo/userManager.js";
import cartManager from "../dao/controllers_mongo/cartsManager.js";
import jwt from "jsonwebtoken";
import config from "./config.js";
import { port } from "../app.js";
import UsersDTO from "../dao/dto/users.dto.js";

const um = new userManager();
const cm = new cartManager();
export const userAdmin = {
  _id: 1,
  first_name: config.adminFirstName,
  last_name: config.adminLastName,
  email: config.adminEmail,
  password: config.adminPassword,
  age: 0,
  role: "admin",
};

passport.use(
  "jwt",
  new JwtStrategy(
    {
      jwtFromRequest: (req) => {
        let token = null;
        if (req && req.signedCookies) {
          token = req.signedCookies["jwt"];
        }
        return token;
      },
      secretOrKey: config.privateKey,
    },
    async (jwt_payload, done) => {
      try {
        const user = await um.getUserById(jwt_payload.sub);
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export const requireJwtAuth = passport.authenticate("jwt", { session: false });
export const generateToken = (user) => {
  let token = jwt.sign({ id: user._id }, config.privateKey, { expiresIn: "24h" });
  return token;
};

passport.use(
  "login",
  new Strategy(
    { usernameField: "email", passwordField: "password" },
    async (username, password, done) => {
      try {
        if (username === userAdmin.email && password === userAdmin.password) {
          const token = generateToken(userAdmin);
          return done(null, { user: userAdmin, token });
        }
        const user = await um.getUserByCreds(username, password);
        if (!user)
          return done(null, false, { message: "Contraseña o usuario incorrecto" });
        const token = generateToken(user);
        return done(null, { user, token });
      } catch (error) {
        return done(error);
      }
    }
  )
);

const initializePassport = () => {
  passport.use(
    "register",
    new Strategy(
      { passReqToCallback: true, usernameField: "email", passwordField: "password" },
      async (req, username, password, done) => {
        const { confirm, first_name, last_name, age } = req.body;
        let emailUsed = await um.getUser(username);
        if (emailUsed) {
          return done("Ya existe un usario con este correo electrónico", false);
        }
        if (password !== confirm) {
          return done("Las contraseñas no coinciden", false);
        }
        const newCart = await cm.addCart();
        const user = {
          first_name,
          last_name,
          age,
          email: username,
          password,
          cart: newCart[0]._id,
        };
        await um.addUser(user);
        let addUser = await um.getUser(user.email);
        const token = generateToken(user);
        return done(null, { user: addUser, token });
      }
    )
  );

  passport.use(
    "github",
    new StrategyGitHub(
      {
        clientID: "Iv1.6d1c1b3a5778cb34",
        clientSecret: "551f13b31eb6eb2b526ac1cf0ca51af93a564b4c",
        callbackURL: `http://localhost:${port}/api/sessions/githubcallbackapata`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await um.getUser(profile._json.email);
          const token = generateToken(user);
          if (!user) {
            const newCart = await cm.addCart();
            let newUser = {
              first_name: profile._json.name,
              last_name: "",
              email: profile._json.email,
              age: "",
              password: "",
              cart: newCart[0]._id,
            };
            let result = await um.addUser(newUser);
            const token = generateToken(result);
            done(null, { user: result, token });
          } else {
            done(null, { user, token });
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.user._id);
  });

  passport.deserializeUser(async (id, done) => {
    let user;
    if (id === 1) {
      user = userAdmin;
    } else {
      try {
        user = await um.getUserById(id);
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  });
};

export default initializePassport;
