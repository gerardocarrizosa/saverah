# AGENTS.md — Saverah

This document describes the architecture, conventions, and guidelines for AI agents and developers working on this codebase.

---

## Project Overview

**Saverah** is a personal finance web application built with **Next.js 15** (App Router). It serves two core purposes:

1. **Bill & Payment Reminders** — track bills, credit cards, subscriptions, and services. Display days remaining until each payment is due, and provide per-reminder analytics (payment history, trends, upcoming totals).
2. **Budget Tracker** — record steady and variable income sources, log expenses by category, set category spending limits, and receive warnings when approaching or exceeding those limits.

The app is built for personal use with the potential to be distributed to future clients. It prioritizes:

- **Server-Side Rendering (SSR)** and **React Server Components (RSC)** by default
- **API Routes** as the primary data layer — all reads and mutations go through `app/api/`
- **Axios** for all HTTP requests on the client side
- **Performance** — streaming, caching, minimal JS bundle, code splitting
- **Clean architecture** — separation of concerns, colocation, and predictable data flow

It's **IMPORTANT** to note that the webapp text and copies need to be in **spanish**, the files and naming conventions should be in **english**.

## Tech Stack

| Layer            | Technology                                    |
| ---------------- | --------------------------------------------- |
| Framework        | Next.js 15 (App Router)                       |
| Language         | TypeScript (strict mode)                      |
| Styling          | DaisyUI + Tailwind CSS                        |
| Icons            | Lucide                                        |
| HTTP Client      | Axios                                         |
| Forms            | Formik + Yup                                  |
| Auth             | Supabase Auth                                 |
| Database         | Supabase (PostgreSQL)                         |
| State management | React Context (minimal), URL state via `nuqs` |
| Package manager  | npm                                           |

---

## Directory Structure

```
.
├── app/
│   ├── (auth)/                        # Route group — public auth pages
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (app)/                         # Route group — authenticated app shell
│   │   ├── layout.tsx                 # Auth-protected layout
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── reminders/
│   │   │   ├── page.tsx               # List all reminders
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx           # Reminder detail + analytics
│   │   └── budget/
│   │       ├── page.tsx               # Budget overview
│   │       ├── income/
│   │       │   └── page.tsx
│   │       └── expenses/
│   │           └── page.tsx
│   ├── api/                           # ★ Primary data layer
│   │   ├── reminders/
│   │   │   ├── route.ts               # GET, POST /api/reminders
│   │   │   └── [id]/
│   │   │       └── route.ts           # GET, PATCH, DELETE /api/reminders/:id
│   │   ├── analytics/
│   │   │   └── reminders/
│   │   │       └── [id]/
│   │   │           └── route.ts       # GET /api/analytics/reminders/:id
│   │   └── budget/
│   │       ├── income/
│   │       │   └── route.ts           # GET, POST /api/budget/income
│   │       ├── expenses/
│   │       │   ├── route.ts           # GET, POST /api/budget/expenses
│   │       │   └── [id]/
│   │       │       └── route.ts       # PATCH, DELETE /api/budget/expenses/:id
│   │       └── summary/
│   │           └── route.ts           # GET /api/budget/summary
│   ├── globals.css
│   └── layout.tsx                     # Root layout (Server Component)
│
├── components/
│   ├── ui/                            # Primitive, reusable UI components
│   ├── reminders/                     # Reminder-specific components
│   │   ├── ReminderCard.tsx
│   │   ├── ReminderForm.tsx           # "use client" — Formik form
│   │   ├── ReminderListClient.tsx     # "use client" — interactive list
│   │   ├── CountdownBadge.tsx
│   │   └── ReminderAnalyticsChart.tsx # "use client" — chart component
│   └── budget/
│       ├── BudgetSummary.tsx
│       ├── CategoryProgress.tsx
│       ├── ExpenseForm.tsx            # "use client" — Formik form
│       └── IncomeForm.tsx             # "use client" — Formik form
│
├── lib/
│   ├── supabase/
│   │   ├── server.ts                  # Supabase server client (API routes + RSC)
│   │   └── client.ts                  # Supabase browser client (auth state only)
│   ├── axios/
│   │   └── index.ts                   # Configured Axios instance
│   ├── api/                           # Server-side data access (called inside API routes)
│   │   ├── reminders.ts
│   │   ├── budget.ts
│   │   └── analytics.ts
│   ├── validations/                   # Yup schemas (shared between Formik forms and API routes)
│   │   ├── reminder.schemas.ts
│   │   └── budget.schemas.ts
│   └── utils/
│       ├── dates.ts                   # Days-remaining calculations
│       └── currency.ts               # Money formatting helpers
│
├── hooks/                             # Client-side Axios-based data hooks
│   ├── useReminders.ts
│   ├── useBudget.ts
│   └── useAnalytics.ts
│
├── types/
│   ├── reminder.types.ts
│   ├── budget.types.ts
│   └── api.types.ts                   # Shared API response shapes
│
├── config/
│   └── constants.ts                   # Expense categories, currency, app constants
│
└── middleware.ts                      # Supabase session refresh + route protection
```

