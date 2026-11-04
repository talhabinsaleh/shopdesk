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

- **client/**: Next.js website, with React, TypeScript, Tailwind CSS and DaisyUI
- **server/**: Express API, with MongoDB, BetterAuth (email and Google login) and imgbb uploads

## Project layout

```
shopdesk/
├── client/                    Next.js website (what the visitor sees)
│   ├── app/
│   │   ├── (store)/(ssr)/     server-rendered (SSR): home, products, product page, login, register
│   │   ├── (store)/(csr)/     client-rendered (CSR): cart, checkout, my orders
│   │   └── manage/            admin dashboard, client-rendered (CSR)
│   ├── components/            interface pieces (manage/ = admin dashboard)
│   ├── lib/                   API calls, cart, login client, formatting
│   ├── public/                product photos
│   ├── proxy.ts               sends logged-out visitors to the login page
│   └── next.config.ts         passes every /api request on to the server
├── server/                    Express API (the backend)
│   ├── src/
│   │   ├── config/            environment, MongoDB and BetterAuth setup
│   │   ├── middleware/        login checks (requireUser, requireAdmin) and error handling
│   │   ├── routes/            products, categories, orders, manage (admin), upload, settings
│   │   ├── lib/               catalog, order status and form checks
│   │   ├── app.ts             the Express app
│   │   └── index.ts           starts it on port 5000
│   └── scripts/seed.ts        sample data and demo logins
├── .env.example               every setting, for both apps
└── package.json               runs both apps together
```

Names in brackets, like `(ssr)`, only group the folders and never appear in the web address.

**How the two talk:** the browser only ever opens the website. `client/next.config.ts` passes every `/api/...` request on to the Express server, so login cookies stay on the website's own address. SSR pages ask the server for their data before the page is sent, and CSR pages fetch it from `/api` in the browser.

## Run it locally

You need Node.js 20.12 or newer and a free [MongoDB Atlas](https://www.mongodb.com/atlas) database.

```bash
git clone https://github.com/talhabinsaleh/shopdesk.git
cd shopdesk
npm install          # installs client and server together
cp .env.example .env # then fill in MONGODB_URI and BETTER_AUTH_SECRET
npm run dev          # server on http://localhost:5000, website on http://localhost:3000
```

To fill an empty database with the sample shop and the demo logins, run:

```bash
npm run seed
```

Seeding replaces all products, categories and orders, so only run it on a demo database.

## Deploy on Vercel

The two apps are deployed as two Vercel projects from this one repo.

1. **Server:** import the repo on [vercel.com/new](https://vercel.com/new) and set the Root Directory to `server`. Add the server values from `.env.example`, with `BETTER_AUTH_URL` set to the **website's** address.
2. **Website:** import the repo again with Root Directory `client`, and add `API_URL` set to the server's address.
3. In MongoDB Atlas, allow access from anywhere (`0.0.0.0/0`) under Network Access.
4. For Google login, add `https://YOUR-WEBSITE/api/auth/callback/google` as a redirect URI on your Google OAuth client.

## Credits

Sample product photos come from the [DummyJSON](https://dummyjson.com) demo data set. All names, prices, orders and figures are sample data.
