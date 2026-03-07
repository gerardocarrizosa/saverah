# ENTITIES.md — Saverah

This document describes every data entity in Saverah, its purpose, its fields, and how it relates to other entities.

---

## Entity Overview

```
auth.users (Supabase managed)
    │
    ├──< reminders
    │        └──< reminder_payments
    │
    ├──< income_entries
    │
    ├──< expense_entries
    │
    └──< budget_limits
```

---

## 1. `users` _(managed by Supabase Auth)_

**Purpose:** Represents an authenticated user of the application. This table is fully managed by Supabase's `auth.users` schema — Saverah does not create or own this table. All other entities reference `auth.users(id)` via a `user_id` foreign key.

Optionally, a `profiles` table can extend this entity with app-specific user preferences.

| Column       | Type          | Notes                                 |
| ------------ | ------------- | ------------------------------------- |
| `id`         | `uuid`        | Primary key, managed by Supabase Auth |
| `email`      | `text`        | User's email address                  |
| `created_at` | `timestamptz` | Account creation date                 |

### Relationships

- **One `user` → many `reminders`**
- **One `user` → many `reminder_payments`**
- **One `user` → many `income_entries`**
- **One `user` → many `expense_entries`**
- **One `user` → many `budget_limits`**
- **One `user` → one `profile`** _(optional extension)_

---

## 2. `profiles`

**Purpose:** Extends the Supabase `auth.users` entity with app-level user preferences and display settings. Created automatically upon first sign-in via a Supabase database trigger. Stores currency preference, locale, and display name so the app can adapt formatting and greetings per user.

| Column                     | Type          | Constraints               | Notes                                                      |
| -------------------------- | ------------- | ------------------------- | ---------------------------------------------------------- |
| `id`                       | `uuid`        | PK, FK → `auth.users(id)` | Matches the Supabase auth user ID                          |
| `display_name`             | `text`        | nullable                  | How the user's name appears in the UI                      |
| `currency`                 | `text`        | default `'USD'`           | ISO 4217 currency code (e.g., `USD`, `MXN`, `EUR`)         |
| `locale`                   | `text`        | default `'en-US'`         | BCP 47 locale tag for number and date formatting           |
| `monthly_budget_start_day` | `int`         | default `1`, 1–31         | Day of month the user considers the budget period to start |
| `created_at`               | `timestamptz` | default `now()`           |                                                            |
| `updated_at`               | `timestamptz` | default `now()`           |                                                            |

### Relationships

- **One `profile` → one `user`** (1:1 extension)

---

## 3. `reminders`

**Purpose:** The core entity of the reminders feature. Represents a recurring financial obligation the user needs to pay — such as a utility bill, credit card, loan payment, streaming subscription, or any other service. Each reminder stores when payment is due (day of month) and how often it recurs. The actual payment amounts are tracked separately in `reminder_payments`. The app uses this to compute days remaining and surface overdue alerts.

| Column       | Type            | Constraints                                          | Notes                                                                            |
| ------------ | --------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| `id`         | `uuid`          | PK, default `gen_random_uuid()`                      |                                                                                  |
| `user_id`    | `uuid`          | FK → `auth.users(id)`, `ON DELETE CASCADE`, NOT NULL | Owner of the reminder                                                            |
| `name`       | `text`          | NOT NULL                                             | Display name (e.g., "Netflix", "Electricity Bill")                               |
| `due_day`    | `int`           | NOT NULL, 1–31                                       | Day of month the payment is due                                                  |
| `recurrence` | `text`          | NOT NULL, enum                                       | `'monthly'`, `'yearly'`, `'weekly'`                                              |
| `category`   | `text`          | NOT NULL                                             | See category constants (e.g., `'subscriptions'`, `'utilities'`, `'credit_card'`) |
| `color`      | `text`          | nullable                                             | Optional hex color for UI card theming                                           |
| `icon`       | `text`          | nullable                                             | Optional icon identifier for the UI                                              |
| `notes`      | `text`          | nullable, max 500 chars                              | Free-form notes                                                                  |
| `is_active`  | `boolean`       | default `true`                                       | Soft-disable without deleting                                                    |
| `created_at` | `timestamptz`   | default `now()`                                      |                                                                                  |
| `updated_at` | `timestamptz`   | default `now()`                                      |                                                                                  |

