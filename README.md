# Sanad (سند) - Volunteer Help Platform

A modern, bilingual (Arabic & English) community volunteer platform connecting individuals and organizations who need assistance with verified, passionate volunteers. Featuring verified owner documentation, volunteer matching, real-time messaging, points and gamification badges, certificate generation, safety reporting, and full Supabase backend database integration.

---

## ✨ Features

- **🌍 Full Bilingual & RTL Support**: Native Arabic and English translations with dynamic RTL/LTR layout transitions.
- **🎨 Natural Tones Aesthetic**: Warm neutral color palette (`#f5f5f0` / `#1a1a16`), editorial serif typography (Newsreader & Amiri), clean body text (Cairo & Plus Jakarta Sans), and dark mode.
- **🛡️ Multi-Role & Owner Verification**:
  - **Volunteer**: Browse requests, filter by skills/urgency, submit applications, track volunteer hours, earn badges & points, and download certificates.
  - **Owner**: Post help requests, review volunteer applicants, assign tasks, request optional donation/InstaPay support, and track completion.
  - **Admin**: Review owner verification credentials, approve/reject documentation, moderate content, handle safety reports, and manage categories.
- **⚡ Real-Time Messaging**: Built-in direct messaging between owners and volunteers.
- **🗄️ Supabase Ready**:
  - Direct integration using `@supabase/supabase-js`.
  - Comprehensive SQL schema in `src/lib/supabase-schema.sql` with Row Level Security (RLS) policies and Realtime subscriptions.
  - Graceful fallback to browser local persistence when Supabase credentials are not yet configured.

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/sanad-volunteer-platform.git
cd sanad-volunteer-platform
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables (Optional)
Copy the example environment file:
```bash
cp .env.example .env.local
```

Add your Supabase credentials (found in your [Supabase Dashboard](https://supabase.com/dashboard) under Project Settings > API):
```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the port displayed in your terminal) in your browser.

---

## 🗄️ Supabase Database Setup

To link your live Supabase database with Sanad:

1. Create a new project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** tab in your Supabase dashboard.
3. Open [`src/lib/supabase-schema.sql`](./src/lib/supabase-schema.sql) in this repo, copy all the SQL contents, paste them into the SQL editor, and click **Run**.
4. Retrieve your **Project URL** and **Anon Key** from **Project Settings > API**.
5. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your `.env.local` file (or in Vercel Environment Variables).

---

## ☁️ Deploying to Vercel

This repository is pre-configured with `vercel.json` for single-click deployment:

### Method 1: Via Vercel Dashboard (Recommended)
1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **Add New > Project**.
3. Import your GitHub repository.
4. In the **Environment Variables** section, optionally add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**. Vercel will automatically build and deploy the SPA!

### Method 2: Via Vercel CLI
```bash
npm i -g vercel
vercel
```

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite 6
- **Styling**: Tailwind CSS v4 + Lucide Icons + Framer Motion
- **Database / Backend**: Supabase (`@supabase/supabase-js`)
- **Deployment**: Vercel & Cloud Run ready

---

## 📄 License

MIT License - feel free to use and adapt this project for your community.