---

## Core Principles

### 1. API Routes Are the Primary Data Layer

All data reads and mutations go through `app/api/` Route Handlers. Server Actions are **not used** in this project. Every API route must:

- Authenticate the request using Supabase session
- Validate the request body against the shared Yup schema
- Return a consistent JSON response shape (see API Response Shape below)
- Handle errors with appropriate HTTP status codes

```
Client Component  →  Axios  →  /api/route  →  lib/api/  →  Supabase DB
Server Component  →  lib/api/  →  Supabase DB   (direct, for SSR initial render only)
```

```ts
// app/api/reminders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getReminders, createReminder } from '@/lib/api/reminders';
import { createReminderSchema } from '@/lib/validations/reminder.schemas';

export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const reminders = await getReminders(user.id);
  return NextResponse.json({ data: reminders });
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  try {
    const validated = await createReminderSchema.validate(body, {
      abortEarly: false,
    });
    const reminder = await createReminder(user.id, validated);
    return NextResponse.json({ data: reminder }, { status: 201 });
  } catch (validationError: any) {
    return NextResponse.json(
      { error: validationError.errors },
      { status: 422 },
    );
  }
}
```

### 2. Axios for All Client-Side HTTP Requests

Never use raw `fetch` on the client. All client-side requests go through the configured Axios instance at `lib/axios/index.ts`, which provides centralized error handling, base URL configuration, and automatic 401 redirects.

```ts
// lib/axios/index.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL + '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // forwards the Supabase session cookie
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
```

```ts
// hooks/useReminders.ts — always "use client"
'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import type { Reminder } from '@/types/reminder.types';

export function useReminders(initialData: Reminder[] = []) {
  const [reminders, setReminders] = useState<Reminder[]>(initialData);
  const [loading, setLoading] = useState(!initialData.length);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setLoading(true);
    api
      .get<{ data: Reminder[] }>('/reminders')
      .then((res) => setReminders(res.data.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!initialData.length) refresh();
  }, []);

  return { reminders, loading, error, refresh };
}
```

### 3. Server Components for Initial Page Render

Pages are **Server Components** that directly call `lib/api/` functions (bypassing Axios/HTTP) for fast SSR. The resulting data is passed as `initialData` to Client Components, which then manage updates via Axios hooks.

```tsx
// app/(app)/reminders/page.tsx — Server Component, no directive
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getReminders } from '@/lib/api/reminders';
import { ReminderListClient } from '@/components/reminders/ReminderListClient';
import { Suspense } from 'react';

export const metadata = {
  title: 'Reminders | Saverah',
};

export default async function RemindersPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Direct DB call for SSR — no HTTP round-trip
  const initialReminders = await getReminders(user!.id);

  return (
    <main>
      <h1>Your Reminders</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <ReminderListClient initialData={initialReminders} />
      </Suspense>
    </main>
  );
}
```

### 4. Forms with Formik + Yup

All forms are **Client Components** using Formik for form state management and Yup for validation. Yup schemas live in `lib/validations/` and are **shared** between the Formik form (client-side validation) and the API route (server-side validation), ensuring consistency.

```ts
// lib/validations/reminder.schemas.ts
import * as Yup from 'yup';

export const createReminderSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .max(100, 'Max 100 characters'),
  amount: Yup.number()
    .required('Amount is required')
    .positive('Must be a positive number'),
  due_day: Yup.number()
    .required('Due day is required')
    .min(1, 'Must be at least 1')
    .max(31, 'Must be 31 or less'),
  category: Yup.string().required('Category is required'),
  recurrence: Yup.string()
    .oneOf(['monthly', 'yearly', 'weekly'])
    .required('Recurrence is required'),
  notes: Yup.string().optional().max(500),
});

export type CreateReminderInput = Yup.InferType<typeof createReminderSchema>;
```

