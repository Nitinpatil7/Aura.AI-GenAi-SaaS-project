# Aura.ai Frontend

Next.js frontend for Aura.ai, an AI SaaS dashboard with generation tools, subscriptions, and admin analytics.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Create `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY=your_razorpay_key_id
```

## Key Features

- Cookie-based auth with user/admin dashboard routing.
- AI tools for image, code, website, PDF resume analysis, YouTube summaries, chat, and adaptive mock interviews.
- Resume analyzer validates PDF-only uploads up to 5MB before sending to the backend; backend content checks reject non-resume PDFs.
- Website generator previews standalone Tailwind HTML and relies on backend prompt logic for requested sections, images, colors, and animations.
- Mock interview supports typed and browser speech input, waits for speech to finish before submitting, and shows question-by-question review.
- Admin dashboard, billing, users, and content screens render backend data only.
- Pricing plans match backend quotas and Razorpay payment amounts.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Important Pages

- `/user/dashboard/tools/resumeanalyzer`
- `/user/dashboard/tools/websitegenerator`
- `/user/dashboard/tools/mockai`
- `/user/dashboard/pricing`
- `/admin/dashboard`
- `/admin/dashboard/users`
- `/admin/dashboard/billing`
- `/admin/dashboard/content`
