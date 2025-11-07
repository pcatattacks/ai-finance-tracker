# AI-Powered Personal Finance Guru: App Prototyping with AI Code Generation

## Product Description

An AI-driven personal finance companion that ingests credit card statements and CSV files, automatically categorizes spending, visualizes financial history, and provides actionable, privacy-first recommendations to help users optimize their money habits. Users can set goals, receive spending alerts, and track trends over time—achieving a clear, trustworthy view of their finances with minimal friction.

Key objectives:

* Reduce onboarding friction: simple sign-in and instant value from the first upload

* Deliver clarity: accurate auto-categorization and intuitive, explainable insights

* Encourage action: timely alerts, goals, and personalized coaching

* Build trust: transparent data usage, strong privacy defaults, and user control

Primary interactions:

* Secure sign-in and profile setup

* Statement/CSV file upload and parsing

* Auto-categorization of transactions with confidence scoring

* Spend visualization (timelines, categories, merchants)

* Digestible insights and recommendations

* Category management and rules

* Alerts and notifications configuration

* Goal creation and habit coaching

Success metrics (examples):

* Time-to-first-insight: < 30 seconds after first upload

* Auto-categorization accuracy: > 90% with feedback loops

* Monthly active users with goals: > 50%

* Alert engagement rate: > 25%

Supported inputs (initial):

* CSV exports from major banks and aggregators

* OFX/QFX/QBO where available

* PDF statements via OCR

* Optional: Bank connection via aggregator (e.g., Plaid) for automated sync

Non-goals (initial MVP):

* Investment portfolio analysis and tax optimization

* Full accounting features

Privacy and trust:

* Clear consent, user data ownership, and granular controls

* Explainable insights with references to transactions and categories

* Secure storage and transport for documents and PII

## Deisgn and Theme

* Design system: shadcn/ui with Tailwind CSS and Radix UI primitives for accessibility and consistent patterns

* Visual language: modern, clean, calm aesthetic to foster trust and reduce cognitive load

