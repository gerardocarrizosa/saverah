# Supabase Database Setup Guide

This guide will walk you through setting up the Saverah database in Supabase.

## Prerequisites

- A Supabase account (free tier works fine)
- A new Supabase project created

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Click on **Settings** (gear icon) in the left sidebar
3. Go to **API** section
4. Copy these values:
   - **Project URL** (e.g., `https://abcdefgh12345678.supabase.co`)
   - **Project API keys** → **anon public** key

## Step 2: Configure Environment Variables

Create or update your `.env.local` file in the project root:

```env
# Supabase - Required for both server and client
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# App base URL (used by Axios baseURL)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Replace `your-project-url` and `your-anon-key-here` with your actual values.

## Step 3: Run the Database Migration

### Option A: Using Supabase SQL Editor (Recommended)

1. In your Supabase dashboard, go to **SQL Editor** in the left sidebar
2. Click **New query**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste it into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)

You should see output like:
```
Success. No rows returned
```

### Option B: Using Supabase CLI (If you have it installed)

```bash
# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Step 4: Verify the Setup

### Check Tables Were Created

1. In Supabase dashboard, go to **Table Editor** in the left sidebar
2. You should see 5 tables:
   - `reminders`
   - `reminder_payments`
   - `income`
   - `expenses`
   - `budget_limits`

### Check RLS Policies

1. Click on any table in the Table Editor
2. Go to **Policies** tab
3. You should see a policy like: "Users own their [table_name]"

## Step 5: Enable Authentication (If not already enabled)

1. In Supabase dashboard, go to **Authentication** in the left sidebar
2. Go to **Providers** tab
3. Make sure **Email** provider is enabled
4. (Optional) Enable **Google** or other OAuth providers if desired

## Step 6: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`

3. Try to sign up for a new account
   - If successful, a new user will be created in `auth.users` table
   - The app should redirect you to `/dashboard`

## Database Schema Overview

### reminders
Stores recurring payments like bills, credit cards, subscriptions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| name | TEXT | Name of the reminder (e.g., "Netflix") |
| amount | NUMERIC | Amount to pay |
| due_day | INTEGER | Day of month (1-31) |
| recurrence | TEXT | monthly/yearly/weekly |
| category | TEXT | Category (e.g., "Suscripción") |
| notes | TEXT | Optional notes |
| is_active | BOOLEAN | Is this reminder active? |
| created_at | TIMESTAMPTZ | Creation timestamp |

### reminder_payments
Tracks payment history for analytics.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| reminder_id | UUID | Foreign key to reminders |
| user_id | UUID | Foreign key to auth.users |
| paid_at | TIMESTAMPTZ | When the payment was made |
| amount_paid | NUMERIC | Amount that was paid |

### income
Stores income sources.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| source | TEXT | Source name (e.g., "Salario") |
| type | TEXT | steady/variable/other |
| amount | NUMERIC | Income amount |
| received_at | DATE | When it was received |
| notes | TEXT | Optional notes |

### expenses
Stores expense entries.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| description | TEXT | What was purchased |
| amount | NUMERIC | Expense amount |
| category | TEXT | Category (e.g., "Alimentación") |
| spent_at | DATE | When it was spent |
| notes | TEXT | Optional notes |

### budget_limits
Stores monthly spending limits per category.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| category | TEXT | Category name |
| monthly_limit | NUMERIC | Spending limit for the month |

## Security Notes

✅ **Row Level Security (RLS) is enabled** on all tables
✅ **Users can only access their own data** via the `user_id` column
✅ **Foreign keys with CASCADE delete** ensure data cleanup when users are deleted
✅ **Indexes** are created for optimal query performance

## Troubleshooting

### "Failed to fetch" errors in the app
- Check that your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Make sure there are no typos or extra spaces

### Tables not appearing in Table Editor
- Refresh the Supabase dashboard page
- Check the SQL Editor output for any error messages

### "Unauthorized" errors when calling API
- Check that RLS policies were created correctly
- Verify the user is properly authenticated

### Policies not working
- Make sure you're testing with an authenticated user
- Anonymous users (not logged in) cannot access any data due to RLS

## Next Steps

Once the database is set up:

1. ✅ Create a user account via `/signup`
2. ✅ Add your first reminder at `/reminders/new`
3. ✅ Add income at `/budget/income`
4. ✅ Add expenses at `/budget/expenses`
5. ✅ View your dashboard at `/dashboard`

## Need to Reset?

If you need to start over:

```sql
-- Drop all tables (DANGER: This deletes all data!)
DROP TABLE IF EXISTS budget_limits CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS income CASCADE;
DROP TABLE IF EXISTS reminder_payments CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
```

Then re-run the migration SQL.

---

**Note**: Never commit your `.env.local` file to git. It contains sensitive credentials!
