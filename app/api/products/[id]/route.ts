import { findProduct } from "@/lib/server/catalog";
import { route } from "@/lib/server/http";

export const GET = route((_request, { id }) => findProduct(id));
