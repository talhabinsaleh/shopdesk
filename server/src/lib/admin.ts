import { collections } from "../config/db.js";
import { asObjectId, HttpError, imageUrl, number, optionalText, text } from "./validate.js";

export const LOW_STOCK = 5;

// Checks the product form, used when adding and editing
export async function readProduct(body: Record<string, unknown>) {
  const { categories } = await collections();
  const categoryId = asObjectId(body.categoryId);
  const category = await categories.findOne({ _id: categoryId });
  if (!category) throw new HttpError(400, "Please choose a category.");
  const gallery = Array.isArray(body.gallery) ? body.gallery.filter((link: unknown) => String(link).trim()).slice(0, 6).map(imageUrl) : [];
  return {
    name: text(body.name, "Name", { min: 2, max: 120 }),
    categoryId,
    category: category.name,
    description: text(body.description, "Details", { max: 2000 }),
    image: imageUrl(body.image),
    gallery,
    price: number(body.price, "Price", { min: 1 }),
    stock: number(body.stock, "Stock", { max: 1000000, integer: true }),
    featured: Boolean(body.featured),
  };
}

export function readCategory(body: Record<string, unknown>) {
  return {
    name: text(body.name, "Name", { min: 2, max: 60 }),
    description: optionalText(body.description, "Description", 300),
    image: imageUrl(body.image),
  };
}
