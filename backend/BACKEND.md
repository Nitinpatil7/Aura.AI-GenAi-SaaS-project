# Aura.ai Backend

## Project Overview

The Aura.ai backend is a Node.js and Express API that serves authentication, user/admin dashboards, subscription payments, usage limits, and AI tool endpoints for the frontend. It stores users, generated content, payments, resume analyses, YouTube summaries, and mock interview sessions in MongoDB through Mongoose.

## Tech Stack

- Node.js and Express 5
- MongoDB with Mongoose
- JWT authentication stored in HTTP-only cookies
- Zod request validation
- Express Rate Limit for AI endpoints
- Multer memory uploads for resume PDFs
- Cloudinary for image and resume file storage
- Razorpay for paid subscriptions
- Hugging Face Inference for image generation
- Groq/LangChain for chat, code, website, and mock interview flows
- Google Gemini/LangChain for resume and YouTube summary flows
- pdf-parse for resume text extraction
- ytdl-core and youtube-transcript for YouTube metadata/transcripts
- NodeCache for cached admin dashboard stats

## Folder Structure

```text
backend/
  config/             MongoDB, Cloudinary, and Razorpay setup
  controller/         Route handlers for auth, AI, dashboard, payment, admin
  middlewere/         Auth, admin guard, validation, rate limit, uploads, plan checks
  model/              Mongoose schemas
  routes/             Express route definitions
  services/           AI provider integrations and business logic
  utils/              JWT generation, Zod schemas, code helpers
  server.js           Express app entry point
  package.json        Scripts and dependencies
```

## Installation & Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` in `backend/`.

3. Start MongoDB or use a hosted MongoDB URI.

4. Start the server:

```bash
npm start
```

The server listens on port `5000`.

## Environment Variables

| Variable | Description |
| --- | --- |
| `MONGO_URL` | MongoDB connection string. |
| `JWT_SEC` | Secret used to sign and verify JWT auth cookies. |
| `RAZORPAY_KEY` | Razorpay key ID. |
| `RAZORPAY_SECRET` | Razorpay key secret and webhook/payment signature secret. |
| `CLOUDINARY_NAME` | Cloudinary cloud name. |
| `CLOUDINARY_API_KEY` | Cloudinary API key. |
| `CLOUDINARY_API_SEC` | Cloudinary API secret. |
| `HF_API_KEY` | Hugging Face token for image generation. |
| `HF_IMAGE_MODEL` | Optional Hugging Face image model override. Defaults to `stabilityai/stable-diffusion-xl-base-1.0`. |
| `HF_IMAGE_ENDPOINT` | Optional direct Hugging Face inference endpoint. Defaults to the selected image model endpoint. |
| `HF_IMAGE_TIMEOUT_MS` | Optional Hugging Face image timeout. Defaults to `25000`. |
| `HF_IMAGE_RETRIES` | Optional retry count for transient Hugging Face failures. Defaults to `1`. |
| `POLLINATIONS_TIMEOUT_MS` | Optional fallback image provider timeout. Defaults to `20000`. |
| `GROQ_API_KEY` | Groq API key for chat/code/website/mock interview. |
| `AI_CHAT_MODEL` | Optional chat assistant model override. Defaults to `llama-3.1-8b-instant`. |
| `AI_CHAT_TIMEOUT_MS` | Optional chat assistant timeout. Defaults to `12000`. |
| `CODE_AI_MODEL` | Optional code writer model override. Defaults to `llama-3.1-8b-instant`. |
| `CODE_AI_TIMEOUT_MS` | Optional code writer timeout. Defaults to `18000`. |
| `WEBSITE_AI_MODEL` | Optional website generator model override. Defaults to `llama-3.3-70b-versatile`. |
| `WEBSITE_AI_TIMEOUT_MS` | Optional website generator timeout. Defaults to `22000`. |
| `RESUME_AI_MODEL` | Optional resume analyzer model override. Defaults to `gemini-2.5-flash`. |
| `RESUME_AI_TIMEOUT_MS` | Optional resume analyzer timeout. Defaults to `22000`. |
| `YOUTUBE_AI_MODEL` | Optional YouTube summarizer model override. Defaults to `gemini-2.5-flash`. |
| `YOUTUBE_INFO_TIMEOUT_MS` | Optional YouTube metadata/transcript timeout. Defaults to `12000`. |
| `YOUTUBE_AI_TIMEOUT_MS` | Optional YouTube AI summary timeout. Defaults to `18000`. |
| `MOCK_AI_MODEL` | Optional mock interview model override. Defaults to `llama-3.1-8b-instant`. |
| `MOCK_AI_TIMEOUT_MS` | Optional mock interview timeout. Defaults to `15000`. |
| `OPENAI_API_KEY` | Optional fallback for chatbot if Groq is not configured. |
| `OPENAI_CHAT_MODEL` | Optional OpenAI fallback chat model. Defaults to `gpt-4o-mini`. |
| `GEMINI_API_KEY` | Gemini key for resume analysis. |
| `GOOGLE_API_KEY` | Google/Gemini key used by the YouTube summary service. |

