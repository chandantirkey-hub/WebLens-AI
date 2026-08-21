# WebLens AI — AI-Powered Website Content Intelligence Tool

## Role

Act as a senior product designer, UX designer and full-stack AI application developer helping a beginner build a functional hackathon MVP.

I am participating in a 48-hour AI hackathon. I have limited technical knowledge, so explain technical decisions in simple language and build the application incrementally. Do not over-engineer the solution.

The application must be stable, visually impressive, easy to demonstrate and practical for a live hackathon presentation.

---

# 1. Product

Build an application called:

**WebLens AI**

### Tagline

**Turn any public webpage into structured, searchable intelligence.**

### Core Value Proposition

WebLens AI allows users to enter a public webpage URL and automatically:

**Scrape → Understand → Summarise → Structure → Ask → Save**

The product should feel like an AI-powered research assistant rather than a basic website scraper.

---

# 2. Problem

Users often spend significant time manually:

- Reading webpages
- Identifying important information
- Copying headings
- Extracting links
- Summarising content
- Identifying key topics
- Organising research
- Saving information for later use

WebLens AI should automate this process.

---

# 3. Target Users

Primary users:

- Researchers
- Students
- Consultants
- Business professionals
- Entrepreneurs
- Analysts

---

# 4. Core User Journey

The primary workflow must be:

1. User visits WebLens AI.
2. User can first explore sample analyses.
3. User can enter a public webpage URL.
4. User clicks **Analyse Website**.
5. The application validates the URL.
6. The backend sends the URL securely to Firecrawl.
7. Firecrawl extracts webpage content, metadata, headings and links.
8. The extracted content is sent to OpenAI.
9. OpenAI analyses the content and returns structured information.
10. The application displays the results.
11. User can ask questions about the webpage.
12. User can save the research.
13. Saved research is stored in Supabase.
14. User can later view and search saved research.

---

# 5. Technology Stack

### Frontend

- Bolt

### Backend / Database

- Supabase
- Supabase Edge Functions

### Web Scraping

- Firecrawl API

### AI

- OpenAI API

### Version Control

- GitHub if required

Do not introduce additional technologies unless genuinely necessary.

---

# 6. Security Requirement

Never expose Firecrawl or OpenAI secret API keys in frontend/browser code.

Use Supabase Edge Functions as the secure server-side layer for calls to:

- Firecrawl
- OpenAI

Store API keys as secure environment variables/secrets.

Never display API keys, backend errors, stack traces or sensitive technical information to users.

---

# 7. NEW FEATURE — Sample Analyses on the Website

The website must contain a dedicated section allowing visitors to see **5–10 sample website analyses before using the tool**.

The purpose is to immediately demonstrate what WebLens AI can do.

## Sample Section

Add a prominent section on the landing page:

### "See WebLens AI in Action"

or:

### "Explore Sample Website Intelligence"

Display between **5 and 10 sample analyses**.

Each sample should be displayed as a clean card containing:

- Website/domain name
- Page title
- Short AI-generated summary
- 3–5 key points
- Key topics
- Number of links extracted
- "View Analysis" button

Example card:

**Sample Website**

Website: example.com

**Page:** About Us

**AI Summary:**

Short summary of the webpage.

**Key Topics:**

[Technology] [Innovation] [Business]

**Key Points:**

• Point 1  
• Point 2  
• Point 3

[View Full Analysis]

---

# 8. Sample Data Requirements

The 5–10 sample analyses should be available immediately when the website loads.

The samples should NOT require a Firecrawl API call every time.

Use preloaded/static demo data for the sample section to:

- Avoid unnecessary API usage
- Make the website load quickly
- Ensure the hackathon demo works even if an external API temporarily fails
- Allow visitors to understand the product immediately

Clearly label these records:

**"Demo Analysis"**

or

**"Sample Analysis"**

Do not present static sample data as if it was just scraped live.

The sample data should demonstrate different types of webpages.

Prefer a mixture such as:

1. Business/company webpage
2. Government/public information webpage
3. Educational webpage
4. Technology webpage
5. Product/service webpage
6. News/information webpage
7. Research/institutional webpage
8. NGO/development webpage

Use publicly accessible websites where appropriate.

If actual live URLs are used as examples, clearly identify them as sample/demo analyses.

---

# 9. Sample Analysis Detail Page

When the visitor clicks:

**View Analysis**

show the same type of detailed analysis that would be generated for a live URL.

Display:

### Website Overview

- Website name
- Page title
- URL
- Description
- Analysis type: Demo Analysis

### AI Summary

Concise summary.

### Key Points

5–7 key points.

### Key Topics

Display as tags.

### Target Audience

Identify the intended audience where information is available.

### Products / Services

Display important products or services mentioned.

### Page Structure

Display important headings.

### Important Links

Display useful links.

### Ask This Webpage

Allow the user to ask questions about the sample content.

The AI answers must be based only on the sample content.

