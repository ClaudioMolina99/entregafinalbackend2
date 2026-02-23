import { Router } from "express";
import passport from "passport";
import CartsManager from "../dao/managers/CartsManager.js";
import ProductsManager from "../dao/managers/ProductsManager.js";
import TicketsManager from "../dao/managers/TicketsManager.js";
import { v4 as uuidv4 } from "uuid";
import { authorization } from "../middlewares/authorization.middleware.js";

const router = Router();
const manager = new CartsManager();
const productsManager = new ProductsManager();
const ticketsManager = new TicketsManager();

/* =====================================================
   1) Crear carrito
===================================================== */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  authorization(["user", "admin"]),
  async (req, res) => {
    try {
      const newCart = await manager.createCart();
      res.status(201).json({ status: "success", payload: newCart });
    } catch (error) {
      res.status(500).json({ status: "error", error: error.message });
    }
  }
);

/* =====================================================
   2) Obtener TODOS los carritos (solo admin)
===================================================== */
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  authorization(["admin"]),
  async (req, res) => {
    try {
      const carts = (await manager.getAllCarts?.()) || [];
      res.json({ status: "success", payload: carts });
    } catch (error) {
      res.status(500).json({ status: "error", error: error.message });
    }
  }
);

/* =====================================================
   3) Obtener carrito por ID (user/admin)
===================================================== */
router.get(
  "/:cid",
  passport.authenticate("jwt", { session: false }),
  authorization(["user", "admin"]),
  async (req, res) => {
    try {
      const cart = await manager.getCartById(req.params.cid);

      if (!cart) {
        return res
          .status(404)
          .json({ status: "error", error: "Cart not found" });
      }

      res.json({ status: "success", payload: cart });
    } catch (error) {
      res.status(500).json({ status: "error", error: error.message });
    }
  }
);

/* =====================================================
   4) Agregar producto al carrito (SOLO USER)
===================================================== */
router.post(
  "/:cid/products/:pid",
  passport.authenticate("jwt", { session: false }),
  authorization(["user"]),
  async (req, res) => {
    try {
      const { cid, pid } = req.params;

      const updatedCart = await manager.addProductToCart(cid, pid);

      res.json({
        status: "success",
        payload: updatedCart,
      });
    } catch (error) {
      res.status(500).json({ status: "error", error: error.message });
    }
  }
);

/* =====================================================
   5) Actualizar cantidad (user/admin)
===================================================== */
router.put(
  "/:cid/products/:pid",
  passport.authenticate("jwt", { session: false }),
  authorization(["user", "admin"]),
  async (req, res) => {
    try {
      const { cid, pid } = req.params;
      const { quantity } = req.body;

      const result = await manager.updateProductQuantity(cid, pid, quantity);

      if (result.modifiedCount === 0) {
        return res.status(404).json({
          status: "error",
          error: "Product not found in cart",
        });
      }

      res.json({ status: "success", payload: "Quantity updated" });
    } catch (error) {
      res.status(500).json({ status: "error", error: error.message });
    }
  }
);

/* =====================================================
   6) Eliminar producto (user/admin)
===================================================== */
router.delete(
  "/:cid/products/:pid",
  passport.authenticate("jwt", { session: false }),
  authorization(["user", "admin"]),
  async (req, res) => {
    try {
      const { cid, pid } = req.params;

      const updatedCart = await manager.deleteProduct(cid, pid);

      res.json({
        status: "success",
        payload: updatedCart,
      });
    } catch (error) {
      res.status(500).json({ status: "error", error: error.message });
    }
  }
);

/* =====================================================
   7) Vaciar carrito (user/admin)
===================================================== */
router.delete(
  "/:cid",
  passport.authenticate("jwt", { session: false }),
  authorization(["user", "admin"]),
  async (req, res) => {
    try {
      const { cid } = req.params;

      const clearedCart = await manager.deleteAllProducts(cid);

      res.json({
        status: "success",
        payload: clearedCart,
      });
    } catch (error) {
      res.status(500).json({ status: "error", error: error.message });
    }
  }
);

/* =====================================================
   8) PURCHASE - Generar ticket y actualizar carrito
===================================================== */
router.post(
  "/:cid/purchase",
  passport.authenticate("jwt", { session: false }),
  authorization(["user"]),
  async (req, res) => {
    try {
      const { cid } = req.params;

      const cart = await manager.getCartById(cid);
      if (!cart) {
        return res
          .status(404)
          .json({ status: "error", error: "Cart not found" });
      }

      const purchaser = req.user.email;

      let amount = 0;
      const productsNotProcessed = [];

      for (const item of cart.products) {
        const productDoc = item.product; // populate
        const quantity = item.quantity;

        if (!productDoc) {
          productsNotProcessed.push(item);
          continue;
        }

        if (productDoc.stock >= quantity) {
          const newStock = productDoc.stock - quantity;
          await productsManager.updateProductStock(productDoc._id, newStock);

          amount += productDoc.price * quantity;
        } else {
          productsNotProcessed.push(item);
        }
      }

      let ticket = null;
      if (amount > 0) {
        ticket = await ticketsManager.createTicket({
          code: uuidv4(),
          amount,
          purchaser,
        });
      }

      // Dejar en el carrito solo lo NO procesado
      const remaining = productsNotProcessed.map((p) => ({
        product: p.product?._id || p.product,
        quantity: p.quantity,
      }));

      await manager.updateCart(cid, remaining);

      return res.json({
        status: "success",
        payload: {
          ticket,
          productsNotProcessed: remaining,
        },
      });
    } catch (error) {
      return res.status(500).json({ status: "error", error: error.message });
    }
  }
);

export default router;