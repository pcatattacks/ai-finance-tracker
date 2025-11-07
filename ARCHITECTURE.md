# Architecture Documentation

This document explains the project structure, how files interact, and data flow patterns in the Finance Guru application.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Core Concepts](#core-concepts)
3. [File Purposes](#file-purposes)
4. [Data Flow](#data-flow)
5. [Key Interactions](#key-interactions)

## Project Structure

\`\`\`
ai-finance-tracker/
├── app/                          # Next.js App Router - All pages and routes
│   ├── layout.tsx                # Root layout (wraps entire app)
│   ├── page.tsx                  # Dashboard (home page at /)
│   ├── globals.css               # Global styles and CSS variables
│   ├── api/                      # Backend API endpoints
│   │   └── transactions/
│   │       └── route.ts          # GET/POST /api/transactions
│   ├── upload/
│   │   └── page.tsx              # Upload page (/upload)
│   ├── transactions/
│   │   └── page.tsx              # Transactions list (/transactions)
│   ├── categories/
│   │   └── page.tsx              # Category management (/categories)
│   ├── insights/
│   │   └── page.tsx              # AI insights (/insights)
│   ├── goals/
│   │   └── page.tsx              # Financial goals (/goals)
│   ├── alerts/
│   │   └── page.tsx              # Alert configuration (/alerts)
│   └── settings/
│       └── page.tsx              # User settings (/settings)
│
├── components/                   # Reusable React components
│   ├── ui/                       # Base UI components (shadcn/ui)
│   │   ├── button.tsx            # Button component
│   │   ├── card.tsx              # Card container component
│   │   ├── input.tsx             # Text input component
│   │   ├── label.tsx             # Form label component
│   │   ├── badge.tsx             # Badge/tag component
│   │   ├── toast.tsx             # Toast notification component
│   │   └── toaster.tsx           # Toast container
│   ├── app-shell.tsx             # Main app layout with sidebar
│   ├── theme-provider.tsx        # Dark/light theme wrapper
│   └── query-provider.tsx        # TanStack Query wrapper
│
├── lib/                          # Utility libraries and helpers
│   ├── prisma.ts                 # Prisma client instance
│   ├── utils.ts                  # Common utility functions
│   ├── parsers/                  # File parsing utilities
│   │   └── csv-parser.ts         # CSV file parser
│   └── ai/                       # AI-related functionality
│       └── categorizer.ts        # Transaction categorization AI
│
├── hooks/                        # Custom React hooks
│   └── use-toast.ts              # Toast notification hook
│
├── prisma/                       # Database schema and migrations
│   ├── schema.prisma             # Database schema definition
│   └── seed.ts                   # Database seeding script
│
├── middleware.ts                 # Next.js middleware (authentication)
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── components.json               # shadcn/ui configuration
├── package.json                  # Dependencies and scripts
├── .env.example                  # Environment variables template
└── .gitignore                    # Git ignore rules
\`\`\`

## Core Concepts

### 1. App Router (Next.js 15)

Next.js uses a file-based routing system where folders in \`app/\` become routes:

- \`app/page.tsx\` → \`/\` (home/dashboard)
- \`app/upload/page.tsx\` → \`/upload\`
- \`app/transactions/page.tsx\` → \`/transactions\`

### 2. Server vs Client Components

- **Server Components** (default): Run on the server, can access database directly
- **Client Components** (marked with \`"use client"\`): Run in browser, have access to hooks and state

Examples:
- \`app/page.tsx\` → Server component (no interactivity needed)
- \`app/upload/page.tsx\` → Client component (needs file upload state)

### 3. API Routes

API routes handle backend logic:
- Located in \`app/api/\`
- Export functions named after HTTP methods: \`GET\`, \`POST\`, \`PUT\`, \`DELETE\`
- Return \`NextResponse\` objects

### 4. Database Access

- **Prisma ORM** manages database operations
- Schema defined in \`prisma/schema.prisma\`
- Client accessed via \`lib/prisma.ts\` (singleton pattern)

### 5. Authentication

- **Clerk** handles user authentication
- \`middleware.ts\` protects all routes except sign-in/sign-up
- User ID accessed via \`auth()\` function in API routes

## File Purposes

### Configuration Files

#### \`middleware.ts\`
**What it does**: Runs on every request before the page loads.

**Why we need it**: Protects routes by checking if user is authenticated. Redirects unauthenticated users to sign-in page.

**How it works**: Clerk middleware checks for valid session, allows public routes (sign-in, sign-up), blocks everything else if not authenticated.

#### \`app/layout.tsx\`
**What it does**: Root layout that wraps all pages.

**Why we need it**: Sets up providers (Clerk, TanStack Query, Theme) that all pages need.

**Components it provides**:
- ClerkProvider → Authentication context
- ThemeProvider → Light/dark mode
- QueryProvider → React Query for API calls
- Toaster → Toast notifications

#### \`lib/prisma.ts\`
**What it does**: Creates a single Prisma database client.

**Why we need it**: In development, Next.js hot reloading would create multiple database connections without this singleton pattern. This reuses the same client instance.

### Core Components

#### \`components/app-shell.tsx\`
**What it does**: Provides the sidebar navigation and header for all authenticated pages.

**Why we need it**: Creates consistent layout across all pages with navigation menu.

**Key features**:
- Responsive sidebar (collapsible on mobile)
- Navigation links with active state
- User menu with Clerk UserButton

#### \`components/ui/\*\`
**What it does**: Reusable UI components (buttons, cards, inputs, etc.)

**Why we need them**: Consistent design system across the app. Based on shadcn/ui for accessibility and best practices.

### Pages

#### \`app/page.tsx\` (Dashboard)
**What it does**: Shows financial overview with charts and insights.

**Data it displays**:
- Summary cards (total spending, monthly spending, transaction count)
- Spending charts (trends, categories)
- Recent AI insights

**Future enhancement**: Will fetch real data from API routes.

#### \`app/upload/page.tsx\`
**What it does**: Handles file uploads (CSV, PDF, OFX).

**Key features**:
- Drag-and-drop file upload (using react-dropzone)
- File validation (type, size)
- Upload progress tracking
- Processing status display

**Data flow**:
1. User drops file → \`onDrop\` function called
2. File validated → added to state
3. Upload simulated (will call API in production)
4. Success toast shown

#### \`app/transactions/page.tsx\`
**What it does**: Displays all transactions in a table.

**Key features**:
- Search and filter
- Sortable columns
- Category badges
- Confidence scores
- Inline editing (future)

**Data flow**: Will fetch from \`/api/transactions\` endpoint.

### Utilities

#### \`lib/parsers/csv-parser.ts\`
**What it does**: Parses CSV files and extracts transactions.

**Why complex**: Different banks use different CSV formats. This auto-detects columns.

**Process**:
1. Parse CSV with PapaParse library
2. Auto-detect column mappings (date, merchant, amount)
3. Parse each row into standard format
4. Handle multiple date formats
5. Clean amount values (remove $, commas)
6. Return normalized transactions

#### \`lib/ai/categorizer.ts\`
**What it does**: Categorizes transactions using AI.

**How it works**:
1. Build prompt with transaction details
2. Include few-shot examples
3. Call Anthropic Claude or OpenAI API
4. Parse JSON response
5. Return category + confidence + explanation
6. Fallback to rule-based if AI fails

**Why low temperature (0.2)**: Makes AI responses consistent and deterministic rather than creative.

## Data Flow

### 1. User Signs In

\`\`\`
User clicks "Sign In"
  → Clerk handles authentication
  → middleware.ts validates session
  → User redirected to dashboard (/)
  → app/page.tsx loads
  → AppShell renders with sidebar
\`\`\`

### 2. File Upload Flow

\`\`\`
User drags CSV file onto upload page
  ↓
app/upload/page.tsx
  → onDrop() function triggered
  → File validated (type, size)
  → File added to state
  ↓
[Future: Upload to server]
  → POST /api/documents
  → File saved to storage
  → Background job started
  ↓
lib/parsers/csv-parser.ts
  → parseCSV() extracts transactions
  → Auto-detects columns
  → Normalizes data
  ↓
lib/ai/categorizer.ts
  → categorizeTransaction() for each transaction
  → AI returns category + confidence
  ↓
app/api/transactions/route.ts
  → Saves to database via Prisma
  → Generates hash for deduplication
  → Returns success
  ↓
User sees completed transactions in transactions page
\`\`\`

### 3. Viewing Dashboard

\`\`\`
User navigates to / (dashboard)
  ↓
app/page.tsx loads
  ↓
[Future: Fetches data from API]
  → GET /api/transactions
  → GET /api/insights
  → GET /api/goals
  ↓
app/api/transactions/route.ts
  → auth() gets user ID
  → Prisma fetches user's data
  → Returns JSON response
  ↓
TanStack Query caches response
  ↓
Dashboard displays:
  → Summary cards
  → Charts (Recharts)
  → Recent insights
\`\`\`

### 4. AI Categorization Flow

\`\`\`
Transaction needs categorization
  ↓
lib/ai/categorizer.ts
  → categorizeTransaction(merchant, description, amount)
  ↓
Check for API key
  ├─ Has ANTHROPIC_API_KEY → Use Claude
  ├─ Has OPENAI_API_KEY → Use OpenAI
  └─ No API key → Use rule-based fallback
  ↓
Build prompt with:
  → Category taxonomy
  → Few-shot examples
  → Transaction details
  ↓
Call AI API (POST request)
  → Temperature: 0.2 (deterministic)
  → Max tokens: 256
  → Model: claude-3-haiku or gpt-3.5-turbo
  ↓
Parse JSON response
  → Extract category, subcategory, confidence, explanation
  ↓
Return CategorizationResult
  → category: "Groceries"
  → confidence: 0.95
  → explanation: "Clear grocery store purchase"
\`\`\`

### 5. Database Operations

\`\`\`
API route needs to query database
  ↓
Import: import { prisma } from "@/lib/prisma"
  ↓
lib/prisma.ts provides singleton client
  ↓
Prisma Client
  → Connects to PostgreSQL
  → Uses connection pool
  → Reuses same instance
  ↓
Query examples:
  → prisma.transaction.findMany() - Fetch transactions
  → prisma.transaction.create() - Create new transaction
  → prisma.user.findUnique() - Find user by ID
  ↓
Returns typed data (TypeScript)
\`\`\`

## Key Interactions

### How Authentication Works

1. **Middleware Protection** (\`middleware.ts\`):
   - Every request hits middleware first
   - Checks if route is public (sign-in/sign-up)
   - If private route → checks for Clerk session
   - No session → redirect to sign-in
   - Valid session → allow request through

2. **User in API Routes**:
   \`\`\`typescript
   const { userId } = await auth(); // Get Clerk user ID

   const user = await prisma.user.findUnique({
     where: { clerkId: userId }
   });
   \`\`\`

3. **User in Components**:
   \`\`\`typescript
   import { UserButton } from "@clerk/nextjs";

   // Shows user avatar with dropdown menu
   <UserButton />
   \`\`\`

### How State Management Works

1. **Server State** (API data):
   - TanStack Query handles caching
   - Automatically refetches stale data
   - Optimistic updates for better UX

2. **UI State** (forms, modals):
   - React useState for local state
   - Example: file upload progress

3. **Global State** (theme, user):
   - ThemeProvider for dark/light mode
   - ClerkProvider for user context

### How Styling Works

1. **Tailwind CSS**: Utility-first CSS framework
   \`\`\`typescript
   <div className="flex items-center gap-4 p-4 rounded-lg border">
   \`\`\`

2. **CSS Variables**: Defined in \`app/globals.css\`
   - Light/dark theme colors
   - Consistent spacing
   - Primary/secondary colors from PRD

3. **Component Variants**: Using CVA (Class Variance Authority)
   \`\`\`typescript
   <Button variant="destructive" size="lg">Delete</Button>
   \`\`\`

### How Forms Work

1. **Form Library**: react-hook-form
   - Handles validation
   - Manages form state
   - Integrates with Zod for schema validation

2. **Example Flow**:
   \`\`\`typescript
   const form = useForm()

   form.handleSubmit(async (data) => {
     // Submit to API
     await fetch('/api/endpoint', {
       method: 'POST',
       body: JSON.stringify(data)
     })
   })
   \`\`\`

## Database Schema Overview

### Key Tables

1. **users**: User accounts (linked to Clerk)
2. **transactions**: Financial transactions
3. **categories**: Spending categories (hierarchical)
4. **insights**: AI-generated recommendations
5. **goals**: Budgets and savings goals
6. **alerts**: Notification rules
7. **documents**: Uploaded files
8. **audit_logs**: Security tracking

### Relationships

- User → has many → Transactions
- User → has many → Categories (custom)
- Transaction → belongs to → Category
- Transaction → belongs to → Account
- Goal → belongs to → User
- Goal → may have → Category (budget tracking)

See \`prisma/schema.prisma\` for complete schema with all fields and relations.

## Performance Considerations

1. **Database Queries**:
   - Use \`include\` to fetch related data in one query
   - Add \`take\` to limit results
   - Index frequently queried fields

2. **React Query Caching**:
   - Stale time: 5 minutes (data considered fresh)
   - GC time: 10 minutes (inactive data kept in cache)

3. **Image Optimization**:
   - Use Next.js Image component
   - Automatic lazy loading

4. **Code Splitting**:
   - Next.js automatically splits code by route
   - Dynamic imports for large components

## Security

1. **Authentication**: Clerk middleware protects all routes
2. **API Security**: All API routes check \`userId\` from \`auth()\`
3. **Database**: User data isolated by userId
4. **Input Validation**: Zod schemas validate all inputs
5. **SQL Injection**: Prisma prevents with parameterized queries

## Next Steps for Development

1. **Connect real API calls**: Replace mock data with API fetches
2. **Implement file upload API**: Save files and trigger parsing
3. **Add charts**: Integrate Recharts with real data
4. **Build insights engine**: Generate AI recommendations
5. **Add rule engine**: User-defined categorization rules
6. **Email notifications**: Integrate Resend for alerts