---

# 10. NEW FEATURE — Free Trial / Free Website Analyses

Visitors must be able to test WebLens AI without creating an account initially.

Provide:

## **5 Free Website Analyses**

The exact number may be configured between **3 and 5**, but default to:

### **5 free analyses per visitor**

Display prominently on the landing page:

> **Try WebLens AI — 5 Free Website Analyses**

or:

> **Analyse 5 Websites Free — No Login Required**

---

# 11. Free Trial Rules

A visitor can enter a public webpage URL and receive a complete analysis.

The free usage counter should track the number of analyses performed.

Example:

**Free analyses remaining: 5**

After one analysis:

**Free analyses remaining: 4**

Continue until:

**Free analyses remaining: 0**

When the visitor reaches the limit, display:

> **You've used your 5 free analyses. Sign in or create an account to continue analysing websites.**

For the hackathon MVP, a simple browser/device-based usage counter may be used.

Do not claim that this is a secure production-grade quota system.

Design the architecture so that it can later be replaced by proper authenticated usage tracking.

---

# 12. Free Trial UX

Display the remaining free analyses clearly but unobtrusively.

Example:

**5 free analyses available**

After analysis:

**4 free analyses remaining**

Add a progress indicator if appropriate.

Do not interrupt the user with unnecessary registration requirements before they experience the product.

The objective is:

**Discover → Try → Experience Value → Save → Sign Up**

---

# 13. Optional Login Conversion

When the free analyses are exhausted, offer:

### "Create Free Account"

Allow registered users to:

- Save research
- Search research
- Revisit previous analyses
- Continue using the application subject to configured limits

Authentication may be implemented if time permits.

Do not allow authentication development to delay the core scraping and AI workflow.

---

# 14. Landing Page

Create a clean, modern and professional SaaS-style landing page.

The landing page should contain:

## Hero Section

**WebLens AI**

**Turn any public webpage into structured, searchable intelligence.**

Short explanation:

> Enter a webpage URL and let AI extract, understand, summarise and organise the information in seconds.

Primary button:

**Analyse a Website**

Secondary button:

**Explore Samples**

Display:

**5 Free Website Analyses**

---

# 15. Landing Page Structure

Recommended order:

1. Hero section
2. URL input and Analyse Website button
3. Free analysis counter
4. How WebLens AI Works
5. Sample Website Analyses
6. Key capabilities
7. Ask This Webpage demonstration
8. Save & Search Research
9. Call to action

---

# 16. How It Works Section

Display the four major steps visually:

### 1. Enter URL

Paste a public webpage URL.

### 2. Scrape

Firecrawl extracts the useful webpage content.

### 3. Understand

OpenAI analyses and structures the content.

### 4. Save

Supabase stores the research for later use.

Use simple icons and short explanations.

---

# 17. URL Input

Provide:

**Website URL**

Input field:

`https://example.com`

Button:

**Analyse Website**

Also provide example URLs or clickable sample URLs to help first-time users.

---

# 18. URL Validation

Validate:

- URL exists
- URL uses http or https
- URL is syntactically valid
- URL is publicly accessible where possible

Show friendly error messages.

Example:

> Please enter a valid public webpage URL.

---

# 19. Scraping

Send the URL securely to Firecrawl.

Request useful webpage information including:

- Main content
- Markdown
- Links
- Metadata
- Title
- Description

Prefer the main webpage content and avoid unnecessary navigation/footer content where possible.

---

# 20. AI Analysis

Send the scraped content to OpenAI.

Return structured information containing:

- page_title
- page_description
- executive_summary
- key_points
- key_topics
- target_audience
- products_or_services
- important_information
- important_links

The AI must use only information contained in the scraped webpage.

Never invent facts.

If information is unavailable, return:

**"Not found on the webpage."**

---

# 21. Results Page

Display:

## Website Overview

- Title
- URL
- Description
- Date analysed
- Analysis status: Live Analysis

## AI Summary

Concise summary.

## Key Points

5–7 important points.

## Key Topics

Display as tags.

## Target Audience

Display the audience identified from the webpage.

## Products / Services

List important products/services mentioned.

## Page Structure

Display important headings.

## Important Links

Display useful links extracted from the webpage.

---

# 22. Ask This Webpage

Provide an input box:

**"Ask anything about this webpage..."**

Example questions:

- What is this webpage mainly about?
- Who is the target audience?
- What products or services are mentioned?
- What are the three most important points?
- What information is missing?
- What are the key topics discussed?

Answers must be based only on the scraped webpage content.

If the answer is not available in the source content, clearly say so.

---

# 23. Save Research

Add:

**Save Research**

Saved records should include:

- URL
- title
- scraped content
- summary
- key points
- topics
- links
- analysis date
- user ID where authentication is enabled

If authentication is not implemented in the initial MVP, allow demo/local saving only where appropriate and clearly communicate the limitation.

