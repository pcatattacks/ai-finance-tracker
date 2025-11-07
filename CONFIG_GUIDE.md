# Configuration Guide

This guide walks you through setting up all the services and configuration needed to run Finance Guru.

## Table of Contents

1. [PostgreSQL Database Setup](#postgresql-database-setup)
2. [Clerk Authentication Setup](#clerk-authentication-setup)
3. [AI Provider Setup (Anthropic or OpenAI)](#ai-provider-setup)
4. [Environment Variables](#environment-variables)
5. [Optional Services](#optional-services)

---

## PostgreSQL Database Setup

PostgreSQL is the database where all your financial data is stored (transactions, categories, goals, etc.).

### Step 1: Install PostgreSQL

#### On macOS (using Homebrew)

\`\`\`bash
# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14
\`\`\`

#### On Windows

1. Download PostgreSQL installer from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer
3. Remember the password you set for the \`postgres\` user
4. Keep the default port (5432)

#### On Linux (Ubuntu/Debian)

\`\`\`bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
\`\`\`

### Step 2: Create Database

\`\`\`bash
# Connect to PostgreSQL (on Mac/Linux)
psql postgres

# Or on Windows, use pgAdmin or SQL Shell

# Create the database
CREATE DATABASE finance_tracker;

# Create a user (optional, recommended for production)
CREATE USER finance_user WITH PASSWORD 'your_secure_password';

# Grant permissions
GRANT ALL PRIVILEGES ON DATABASE finance_tracker TO finance_user;

# Exit
\\q
\`\`\`

### Step 3: Get Database Connection String

Your connection string format:

\`\`\`
postgresql://[user]:[password]@[host]:[port]/[database]
\`\`\`

**Examples**:

- Local development (default user):
  \`\`\`
  postgresql://postgres:@localhost:5432/finance_tracker
  \`\`\`

- With custom user:
  \`\`\`
  postgresql://finance_user:your_secure_password@localhost:5432/finance_tracker
  \`\`\`

- Cloud database (e.g., Render, Supabase):
  \`\`\`
  postgresql://user:pass@host.render.com:5432/database_name
  \`\`\`

**Save this connection string** - you'll add it to \`.env\` as \`DATABASE_URL\`.

### Step 4: Test Connection

\`\`\`bash
# Test connecting with psql
psql postgresql://postgres:@localhost:5432/finance_tracker

# If successful, you should see:
# finance_tracker=#
\`\`\`

---

## Clerk Authentication Setup

Clerk provides user authentication (sign-up, sign-in, user management) so you don't have to build it yourself.

### Step 1: Create Clerk Account

1. Go to [clerk.com](https://clerk.com/)
2. Click "Start Building" or "Sign Up"
3. Create an account with your email

### Step 2: Create an Application

1. After signing in, click "Create Application"
2. Enter application name: "Finance Guru" (or your preferred name)
3. Choose sign-in options:
   - ✅ Email
   - ✅ Google (recommended for easier sign-in)
   - ✅ Other providers as desired
4. Click "Create Application"

### Step 3: Get API Keys

You'll see your dashboard with API keys displayed:

1. **Publishable Key** (starts with \`pk_test_\`):
   - This is safe to use in your frontend code
   - Example: \`pk_test_bG9jYWwuY29tJA\`

2. **Secret Key** (starts with \`sk_test_\`):
   - This is private and should only be in \`.env\`
   - Example: \`sk_test_abcdef123456\`

**Copy both keys** - you'll add them to \`.env\`.

### Step 4: Configure Redirect URLs

1. In Clerk Dashboard, go to "Paths" in the left sidebar
2. Set these URLs:
   - **Sign-in URL**: \`/sign-in\`
   - **Sign-up URL**: \`/sign-up\`
   - **After sign-in URL**: \`/\`
   - **After sign-up URL**: \`/\`

3. Save changes

### Step 5: Test in Development

Once you add the keys to \`.env\` and start the app:
1. Visit \`http://localhost:3000\`
2. You should be redirected to sign-in
3. Click "Sign up" and create a test account
4. After signing up, you should land on the dashboard

---

## AI Provider Setup

AI categorizes your transactions automatically. You need either Anthropic (Claude) **OR** OpenAI (GPT).

### Option A: Anthropic Claude (Recommended)

Claude is faster and more cost-effective for categorization tasks.

#### Step 1: Create Anthropic Account

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign up with your email
3. Verify your email

#### Step 2: Get API Key

1. In the Anthropic Console, click "API Keys"
2. Click "Create Key"
3. Give it a name: "Finance Guru Dev"
4. Copy the key (starts with \`sk-ant-\`)
   - **Important**: You can only see this once! Save it immediately.

#### Step 3: Add Credits (if needed)

- Anthropic gives free credits for testing
- For production, add a payment method in "Billing"

**Copy the API key** - you'll add it to \`.env\` as \`ANTHROPIC_API_KEY\`.

### Option B: OpenAI (Alternative)

#### Step 1: Create OpenAI Account

1. Go to [platform.openai.com](https://platform.openai.com/)
2. Sign up with your email
3. Verify your email

#### Step 2: Get API Key

1. Click your profile icon → "View API Keys"
2. Click "Create new secret key"
3. Give it a name: "Finance Guru"
4. Copy the key (starts with \`sk-\`)
   - **Important**: You can only see this once! Save it immediately.

#### Step 3: Add Credits

- OpenAI requires a payment method
- Add a card in "Billing" → "Payment methods"
- Set a usage limit to avoid surprise charges

**Copy the API key** - you'll add it to \`.env\` as \`OPENAI_API_KEY\`.

---

## Environment Variables

Now that you have your credentials, let's set up the \`.env\` file.

### Step 1: Copy Example File

\`\`\`bash
cp .env.example .env
\`\`\`

### Step 2: Fill in Variables

Open \`.env\` in your text editor and add your values:

\`\`\`env
# =====================
# DATABASE
# =====================
# Your PostgreSQL connection string from earlier
DATABASE_URL="postgresql://postgres:@localhost:5432/finance_tracker"

# =====================
# CLERK AUTHENTICATION
# =====================
# Copy from Clerk Dashboard
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# These should match what you set in Clerk Dashboard
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# =====================
# AI PROVIDER
# =====================
# Add ONLY ONE of these (Anthropic recommended):

# Option A: Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-your_key_here

# Option B: OpenAI (comment out if using Anthropic)
# OPENAI_API_KEY=sk-your_key_here

# =====================
# OPTIONAL SERVICES
# =====================

# File storage directory (local for development)
UPLOAD_DIR=./uploads

# Email service (for notifications - optional)
# RESEND_API_KEY=re_your_key_here

# Error tracking (optional)
# SENTRY_DSN=https://your_key@sentry.io/your_project

# Redis for rate limiting (optional)
# UPSTASH_REDIS_URL=https://your_instance.upstash.io
# UPSTASH_REDIS_TOKEN=your_token
\`\`\`

### Step 3: Verify Environment Variables

**Required variables** (app won't work without these):
- ✅ \`DATABASE_URL\`
- ✅ \`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY\`
- ✅ \`CLERK_SECRET_KEY\`
- ✅ \`ANTHROPIC_API_KEY\` **OR** \`OPENAI_API_KEY\`

**Optional variables** (app works without these):
- \`RESEND_API_KEY\` - For email notifications
- \`SENTRY_DSN\` - For error tracking
- \`UPSTASH_REDIS_URL\` - For rate limiting

---

## Optional Services

### Email Notifications (Resend)

For sending alerts and digests via email.

1. Go to [resend.com](https://resend.com/)
2. Sign up and create an API key
3. Add to \`.env\`: \`RESEND_API_KEY=re_your_key\`

**Note**: Currently, email features are not implemented but the infrastructure is ready.

### Error Tracking (Sentry)

For monitoring errors in production.

1. Go to [sentry.io](https://sentry.io/)
2. Create a project
3. Copy the DSN (looks like: \`https://xxx@xxx.ingest.sentry.io/xxx\`)
4. Add to \`.env\`: \`SENTRY_DSN=your_dsn\`

### Rate Limiting (Upstash Redis)

For preventing API abuse.

1. Go to [upstash.com](https://upstash.com/)
2. Create a Redis database
3. Copy the URL and token
4. Add to \`.env\`

---

## Verification Checklist

Before running the app, verify:

### Database
- [ ] PostgreSQL is running (\`pg_ctl status\` or check Services)
- [ ] Database \`finance_tracker\` exists
- [ ] Connection string is correct in \`.env\`
- [ ] Can connect with \`psql\` using the connection string

### Clerk
- [ ] Application created in Clerk Dashboard
- [ ] API keys copied to \`.env\`
- [ ] Redirect URLs configured
- [ ] Both \`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY\` and \`CLERK_SECRET_KEY\` present

### AI Provider
- [ ] Account created (Anthropic or OpenAI)
- [ ] API key generated
- [ ] API key added to \`.env\`
- [ ] Credits available (check dashboard)

### Environment File
- [ ] \`.env\` file exists (not \`.env.example\`)
- [ ] All required variables filled in
- [ ] No placeholder values (like \`xxxxx\`)

---

## Testing Your Configuration

### Test 1: Database Connection

\`\`\`bash
# Run Prisma push (creates tables)
npm run db:push

# If successful, you should see:
# ✔ Generated Prisma Client
# ✔ The database is now in sync with the Prisma schema
\`\`\`

**If this fails**: Check your \`DATABASE_URL\` and PostgreSQL status.

### Test 2: Seed Database

\`\`\`bash
npm run db:seed

# Should output:
# Starting database seed...
# Seeding default categories...
# ✓ Default categories seeded
# Database seed completed!
\`\`\`

**If this fails**: Check database connection and Prisma client generation.

### Test 3: Start Development Server

\`\`\`bash
npm run dev

# Should output:
# ▲ Next.js 15.0.3
# - Local:        http://localhost:3000
# ✓ Ready in [time]
\`\`\`

**If this fails**: Check for port conflicts or missing dependencies.

### Test 4: Authentication

1. Open \`http://localhost:3000\`
2. Should redirect to Clerk sign-in page
3. Click "Sign up" and create an account
4. Should land on dashboard after sign-up

**If this fails**: Check Clerk API keys and configuration.

### Test 5: AI Categorization

This will be tested once you upload a transaction:

1. Create a test CSV file
2. Upload via the Upload page
3. Check the transaction is categorized
4. Check browser console for AI API errors

**If categorization fails**: Check AI API key and credits.

---

## Troubleshooting

### "Prisma Client initialization error"

**Solution**:
\`\`\`bash
npm run db:generate
\`\`\`

### "Clerk authentication not working"

**Solution**:
- Verify keys in \`.env\` match Clerk Dashboard
- Clear browser cookies
- Check redirect URLs in Clerk Dashboard

### "AI categorization always returns 'Uncategorized'"

**Solution**:
- Verify AI API key in \`.env\`
- Check API credits in provider dashboard
- Look for errors in server console
- Test API key with curl:

\`\`\`bash
# For Anthropic
curl https://api.anthropic.com/v1/messages \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "content-type: application/json" \\
  -d '{"model":"claude-3-haiku-20240307","max_tokens":1024,"messages":[{"role":"user","content":"Hello"}]}'
\`\`\`

### "Cannot connect to database"

**Solution**:
1. Check PostgreSQL is running
2. Verify DATABASE_URL syntax
3. Test connection with psql
4. Check firewall/network settings

---

## Security Best Practices

1. **Never commit \`.env\`** to Git (it's in \`.gitignore\`)
2. **Use different API keys** for development and production
3. **Set usage limits** on AI APIs to avoid surprise charges
4. **Rotate keys regularly** if they might be compromised
5. **Use strong passwords** for database users in production
6. **Enable MFA** on Clerk, Anthropic, and OpenAI accounts

---

## Next Steps

Once configuration is complete:

1. Review [README.md](./README.md) for usage instructions
2. Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the codebase
3. Start developing with \`npm run dev\`
4. Upload test data and explore features

---

## Getting Help

If you're stuck:

1. **Check the error message** carefully - it usually tells you what's wrong
2. **Verify environment variables** - most issues are from missing or incorrect config
3. **Review the logs** - check both browser console and server terminal
4. **Search documentation** - Clerk, Prisma, and AI provider docs are helpful
5. **Test incrementally** - verify each service works independently

## Configuration Summary

Here's a quick reference of all configuration files:

| File | Purpose |
|------|---------|
| \`.env\` | Environment variables (API keys, database URL) |
| \`prisma/schema.prisma\` | Database schema |
| \`next.config.js\` | Next.js configuration |
| \`tailwind.config.ts\` | Tailwind CSS styling |
| \`middleware.ts\` | Authentication protection |
| \`components.json\` | shadcn/ui configuration |

Most configuration happens in \`.env\` - the other files rarely need changes unless you're modifying the app structure.
