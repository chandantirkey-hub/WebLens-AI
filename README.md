# WebLens AI

A lightweight MVP for turning public webpages into structured intelligence.

## Run the frontend

Open `index.html` in a browser, or serve this folder with any static server. The landing page, navigation, demo analyses, URL validation, loading state, and local free-analysis counter work without API keys.

## Deploy the live analysis function

Install the Supabase CLI, authenticate, and link this folder to your Supabase project:

```powershell
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set FIRECRAWL_API_KEY=YOUR_FIRECRAWL_KEY OPENAI_API_KEY=YOUR_OPENAI_KEY
supabase functions deploy analyze-website --no-verify-jwt
```

The browser posts `{ "url": "https://example.com" }` to `/functions/v1/analyze-website`. For a separately hosted static frontend, set the endpoint before loading `app.js`:

```html
<script>window.WEBLENS_ANALYZE_ENDPOINT = 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/analyze-website';</script>
<script type="module" src="app.js"></script>
```

The secure Supabase Edge Function in `supabase/functions/analyze-website/index.ts` is the server-side implementation for Firecrawl and OpenAI. Secrets remain in Supabase and are never shipped to the browser.

The browser counter is intentionally a hackathon-only convenience, not production quota enforcement. The result modal supports browser-generated PDF printing and Word-compatible `.doc` download.

## Email OTP, passwords and registered accounts

Supabase Auth is wired to the public project anon key in `index.html`. In Supabase Authentication → Providers → Email, **disable "Confirm email"** so sign-up returns a session immediately with no verification step. Recovery emails still deliver a reset link.

- **Sign up**: email + password only. The account is created and signed in immediately — no OTP/verification code required. This creates a row in `public.profiles` (via the `on_auth_user_created` trigger in `supabase/schema.sql`) with 5 additional free analyses. The `profiles` table still has optional `mobile`/`address`/`pincode`/`state`/`country` columns for future profile-editing screens; they are simply left blank at sign-up.
- **Sign in**: email + password.
- **Forgot password**: enter your email, receive a reset **link** (redirects back to this page with a `#access_token=...&type=recovery` fragment), then set a new password directly — no code entry required. Passwords are hashed and stored by Supabase Auth; the app never sees or stores raw passwords itself.
- **Free analyses**: anonymous visitors get 5 free analyses (browser-only counter). Registered users get **5 more**, tracked server-side in `profiles.trial_remaining`, capped at **2 analyses per day** regardless of remaining balance.
- Run `supabase/schema.sql` against your project (or `supabase db push`) to create the `profiles` table, its RLS policies and the new-user trigger before testing sign-up.
- In Supabase Authentication → URL Configuration, add this site's URL to **Redirect URLs** so the recovery link is allowed to redirect back here.

The free counter and daily cap are intentionally a hackathon-only convenience, not production quota enforcement. The result modal supports browser-generated PDF printing only, with a "WebLens AI" watermark plus a report header/footer.

The checkout button is intentionally a placeholder. OpenAI API keys pay for AI requests; they cannot process customer payments. Connect a payment provider through a server-side checkout function before offering paid plans.
