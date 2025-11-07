# Finance Guru - AI-Powered Personal Finance Tracker

An AI-driven personal finance companion that automatically categorizes spending, provides actionable insights, and helps you achieve your financial goals with complete privacy.

## Features

- **Automatic Categorization**: Upload bank statements (CSV, PDF, OFX) and let AI categorize your transactions
- **Smart Insights**: Get personalized recommendations to optimize your spending
- **Goal Tracking**: Set budgets, savings targets, and debt payoff goals
- **Privacy-First**: Your data is encrypted and never shared with third parties
- **Beautiful Dashboard**: Visualize your spending with charts and analytics
- **Custom Alerts**: Get notified about unusual spending or budget thresholds

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (version 14 or higher) - [Download here](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)

You'll also need accounts for:

- **Clerk** (for authentication) - [Sign up here](https://clerk.com/)
- **Anthropic** or **OpenAI** (for AI categorization) - Optional but recommended

## Quick Start

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd ai-finance-tracker
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

This will install all required packages including Next.js, Prisma, Clerk, and UI components.

### 3. Set Up Environment Variables

Copy the example environment file:

\`\`\`bash
cp .env.example .env
\`\`\`

Then edit \`.env\` and fill in your values (see [CONFIG_GUIDE.md](./CONFIG_GUIDE.md) for detailed instructions):

\`\`\`env
# Database - Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/finance_tracker"

# Clerk Authentication - Get these from clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# AI Provider (choose one)
ANTHROPIC_API_KEY=sk-ant-xxxxx  # Recommended
# OR
OPENAI_API_KEY=sk-xxxxx
\`\`\`

### 4. Set Up the Database

Create a PostgreSQL database:

\`\`\`bash
# Using psql command line
createdb finance_tracker

# Or using PostgreSQL GUI tools like pgAdmin
\`\`\`

Run database migrations to create tables:

\`\`\`bash
npm run db:push
\`\`\`

Seed the database with default categories:

\`\`\`bash
npm run db:seed
\`\`\`

### 5. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see the Finance Guru application!

### 6. Create an Account

1. Click "Sign Up" and create an account using Clerk
2. Complete your profile
3. Start uploading transactions!

## How to Test the Application

### Testing File Upload

1. Navigate to the "Upload" page
2. Drag and drop a CSV file with transactions, or click to browse
3. The file should be processed automatically
4. Check the "Transactions" page to see your imported data

#### Sample CSV Format

Create a file called `test-transactions.csv`:

\`\`\`csv
Date,Description,Amount
2024-11-01,Whole Foods Market,-87.50
2024-11-02,Shell Gas Station,-45.00
2024-11-03,Netflix,-15.99
2024-11-04,Salary Deposit,4500.00
2024-11-05,Starbucks,-5.75
\`\`\`

### Testing AI Categorization

1. Upload transactions (as above)
2. The system will automatically categorize each transaction
3. Check the "Transactions" page to see categories and confidence scores
4. Navigate to "Insights" to see AI-generated recommendations

### Testing the Dashboard

1. Go to the home page (Dashboard)
2. You should see:
   - Summary cards with spending totals
   - Charts showing spending trends
   - Recent insights and recommendations

### Running Database Commands

\`\`\`bash
# Generate Prisma client after schema changes
npm run db:generate

# Push schema changes to database
npm run db:push

# Create a new migration
npm run db:migrate

# Open Prisma Studio to view/edit data
npm run db:studio

# Re-seed the database
npm run db:seed
\`\`\`

## Common Issues and Solutions

### Issue: "Cannot connect to database"

**Solution**:
- Check that PostgreSQL is running: \`pg_ctl status\` or \`brew services list\` (on Mac)
- Verify your DATABASE_URL in \`.env\` is correct
- Test the connection: \`psql postgres://user:password@localhost:5432/finance_tracker\`

### Issue: "Clerk authentication not working"

**Solution**:
- Verify your Clerk API keys in \`.env\`
- Check that you've set the correct redirect URLs in Clerk Dashboard
- Ensure middleware.ts is not blocking authentication routes

### Issue: "AI categorization returns 'Uncategorized'"

**Solution**:
- Check that you've added ANTHROPIC_API_KEY or OPENAI_API_KEY to \`.env\`
- Verify the API key is valid by testing it directly
- Check the console for error messages
- The app will fallback to rule-based categorization if AI fails

### Issue: "npm install fails"

**Solution**:
- Clear npm cache: \`npm cache clean --force\`
- Delete \`node_modules\` and \`package-lock.json\`
- Run \`npm install\` again
- Ensure you're using Node.js 18 or higher: \`node --version\`

### Issue: "Prisma Client errors"

**Solution**:
- Regenerate the Prisma client: \`npm run db:generate\`
- Check that your database schema is up to date: \`npm run db:push\`
- Restart your development server

### Issue: "Port 3000 already in use"

**Solution**:
- Kill the process using port 3000: \`lsof -ti:3000 | xargs kill -9\`
- Or use a different port: \`PORT=3001 npm run dev\`

### Issue: "File upload not working"

**Solution**:
- Check that the \`uploads\` directory exists (create it if not)
- Verify file size is under 10MB
- Ensure the file type is supported (CSV, PDF, OFX, QFX, QBO)
- Check browser console for JavaScript errors

## Development Workflow

### Project Structure

See [ARCHITECTURE.md](./ARCHITECTURE.md) for a detailed explanation of the project structure.

### Making Changes

1. **Database Changes**: Edit \`prisma/schema.prisma\`, then run \`npm run db:push\`
2. **UI Changes**: Components are in \`components/\`, pages are in \`app/\`
3. **API Changes**: API routes are in \`app/api/\`
4. **Styling**: Edit \`app/globals.css\` or use Tailwind classes

### Code Quality

\`\`\`bash
# Lint code
npm run lint

# Format code (if you have Prettier configured)
npm run format
\`\`\`

## Building for Production

\`\`\`bash
# Build the application
npm run build

# Start production server
npm start
\`\`\`

## Environment Variables Reference

See [CONFIG_GUIDE.md](./CONFIG_GUIDE.md) for detailed explanations of all environment variables.

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **AI**: Anthropic Claude or OpenAI GPT
- **Charts**: Recharts
- **File Upload**: react-dropzone

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture and code organization
- [CONFIG_GUIDE.md](./CONFIG_GUIDE.md) - Step-by-step configuration guide
- [PRD.md](./PRD.md) - Full product requirements document
- [CLAUDE.md](./CLAUDE.md) - Developer reference for AI code generation

## Support

If you encounter issues:

1. Check the "Common Issues" section above
2. Review the documentation files
3. Check the browser console and server logs for error messages
4. Ensure all prerequisites are properly installed

## License

[Your License Here]

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Clerk](https://clerk.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Anthropic Claude](https://www.anthropic.com/)
