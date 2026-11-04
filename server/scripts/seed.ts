import { ObjectId, type Document } from "mongodb";
import { auth } from "../src/config/auth.js";
import { client, DB_NAME } from "../src/config/db.js";

// Run with: npm run seed (from the project root). It creates the demo logins through BetterAuth,
// then replaces all shop data. It never touches real accounts.
if (DB_NAME !== "shopdesk") throw new Error("Seeding is only allowed on the shopdesk database");
if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set. Copy .env.example to .env first.");

type OrderStatus = "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
type PaymentMethod = "Cash on Delivery" | "bKash" | "Nagad";
interface OrderItem { productId: ObjectId; name: string; image: string; price: number; qty: number }
interface Product extends Document { _id: ObjectId; name: string; image: string; price: number }
interface Order extends Document {
  orderNo: string; userEmail: string; userName: string; items: OrderItem[];
  subtotal: number; deliveryFee: number; total: number;
  delivery: { name: string; phone: string; address: string; city: string };
  payment: { method: PaymentMethod; status: "Unpaid" | "Awaiting check" | "Paid"; senderNumber?: string; transactionId?: string };
  exchange?: { status: "Requested" | "Approved" | "Rejected"; reason: string; requestedAt: Date };
  status: OrderStatus; history: { status: OrderStatus; at: Date }[]; createdAt: Date;
}

const getDb = async () => client.db(DB_NAME);
async function collections() {
  const db = await getDb();
  return {
    categories: db.collection("categories"),
    products: db.collection<Product>("products"),
    orders: db.collection<Order>("orders"),
    counters: db.collection<{ _id: string; value: number }>("counters"),
    users: db.collection("user"),
  };
}

const photo = (name: string, number = 1) => `/products/${name}-${number}.webp`;

const DEMO_USERS = [
  { name: "Farhana Ahmed", email: "admin@shopdesk.demo", password: "Ledger-Owner-5173", role: "admin" },
  { name: "Sadia Rahman", email: "customer@shopdesk.demo", password: "Ledger-Buyer-8302", role: "customer" },
];

const CATEGORIES = [
  { name: "Home Appliances", description: "Everyday machines for the kitchen and home", image: photo("microwave") },
  { name: "Men's Wardrobe", description: "Shirts, shoes and watches", image: photo("check-shirt") },
  { name: "Women's Wardrobe", description: "Dresses, shoes and bags", image: photo("blue-frock") },
  { name: "Office Equipment", description: "Laptops, tablets and seating for work", image: photo("office-chair") },
  { name: "Automobiles", description: "Cars, scooters and motorcycles", image: photo("scooter") },
  { name: "Phones & Telecom", description: "Smartphones and accessories", image: photo("oppo") },
];

// [name, category, photo, photos available, price, stock, featured, details]
type Seed = [string, string, string, number, number, number, boolean, string];

