import app from "./app.js";
import { PORT } from "./config/env.js";

// On Vercel the app is exported and run as a function. Locally it listens on a port.
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`ShopDesk API running on http://localhost:${PORT}`));
}

export default app;
