# Implementation Plan: Add Installment Expenses

**Branch**: `001-add-installment-expenses` | **Date**: 2026-08-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-add-installment-expenses/spec.md`

## Summary

Allow users to register either a single expense or a monthly installment purchase. The implementation will reuse the existing `expenses` table as the persisted monthly expense entity: single expenses remain one row, while an installment purchase creates one `expenses` row per monthly installment with shared series metadata. Monthly totals, category usage, and budget warnings continue to sum `expenses.amount` within the selected month, so the current month only includes the installment amount instead of the full purchase total.

No new table is planned for the initial implementation. The existing `expenses` entity will be extended with nullable installment-series columns only if needed to distinguish installment rows and support series edit/delete behavior.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 15 App Router

**Primary Dependencies**: Next.js Route Handlers, Supabase Auth/PostgreSQL via `@supabase/ssr` and `@supabase/supabase-js`, Axios, Formik, Yup, Tailwind CSS, DaisyUI, Lucide

**Storage**: Supabase PostgreSQL; reuse existing `expenses`, `budget_limits`, and user-scoped RLS policies; extend `expenses` with nullable installment metadata columns instead of adding new tables in this phase

**Testing**: Current package exposes `npm run lint`; implementation should add Vitest or equivalent tests for installment split utilities and Yup validation if the project test setup is introduced

**Target Platform**: Web application running on Next.js App Router with SSR pages and API Route Handlers

**Project Type**: Web application with frontend and backend in one Next.js project under `src/`

**Performance Goals**: Creating an installment purchase should insert all monthly rows in one server-side operation; monthly budget reads should remain index-friendly by filtering `expenses.spent_at` and `expenses.user_id`

**Constraints**: User-facing copy in Spanish; client HTTP through Axios only; forms through Formik + shared Yup schemas; all mutations authenticated through API routes; all user-owned data filtered by `user_id`; preserve exact cent-level total across installments

**Scale/Scope**: Personal finance workflow for one authenticated user's budget; initial scope covers monthly consecutive installments, future-month visibility, category warning calculations, and clear single-vs-installment display

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**I. API Routes Are The Primary Data Layer**: PASS. Expense creation, update, deletion, and reads remain behind `src/app/api/budget/*` Route Handlers. Client UI will use `src/lib/axios` through hooks or form submitters.

**II. SSR And Server Components By Default**: PASS. Budget pages should continue to fetch initial monthly data during SSR and pass it into leaf Client Components for form/list interactivity.

**III. Client HTTP And Forms Are Standardized**: PASS. The expense form remains a Client Component using Formik and shared Yup schemas from `src/lib/validations/budget.schemas.ts`.

**IV. User Data Ownership And Security Are Mandatory**: PASS. `expenses` already has `user_id` and RLS. New installment rows must be inserted with authenticated `user.id`; no client-supplied owner is accepted.

**V. Performance, Localization, And Clean Boundaries**: PASS. Installment splitting belongs in `src/lib/utils` or `src/lib/api/budget.ts`; API response types in `src/types`; Spanish UI copy; English file and identifier names.

No constitution violations identified.

## Project Structure

### Documentation (this feature)

```text
specs/001-add-installment-expenses/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── budget-expenses.md
│   └── budget-summary.md
└── tasks.md             # Phase 2 output; not created by this plan
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (app)/budget/expenses/
│   │   └── ...                     # Expense pages and SSR initial data
│   └── api/budget/
│       ├── expenses/route.ts        # GET monthly expenses, POST single or installment expense
│       ├── expenses/[id]/route.ts   # PATCH/DELETE expense or installment series semantics
│       └── summary/route.ts         # Monthly totals and category warnings
├── components/budget/
│   ├── ExpenseForm.tsx              # Formik UI with single/installment controls
│   └── ExpenseList.tsx              # Spanish installment labels and delete confirmation
├── hooks/
│   └── useBudget.ts                 # Axios calls for expense mutations and refresh
├── lib/
│   ├── api/budget.ts                # Auth-scoped Supabase reads/writes and series operations
│   ├── utils/installments.ts         # Split amount and month generation helpers
│   └── validations/budget.schemas.ts # Shared Yup schemas for single/installment expenses
├── types/
│   └── budget.types.ts              # Expense installment metadata and API input/output types
└── config/constants.ts              # Existing categories/currency remain source of truth

supabase/
└── migrations/
    └── 005_add_expense_installment_metadata.sql # Extend existing expenses table only
```

**Structure Decision**: Use the existing `src/` Next.js structure and existing budget domain files. Avoid introducing a separate installment table for the initial design; represent visible monthly installments as rows in `expenses` with nullable metadata that links rows in the same series.

## Complexity Tracking

No constitution violations or complexity exceptions are required.

## Phase 0: Research Summary

See [research.md](./research.md). Key decisions: reuse `expenses`; generate one row per installment month; split money in cents to preserve exact totals; keep API routes as the mutation contract.

## Phase 1: Design Summary

See [data-model.md](./data-model.md), [contracts/budget-expenses.md](./contracts/budget-expenses.md), [contracts/budget-summary.md](./contracts/budget-summary.md), and [quickstart.md](./quickstart.md).

## Post-Design Constitution Check

**I. API Routes Are The Primary Data Layer**: PASS. Contracts define only `/api/budget/expenses` and `/api/budget/summary` changes.

**II. SSR And Server Components By Default**: PASS. Quickstart validates SSR monthly views and client refresh behavior without moving initial data loading to `useEffect`.

**III. Client HTTP And Forms Are Standardized**: PASS. Design keeps Formik/Yup and Axios.

**IV. User Data Ownership And Security Are Mandatory**: PASS. Data model keeps `user_id` on every persisted row and relies on existing RLS plus user-scoped queries.

**V. Performance, Localization, And Clean Boundaries**: PASS. Design places calculation helpers outside components, keeps Spanish UI labels, and relies on indexed date/user queries.