* Color schemes:

  * Primary: forest green (#0E7C66) and teal accents (#20A39E) for finance positivity

  * Neutrals: cool gray palette for backgrounds and surfaces

  * Alert colors: semantic red/amber/green for risk, warnings, and success

* Typography: Inter (primary), optional fallback: system UI

* Layout: card-based dashboards, generous white space, consistent spacing scale

* Data viz: Recharts or Nivo with accessible color palettes and annotations for interpretability

* Light/Dark mode: supported via next-themes, sync to OS preference with manual override

* Components to standardize:

  * App shell: responsive navbar, sidebar, and content area with sticky summary header

  * Upload module: drag-and-drop zone with progress, validation, and error states

  * Charts: category donut, cashflow line, merchant bar chart, MoM heatmap

  * Tables: transactions with inline editing, filters, and bulk actions

  * Forms: wizards for onboarding, alerts, rules, and goals (with inline validation)

  * Banners: insights and contextual education hints

  * Empty states: friendly, instructional, and action-driven

* Accessibility: WCAG 2.1 AA targets, keyboard navigability, focus states, and semantic landmarks

## Required Development Stack

Recommended baseline (flexible to preferences):

Dev experience:

* Monorepo optional; default single Next.js app

* GitHub Actions for CI: lint (ESLint), typecheck, test, build, preview deploy

* Code quality: Prettier, commitlint, and Husky hooks

* Performance budget: LCP < 2.5s, TTI < 3s on mid-tier devices

## Application Backend Requirements

Authentication and authorization:

* Providers: Clerk (default) for email/password + OAuth (Google, Apple); MFA optional

* Sessions: short-lived JWT with rotating refresh, HTTP-only cookies

* RBAC: user, admin (support); per-tenant isolation if teams introduced later

* PII protection: encrypt at rest (KMS), minimize scopes to third parties

Database schema (high level):

* users: id, email, name, onboarding_state, preferences, created_at

* accounts: id, user_id, institution, account_type, last_sync_at

* documents: id, user_id, storage_key, file_name, file_type, source, status, uploaded_at

* transactions: id, user_id, account_id, date, amount, currency, merchant_raw, merchant_normalized, description, category_id, subcategory_id, is_transfer, confidence, metadata (JSONB), source_doc_id, hash

* categories: id, user_id (nullable for global defaults), name, parent_id, rules (JSONB), icon

* insights: id, user_id, type, title, body, severity, references (JSONB), created_at

* goals: id, user_id, type (budget/savings/debt), target_amount, period, category_id (nullable), start_date, end_date, status, progress

* alerts: id, user_id, type, threshold, category_id (nullable), channel (email/push), active

* rules: id, user_id, rule_type (merchant/description/amount/date), pattern, action (set_category/flag/ignore), priority, enabled

* audit_logs: id, user_id, actor, action, entity_type, entity_id, changes (JSONB), timestamp

* embeddings (optional): id, user_id, term, vector, metadata (JSONB)

Document upload and parsing pipeline:

1. Upload: client to storage with signed URL; antivirus scan (ClamAV) if available

2. Extraction:

  * CSV: strict header mapping; delimiter detection; schema validation

  * OFX/QFX/QBO: parse via OFX library; normalize fields

  * PDF: OCR for scanned docs; text extraction; line-item heuristic parsing

3. Normalization: standardize dates, amounts, currencies, time zones; compute transaction hash to dedupe

4. Enrichment: merchant normalization (string cleanup + embeddings similarity), MCC mapping if available

5. Categorization:

  * Rule engine pass (user-defined rules, merchant heuristics)

  * AI classification with confidence scoring

  * Fallback to “Uncategorized” when low confidence

6. Post-processing: persist, index, recompute aggregates; emit events for insights

AI-driven categorization and insights:

* Category taxonomy: essentials (housing, groceries, utilities), transport, dining, shopping, health, subscriptions, entertainment, travel, income, transfers

* Classification model: system prompt with examples; few-shot by category; temperature \~0–0.3; include merchant, description, amount, date context

* Confidence and explainability: store rationale with a short “because” note and references to training examples

* Feedback loop: user corrections create rules; model is reinforced by capturing corrected pairs for future few-shot contexts

* Insights engine:

  * Spending trends: MoM change, rolling averages

  * Outliers: unusual spend vs. typical range

  * Subscriptions: recurring detection by interval pattern and merchant signature

  * Savings opportunities: fee detection, duplicate charges, category optimization

  * Goals progress: pace vs. target; nudge recommendations

* Interpretability standards:

  * Every recommendation includes: why it was generated, supporting data (e.g., last 90 days), and suggested next step

Visual analytics and aggregation:

* Time series: daily/weekly/monthly rollups, cumulative views

* Category breakdowns: proportions, top merchants, cashflow waterfalls

* Benchmarks: compare vs. user’s past averages (never cross-user by default)

* Export: CSV/JSON export of transactions and insights

Security, privacy, and compliance:

* Transport: TLS 1.2+; HSTS; same-site cookie policies

* Data at rest: encryption (KMS-managed keys), per-tenant key scoping where possible

* Secrets: environment variables via Vercel + Doppler/1Password; no secrets in repo

* Access: audit logs for sensitive actions; IP and device metadata (privacy-preserving)

* Deletion: hard-delete user data upon request with background shred for docs

* Compliance posture: GDPR-ready (consent, export, delete); SOC 2 alignment practices

API surface (RESTful, versioned: /api/v1):

* Auth: handled by provider; session endpoints minimal

* Documents: POST /documents (initiate upload), GET /documents/:id, GET /documents

* Transactions: GET /transactions, GET /transactions/:id, PATCH /transactions/:id, POST /transactions/bulk

* Categories: GET/POST/PATCH/DELETE /categories

* Insights: GET /insights, POST /insights/regenerate

* Goals: CRUD /goals

* Alerts: CRUD /alerts

* Rules: CRUD /rules, POST /rules/apply

* Analytics: GET /analytics/summary, /analytics/timeseries, /analytics/categories

* Webhooks: POST /webhooks/ingest (parser events), /webhooks/provider (e.g., Plaid)

Background jobs:

* Queue for parsing, categorization, insights, alert evaluation, email digests

* Schedules: daily subscriptions scan, weekly insights digest, month-end summaries

* Rate limiting: per-user and per-IP with sliding window (Upstash Redis)

## Explicitly Defined Product Flows

1. Onboarding

  * User signs up (OAuth or email) and accepts terms/privacy

  * Quick preferences: currency, country, dark/light mode

  * Guided tour (optional): overview of upload, insights, and goals

2. File Upload

  * Drag-and-drop or mobile file picker

  * Real-time validation and progress display

  * On success, background job begins parsing; user sees “Parsing…” status with ETA

  * On completion, user is notified and redirected to first dashboard

3. First “I Win” Moment

  * Within 30 seconds: show categorized spend summary for last 1–3 months

  * Highlights: top 3 categories, recent spikes, detected subscriptions

  * One-click actions: fix category, set budget, create alert

4. Spend Visualization

  * Dashboard: cashflow line chart, category donut, merchant leaderboard

  * Filters: date range, accounts, categories, min/max amount, status (review needed)

  * Drill-down: open category to see merchants and transactions; inline edits

5. Insight Delivery

  * Sidebar panel with latest insights and confidence level

  * Each insight includes “why” and links to supporting transactions

  * Actions: mark helpful, snooze, or create rule/goal from insight

6. Category Management

  * Edit category on a transaction; optional rule creation (“always categorize X as Y”)

  * Bulk recategorization via filters

  * Manage taxonomy: add custom categories/subcategories

7. Alerts and Notifications

  * Prebuilt alerts: large transaction, unusual spend, budget threshold, subscription renewal

  * Channels: email and web push; quiet hours and frequency controls

  * Preview: sample notification before saving

8. Goal Creation

  * Goal types: category budget, savings target, debt payoff milestone

  * Configure amount, period, and start date; connect to categories where relevant

  * Progress tracking: pace vs. goal; contextual nudges

9. Habit Coaching

  * Weekly digest with behavior-oriented suggestions

  * Gentle, non-judgmental tone; actionable tips with estimated impact

  * Track completed actions and improvement over time

10. Data Export and Ownership

* Export transactions, categories, and insights as CSV/JSON

* Manage privacy: delete account/data; revoke connections

Acceptance criteria examples:

* Uploading a valid CSV produces categorized transactions and at least 3 insights

* User can recategorize and see updated charts within 2 seconds

* Alerts trigger based on thresholds within 5 minutes of new data

* Goals show progress and notify when at risk mid-period

## Explicit Directions for AI Generation

Scaffold requirements:

* Pages/routes

  * / (dashboard with summary charts and latest insights)

  * /upload (document ingestion and status)

  * /transactions (table with filters, inline category edit, bulk actions)

  * /categories (taxonomy and rules management)

  * /insights (history with filters and actions)

  * /goals (create/edit goals and track progress)

  * /alerts (create/edit notification rules)

  * /settings (profile, preferences, privacy, export)

* Components

  * UploadDropzone, DocumentStatusCard, TransactionTable, CategoryPicker, RuleBuilder

  * InsightCard with “why” tooltip and action buttons

  * Charts: CashflowLineChart, CategoryDonutChart, MerchantBarChart, HeatmapMoM

  * GoalProgressCard, AlertEditor, BudgetProgressBar

  * EmptyState, Skeletons, Pagination, DateRangePicker

* State management

  * TanStack Query for server state; optimistic updates for edits

  * Global theme + preferences context; URL-synced filters

Backend scaffolding:

* ORM models matching schema with Prisma and migrations

* REST endpoints listed above with input validation (Zod) and error normalization

* Background job handlers for parsing, categorization, insights, alerts

* Webhook endpoints and signature verification

* Eventing: emit domain events (document.parsed, transactions.created, insights.generated)

AI and parsing specifics:

* Parsing

  * CSV: infer delimiter, map common headers (date, description, merchant, amount), allow column mapping UI

  * PDF: OCR fallback; regex/heuristics to extract date, merchant, amount; store parser provenance for debugging

* Categorization prompt structure

  * System: “You assign spending categories using provided taxonomy; return category, subcategory, confidence (0–1), and brief explanation.”

  * Provide taxonomy and 5–10 few-shot examples per common category; lean deterministic (temperature 0–0.2)

  * Return JSON-like object; enforce schema in server with validation and fallback

* Merchant normalization

  * Cleaning rules (remove store numbers, transaction codes)

  * Embeddings similarity against known merchants via pgvector

  * Confidence threshold for acceptance; otherwise show candidate suggestions

* Recommendations generation

  * Use recent 90-day window + user preferences

  * Each recommendation must include: impact estimate (low/med/high), rationale, and 1-click next action (create budget/alert/rule)

Security, privacy, and compliance:

* Use server-side model calls only; never send PII from the client directly to model APIs

* Redact sensitive fields before model input; restore context after classification via IDs

* Log minimal model prompts and responses; allow user to opt out of analytics

* Implement rate limiting and abuse protection on all public endpoints

DX and quality:

* Environment variables (examples): DATABASE_URL, AUTH_SECRET, STORAGE_BUCKET, VECTOR_DB_URL, OPENAI_API_KEY/ANTHROPIC_API_KEY, RESEND_API_KEY, SENTRY_DSN

* Tests: unit (parsers, rules), integration (API endpoints), e2e (Cypress/Playwright for key flows)

* Seed script: demo user, 200 sample transactions across categories, 10 insights, 2 goals, 3 alerts

* Performance: cache analytics queries (e.g., KV) and precompute rollups on ingest

* Accessibility and internationalization: i18n-ready copy; currency/locale-aware formatting

* Telemetry dashboards: error rate, upload success rate, parsing accuracy, categorization confidence distribution

Tone and UX principles for AI outputs:

* Respectful, non-judgmental, encouraging

* Specific, interpretable, and actionable

* Privacy-first: explain data use briefly and point to controls

* Transparent: show confidence and allow corrections that improve future results