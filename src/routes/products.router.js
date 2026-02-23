import { Router } from "express";
import passport from "passport";
import ProductsManager from "../dao/managers/ProductsManager.js";
import { authorization } from "../middlewares/authorization.middleware.js";

const router = Router();
const manager = new ProductsManager();

/* =====================================================
   GET /api/products
   Paginación + filtros + ordenamiento
===================================================== */
router.get("/", async (req, res) => {
  try {
    let { limit = 10, page = 1, sort, query } = req.query;

    limit = Number(limit);
    page = Number(page);

    let filter = {};
    if (query) {
      filter = {
        $or: [{ category: query }, { status: query === "true" }],
      };
    }

    const options = { limit, page };

    if (sort === "asc") options.sort = { price: 1 };
    if (sort === "desc") options.sort = { price: -1 };

    const result = await manager.getProducts(filter, options);

    res.json({
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage
        ? `/api/products?limit=${limit}&page=${result.prevPage}`
        : null,
      nextLink: result.hasNextPage
        ? `/api/products?limit=${limit}&page=${result.nextPage}`
        : null,
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

/* =====================================================
   GET producto por ID
===================================================== */
router.get("/:pid", async (req, res) => {
  try {
    const product = await manager.getProductById(req.params.pid);

    if (!product) {
      return res
        .status(404)
        .json({ status: "error", error: "Product not found" });
    }

    res.json({ status: "success", payload: product });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

/* =====================================================
   POST crear producto (SOLO ADMIN)
===================================================== */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  authorization(["admin"]),
  async (req, res) => {
    try {
      const newProduct = await manager.createProduct(req.body);
      res.status(201).json({ status: "success", payload: newProduct });
    } catch (err) {
      res.status(400).json({ status: "error", error: err.message });
    }
  }
);

/* =====================================================
   PUT actualizar producto (SOLO ADMIN)
===================================================== */
router.put(
  "/:pid",
  passport.authenticate("jwt", { session: false }),
  authorization(["admin"]),
  async (req, res) => {
    try {
      const updated = await manager.updateProduct(req.params.pid, req.body);
      res.json({ status: "success", payload: updated });
    } catch (err) {
      res.status(400).json({ status: "error", error: err.message });
    }
  }
);

/* =====================================================
   DELETE borrar producto (SOLO ADMIN)
===================================================== */
router.delete(
  "/:pid",
  passport.authenticate("jwt", { session: false }),
  authorization(["admin"]),
  async (req, res) => {
    try {
      await manager.deleteProduct(req.params.pid);
      res.json({ status: "success", payload: "Product deleted" });
    } catch (err) {
      res.status(500).json({ status: "error", error: err.message });
    }
  }
);

export default router;