```tsx
// components/reminders/ReminderForm.tsx
'use client';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import {
  createReminderSchema,
  type CreateReminderInput,
} from '@/lib/validations/reminder.schemas';
import api from '@/lib/axios';

const initialValues: CreateReminderInput = {
  name: '',
  amount: 0,
  due_day: 1,
  category: '',
  recurrence: 'monthly',
  notes: '',
};

export function ReminderForm({ onSuccess }: { onSuccess: () => void }) {
  const handleSubmit = async (values: CreateReminderInput) => {
    await api.post('/reminders', values);
    onSuccess();
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={createReminderSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form>
          <Field name="name" placeholder="Bill name" />
          <ErrorMessage name="name" component="p" className="text-red-500" />

          <Field name="amount" type="number" placeholder="Amount" />
          <ErrorMessage name="amount" component="p" className="text-red-500" />

          <Field name="due_day" type="number" placeholder="Day of month" />
          <ErrorMessage name="due_day" component="p" className="text-red-500" />

          <Field as="select" name="recurrence">
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="weekly">Weekly</option>
          </Field>
          <ErrorMessage
            name="recurrence"
            component="p"
            className="text-red-500"
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Reminder'}
          </button>
        </Form>
      )}
    </Formik>
  );
}
```

### 5. Supabase Auth & Database

Use two separate Supabase clients — one for the server (API routes, Server Components) and one for the browser (auth state listeners, sign-in/sign-out).

```ts
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => cookieStore.set(name, value, options),
        remove: (name, options) => cookieStore.set(name, '', options),
      },
    },
  );
}
```

```ts
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export const supabaseBrowser = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
```

**Row Level Security (RLS) is mandatory** on every table. Every table must have a `user_id` column and RLS policies that restrict access strictly to the authenticated user's own rows.

### 6. Middleware for Route Protection

```ts
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/reminders', '/budget'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) =>
          response.cookies.set(name, value, options),
        remove: (name, options) => response.cookies.set(name, '', options),
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isProtected = PROTECTED_PATHS.some((p) =>
    request.nextUrl.pathname.startsWith(p),
  );

  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
```

### 7. Streaming with Suspense

Wrap slow data-fetching Server Components in `<Suspense>` to progressively stream the page. Always provide meaningful skeleton fallbacks.

```tsx
// app/(app)/dashboard/page.tsx
import { Suspense } from 'react';
import { RemindersSummary } from '@/components/reminders/RemindersSummary';
import { BudgetOverview } from '@/components/budget/BudgetOverview';

export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <Suspense fallback={<RemindersSummarySkeleton />}>
        <RemindersSummary />
      </Suspense>
      <Suspense fallback={<BudgetOverviewSkeleton />}>
        <BudgetOverview />
      </Suspense>
    </div>
  );
}
```

### 8. Parallel Data Fetching

When a Server Component or API route needs multiple independent queries, always fetch them in parallel with `Promise.all`.

```ts
// lib/api/budget.ts
export async function getBudgetSummary(userId: string) {
  const [income, expenses, limits] = await Promise.all([
    supabase.from('income').select('*').eq('user_id', userId),
    supabase.from('expenses').select('*').eq('user_id', userId),
    supabase.from('budget_limits').select('*').eq('user_id', userId),
  ]);
  return {
    income: income.data ?? [],
    expenses: expenses.data ?? [],
    limits: limits.data ?? [],
  };
}
```

---

## Database Schema (Supabase / PostgreSQL)

