import { featuredProducts } from "@/lib/server/catalog";
import { route } from "@/lib/server/http";

export const GET = route(() => featuredProducts());
