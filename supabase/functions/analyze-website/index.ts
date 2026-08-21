const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const analysisSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    page_title: { type: "string" },
    page_description: { type: "string" },
    executive_summary: { type: "string" },
    key_points: { type: "array", items: { type: "string" } },
    key_topics: { type: "array", items: { type: "string" } },
    target_audience: { type: "string" },
    products_or_services: { type: "array", items: { type: "string" } },
    important_information: { type: "array", items: { type: "string" } },
    headings: { type: "array", items: { type: "string" } },
  },
  required: ["page_title", "page_description", "executive_summary", "key_points", "key_topics", "target_audience", "products_or_services", "important_information", "headings"],
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const payload = await request.json();
    const url = typeof payload?.url === "string" ? payload.url.trim() : "";
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error();
    } catch {
      return json({ error: "Please enter a valid public webpage URL." }, 400);
    }

    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    if (!firecrawlKey || !openAiKey) return json({ error: "Live analysis is not configured yet." }, 503);

    const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: { "Authorization": `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url: parsedUrl.toString(), formats: ["markdown", "links"], onlyMainContent: true }),
    });
    if (!scrapeResponse.ok) return json({ error: "That webpage could not be read right now." }, 502);
    const scrapeResult = await scrapeResponse.json();
    const page = scrapeResult?.data ?? scrapeResult;
    const markdown = typeof page?.markdown === "string" ? page.markdown.slice(0, 50000) : "";
    if (!markdown) return json({ error: "No readable content was found on that webpage." }, 422);

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${openAiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_schema", json_schema: { name: "webpage_analysis", strict: true, schema: analysisSchema } },
        messages: [
          { role: "system", content: "You analyse webpage content for a research tool. Use only the supplied webpage. Never invent facts. If something is unavailable, say Not found on the webpage." },
          { role: "user", content: `Analyse this webpage and return structured intelligence. Source URL: ${parsedUrl}\n\nPAGE CONTENT:\n${markdown}` },
        ],
      }),
    });
    if (!aiResponse.ok) return json({ error: "The webpage was read, but its analysis could not be completed." }, 502);
    const aiResult = await aiResponse.json();
    const content = aiResult?.choices?.[0]?.message?.content;
    if (!content) return json({ error: "The analysis returned no usable insights." }, 502);

    const analysis = JSON.parse(content);
    return json({ ...analysis, domain: parsedUrl.hostname, url: parsedUrl.toString(), links: Array.isArray(page?.links) ? page.links.slice(0, 100) : [] });
  } catch {
    return json({ error: "Something went wrong while analysing that webpage." }, 500);
  }
});
