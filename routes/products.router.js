import { Router } from 'express';
import Product from '../models/product.js';

const router = Router();

/* =====================================================
   GET /api/products — Con paginación, filtros y orden
   (REQUERIDO EN LA ENTREGA FINAL)
===================================================== */
router.get('/', async (req, res) => {
  try {
    let { limit = 10, page = 1, sort, query } = req.query;

    limit = Number(limit);
    page = Number(page);

    // FILTRO
    let filter = {};
    if (query) {
      filter = {
        $or: [
          { category: query },
          { status: query === "true" } // disponibilidad
        ]
      };
    }

    // ORDENAMIENTO
    let sortOption = {};
    if (sort === "asc") sortOption = { price: 1 };
    if (sort === "desc") sortOption = { price: -1 };

    // PAGINACIÓN MANUAL
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      status: "success",
      payload: products,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
      page,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevLink: page > 1 ? `/api/products?limit=${limit}&page=${page - 1}` : null,
      nextLink: page < totalPages ? `/api/products?limit=${limit}&page=${page + 1}` : null
    });

  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

/* =====================================================
   GET producto por ID
===================================================== */
router.get('/:pid', async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid);
    if (!product) {
      return res.status(404).json({ status: 'error', error: 'Product not found' });
    }
    res.json({ status: 'success', payload: product });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

/* =====================================================
   POST crear producto
===================================================== */
router.post('/', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const saved = await newProduct.save();
    res.status(201).json({ status: 'success', payload: saved });
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
});

/* =====================================================
   PUT actualizar producto
===================================================== */
router.put('/:pid', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.pid, req.body, { new: true });
    res.json({ status: 'success', payload: updated });
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
});

/* =====================================================
   DELETE borrar producto
===================================================== */
router.delete('/:pid', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.pid);
    res.json({ status: 'success', payload: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

export default router;
