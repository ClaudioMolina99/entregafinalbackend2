import { Router } from 'express';
import CartsManager from '../dao/managers/CartsManager.js';

const router = Router();
const manager = new CartsManager();

/* =====================================================
   1) Crear carrito
===================================================== */
router.post('/', async (req, res) => {
  try {
    const newCart = await manager.createCart();
    res.status(201).json({ status: "success", payload: newCart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

/* =====================================================
   2) Obtener TODOS los carritos
===================================================== */
router.get('/', async (req, res) => {
  try {
    const carts = await manager.getAllCarts?.() || []; 
    res.json({ status: "success", payload: carts });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

/* =====================================================
   3) Obtener carrito por ID (con populate)
===================================================== */
router.get('/:cid', async (req, res) => {
  try {
    const cart = await manager.getCartById(req.params.cid);

    if (!cart) {
      return res.status(404).json({ status: "error", error: "Cart not found" });
    }

    res.json({ status: "success", payload: cart });

  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

/* =====================================================
   4) Agregar producto al carrito
===================================================== */
router.post('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const updatedCart = await manager.addProductToCart(cid, pid);

    res.json({
      status: "success",
      payload: updatedCart
    });

  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

/* =====================================================
   5) Actualizar cantidad de UN producto en el carrito
===================================================== */
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const result = await manager.updateProductQuantity(cid, pid, quantity);

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        status: "error",
        error: "Product not found in cart"
      });
    }

    res.json({ status: "success", payload: "Quantity updated" });

  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

/* =====================================================
   6) Eliminar UN producto del carrito
===================================================== */
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const updatedCart = await manager.deleteProduct(cid, pid);

    res.json({
      status: "success",
      payload: updatedCart
    });

  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

/* =====================================================
   7) Eliminar TODOS los productos del carrito
===================================================== */
router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;

    const clearedCart = await manager.deleteAllProducts(cid);

    res.json({
      status: "success",
      payload: clearedCart
    });

  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

export default router;
