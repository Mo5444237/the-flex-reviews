# 📊 The Flex Reviews

A full-stack application for managing, moderating, and displaying guest reviews from multiple booking sources.
Built with **Next.js 15, Prisma, PostgreSQL (Supabase), React Query, TailwindCSS, and shadcn/ui**.

> **Note**: This project was developed as part of the **Flex assessment**. The provided Hostaway sandbox API contained no usable data, so mock data was used for seeding. However, the production code is structured to integrate directly with the real API if available.


## 🚀 Live Demo

* **App:** [the-flex-reviews.vercel.app](https://the-flex-reviews.vercel.app/)
* **Repo:** [GitHub Repository](https://github.com/Mo5444237/the-flex-reviews)


## 📖 Features

### Admin Dashboard

* Filter reviews by:

  * Date range, type, channel, status, approval, and sort order.
* Paginated table view with:

  * Listing, guest, review text, date, overall rating.
  * Category details (cleanliness, communication, house rules).
  * Toggle approval and link to property page.
* Aggregates & charts:

  * Overall average rating.
  * Reviews by channel.
  * Top listings by review count.

### Public Reviews

* Property pages at `/properties/[slug]`.
* Show guest reviews with names, dates, and comments.
* Category averages with styled chips.

## 🛠 Tech Stack

* **Frontend & Server**: [Next.js 15](https://nextjs.org/) (App Router, TypeScript)
* **Database**: [PostgreSQL](https://www.postgresql.org/) via [Supabase](https://supabase.com/)
* **ORM**: [Prisma](https://www.prisma.io/)
* **UI**: [TailwindCSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
* **Charts**: [recharts](https://recharts.org/)
* **Hosting**: [Vercel](https://vercel.com/)


## 🗄 Database Schema

* **Listing**
  Stores properties (`id`, `name`, `slug`, `hostawayListingId`).

* **Review**
  Guest reviews linked to listings. Includes enums for:

  * `ReviewType` (host-to-guest, guest-to-host)
  * `ReviewStatus` (published, hidden, draft)
  * `ReviewChannel` (airbnb, booking, direct, unknown)

* **ReviewCategory**
  Per-category ratings (cleanliness, communication, house rules, etc.).


## ⚙️ Deployment & Environment

### Environment Variables

```env
# Supabase (public schema)
DATABASE_URL="postgresql://<user>:<pass>@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=public&sslmode=require"
DIRECT_URL="postgresql://<user>:<pass>@aws-1-eu-north-1.pooler.supabase.com:5432/postgres?schema=public&sslmode=require"
```

### Deployments

* **Migrations**

  ```bash
  npx prisma migrate deploy
  ```
* **Seeding**

  ```bash
  npx prisma db seed
  ```


## 💻 Local Development

```bash
# Clone repo
git clone https://github.com/Mo5444237/the-flex-reviews.git
cd the-flex-reviews

# Install dependencies
npm install

# Setup environment
cp .env.example .env   # add Supabase credentials

# Prisma setup
npx prisma generate
npx prisma migrate deploy
npx prisma db seed

# Run dev server
npm run dev
```

Open app at: [http://localhost:3000](http://localhost:3000)


## ⚠️ Notes & Limitations

* Demo data is seeded for presentation only.
* No authentication/authorization layer included.
* Sandbox API was not used because it contained no real data; mock data was seeded instead.
* For production use, secure routes, role-based access control, and direct API integration should be added.


## 👤 Author

**Mohamed Ibrahim**

* [GitHub](https://github.com/Mo5444237)
* [LinkedIn](https://www.linkedin.com/in/mo5444237/)
