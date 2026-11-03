# ShopDesk

An online shop management system. The administrator keeps the catalog of home appliances, men's and women's wardrobes, office equipment, automobiles, and phones, with details, prices and photographs. Customers choose a category, pick an item and order easily, then pay online or on delivery and ask for an exchange within 7 days.

**Live site:** https://shopdesk-talha.vercel.app

## Demo logins

The login page has a button that fills in each of these.

| Role | Email | Password |
|---|---|---|
| Admin | admin@shopdesk.demo | Ledger-Owner-5173 |
| Customer | customer@shopdesk.demo | Ledger-Buyer-8302 |

## Features

- **Catalog:** categories, search from the navbar, sorting, product details, prices and several photos
- **Ordering:** cart, checkout and order tracking
- **Payment:** bKash, Nagad or cash on delivery. For bKash and Nagad, the customer enters the transaction ID and the admin confirms it. The demo uses a sample number, so no real money moves.
- **Exchange:** customers can ask within 7 days of delivery, and the admin approves or rejects
- **Admin:** products, categories, orders, customers and a sales overview
- Login with email or Google, light and dark themes, on phone and desktop

## Stack

One Next.js app: the pages and the API (`app/api`) live together, with MongoDB, BetterAuth, TypeScript, Tailwind CSS, DaisyUI and imgbb.

## Run it locally

You need Node.js 20 or newer and a free [MongoDB Atlas](https://www.mongodb.com/atlas) database.

```bash
git clone https://github.com/talhabinsaleh/shopdesk.git
cd shopdesk
npm install
cp .env.example .env.local   # then fill in MONGODB_URI and BETTER_AUTH_SECRET
npm run dev                  # http://localhost:3000
```

To fill an empty database with the sample shop and the demo logins, keep `npm run dev` running and in a second terminal run:

```bash
npm run seed
```

Seeding replaces all products, categories and orders, so only run it on a demo database.

## Deploy on Vercel

1. Import the repo on [vercel.com/new](https://vercel.com/new). No build settings are needed.
2. Add the values from `.env.example` as environment variables, with `BETTER_AUTH_URL` set to your site's address.
3. In MongoDB Atlas, allow access from anywhere (`0.0.0.0/0`) under Network Access.
4. For Google login, add `https://YOUR-SITE/api/auth/callback/google` as a redirect URI on your Google OAuth client.

## Project layout

```
app/            pages, plus app/api for the backend routes
components/     interface pieces
lib/            login, cart and helpers
lib/server/     database code used only on the server
scripts/seed.ts sample data
public/         product photos
```

## Credits

Sample product photos come from the [DummyJSON](https://dummyjson.com) demo data set. All names, prices, orders and figures are sample data.
