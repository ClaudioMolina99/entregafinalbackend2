import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { createHash, isValidPassword } from "../utils/hash.js";
import { sendPasswordResetEmail } from "../utils/mailer.js";
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

// =============================
// ✅ FORGOT PASSWORD
// =============================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email requerido",
      });
    }

    // Verificar que el usuario existe
    const user = await User.findOne({ email });

    // Responder "success" para seguridad aunque no exista el email
    if (!user) {
      return res.json({
        status: "success",
        message: "Si el email existe, se enviará un correo con instrucciones",
      });
    }

    // Generar token de 1 hora
    const secret = process.env.JWT_SECRET + user.password;
    const token = jwt.sign(
      { id: user._id, email: user.email, type: "reset" },
      secret,
      { expiresIn: "1h" }
    );

    const resetLink = `${process.env.BASE_URL}/api/sessions/reset-password/${token}`;

    // Enviar el mail de reset
    await sendPasswordResetEmail({ to: user.email, resetLink });

    return res.json({
      status: "success",
      message: "Si el email existe, se enviará un correo con instrucciones",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error en forgot-password",
      error: error.message,
    });
  }
});

// =============================
// ✅ RESET PASSWORD FORM
// =============================
router.get("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // Mostrar el formulario con el token
    return res.send(`
      <html>
        <head><meta charset="utf-8"><title>Restablecer contraseña</title></head>
        <body style="font-family: Arial, sans-serif;">
          <h2>Restablecer contraseña</h2>
          <form method="POST" action="/api/sessions/reset-password">
            <input type="hidden" name="token" value="${token}" />
            <label>Nueva contraseña</label><br/>
            <input type="password" name="password" required />
            <br/><br/>
            <button type="submit">Actualizar</button>
          </form>
        </body>
      </html>
    `);
  } catch (error) {
    return res.status(500).send("Error");
  }
});

// =============================
// ✅ RESET PASSWORD
// =============================
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        status: "error",
        message: "Token y nueva contraseña son requeridos",
      });
    }

    // Verificar el token y extraer datos
    const decoded = jwt.decode(token);
    if (!decoded?.id || decoded?.type !== "reset") {
      return res.status(400).json({
        status: "error",
        message: "Token inválido",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    // Verificar si el token es válido
    const secret = process.env.JWT_SECRET + user.password;
    try {
      jwt.verify(token, secret);
    } catch (err) {
      return res.status(400).json({
        status: "error",
        message: "Token expirado o inválido",
      });
    }

    // Evitar que la nueva contraseña sea la misma que la anterior
    if (isValidPassword(user, password)) {
      return res.status(400).json({
        status: "error",
        message: "La nueva contraseña no puede ser igual a la anterior",
      });
    }

    // Actualizar la contraseña
    user.password = createHash(password);
    await user.save();

    return res.json({
      status: "success",
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error en reset-password",
      error: error.message,
    });
  }
});

export default router;