const PRODUCTS: Seed[] = [
  ["Microwave Oven, 20 L", "Home Appliances", "microwave", 3, 8900, 6, true, "Simple dial controls and enough room for a family plate. Reheats and defrosts quickly."],
  ["Induction Cooktop", "Home Appliances", "stove", 3, 5400, 9, false, "A slim cooktop with precise heat that is easy to wipe clean after dinner."],
  ["Hand Blender, 400 W", "Home Appliances", "hand-blender", 1, 2450, 12, false, "Blend soups and batters right in the pot. The steel shaft detaches for washing."],
  ["Kitchen Blender", "Home Appliances", "blender", 3, 3650, 4, false, "A sturdy jug blender for juices, chutneys and smoothies."],
  ["Classic Table Lamp", "Home Appliances", "lamp", 1, 3200, 11, false, "A warm fabric shade on a carved base, made for bedside tables and reading corners."],

  ["Blue Check Shirt", "Men's Wardrobe", "check-shirt", 3, 1450, 24, true, "A soft cotton check shirt that works for the office and the weekend."],
  ["Red Plaid Shirt", "Men's Wardrobe", "plaid-shirt", 3, 1350, 18, false, "A relaxed plaid shirt with a button-down collar."],
  ["Floral Short Sleeve Shirt", "Men's Wardrobe", "short-sleeve-shirt", 3, 1150, 20, false, "A light, breathable shirt for warm days."],
  ["White Sports Sneakers", "Men's Wardrobe", "sneakers", 3, 3400, 3, false, "Cushioned sneakers with a grippy sole for all-day wear."],
  ["Brown Leather Belt Watch", "Men's Wardrobe", "leather-watch", 3, 4200, 8, false, "A clean dial on a brown leather strap, smart enough for any occasion."],

  ["Polka Dot Frock", "Women's Wardrobe", "blue-frock", 3, 1850, 15, true, "A flowing frock in a light fabric, comfortable through a long day."],
  ["Sage Sleeveless Dress", "Women's Wardrobe", "gray-dress", 3, 2100, 12, false, "A simple button-front dress that dresses up or down easily."],
  ["Floral Evening Gown", "Women's Wardrobe", "black-gown", 3, 6500, 5, false, "An elegant full-length gown for weddings and evenings out."],
  ["Red High Heels", "Women's Wardrobe", "red-shoes", 3, 2800, 10, false, "Bright red heels with a comfortable fit."],
  ["Black Office Handbag", "Women's Wardrobe", "handbag", 3, 5200, 2, false, "A sharp black bag with gold hardware and an organised interior."],

  ["Lenovo Yoga Laptop", "Office Equipment", "lenovo-laptop", 3, 92000, 4, true, "A slim convertible laptop that folds into a tablet for presentations."],
  ["Asus Dual Screen Laptop", "Office Equipment", "asus-laptop", 3, 145000, 2, false, "A second screen above the keyboard gives you extra room for multitasking."],
  ["Executive Office Chair", "Office Equipment", "office-chair", 3, 18500, 7, false, "A padded chair with a steady swivel base for long working days."],
  ["Samsung Galaxy Tab", "Office Equipment", "office-tablet", 3, 38000, 6, false, "A large bright tablet for notes, documents and video calls."],

  ["Family Sedan", "Automobiles", "sedan", 3, 3850000, 1, false, "A comfortable five-seat sedan with a smooth ride and a large boot."],
  ["Sports Sedan", "Automobiles", "sports-car", 3, 5200000, 1, false, "Strong acceleration and confident handling in a bold body."],
  ["Family Minivan", "Automobiles", "minivan", 3, 4700000, 1, false, "Seats for the whole family, with sliding doors and plenty of luggage space."],
  ["City Scooter", "Automobiles", "scooter", 3, 165000, 5, true, "Light, easy to ride and cheap to run through city traffic."],
  ["Sports Motorcycle", "Automobiles", "motorcycle", 3, 210000, 4, true, "A sharp, responsive motorcycle with a comfortable seat."],

  ["Realme C35", "Phones & Telecom", "realme", 3, 17500, 14, true, "A large display and a long-lasting battery at a friendly price."],
  ["Samsung Galaxy S10", "Phones & Telecom", "samsung", 3, 52000, 6, false, "A sharp display with a flexible triple camera."],
  ["Vivo V9", "Phones & Telecom", "vivo", 3, 21000, 9, false, "A slim phone with a clear front camera for selfies and video calls."],
  ["Oppo F19 Pro Plus", "Phones & Telecom", "oppo", 3, 29500, 11, true, "Fast charging and a smooth screen for everyday use."],
  ["Selfie Stick Monopod", "Phones & Telecom", "selfie-stick", 1, 950, 30, false, "A light extending stick that fits most phones."],
];

const BUYERS = [
  { name: "Sadia Rahman", email: "customer@shopdesk.demo", city: "Dhaka", address: "House 14, Road 7, Dhanmondi", phone: "01712345601" },
  { name: "Tanvir Ahmed", email: "tanvir@shopdesk.demo", city: "Chattogram", address: "22 CDA Avenue, Nasirabad", phone: "01812345602" },
  { name: "Nusrat Jahan", email: "nusrat@shopdesk.demo", city: "Sylhet", address: "5 Zindabazar Road", phone: "01912345603" },
  { name: "Rakib Hasan", email: "rakib@shopdesk.demo", city: "Rajshahi", address: "31 Shaheb Bazar", phone: "01612345604" },
  { name: "Mithila Sultana", email: "mithila@shopdesk.demo", city: "Khulna", address: "9 KDA Avenue", phone: "01512345605" },
];

// A fixed sequence, so every seed gives the same demo numbers
let randomState = 20261103;
function random() {
  randomState = (randomState * 1664525 + 1013904223) % 4294967296;
  return randomState / 4294967296;
}
const pick = <T,>(list: readonly T[]) => list[Math.floor(random() * list.length)];

async function createLogins() {
  const { users } = await collections();
  const db = await getDb();
  // Clears accounts made while testing, then lists the sample buyers. They have no password, so nobody can log in as them.
  const keep = DEMO_USERS.map((user) => user.email);
  const old = await users.find({ email: { $regex: "@shopdesk\\.demo$", $nin: keep } }, { projection: { _id: 1 } }).toArray();
  const oldIds = old.map((user) => user._id);
  await Promise.all([db.collection("account").deleteMany({ userId: { $in: oldIds } }), db.collection("session").deleteMany({ userId: { $in: oldIds } }), users.deleteMany({ _id: { $in: oldIds } })]);
  const buyers = BUYERS.filter((buyer) => !keep.includes(buyer.email));
  await users.insertMany(buyers.map((buyer, index) => ({ name: buyer.name, email: buyer.email, emailVerified: false, role: "customer", createdAt: new Date(Date.now() - (50 - index) * 86400000), updatedAt: new Date() })));

  for (const user of DEMO_USERS) {
    try {
      await auth.api.signUpEmail({ body: { name: user.name, email: user.email, password: user.password } });
    } catch (err) {
      // 422 means the login already exists from an earlier seed
      if ((err as { statusCode?: number }).statusCode !== 422) throw err;
    }
    await users.updateOne({ email: user.email }, { $set: { role: user.role } });
  }
}

