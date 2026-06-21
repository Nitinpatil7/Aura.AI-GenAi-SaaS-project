# Aura.ai Frontend

## Project Overview

Aura.ai is a SaaS AI hub for creators and developers. The frontend is a Next.js application that provides the public landing page, authentication screens, user dashboard, AI tools, image gallery, pricing/payment flow, profile settings, and admin analytics panels.

The app talks to the Express backend through cookie-based requests. Authenticated API calls use `credentials: "include"` so the backend can read the `accesstoken` HTTP-only cookie.

## Tech Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Framer Motion for landing/gallery animations
- Lucide React for icons
- Recharts for admin billing charts
- React Hook Form, Zod, and Hookform Resolvers are installed for form validation workflows
- Razorpay Checkout script for subscription payments
- ESLint for frontend linting

## Folder Structure

```text
frontend/
  app/
    admin/dashboard/          Admin dashboard layout and admin pages
    auth/signin/              Login page
    auth/signup/              Signup page
    component/                Shared landing components such as Navbar and Footer
    context/appcontext.js     Global React context for API base URL and profile state
    sections/                 Landing page sections
    user/dashboard/           Authenticated user dashboard layout and pages
    globals.css               Tailwind import and shared utility classes
    layout.js                 Root layout, global provider, Razorpay script
    page.js                   Landing/auth redirect entry page
  public/                     Static images and SVG assets
  eslint.config.mjs           ESLint flat config
  next.config.mjs             Next image configuration
  package.json                Scripts and dependencies
```

## Installation & Setup

1. Install dependencies:

```bash
npm install
```

2. Create or update `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY=your_razorpay_key_id
```

3. Start the backend on port `5000`.

4. Start the frontend:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Backend API origin used by the app context. Defaults to `http://localhost:5000` if omitted. |
| `NEXT_PUBLIC_RAZORPAY_KEY` | Yes for paid plans | Razorpay public key used by the pricing page checkout flow. |

## Pages & Components

### Public and Auth

- `/` renders the landing page and checks `/auth/me`; authenticated users are redirected to either `/user/dashboard` or `/admin/dashboard`.
- `/auth/signin` logs in users through `POST /auth/login`.
- `/auth/signup` registers users through `POST /auth/register`.
- Landing sections include hero, features, why Aura.ai, pricing plans, testimonials, CTA, navbar, and footer.

### User Dashboard

- `/user/dashboard` shows usage totals, quick links, recent activity, and most-used tools from `GET /dashboard/user`.
- `/user/dashboard/gallary` shows generated images from `GET /ai/gallery`.
- `/user/dashboard/profile` manages profile, phone number, password, and billing information through `/auth/profile` and `/auth/password`.
- `/user/dashboard/pricing` creates and verifies Razorpay payments through `/payment/createorder` and `/payment/verifypayment`. Visible prices and quotas match backend plan enforcement: Free, Pro, and Premium.

### AI Tools

- `/user/dashboard/tools/aiassistance` and `/user/dashboard/tools/aichatbot`: chatbot UI using `POST /ai/chat`.
- `/user/dashboard/tools/Imagegenerator`: text-to-image UI using `POST /ai/image`.
- `/user/dashboard/tools/codewriter`: code generation UI using `POST /ai/code`.
- `/user/dashboard/tools/websitegenerator`: website HTML generation UI using `POST /ai/website`; generated previews are standalone Tailwind HTML and prompt logic honors requested images, sections, features, colors, and animations.
- `/user/dashboard/tools/resumeanalyzer`: PDF resume analyzer using `POST /ai/resume`; the frontend validates file type and 5MB size before upload and shows a clear resume-only error for invalid files.
- `/user/dashboard/tools/ytsummarizer`: YouTube summarizer using `POST /ai/youtube`.
- `/user/dashboard/tools/mockai`: adaptive voice/typed mock interview using `/ai/start`, `/ai/submit`, and `/ai/end`; the UI waits for speech input to stop before allowing answer submission and shows question-by-question results.

### Admin Panel

- `/admin/dashboard` shows platform metrics, real monthly charts, plan distribution, and recent activity from `GET /admin/dashboard`.
- `/admin/dashboard/users` shows user counts and users list from `GET /admin/userstate` and `GET /admin/userslist`, sorted and filtered client-side.
- `/admin/dashboard/billing` shows revenue, subscriptions, plan revenue, retention, and transactions from `GET /admin/billing`.
- `/admin/dashboard/content` shows content totals and latest content from `GET /admin/content` with deterministic date sorting and search.

## API Integration

The API base URL comes from `app/context/appcontext.js`. All protected calls include cookies:

```js
fetch(`${api}/path`, { credentials: "include" })
```

The frontend expects the backend to run at `NEXT_PUBLIC_API_BASE_URL` and to allow CORS credentials from `http://localhost:3000`.

## AI Features

The frontend does not call OpenAI, Gemini, Groq, or Hugging Face directly. It sends user prompts, files, and tool options to the backend. The backend performs provider calls, saves history, updates usage, and returns generated content.

## Build & Deployment

Run quality checks:

```bash
npm run lint
npm run build
```

Run production locally:

```bash
npm run start
```

For deployment, set `NEXT_PUBLIC_API_BASE_URL` to the deployed backend origin and `NEXT_PUBLIC_RAZORPAY_KEY` to the live Razorpay key. Deploy the Next.js app to a Node-capable host such as Vercel, Render, Railway, or a VPS.
