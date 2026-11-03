import { productsByIds } from "@/lib/server/catalog";
import { query, route } from "@/lib/server/http";

export const GET = route((request) => productsByIds(query(request).get("ids") ?? ""));
