import { Router } from 'express';
import ProductsManager from '../dao/managers/ProductsManager.js';
import CartsManager from '../dao/managers/CartsManager.js';

const router = Router();
const productsManager = new ProductsManager();
const cartsManager = new CartsManager();

/* ============================================
   Vista: Lista de productos con paginación
=============================================== */
router.get('/products', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const result = await productsManager.getProducts(
        {},
        { page, limit, lean: true }
    );

    res.render('products', {
        title: "Listado de Productos",
        products: result.docs,
        pagination: {
            hasPrevPage: result.hasPrevPage,
            prevPage: result.prevPage,
            hasNextPage: result.hasNextPage,
            nextPage: result.nextPage
        }
    });
});

/* ============================================
   Vista: Detalle de un producto
=============================================== */
router.get('/products/:pid', async (req, res) => {
    const product = await productsManager.getProductById(req.params.pid).lean();

    if (!product) return res.status(404).send("Producto no encontrado");

    res.render('productDetail', { 
        title: product.title, 
        product 
    });
});

/* ============================================
   Vista: Carrito con populate + TOTAL
=============================================== */
router.get('/carts/:cid', async (req, res) => {
    const cart = await cartsManager.getCartById(req.params.cid).lean();

    if (!cart) return res.status(404).send("Carrito no encontrado");

    // ⭐ Calcular total del carrito
    let total = 0;
    cart.products.forEach(item => {
        total += item.quantity * item.product.price;
    });

    res.render('cart', { 
        title: "Carrito", 
        cart,
        total
    });
});

export default router;
