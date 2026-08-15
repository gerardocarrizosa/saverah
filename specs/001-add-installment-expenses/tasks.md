# Tasks: Add Installment Expenses

**Input**: Design documents from `/specs/001-add-installment-expenses/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: No automated test framework is currently configured in `package.json`. Tasks include manual/API validation and `npm run lint`; add automated tests only if the project test setup is introduced during implementation.

**Organization**: Tasks are grouped by user story and priority so P1 can ship as the MVP, followed by P2 and P3.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other tasks that touch different files.
- **[Story]**: User story traceability: `US1`, `US2`, `US3`, or `ALL` for shared work.
- Every implementation task references exact project paths.

---

## Phase 1: Setup And Foundation

**Purpose**: Add shared schema, types, and utilities that all stories depend on while preserving the existing `expenses` entity.

- [X] T001 [ALL] Create `supabase/migrations/005_add_expense_installment_metadata.sql` to alter only the existing `expenses` table with nullable columns `installment_group_id`, `installment_number`, `installment_total`, `installment_total_amount`, `installment_start_date`, and `installment_end_date`; add `(user_id, installment_group_id)` index and table checks for valid installment metadata.
- [X] T002 [P] [ALL] Update `src/types/budget.types.ts` so `Expense` includes nullable installment metadata fields and add input/response types for single expense creation and installment expense creation.
- [X] T003 [P] [ALL] Update `src/types/supabase.ts` to include the new nullable `expenses` columns in Row/Insert/Update definitions, keeping field names in English.
- [X] T004 [P] [ALL] Add `src/lib/utils/installments.ts` with pure helpers for cent-based amount splitting, monthly date generation with end-of-month clamping, and installment row draft generation.
- [X] T005 [ALL] Update `src/lib/validations/budget.schemas.ts` so `createExpenseSchema` accepts optional `is_installment` and `installment_count`, validates Spanish error messages, treats omitted or one installment as a normal expense, and requires integer `installment_count >= 2` when `is_installment` is true.
- [X] T006 [ALL] Ensure all shared code added in T002-T005 compiles in strict TypeScript without `any`, raw client `fetch`, Server Actions, or user-facing English copy.

**Checkpoint**: Database metadata, shared types, validation, and installment calculation utilities are ready; no user story work should start before this foundation is complete.

---

## Phase 2: User Story 1 - Registrar gastos en cuotas mensuales (Priority: P1) MVP

**Goal**: Users can create an installment expense and only the current month's installment amount impacts the current month.

**Independent Test**: Register a `600` expense with `6` installments from the current month and verify the current month expense total increases by `100`, not `600`; invalid installment counts show clear Spanish validation errors.

### Implementation for User Story 1

- [X] T007 [US1] Update `src/lib/api/budget.ts` `createExpense` so it branches between single-expense insert and installment-series insert based on validated `is_installment`/`installment_count`.
- [X] T008 [US1] In `src/lib/api/budget.ts`, implement installment-series insertion in one server-side Supabase operation using a generated `installment_group_id`, authenticated `userId`, monthly row drafts from `src/lib/utils/installments.ts`, and no client-supplied `user_id`.
- [X] T009 [US1] In `src/lib/api/budget.ts`, preserve existing single-expense behavior when `installment_count` is omitted or equals `1`, ensuring all installment metadata columns are null for single expenses.
- [X] T010 [US1] Update `src/app/api/budget/expenses/route.ts` POST handling to return `{ data: Expense }` for single expenses and `{ data: Expense[] }` for installment creation while keeping authenticated session checks, Yup validation, structured JSON errors, and `201` status.
- [X] T011 [US1] Update `src/hooks/useBudget.ts` `addExpense` typing and state handling so Axios can submit either single or installment payloads and refresh or merge returned installment rows without assuming POST always returns one `Expense`.
- [X] T012 [US1] Add installment controls to `src/app/(app)/budget/expenses/new/page.tsx` using Formik fields: Spanish toggle/selector for `Pago único` vs `En cuotas`, `installment_count`, and helper copy that explains `Monto` is the total purchase amount when installments are enabled.
- [X] T013 [US1] Ensure `src/app/(app)/budget/expenses/new/page.tsx` submits only validated fields through `useBudget.addExpense`, keeps all visible copy in Spanish, and redirects back to `/budget/expenses` after success.
- [X] T014 [US1] Manually validate POST `/api/budget/expenses` against `specs/001-add-installment-expenses/contracts/budget-expenses.md` for a normal expense, a `600 / 6` installment expense, `installment_count: 1`, and invalid counts less than `2`.
- [X] T015 [US1] Run `npm run lint` and fix any lint/type issues introduced by US1 work.

**Checkpoint**: P1 is independently functional: users can create installment expenses, the current month only shows the monthly installment amount, single expenses still behave normally, and validation is in Spanish.

---

## Phase 3: User Story 2 - Ver cuotas futuras y resúmenes mensuales (Priority: P2)

**Goal**: Future installments are visible in their corresponding months, and monthly/category summaries include only rows for the viewed month.

**Independent Test**: Register `600` in `6` installments starting in August, then verify August through January each include one `100` installment and February includes none; category limits use only each month's installment amount.

### Implementation for User Story 2

- [X] T016 [US2] Refactor month-range logic in `src/lib/api/budget.ts` into a reusable helper that accepts optional `YYYY-MM` input, validates it, defaults to the current month, and returns the month start/end range without breaking existing current-month behavior.
- [X] T017 [US2] Update `src/lib/api/budget.ts` `getExpenses(userId, month?)`, `getIncome(userId, month?)`, and `getBudgetSummary(userId, month?)` to use the selected month range while continuing to filter by authenticated `userId` and sum `expenses.amount` rows only inside that month.
- [X] T018 [US2] Update `src/app/api/budget/expenses/route.ts` GET to read optional `month` from `request.nextUrl.searchParams`, pass it to `getExpenses`, and return `422` with Spanish error copy for invalid month format.
- [X] T019 [US2] Update `src/app/api/budget/summary/route.ts` GET to read optional `month`, pass it to `getBudgetSummary`, and return `422` with Spanish error copy for invalid month format.
- [X] T020 [US2] Update `src/hooks/useBudget.ts` `refresh` to accept an optional `month` string and request `/budget/income`, `/budget/expenses`, and `/budget/summary` with the same month query parameter through Axios.
- [X] T021 [US2] Update `src/app/(app)/budget/page.tsx` to accept `searchParams.month`, pass the selected month into `getBudgetSummary`, `getIncome`, and `getExpenses`, and keep the three SSR calls in `Promise.all`.
- [X] T022 [US2] Update `src/app/(app)/budget/expenses/page.tsx` to accept `searchParams.month`, pass it into `getExpenses`, and calculate insights from the selected month's expenses only.
- [X] T023 [P] [US2] Add a compact Spanish month navigation/filter UI to `src/components/budget/ExpensesPageClient.tsx` that links to `/budget/expenses?month=YYYY-MM` for previous/current/next months without using raw client `fetch`.
- [X] T024 [P] [US2] Add a compact Spanish month context display to `src/components/budget/BudgetHero.tsx` or its parent in `src/app/(app)/budget/page.tsx` so users understand which month the totals represent.
- [X] T025 [US2] Manually validate `GET /api/budget/expenses?month=YYYY-MM` and `GET /api/budget/summary?month=YYYY-MM` against `specs/001-add-installment-expenses/contracts/budget-expenses.md` and `specs/001-add-installment-expenses/contracts/budget-summary.md` using current, future, post-final, and invalid month values.
- [X] T026 [US2] Run `npm run lint` and fix any lint/type issues introduced by US2 work.

**Checkpoint**: P2 is independently functional: future months show the correct installments, summaries and category warnings are month-scoped, and invalid month input is handled with structured API errors.

---

## Phase 4: User Story 3 - Distinguir gastos únicos de gastos en cuotas (Priority: P3)

**Goal**: Expense lists and details clearly distinguish single expenses from installment rows with Spanish labels and series metadata.

**Independent Test**: Register a normal expense and an installment expense, then confirm the monthly list shows only installment rows with labels like `Cuota 2 de 6` and details expose original total, current installment amount, total installments, start date, and estimated end date.

### Implementation for User Story 3

- [X] T027 [P] [US3] Add display helpers in `src/lib/utils/installments.ts` for `isInstallmentExpense`, Spanish installment label generation such as `Cuota 2 de 6`, and derived series detail values from an `Expense`.
- [X] T028 [US3] Update `src/components/budget/ExpenseList.tsx` to show Spanish installment badges only when `installment_group_id` is present, including `Cuota N de Total`, original total, and current installment amount without changing single-expense presentation.
- [X] T029 [US3] Update `src/components/budget/ExpensesPageClient.tsx` copy/counts as needed so installment rows are described as monthly charges while preserving existing design language and responsive behavior.
- [X] T030 [US3] Update `src/components/budget/EditExpenseForm.tsx` and/or `src/app/(app)/budget/expenses/[id]/edit/page.tsx` so viewing/editing an installment row clearly shows original total, installment progress, start date, and estimated end date in Spanish.
- [X] T031 [US3] Update delete confirmation behavior in `src/components/budget/ExpenseList.tsx` and `src/hooks/useBudget.ts` so installment rows can request full-series deletion with clear Spanish confirmation copy before calling `DELETE /api/budget/expenses/:id?scope=series`.
- [X] T032 [US3] Update `src/app/api/budget/expenses/[id]/route.ts` DELETE handling to support `scope=series`, delete only rows for the authenticated `userId` and target `installment_group_id`, and return `{ data: { success, deleted_count, scope } }`.
- [X] T033 [US3] If series editing is implemented in this increment, update `src/app/api/budget/expenses/[id]/route.ts` PATCH and `src/lib/api/budget.ts` to support `scope=series` by regenerating rows consistently; otherwise document single-row editing limitations in Spanish UI copy and defer full series edit to a follow-up task.
- [X] T034 [US3] Manually validate the P3 UI with one normal expense and one installment expense across at least two months, including deletion confirmation for an installment series.
- [X] T035 [US3] Run `npm run lint` and fix any lint/type issues introduced by US3 work.

**Checkpoint**: P3 is independently functional: installment expenses are visually distinct, details are understandable in Spanish, and full-series deletion is protected by explicit confirmation.

---

## Phase 5: Polish And Cross-Cutting Validation

**Purpose**: Verify end-to-end behavior, security boundaries, and project standards after the prioritized user stories are complete.

- [X] T036 [ALL] Execute the scenarios in `specs/001-add-installment-expenses/quickstart.md` and record any deviations as follow-up tasks.
- [X] T037 [ALL] Review all touched API routes in `src/app/api/budget/**/route.ts` for authenticated Supabase session checks, no client-supplied `user_id`, Yup validation before mutation, and standard JSON `{ data }` / `{ error }` responses.
- [X] T038 [ALL] Review all touched Client Components and hooks for project standards: Axios only for client HTTP, no raw client `fetch`, Formik + Yup for forms, Spanish user-facing copy, and English filenames/identifiers.
- [X] T039 [ALL] Review all budget SSR pages touched in `src/app/(app)/budget/**/page.tsx` to ensure initial data remains server-rendered and independent server queries still use `Promise.all` where applicable.
- [X] T040 [ALL] Run final `npm run lint` and fix remaining issues before marking the feature complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup And Foundation** has no feature dependencies and blocks all user stories.
- **Phase 2: US1 (P1)** depends on Phase 1 and is the MVP.
- **Phase 3: US2 (P2)** depends on Phase 1 and should be implemented after US1 for easiest validation with real installment rows.
- **Phase 4: US3 (P3)** depends on Phase 1 and benefits from US1 data; full-series deletion depends on series metadata from US1.
- **Phase 5: Polish** depends on the selected user stories being complete.

### User Story Dependencies

- **US1**: No dependency on US2 or US3. Delivers creation and correct current-month impact.
- **US2**: Uses the persisted rows generated by US1 but is otherwise focused on month selection and summaries.
- **US3**: Uses metadata generated by US1 and can be implemented after P1; deletion series support should be validated against P2 future-month visibility when available.

### Parallel Opportunities

- T002, T003, and T004 can run in parallel after T001 is understood because they touch different files.
- T023 and T024 can run in parallel during US2 because they touch separate UI surfaces.
- T027 can run in parallel with UI work planning for US3 because it is a utility-only task.
- Manual validation tasks should run only after their story implementation tasks are complete.

## Implementation Strategy

### MVP First

1. Complete Phase 1 foundation.
2. Complete Phase 2 P1 tasks T007-T015.
3. Stop and validate current-month impact with `600 / 6 = 100`.

### Incremental Delivery

1. Ship P1 creation and current-month totals.
2. Add P2 future-month browsing and month-scoped summaries.
3. Add P3 labels, details, and safer series deletion.
4. Run the quickstart scenarios and final lint.

## Coding Standards Checklist

- User-facing copy must be Spanish.
- File names, identifiers, database columns, and route names remain English.
- Client HTTP must use `src/lib/axios`; no raw client `fetch`.
- Forms must use Formik and shared Yup schemas from `src/lib/validations/`.
- API routes must authenticate first, validate before mutation, and return structured JSON.
- Supabase queries must filter by authenticated `userId` and never trust client-supplied ownership.
- Business logic belongs in `src/lib/api/` or `src/lib/utils/`, not inside UI components.
- Keep SSR initial data loading in Server Components; do not replace it with client `useEffect` initial loads.