```sql
-- Bills, credit cards, subscriptions
create table reminders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  amount      numeric(12, 2) not null,
  due_day     int not null check (due_day between 1 and 31),
  recurrence  text not null check (recurrence in ('monthly', 'yearly', 'weekly')),
  category    text not null,
  notes       text,
  is_active   boolean default true,
  created_at  timestamptz default now()
);
alter table reminders enable row level security;
create policy "Users own their reminders"
  on reminders for all using (auth.uid() = user_id);

-- Payment history for reminder analytics
create table reminder_payments (
  id            uuid primary key default gen_random_uuid(),
  reminder_id   uuid references reminders(id) on delete cascade not null,
  user_id       uuid references auth.users(id) on delete cascade not null,
  paid_at       timestamptz not null,
  amount_paid   numeric(12, 2) not null,
  created_at    timestamptz default now()
);
alter table reminder_payments enable row level security;
create policy "Users own their reminder payments"
  on reminder_payments for all using (auth.uid() = user_id);

-- Income sources (steady salary, freelance, etc.)
create table income (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  source      text not null,
  type        text not null check (type in ('steady', 'variable', 'other')),
  amount      numeric(12, 2) not null,
  received_at date not null,
  notes       text,
  created_at  timestamptz default now()
);
alter table income enable row level security;
create policy "Users own their income"
  on income for all using (auth.uid() = user_id);

-- Expense entries
create table expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  description text not null,
  amount      numeric(12, 2) not null,
  category    text not null,
  spent_at    date not null,
  notes       text,
  created_at  timestamptz default now()
);
alter table expenses enable row level security;
create policy "Users own their expenses"
  on expenses for all using (auth.uid() = user_id);

-- Per-category monthly spending limits
create table budget_limits (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  category      text not null,
  monthly_limit numeric(12, 2) not null,
  created_at    timestamptz default now(),
  unique (user_id, category)
);
alter table budget_limits enable row level security;
create policy "Users own their budget limits"
  on budget_limits for all using (auth.uid() = user_id);
```

---

## API Routes Reference

| Method   | Endpoint                       | Description                                    |
| -------- | ------------------------------ | ---------------------------------------------- |
| `GET`    | `/api/reminders`               | List all reminders for the authenticated user  |
| `POST`   | `/api/reminders`               | Create a new reminder                          |
| `GET`    | `/api/reminders/:id`           | Get a single reminder                          |
| `PATCH`  | `/api/reminders/:id`           | Update a reminder                              |
| `DELETE` | `/api/reminders/:id`           | Delete a reminder                              |
| `GET`    | `/api/analytics/reminders/:id` | Payment history + analytics for a reminder     |
| `GET`    | `/api/budget/income`           | List all income entries                        |
| `POST`   | `/api/budget/income`           | Add an income entry                            |
| `GET`    | `/api/budget/expenses`         | List all expense entries                       |
| `POST`   | `/api/budget/expenses`         | Add an expense entry                           |
| `PATCH`  | `/api/budget/expenses/:id`     | Update an expense                              |
| `DELETE` | `/api/budget/expenses/:id`     | Delete an expense                              |
| `GET`    | `/api/budget/summary`          | Totals, per-category breakdown, limit warnings |

### Standard API Response Shape

```ts
// types/api.types.ts

type ApiSuccess<T> = { data: T };
type ApiSuccessList<T> = { data: T[]; meta?: { total: number } };
type ApiError = { error: string | string[] };

// HTTP status conventions:
// 200 — OK
// 201 — Created
// 401 — Unauthorized (no valid session)
// 403 — Forbidden (session valid but resource belongs to another user)
// 404 — Not found
// 422 — Validation error (Yup)
// 500 — Internal server error
```

---

## Domain Logic

### Reminder Analytics

The `GET /api/analytics/reminders/:id` endpoint must compute and return:

- Total amount paid (all time)
- Number of payments made
- Full payment history (`paid_at`, `amount_paid`)
- Average payment amount
- Last paid date
- Days until next due date
- Whether the reminder is currently overdue

Days-remaining logic lives in `lib/utils/dates.ts` and is reused in both the API response and display components.

```ts
// lib/utils/dates.ts
export function getDaysUntilDue(
  dueDay: number,
  recurrence: 'monthly' | 'yearly' | 'weekly',
): number {
  const today = new Date();
  // compute next occurrence of dueDay based on recurrence
  // return positive number (days remaining) or negative (overdue)
}

export function isOverdue(daysUntilDue: number): boolean {
  return daysUntilDue < 0;
}
```

### Budget Warning System

The `GET /api/budget/summary` endpoint computes per-category spending vs. limits and returns a warning status for each category. Client components use this to render visual progress bars and alert badges.

```ts
// types/budget.types.ts
type CategorySummary = {
  category: string;
  spent: number;
  limit: number | null;
  percentage: number | null; // null if no limit set
  status: 'ok' | 'warning' | 'exceeded'; // warning ≥ 80%, exceeded ≥ 100%
};
```

