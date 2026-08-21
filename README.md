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

The browser counter is intentionally a hackathon-only convenience, not production quota enforcement.
