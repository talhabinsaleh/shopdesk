import { Router } from "express";
import { listCategories } from "../lib/catalog.js";

// Public: the category list with how many products each has
const router = Router();

router.get("/", async (_req, res) => {
  res.json(await listCategories());
});

export default router;