### Derived / Computed Values _(not stored, computed at query time)_

- **Days until due** — computed from `due_day` + `recurrence` + today's date
- **Is overdue** — `days_until_due < 0`
- **Next due date** — the full calendar date of the next occurrence

### Relationships

- **Many `reminders` → one `user`**
- **One `reminder` → many `reminder_payments`** (payment history)

### Reminder Categories (enum-like constants)

`subscriptions` · `utilities` · `credit_card` · `loan` · `insurance` · `rent` · `phone` · `internet` · `taxes` · `other`

---

## 4. `reminder_payments`

**Purpose:** Records each time the user marks a reminder as paid. This is the foundation of the reminder analytics feature — payment history enables the app to show how many times a bill has been paid, the total amount paid over time, the last payment date, and trends over months. A user can also log a payment with a different amount than the reminder's default (e.g., a variable electricity bill).

| Column        | Type            | Constraints                                          | Notes                                                   |
| ------------- | --------------- | ---------------------------------------------------- | ------------------------------------------------------- |
| `id`          | `uuid`          | PK, default `gen_random_uuid()`                      |                                                         |
| `reminder_id` | `uuid`          | FK → `reminders(id)`, `ON DELETE CASCADE`, NOT NULL  | Which reminder was paid                                 |
| `user_id`     | `uuid`          | FK → `auth.users(id)`, `ON DELETE CASCADE`, NOT NULL | Denormalized for RLS and query simplicity               |
| `amount_paid` | `numeric(12,2)` | NOT NULL, positive                                   | Actual amount paid for this payment instance |
| `paid_at`     | `timestamptz`   | NOT NULL                                             | When the user marked it as paid                         |
| `notes`       | `text`          | nullable                                             | Optional note for this specific payment                 |
| `created_at`  | `timestamptz`   | default `now()`                                      |                                                         |

### Relationships

- **Many `reminder_payments` → one `reminder`**
- **Many `reminder_payments` → one `user`**

### Analytics Derived from This Entity

- Total paid (all time) per reminder
- Average payment amount per reminder
- Payment count per reminder
- Last payment date
- Monthly payment trend (grouped by month)

---

## 5. `income_entries`

**Purpose:** Represents a single instance of money received by the user. Income can be steady (regular salary, fixed freelance retainer) or variable (one-off projects, bonuses, gifts). The budget tracker aggregates all income entries within a period to compute total available funds, which it then compares against total expenses to show remaining balance.

| Column         | Type            | Constraints                                          | Notes                                                                           |
| -------------- | --------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| `id`           | `uuid`          | PK, default `gen_random_uuid()`                      |                                                                                 |
| `user_id`      | `uuid`          | FK → `auth.users(id)`, `ON DELETE CASCADE`, NOT NULL | Owner                                                                           |
| `source`       | `text`          | NOT NULL                                             | Label for the income source (e.g., "Salary - Acme Corp", "Freelance Project X") |
| `type`         | `text`          | NOT NULL, enum                                       | `'steady'`, `'variable'`, `'other'`                                             |
| `amount`       | `numeric(12,2)` | NOT NULL, positive                                   | Amount received                                                                 |
| `received_at`  | `date`          | NOT NULL                                             | Date the income was received                                                    |
| `is_recurring` | `boolean`       | default `false`                                      | Whether this is a regular repeating income                                      |
| `recurrence`   | `text`          | nullable, enum                                       | `'monthly'`, `'biweekly'`, `'weekly'` — only if `is_recurring = true`           |
| `notes`        | `text`          | nullable                                             |                                                                                 |
| `created_at`   | `timestamptz`   | default `now()`                                      |                                                                                 |
| `updated_at`   | `timestamptz`   | default `now()`                                      |                                                                                 |

