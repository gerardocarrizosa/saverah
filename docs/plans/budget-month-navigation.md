# Budget Month Navigation

## Goal

Add the existing **Anterior / Actual / Siguiente** month navigation pattern to `/budget`, allowing users to view budget summaries for previous and future months. Preserve the selected month when opening income or expenses from the summary and when returning to the summary.

## Current State

- `src/app/(app)/budget/page.tsx` already reads the optional `month` search parameter, validates it through `getMonthRange`, and fetches the summary, income, and expenses for that month.
- `getBudgetSummary`, `getIncome`, and `getExpenses` already accept a month, so no API or database changes are needed.
- `/budget/income` and `/budget/expenses` already provide month navigation and accept the same `month` parameter.
- The budget hero currently links to `/budget/income` and `/budget/expenses` without preserving the selected month.
- The income and expenses pages currently link back to `/budget` without preserving the selected month.

## Implementation

### 1. Add month controls to the budget summary

Update `src/app/(app)/budget/page.tsx`:

- Derive the previous and next `YYYY-MM` values from the validated `monthContext` using UTC dates, matching the existing income/expenses behavior.
- Use `getMonthRange().month` for the **Actual** destination so it follows the application's configured timezone.
- Add a navigation section with three `Link` controls:
  - **Anterior** → `/budget?month=<previous-month>`
  - **Actual** → `/budget?month=<current-month>`
  - **Siguiente** → `/budget?month=<next-month>`
- Match the responsive layout, spacing, icons, and pill styling used on the income and expenses pages, using the budget page's primary color for **Actual**.
- Keep this change focused on adding navigation; do not redesign the summary or alter its empty-state behavior.

### 2. Preserve the month when drilling into income or expenses

Update `src/components/budget/BudgetHero.tsx`:

- Add a `selectedMonth: string` prop.
- Pass `monthContext` as `selectedMonth` from `src/app/(app)/budget/page.tsx`.
- Change the income card destination to `/budget/income?month=<selectedMonth>`.
- Change the expenses card destination to `/budget/expenses?month=<selectedMonth>`.

This ensures that viewing a past or future summary and clicking either total opens the transactions for that same month.

### 3. Preserve the month when returning to the summary

Update:

- `src/components/budget/IncomePageContent.tsx`
- `src/components/budget/ExpensesPageContent.tsx`

Change each **Volver a presupuesto** link to `/budget?month=<selectedMonth>`, using the existing `selectedMonth` prop. This returns the user to the exact summary they came from.

## Verification

- Run the available lint/build checks.
- Manually verify:
  - **Anterior** and **Siguiente** update all summary totals, transaction counts, and category values.
  - Navigation works across December/January boundaries.
  - **Actual** returns to the current month.
  - Future months can be viewed.
  - From a non-current summary, clicking **Ingresos** or **Gastos** opens that same month.
  - **Volver a presupuesto** returns to that same month's summary.
  - Invalid month parameters continue to fall back to the current month as they do today.

## Out of Scope

- API, database, or data-fetching changes.
- Refactoring the existing navigation into a shared component.
- Changes to empty states, transaction forms, or other summary behavior.
