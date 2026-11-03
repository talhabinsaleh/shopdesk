import { searchProducts } from "@/lib/server/catalog";
import { query, route } from "@/lib/server/http";

export const GET = route((request) => searchProducts(query(request)));