### Relationships

- **Many `income_entries` → one `user`**

### Income Types

- `steady` — Predictable, regular income (salary, monthly retainer)
- `variable` — Irregular or project-based income (freelance, commissions)
- `other` — Gifts, tax returns, any other source

---

## 6. `expense_entries`

**Purpose:** Records a single expense the user has made. This is the primary entity for the budget tracking feature. Each expense is tagged with a category so the app can group and total spending per category, compare against `budget_limits`, and warn the user when they are near or over their limit. Expenses are distinct from reminders — a reminder is a bill scheduled in the future, while an expense is something the user has already spent money on.

| Column           | Type            | Constraints                                          | Notes                                                         |
| ---------------- | --------------- | ---------------------------------------------------- | ------------------------------------------------------------- |
| `id`             | `uuid`          | PK, default `gen_random_uuid()`                      |                                                               |
| `user_id`        | `uuid`          | FK → `auth.users(id)`, `ON DELETE CASCADE`, NOT NULL | Owner                                                         |
| `description`    | `text`          | NOT NULL                                             | What the expense was for (e.g., "Grocery run", "Gas fill-up") |
| `amount`         | `numeric(12,2)` | NOT NULL, positive                                   | Amount spent                                                  |
| `category`       | `text`          | NOT NULL                                             | Must match a valid expense category constant                  |
| `spent_at`       | `date`          | NOT NULL                                             | Date the expense occurred                                     |
| `payment_method` | `text`          | nullable, enum                                       | `'cash'`, `'debit'`, `'credit'`, `'transfer'`, `'other'`      |
| `notes`          | `text`          | nullable                                             |                                                               |
| `created_at`     | `timestamptz`   | default `now()`                                      |                                                               |
| `updated_at`     | `timestamptz`   | default `now()`                                      |                                                               |

### Relationships

- **Many `expense_entries` → one `user`**
- **Many `expense_entries` → one `budget_limit`** _(implicit, via `category` field)_

### Expense Categories (enum-like constants)

`food` · `transport` · `housing` · `health` · `entertainment` · `clothing` · `education` · `utilities` · `personal_care` · `savings` · `subscriptions` · `travel` · `gifts` · `other`

---

## 7. `budget_limits`

**Purpose:** Defines the maximum amount a user is willing to spend in a given category per month. The budget summary engine reads these limits alongside actual `expense_entries` for the current period and computes a status for each category: `ok`, `warning` (≥ 80% spent), or `exceeded` (≥ 100% spent). A user may have a limit for some categories and none for others — uncapped categories are tracked but not warned against.

| Column          | Type            | Constraints                                          | Notes                                              |
| --------------- | --------------- | ---------------------------------------------------- | -------------------------------------------------- |
| `id`            | `uuid`          | PK, default `gen_random_uuid()`                      |                                                    |
| `user_id`       | `uuid`          | FK → `auth.users(id)`, `ON DELETE CASCADE`, NOT NULL | Owner                                              |
| `category`      | `text`          | NOT NULL                                             | Must match a valid expense category constant       |
| `monthly_limit` | `numeric(12,2)` | NOT NULL, positive                                   | Maximum amount allowed for this category per month |
| `created_at`    | `timestamptz`   | default `now()`                                      |                                                    |
| `updated_at`    | `timestamptz`   | default `now()`                                      |                                                    |

**Unique constraint:** `(user_id, category)` — one limit per category per user.

### Relationships

- **Many `budget_limits` → one `user`**
- **One `budget_limit` ↔ many `expense_entries`** _(linked by matching `category` value)_

### Warning Thresholds

| Status     | Condition                             |
| ---------- | ------------------------------------- |
| `ok`       | `spent / monthly_limit < 0.80`        |
| `warning`  | `0.80 ≤ spent / monthly_limit < 1.00` |
| `exceeded` | `spent / monthly_limit ≥ 1.00`        |

---