---

# 24. My Research

Create a page showing saved webpages.

Allow users to:

- Search saved pages
- Open a saved research record
- Delete a record
- Revisit the source URL

---

# 25. Loading State

While analysing a webpage, show a clear progress interface:

1. Validating URL
2. Reading webpage
3. Extracting content
4. Analysing with AI
5. Preparing insights
6. Complete

Do not falsely imply that each stage is a separate real-time API call if it is not.

The interface should communicate progress without misleading the user.

---

# 26. Usage and Error Handling

Handle:

- Invalid URL
- Empty URL
- Firecrawl failure
- Website inaccessible
- OpenAI failure
- Timeout
- Empty webpage
- API rate limit
- Database failure
- Free analysis limit reached

Show simple human-readable messages.

Never expose API keys, stack traces or sensitive backend information.

---

# 27. Database

Create a Supabase table called:

`scraped_pages`

Suggested fields:

- id
- user_id
- url
- title
- description
- content
- headings
- links
- summary
- key_points
- key_topics
- target_audience
- products_services
- created_at

Use appropriate data types.

If authentication is enabled, configure Row Level Security so users can access only their own saved research.

---

# 28. Free Usage Tracking

For the hackathon MVP, create a simple mechanism to track free analyses.

Possible approach:

- Generate/store a browser/device identifier
- Store the number of analyses used
- Allow maximum 5 analyses
- Prevent additional free analyses after the limit

The implementation must be clearly documented as a hackathon MVP approach and should not be represented as production-grade fraud prevention.

Do not unnecessarily collect personal information.

---

# 29. Design

Use a modern, clean and professional SaaS-style interface.

The design should communicate:

- Research
- Intelligence
- Simplicity
- Trust
- AI

Use clear cards, sections, icons and visual hierarchy.

Avoid excessive animations.

Make the application responsive for desktop and mobile.

Prioritise usability over visual complexity.

---

# 30. Important Product Principle

Do not make the application merely a "web scraper".

The product should feel like:

**Website → Understanding → Intelligence → Memory**

The core value proposition is that the user does not merely receive scraped webpage content; they receive useful structured understanding of that content.

The sample analyses and free trial should help visitors understand this value immediately.

---

# 31. Hackathon Demo Requirements

The application must support a compelling live demonstration.

The recommended demo sequence is:

### Step 1

Open WebLens AI landing page.

### Step 2

Show the 5–10 sample analyses.

### Step 3

Open one sample and demonstrate the structured AI insights.

### Step 4

Return to the homepage.

### Step 5

Enter a real public webpage URL.

### Step 6

Click:

**Analyse Website**

### Step 7

Show:

- Scraped information
- AI summary
- Key points
- Topics
- Important links

### Step 8

Ask the webpage a question.

### Step 9

Save the research.

### Step 10

Open My Research.

This complete journey should work reliably without manual intervention.

---

# 32. Future Features — Do Not Build Unless Time Allows

Keep these as future roadmap items:

- Compare two webpages
- Crawl an entire website
- Website change monitoring
- Scheduled re-scraping
- PDF report generation
- Export to CSV
- Share research
- Browser extension
- Team workspaces
- Advanced user subscriptions
- Usage-based paid plans
- Advanced authentication
- Production-grade anti-abuse controls

Do not allow these features to delay the core MVP.

---

# 33. Development Approach

Build incrementally.

### Stage 1

Create the frontend and navigation.

### Stage 2

Create the landing page and sample analyses.

### Stage 3

Create the URL input and free trial counter.

### Stage 4

Connect Supabase.

### Stage 5

Implement Firecrawl.

### Stage 6

Implement OpenAI.

### Stage 7

Connect the complete live workflow.

### Stage 8

Implement saving.

### Stage 9

Implement Ask This Webpage.

### Stage 10

Test free usage limits and error conditions.

### Stage 11

Polish the UI.

After each major step, test the application.

Do not make large architectural changes without explaining why.

---

# 34. Hackathon Success Criteria

The final MVP must demonstrate this complete working flow:

**Explore Samples → Enter URL → Analyse → Scrape → AI Analyse → Display Insights → Ask Question → Save → Retrieve Later**

The application must also demonstrate:

**5 Free Website Analyses**

before requiring registration or further access.

The application should be stable enough for a live hackathon demonstration.

---

# 35. Final Developer Instructions

At the end, provide:

1. A short description of the architecture.
2. List of implemented features.
3. List of API keys/secrets that need to be configured.
4. Supabase tables created.
5. Free usage mechanism implemented.
6. Number of sample analyses created.
7. Steps required to run/deploy the application.
8. Known limitations.
9. Suggested future enhancements.

Keep explanations beginner-friendly.

Do not over-engineer.

Prioritise a stable working MVP over additional features.

The highest priority is:

**A visitor must be able to understand the product from the sample analyses and then test it with up to 5 real public webpages without requiring an account.**