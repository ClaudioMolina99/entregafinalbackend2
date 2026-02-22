import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { createHash } from "../utils/hash.js";
import { UserDTO } from "../dto_temp/user.dto.js";

const router = Router();

// =============================
// ✅ REGISTER
// =============================
router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Faltan campos obligatorios",
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({
        status: "error",
        message: "El usuario ya existe",
      });
    }

    const newUser = await User.create({
      first_name,
      last_name,
      email,
      age,
      password: createHash(password),
      role: "user",
    });

    return res.status(201).json({
      status: "success",
      message: "Usuario registrado correctamente",
      user: new UserDTO(newUser),
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error en register",
      error: error.message,
    });
  }
});

// =============================
// ✅ LOGIN (JWT)
// =============================
router.post("/login", (req, res, next) => {
  passport.authenticate("login", { session: false }, (err, user) => {
    try {
      if (err) return next(err);

      if (!user) {
        return res.status(401).json({
          status: "error",
          message: "Credenciales inválidas",
        });
      }

      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.json({
        status: "success",
        message: "Login exitoso",
        token,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Error en login",
        error: error.message,
      });
    }
  })(req, res, next);
});

// =============================
// ✅ CURRENT (JWT + DTO)
// =============================
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    return res.json({
      status: "success",
      user: new UserDTO(req.user),
    });
  }
);

export default router;