## Entity Relationship Summary

| Entity            | Relates To          | Relationship          | Via                             |
| ----------------- | ------------------- | --------------------- | ------------------------------- |
| `users`           | `profiles`          | 1 : 1                 | `profiles.id`                   |
| `users`           | `reminders`         | 1 : many              | `reminders.user_id`             |
| `users`           | `reminder_payments` | 1 : many              | `reminder_payments.user_id`     |
| `users`           | `income_entries`    | 1 : many              | `income_entries.user_id`        |
| `users`           | `expense_entries`   | 1 : many              | `expense_entries.user_id`       |
| `users`           | `budget_limits`     | 1 : many              | `budget_limits.user_id`         |
| `reminders`       | `reminder_payments` | 1 : many              | `reminder_payments.reminder_id` |
| `expense_entries` | `budget_limits`     | many : 1 _(implicit)_ | matching `category` field       |

---

## Shared Category Constants

Categories are defined as constants in `config/constants.ts` and reused across `reminders`, `expense_entries`, and `budget_limits` to ensure consistency.

```ts
// config/constants.ts

export const REMINDER_CATEGORIES = [
  'subscriptions',
  'utilities',
  'credit_card',
  'loan',
  'insurance',
  'rent',
  'phone',
  'internet',
  'taxes',
  'other',
] as const;

export const EXPENSE_CATEGORIES = [
  'food',
  'transport',
  'housing',
  'health',
  'entertainment',
  'clothing',
  'education',
  'utilities',
  'personal_care',
  'savings',
  'subscriptions',
  'travel',
  'gifts',
  'other',
] as const;

export type ReminderCategory = (typeof REMINDER_CATEGORIES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
```

---

## TypeScript Types

```ts
// types/reminder.types.ts
export type Recurrence = 'monthly' | 'yearly' | 'weekly';
export type ReminderCategory = (typeof REMINDER_CATEGORIES)[number];

export interface Reminder {
  id: string;
  user_id: string;
  name: string;
  due_day: number;
  recurrence: Recurrence;
  category: ReminderCategory;
  color: string | null;
  icon: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Computed fields returned by the API
  days_until_due: number;
  is_overdue: boolean;
  next_due_date: string;
}

export interface ReminderPayment {
  id: string;
  reminder_id: string;
  user_id: string;
  amount_paid: number;
  paid_at: string;
  notes: string | null;
  created_at: string;
}

export interface ReminderAnalytics {
  reminder: Reminder;
  total_paid: number;
  payment_count: number;
  average_amount: number;
  last_paid_at: string | null;
  payment_history: ReminderPayment[];
}
```

```ts
// types/budget.types.ts
export type IncomeType = 'steady' | 'variable' | 'other';
export type IncomeRecurrence = 'monthly' | 'biweekly' | 'weekly';
export type PaymentMethod = 'cash' | 'debit' | 'credit' | 'transfer' | 'other';
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type BudgetStatus = 'ok' | 'warning' | 'exceeded';

export interface IncomeEntry {
  id: string;
  user_id: string;
  source: string;
  type: IncomeType;
  amount: number;
  received_at: string;
  is_recurring: boolean;
  recurrence: IncomeRecurrence | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseEntry {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  spent_at: string;
  payment_method: PaymentMethod | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BudgetLimit {
  id: string;
  user_id: string;
  category: ExpenseCategory;
  monthly_limit: number;
  created_at: string;
  updated_at: string;
}

export interface CategorySummary {
  category: ExpenseCategory;
  spent: number;
  limit: number | null;
  percentage: number | null;
  status: BudgetStatus;
}

export interface BudgetSummary {
  period: { start: string; end: string };
  total_income: number;
  total_expenses: number;
  balance: number;
  categories: CategorySummary[];
}
```

```ts
// types/profile.types.ts
export interface Profile {
  id: string;
  display_name: string | null;
  currency: string;
  locale: string;
  monthly_budget_start_day: number;
  created_at: string;
  updated_at: string;
}
```
