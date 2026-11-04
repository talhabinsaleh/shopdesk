import { toNodeHandler } from "better-auth/node";
import express from "express";
import { auth } from "./config/auth.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import categories from "./routes/categories.js";
import manage from "./routes/manage.js";
import orders from "./routes/orders.js";
import products from "./routes/products.js";
import settings from "./routes/settings.js";
import upload from "./routes/upload.js";

const app = express();
app.set("trust proxy", true);
app.disable("x-powered-by");

// BetterAuth reads its own request body, so it goes before express.json()
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json({ limit: "100kb" }));

app.get("/", (_req, res) => {
  res.json({ name: "ShopDesk API", status: "running" });
});
app.use("/api/settings", settings);
app.use("/api/categories", categories);
app.use("/api/products", products);
app.use("/api/orders", orders);
app.use("/api/manage", manage);
app.use("/api/upload", upload);

app.use(notFound);
app.use(errorHandler);

export default app;
