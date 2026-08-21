# Analyze website function

Deploy with Supabase CLI from the project root:

```sh
supabase functions deploy analyze-website
supabase secrets set FIRECRAWL_API_KEY=... OPENAI_API_KEY=...
```

The browser calls this function with a JSON body containing `url`. Secrets remain in the Edge Function environment and are never shipped to the browser.