async function main() {
  await getDb();
  await createLogins();
  const { categories, products, orders, counters } = await collections();
  await Promise.all([categories.deleteMany({}), products.deleteMany({}), orders.deleteMany({}), counters.deleteMany({})]);
  const db = await getDb();
  // Left over from the earlier, larger version of the system
  await products.dropIndex("sku_1").catch(() => undefined);
  await Promise.all(["stockMoves", "suppliers", "purchases", "expenses", "reviews"].map((name) => db.collection(name).drop().catch(() => undefined)));

  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const ago = (days: number) => new Date(now - days * DAY);

  const inserted = await categories.insertMany(CATEGORIES.map((category) => ({ ...category, createdAt: ago(60) })));
  const categoryId = (name: string) => inserted.insertedIds[CATEGORIES.findIndex((category) => category.name === name)];

  const productDocs = PRODUCTS.map(([name, category, image, photos, price, stock, featured, description], index) => ({
    _id: new ObjectId(),
    name, category, categoryId: categoryId(category), price, stock, featured, description,
    image: photo(image),
    gallery: Array.from({ length: photos - 1 }, (_, extra) => photo(image, extra + 2)),
    createdAt: ago(60 - index), updatedAt: ago(1),
  }));
  await products.insertMany(productDocs);

  // Sample orders stick to everyday goods, so one car does not swamp the sales chart
  const everyday = productDocs.filter((product) => product.price < 60000);
  const orderDocs: Order[] = [];
  for (let daysAgo = 30; daysAgo >= 0; daysAgo -= 1) {
    const count = Math.floor(random() * 3) + 1;
    for (let n = 0; n < count; n += 1) {
      const buyer = pick(BUYERS);
      const chosen = new Map<string, OrderItem>();
      for (let line = Math.floor(random() * 2) + 1; line > 0; line -= 1) {
        const product = pick(everyday);
        chosen.set(String(product._id), { productId: product._id, name: product.name, image: product.image, price: product.price, qty: product.price > 5000 ? 1 : Math.floor(random() * 2) + 1 });
      }
      const items = [...chosen.values()];
      const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
      const deliveryFee = subtotal >= 5000 ? 0 : 80;
      const placed = new Date(ago(daysAgo).getTime() - Math.floor(random() * 6 * 60 * 60 * 1000));

      let path: OrderStatus[] = ["Pending", "Confirmed", "Shipped", "Delivered"];
      if (daysAgo <= 1) path = ["Pending"];
      else if (daysAgo === 2) path = ["Pending", "Confirmed"];
      else if (daysAgo === 3) path = ["Pending", "Confirmed", "Shipped"];
      else if (random() < 0.08) path = ["Pending", "Cancelled"];
      const status = path[path.length - 1];

      const method = pick<PaymentMethod>(["Cash on Delivery", "Cash on Delivery", "bKash", "Nagad"]);
      const online = method !== "Cash on Delivery";
      const paid = status === "Delivered" || (online && daysAgo > 1);
      const payment: Order["payment"] = {
        method,
        status: paid ? "Paid" : online ? "Awaiting check" : "Unpaid",
        ...(online ? { senderNumber: buyer.phone, transactionId: `TX${String(Math.floor(random() * 1e8)).padStart(8, "0")}` } : {}),
      };
      const history = path.map((entry, step) => ({ status: entry, at: new Date(placed.getTime() + step * 18 * 60 * 60 * 1000) }));
      // A few recent deliveries show the exchange step to anyone trying the demo
      const exchange: Order["exchange"] = status === "Delivered" && daysAgo <= 7 && random() < 0.4
        ? { status: "Requested", reason: "The size does not fit. Please exchange it for a larger one.", requestedAt: ago(1) }
        : undefined;

      orderDocs.push({
        orderNo: "", userEmail: buyer.email, userName: buyer.name, items, subtotal, deliveryFee,
        total: subtotal + deliveryFee,
        delivery: { name: buyer.name, phone: buyer.phone, address: buyer.address, city: buyer.city },
        payment, status, history, createdAt: placed,
        ...(exchange ? { exchange } : {}),
      });
    }
  }
  orderDocs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  orderDocs.forEach((order, index) => { order.orderNo = `SD-${1001 + index}`; });
  await orders.insertMany(orderDocs);
  await counters.insertOne({ _id: "order", value: orderDocs.length });

  console.log(`Seeded ${productDocs.length} products and ${orderDocs.length} orders.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => client.close());