---

## Component Guidelines

### Naming Conventions

- **Server Components** — `PascalCase`, no directive (e.g., `RemindersSummary.tsx`)
- **Client Components** — `PascalCase` + `"use client"`, optionally suffix with `Client` (e.g., `ReminderListClient.tsx`)
- **Formik Forms** — always Client Components, suffix with `Form` (e.g., `ReminderForm.tsx`, `ExpenseForm.tsx`)
- **Layouts** — `layout.tsx` inside route segments
- **Loading UI** — `loading.tsx` (automatic Suspense boundary)
- **Error UI** — `error.tsx` (must be a Client Component)

### Component Boundaries

Keep `"use client"` as leaf-level as possible. Server Components own the SSR render and pass `initialData`; Client Components handle interactivity, Axios updates, and Formik forms.

---

## Environment Variables

```env
# .env.local — never commit this file

# Supabase — required on both server and client
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App base URL (used by Axios baseURL)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

The `NEXT_PUBLIC_` prefix is required for Supabase vars because the browser client also needs them. Data access security is enforced by Supabase RLS, not by keeping these keys secret.

---

## Error Handling

- Use `error.tsx` for segment-level error boundaries
- Use `not-found.tsx` + `notFound()` for 404 pages
- API routes must always return structured JSON — never throw unhandled exceptions to the client
- Axios interceptors handle global 401 redirects
- Log errors server-side with a structured logger — never use `console.log` in production

```ts
// Standard try/catch pattern inside every API route
try {
  // ... query logic
} catch (err) {
  console.error('[API Error]', err);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

---

## Security

- **RLS is mandatory** — every Supabase table must have Row Level Security enabled with user-scoped policies
- **Always authenticate first** in every API route — never trust client-sent user IDs
- **Always validate input** using the shared Yup schema before any DB operation
- **Never expose other users' data** — all queries filter by the authenticated `user.id`
- **Sanitize user-generated content** before rendering it in the UI
- **Rate-limit sensitive endpoints** (auth, POST/PATCH/DELETE) using middleware or an edge rate-limit library

---

## Performance Rules

- **SSR first** — pages fetch initial data as Server Components, then hydrate Client Components with `initialData`
- **Never use `useEffect` for initial data loads** — use SSR hydration instead
- **Use `next/image`** for all images — never raw `<img>` tags
- **Use `next/font`** for all fonts — no external `<link>` font tags
- **Use `next/link`** for all internal navigation
- **Prefer `loading.tsx`** over manual loading states where possible
- **Lazy-load heavy Client Components** (charts, rich editors) with `dynamic(() => import(...), { ssr: false })`
- **Avoid layout shift** — always set explicit dimensions on images and chart containers
- **Memoize expensive derived values** in Client Components using `useMemo`

---

## Testing

- **Unit tests** — `vitest` for `lib/api/`, `lib/utils/`, and Yup schemas
- **Component tests** — `@testing-library/react` for Formik forms and interactive components
- **E2E tests** — `playwright` for critical user flows: auth, creating a reminder, logging an expense, viewing budget warnings
- API routes must be tested with a mocked Supabase client — never hit the production database in tests

---

## What NOT to Do

| ❌ Don't                                        | ✅ Do instead                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------- |
| Use raw `fetch` on the client                   | Use the configured Axios instance from `lib/axios`                  |
| Use Server Actions                              | Use `POST /PATCH /DELETE /api/...` Route Handlers                   |
| Validate on the client only                     | Share Yup schemas with the API route for dual validation            |
| Fetch data in `useEffect` from scratch          | Pass SSR `initialData` to Client Components; update via Axios hooks |
| Query Supabase without checking auth            | Always call `supabase.auth.getUser()` first in API routes           |
| Skip or disable RLS on any table                | Enable RLS and write user-scoped policies for every table           |
| Put business logic in components                | Put it in `lib/api/` or `lib/utils/`                                |
| Use `any` in TypeScript                         | Define strict types in `types/`                                     |
| Fetch data sequentially when it can be parallel | Use `Promise.all`                                                   |
| Skip Suspense on slow server fetches            | Wrap slow RSCs in `<Suspense>` with skeleton fallbacks              |
| Hardcode categories or currency                 | Use `config/constants.ts`                                           |
