# 📊 Pediatric Growth Chart — SEHA

WHO & CDC pediatric growth chart tracker with Z-Score interpretation and Waterlow classification.

Built for pediatricians and general practitioners in Indonesia to track children's growth from birth to 20 years.

## Features

- **WHO Growth Standards (0–5 years)** — Weight-for-age, Height-for-age, BMI-for-age
- **CDC Growth Charts (2–20 years)** — Seamless switching between WHO and CDC standards
- **Z-Score Interpretation** — TB/U, BB/U, BB/TB, IMT/U with Indonesian clinical terminology
- **Waterlow Classification** — Nutritional status assessment based on ideal body weight
- **Gender-Themed UI** — Blue theme for boys, pink theme for girls
- **Multiple Measurements** — Track patient growth over time with data point visualization

## Tech Stack

- **Framework:** Next.js 16 (App Router, Server Components)
- **Database:** SQLite with Prisma ORM
- **Charts:** Recharts
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
cd app
npm install
```

### Setup Database

```bash
npx prisma db push
npx prisma db seed
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── app/
│   ├── actions.ts          # Server actions (CRUD)
│   ├── dashboard/          # Patient dashboard
│   ├── patients/[id]/      # Patient detail + growth charts
│   ├── globals.css         # Theme system
│   └── layout.tsx          # Root layout
├── components/
│   ├── growth-chart.tsx    # Interactive growth chart
│   ├── powered-by.tsx      # SEHA branding
│   └── theme-provider.tsx  # Gender-based theming
├── lib/
│   ├── growth-standards.ts # WHO/CDC Z-Score calculations
│   ├── who-data.ts         # WHO LMS data
│   ├── cdc-data.ts         # CDC LMS data
│   └── utils.ts            # Age calculation utilities
└── prisma/
    ├── schema.prisma       # Database schema
    └── seed.ts             # Demo data seeder
```

## Clinical Standards

- **WHO Child Growth Standards** (0–5 years) — Based on Multicentre Growth Reference Study
- **CDC Growth Charts** (2–20 years) — Based on U.S. national survey data
- **Waterlow Classification** — Percentage of ideal body weight for height
- **Indonesian Clinical Terms** — TB/U, BB/U, BB/TB, IMT/U with bilingual labels

## Deployment

### Vercel

The app is configured for Vercel deployment. The build script automatically:

1. Generates Prisma client
2. Creates SQLite database
3. Seeds demo data
4. Builds the Next.js app

> **Note:** SQLite on Vercel is ephemeral — data resets on cold starts. This is acceptable for demo/temporary deployments.

## Powered by SEHA

This tool is part of the **SEHA** ecosystem — Electronic Medical Records for Indonesian clinics.

---

*"Dokter fokus ke pasien. Sisanya biar SEHA yang urus."*
