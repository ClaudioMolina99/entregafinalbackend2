import "dotenv/config";
import express from "express";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

import passport from "passport";
import { initializePassport } from "./config/passport.config.js";

import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";
import sessionsRouter from "./routes/sessions.router.js";

// Para manejar rutas absolutas en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Passport
initializePassport();
app.use(passport.initialize());

// ⭐ Servir archivos estáticos (CSS, imágenes, JS del front)
app.use(express.static(path.join(__dirname, "public")));

// Configuración de Handlebars + Helpers
app.engine(
  "handlebars",
  engine({
    helpers: {
      multiply: (a, b) => a * b,
      add: (a, b) => a + b,
    },
  })
);

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Rutas API
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/sessions", sessionsRouter);

// Rutas de vistas
app.use("/", viewsRouter);

export default app;