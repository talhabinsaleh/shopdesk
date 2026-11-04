import { Router } from "express";
import { featuredProducts, findProduct, productsByIds, searchProducts } from "../lib/catalog.js";
import { queryParams } from "../lib/validate.js";

// Public: anyone can browse the shop
const router = Router();

router.get("/", async (req, res) => {
  res.json(await searchProducts(queryParams(req.query)));
});

router.get("/featured", async (_req, res) => {
  res.json(await featuredProducts());
});

// The cart re-reads its products, so it always shows today's price and stock
router.get("/by-ids", async (req, res) => {
  res.json(await productsByIds(typeof req.query.ids === "string" ? req.query.ids : ""));
});

router.get("/:id", async (req, res) => {
  res.json(await findProduct(req.params.id));
});

export default router;