## API Routes

### Auth

| Method | Path | Purpose | Body / Params | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/auth/register` | Create user and set auth cookie | `{ name, email, password }` | `{ message, role }` |
| `POST` | `/auth/login` | Validate credentials and set auth cookie | `{ email, password }` | `{ message, role, user }` |
| `POST` | `/auth/logout` | Clear auth cookie | None | `{ message }` |
| `GET` | `/auth/me` | Return current user | Cookie auth | User without password |
| `PUT` | `/auth/profile` | Update name/phone | `{ name?, phone? }` | `{ message, user }` |
| `PUT` | `/auth/password` | Change password | `{ currentpassword, newpassword, confirmpassword }` | `{ message }` |

### AI

All `/ai/*` routes are rate-limited to 10 requests/minute and protected where noted.

| Method | Path | Purpose | Body / Params | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/ai/gallery` | Current user's generated image history | Cookie auth | `{ success, images }` |
| `POST` | `/ai/image` | Generate and upload images | `{ prompt, style?, count?, aspect? }` | `{ success, images, historyid }` |
| `POST` | `/ai/website` | Generate prompt-specific Tailwind HTML website with requested sections, imagery, colors, features, and animations | `{ type?, theme?, font?, prompt }` | `{ success, code, historyId }` |
| `POST` | `/ai/code` | Generate code and explanation | `{ prompt }` | `{ success, code, explanation, language }` |
| `POST` | `/ai/resume` | Analyze uploaded PDF resume. Only PDF files up to 5MB are accepted, and extracted text must look like a resume/CV. | `multipart/form-data`: `resume`, `prompt?` | `{ success, result, fileUrl, historyId }` |
| `POST` | `/ai/youtube` | Summarize YouTube video | `{ url }` | `{ success, message, data }` |
| `POST` | `/ai/chat` | AI assistant reply | `{ message }` | `{ reply }` |
| `POST` | `/ai/start` | Start adaptive mock interview | `{ tech }` | `{ sessionId, welcome, guidelines, question }` |
| `POST` | `/ai/submit` | Submit mock answer and get adaptive next question | `{ sessionId, answer }` | `{ finished, feedback, score, correctAnswer?, nextQuestion }` |
| `POST` | `/ai/end` | End mock interview and return full review | `{ sessionId }` | `{ finished, questions, analytics }` |

### Dashboard

| Method | Path | Purpose | Query / Body | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/dashboard/user` | User dashboard metrics | Cookie auth | Usage totals, recent activity, bar data |
| `GET` | `/dashboard/image` | Paginated global image list | `page?`, `limit?` | `{ images, page, limit, totalImages, totalPages }` |

### Admin

All admin routes require auth and `role: "admin"`.

| Method | Path | Purpose | Response |
| --- | --- | --- | --- |
| `GET` | `/admin/dashboard` | Platform totals, monthly charts, plan distribution, and recent activity | Totals plus `userGrowthData`, `revenueData`, `aiRequestData`, `planDistributionData`, `recentActivities` |
| `GET` | `/admin/userstate` | User stats | `{ totalUsers, suspendedUsers, activeUsers, newUsersThisMonth }` |
| `GET` | `/admin/userslist` | All users | User array |
| `GET` | `/admin/billing` | Billing metrics, transactions, monthly revenue/subscriptions, plan revenue, active paid subscriptions, and retention | Revenue, failed payments, transactions, subscriptions, chart arrays |
| `GET` | `/admin/content` | Content totals and latest content | `{ images, codes, websites, totalContent, latestContent }` sorted by newest date |

### Payments and Health

| Method | Path | Purpose | Body / Params | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/payment/createorder` | Create Razorpay order | `{ plan, billingcycle }` | `{ success, order }` |
| `POST` | `/payment/verifypayment` | Verify Razorpay signature and activate subscription | Razorpay IDs/signature, `plan` | `{ success, message }` |
| `GET` | `/api/health` | Server/database health | None | `{ server, database, timestamp }` |

## Authentication Flow

Signup and login hash/check passwords with `bcryptjs`. On success, `generatetoken` signs a JWT with `JWT_SEC` and stores it in the `accesstoken` HTTP-only cookie for 30 minutes. `authmiddlewere` reads the cookie, verifies the token, loads the full user from MongoDB, and assigns it to `req.user`.

Admin routes additionally run `adminmiddlewere`, which checks `req.user.role === "admin"`.

## AI API Integration

- Chatbot: uses Groq `llama-3.1-8b-instant` through LangChain when `GROQ_API_KEY` exists, otherwise OpenAI `gpt-4o-mini`.
- Code writer: uses Groq `llama-3.3-70b-versatile`, parses `CODE:` and `EXPLANATION:` sections, saves to `Code`.
- Image generator: tries Hugging Face Stable Diffusion XL first, falls back to Pollinations if Hugging Face is unreachable, uploads generated images to Cloudinary, and saves Cloudinary URLs.
- Website generator: uses Groq to return standalone Tailwind HTML that follows the user's requested layout, sections, visual style, images/backgrounds, features, and animations.
- Resume analyzer: validates PDF uploads, rejects non-resume PDF content, extracts resume text with `pdf-parse`, sends it to Gemini `gemini-2.5-flash`, and returns structured JSON analytics.
- YouTube summarizer: uses `ytdl-core` and `youtube-transcript`, then Gemini to produce summary JSON.
- Mock interview: uses Groq to generate adaptive questions from previous answers, evaluate answers, save feedback/ideal answers, and produce final analytics plus a full question review.

## Database Schema

- `User`: `name`, `email`, `password`, `phone`, `role`, `isblocked`, `subscription`, `subscriptionStart`, `subscriptionEnd`, `usageResetDate`, `usage`, `lastlogin`, timestamps.
- `Image`: `user`, `prompt`, `style`, `aspect`, `images`, timestamps.
- `Code`: `user`, `prompt`, `result`, `createdAt`.
- `Website`: `user`, `type`, `theme`, `font`, `prompt`, `code`, timestamps.
- `Resume`: `user`, `prompt`, `fileUrl`, `analysis`, timestamps.
- `YouTube`: `user`, `url`, `videoDetails`, `aiSummary`, `createdAt`.
- `mockAi`: `user`, `tech`, `rounds`, `currentRound`, `questions`, `startedAt`, `finishedAt`, `totalScore`.
- `Payment`: `user`, `plan`, `amount`, `billingcycle`, Razorpay IDs/signature, `status`, `createdAt`.
- `Subscription`: `user`, `plan`, `startdate`, `enddate`, `status`.

## Features Breakdown

- Authentication: auth routes validate input with Zod, hash passwords, issue JWT cookies, and expose profile/password updates.
- Plan enforcement: `subscriptioncheck` resets expired plans and monthly usage, then blocks feature requests that exceed plan limits.
- Payments: frontend creates an order, Razorpay returns payment IDs, backend verifies the HMAC signature, saves payment status, and updates user subscription dates.
- User dashboard: derives totals from the user `usage` object and counts website projects.
- Admin dashboard: aggregates users, payment revenue, AI content counts, billing transactions, monthly chart data, plan distribution, and latest generated content from real collections only.
- Content history: each AI feature saves generated output to its own collection for dashboard/gallery views.

## Error Handling

Controllers use `try/catch` and return JSON errors with relevant HTTP status codes. Validation failures return `400` with field-level Zod messages. Auth failures return `401` or `403`. Plan/quota failures return `403`. Unexpected provider/database failures generally return `500` with a generic message while logging details on the server.
