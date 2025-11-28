import { Router } from 'express';
import Cart from '../models/cart.js';

const router = Router();

/* ============================
   1) Crear carrito
=============================== */
router.post('/', async (req, res) => {
  try {
    const newCart = new Cart({ products: [] });
    await newCart.save();

    res.status(201).json({
      status: "success",
      payload: newCart
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

/* ============================
   2) Obtener todos los carritos
=============================== */
router.get('/', async (req, res) => {
  const carts = await Cart.find();
  res.json({
    status: "success",
    payload: carts
  });
});

/* ============================
   3) Obtener carrito por ID
=============================== */
router.get('/:cid', async (req, res) => {
  const cart = await Cart.findById(req.params.cid).populate('products.product');

  if (!cart) {
    return res.status(404).json({ status: "error", error: "Cart not found" });
  }

  res.json({
    status: "success",
    payload: cart
  });
});

/* ============================
   4) Agregar producto al carrito
=============================== */
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: "error", error: "Cart not found" });

    const existingProduct = cart.products.find(p => p.product.toString() === pid);

    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({ product: pid, quantity });
    }

    await cart.save();

    res.json({
      status: "success",
      payload: cart
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

/* ============================
   5) Actualizar cantidad de un producto
=============================== */
router.put('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: "error", error: "Cart not found" });

    const productInCart = cart.products.find(p => p.product.toString() === pid);
    if (!productInCart) {
      return res.status(404).json({ status: "error", error: "Product not in cart" });
    }

    productInCart.quantity = quantity;

    await cart.save();

    res.json({
      status: "success",
      payload: cart
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

/* ============================
   6) Eliminar un producto del carrito
=============================== */
router.delete('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: "error", error: "Cart not found" });

    cart.products = cart.products.filter(p => p.product.toString() !== pid);

    await cart.save();

    res.json({
      status: "success",
      payload: cart
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

/* ============================
   7) Vaciar carrito completo
=============================== */
router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: "error", error: "Cart not found" });

    cart.products = [];
    await cart.save();

    res.json({
      status: "success",
      payload: "Carrito vaciado"
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

export default router;
