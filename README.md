# SalonBook

A role-based salon appointment booking platform. Customers browse services, book appointments, and pay online once an admin confirms. Admins manage services, appointments, users, and transactions.

## Live Website
https://salonbook-s-sarman.vercel.app/

## Repositories
- Server: https://github.com/SajidSarman/SalonBook-Server

## Important Features
- Email/password and Google authentication (Better Auth)
- Role-based access (Customer and Admin) with protected routes and dashboards
- Add/Update service through a modal with image upload (ImgBB)
- Browse services with search by name and sorting by price
- Service details page with appointment booking (date and time slot)
- Admin: manage services (add, update, activate/deactivate), appointments, users (block/unblock), and transactions
- Customer dashboard: appointment history, cancel pending appointments, Pay Now for confirmed ones
- Stripe Checkout with webhook-confirmed payment status
- Image upload with ImgBB
- Responsive UI with a consistent salon theme

## Technology Stack
Next.js, React, Tailwind CSS, shadcn/ui, Better Auth, Stripe, ImgBB, TypeScript

## Installation
```bash
git clone https://github.com/SajidSarman/SalonBook.git
cd SalonBook
npm install
```

## Run Locally
1. Add `.env` and fill in the values.
2. Start the Express server first (see the server README).
3. Run:
```bash
npm run dev 
```
Open http://localhost:3000.

## Environment Variables
```
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
JWT_ISSUER=
JWT_AUDIENCE=
MONGODB_URI=
EXPRESS_API_URL=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
IMGBB_API_KEY=
```
