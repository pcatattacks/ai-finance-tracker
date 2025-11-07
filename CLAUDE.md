# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-Powered Personal Finance Guru: A privacy-first personal finance companion that automatically categorizes spending from uploaded statements, provides AI-driven insights, and helps users optimize their money habits through goals, alerts, and personalized coaching.

**Status**: Early stage project with comprehensive PRD in place. No code implementation yet.

## Tech Stack (from PRD)

**Frontend**:
- Next.js with TypeScript
- shadcn/ui components with Tailwind CSS and Radix UI primitives
- TanStack Query for server state
- Recharts or Nivo for data visualization
- next-themes for light/dark mode
- Clerk for authentication

**Backend**:
- Next.js API routes (RESTful, versioned: /api/v1)
- Prisma ORM with PostgreSQL
- pgvector for merchant embeddings
- Background job queue for parsing and categorization
- Upstash Redis for rate limiting and caching

**AI/ML**:
- Claude or GPT-4 for transaction categorization (temperature 0-0.2 for deterministic results)
- Embeddings for merchant normalization
- Confidence scoring and explainability for all AI outputs

## Core Database Schema

Key tables (see PRD.md lines 136-158 for complete schema):
- `users`: user profiles and onboarding state
- `accounts`: financial institution connections
- `documents`: uploaded files and parsing status
- `transactions`: normalized transaction records with category, confidence, and deduplication hash
- `categories`: hierarchical taxonomy (global defaults + user customizations)
- `insights`: AI-generated recommendations with severity and references
- `goals`: budgets, savings targets, debt payoff tracking
- `alerts`: configurable spending notifications
- `rules`: user-defined categorization and action rules
- `audit_logs`: security and compliance tracking
- `embeddings`: merchant name normalization via vector similarity

## Document Processing Pipeline

Multi-stage pipeline (PRD.md lines 159-184):
1. **Upload**: Signed URLs to storage, antivirus scan
2. **Extraction**: CSV header mapping, OFX parsing, PDF OCR
3. **Normalization**: Date/amount standardization, transaction hash for deduplication
4. **Enrichment**: Merchant name cleanup and embeddings-based normalization
5. **Categorization**: Rule engine → AI classification with confidence → fallback to "Uncategorized"
6. **Post-processing**: Persist, recompute aggregates, emit events for insights

## AI Categorization Guidelines

**Category Taxonomy** (PRD.md line 187):
Essentials (housing, groceries, utilities), transport, dining, shopping, health, subscriptions, entertainment, travel, income, transfers

**Classification Approach** (PRD.md lines 189-194):
- System prompt with few-shot examples (5-10 per category)
- Input context: merchant, description, amount, date
- Temperature: 0-0.3 for determinism
- Output: category, subcategory, confidence (0-1), brief explanation
- User corrections create rules and reinforce future classifications

**Privacy and Security** (PRD.md lines 440-447):
- Server-side model calls only, never send PII from client
- Redact sensitive fields before model input
- Minimal logging with user opt-out
- Rate limiting on all public endpoints

## Key Product Flows

1. **Onboarding**: OAuth/email signup → preferences → guided tour → first upload (PRD.md lines 267-274)
2. **First "I Win" Moment**: Categorized spend summary within 30 seconds of upload (PRD.md lines 285-292)
3. **Spend Visualization**: Cashflow timeline, category breakdown, merchant leaderboard with filters (PRD.md lines 294-300)
4. **Insight Delivery**: Sidebar panel with explainable recommendations and one-click actions (PRD.md lines 302-308)
5. **Category Management**: Inline edits, bulk recategorization, rule creation (PRD.md lines 310-316)

## Required Pages and Components

**Pages** (PRD.md lines 361-378):
- `/` - Dashboard with charts and insights
- `/upload` - Document ingestion with real-time status
- `/transactions` - Filterable table with inline category editing
- `/categories` - Taxonomy and rules management
- `/insights` - History with filters and actions
- `/goals` - Goal creation and progress tracking
- `/alerts` - Notification rule configuration
- `/settings` - Profile, preferences, privacy, data export

**Key Components** (PRD.md lines 380-390):
- UploadDropzone, DocumentStatusCard, TransactionTable, CategoryPicker, RuleBuilder
- InsightCard with "why" tooltip and action buttons
- Charts: CashflowLineChart, CategoryDonutChart, MerchantBarChart, HeatmapMoM
- GoalProgressCard, AlertEditor, BudgetProgressBar
- EmptyState, Skeletons, Pagination, DateRangePicker

## Design System

**Colors** (PRD.md lines 75-82):
- Primary: forest green (#0E7C66) and teal accents (#20A39E)
- Neutrals: cool gray palette
- Semantic: red/amber/green for risk/warnings/success

**Typography**: Inter font family with system fallback

**Layout**: Card-based dashboards, generous white space, consistent spacing scale

**Accessibility**: WCAG 2.1 AA compliance, keyboard navigation, focus states

## Environment Variables

Required (PRD.md line 451):
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - Clerk authentication
- `STORAGE_BUCKET` - Document storage
- `VECTOR_DB_URL` - pgvector connection
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` - AI categorization
- `RESEND_API_KEY` - Email notifications
- `SENTRY_DSN` - Error tracking

## Development Workflow

**Code Quality** (PRD.md line 119):
- ESLint for linting
- Prettier for formatting
- commitlint for commit conventions
- Husky for pre-commit hooks

**Testing** (PRD.md line 454):
- Unit tests: parsers, rule engine
- Integration tests: API endpoints with Zod validation
- E2E tests: Cypress or Playwright for critical flows (upload → categorization → insight generation)

**Performance Budget** (PRD.md line 122):
- LCP < 2.5s
- TTI < 3s on mid-tier devices
- Cache analytics queries in KV store
- Precompute rollups on transaction ingest

## Seed Data (PRD.md line 455)

Demo dataset should include:
- 1 demo user with preferences
- 200 sample transactions across all categories
- 10 insights (trends, outliers, subscriptions, savings opportunities)
- 2 goals (e.g., dining budget, emergency fund)
- 3 alerts (e.g., large transaction, unusual spend, subscription renewal)

## Success Metrics

**Key Targets** (PRD.md lines 36-44):
- Time-to-first-insight: < 30 seconds after upload
- Auto-categorization accuracy: > 90% (with user feedback loops)
- Monthly active users with goals: > 50%
- Alert engagement rate: > 25%

## Tone for AI-Generated Outputs

When generating insights and recommendations (PRD.md lines 463-471):
- Respectful, non-judgmental, encouraging
- Specific, interpretable, and actionable
- Privacy-first: explain data use and provide controls
- Transparent: show confidence levels and allow corrections
