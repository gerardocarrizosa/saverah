# Quickstart: Validate Installment Expenses

## Prerequisites

- Node dependencies installed with `npm install`.
- Supabase environment variables configured in `.env.local`.
- Local database includes the existing Saverah schema and the implementation migration that extends `expenses` with installment metadata.
- A test user can sign in through the app.

## Run The App

```bash
npm run dev
```

Open the app, sign in, and navigate to the budget expense registration flow.

## Scenario 1: Single Expense Remains Unchanged

1. Register a normal expense with description `Supermercado`, amount `850.50`, category `Alimentación`, and today's date.
2. Open the current month budget view.
3. Expected result: the expense list shows one normal expense without installment copy.
4. Expected result: the current month total increases by `850.50`.
5. Expected result: category warning calculations include `850.50` in `Alimentación`.

## Scenario 2: Six Monthly Installments From Current Month

1. Register an installment expense with description `Laptop`, total amount `600`, category `Tecnología`, start date in the current month, and `6` monthly installments.
2. Open the current month budget view.
3. Expected result: the current month total increases by `100`, not `600`.
4. Expected result: the list identifies the row in Spanish as part of a series, for example `Cuota 1 de 6`.
5. Open each of the next five monthly views.
6. Expected result: each month shows one `Laptop` installment of `100` with the correct installment number.
7. Open the month after the final installment.
8. Expected result: the `Laptop` installment no longer appears and no longer affects totals.

## Scenario 3: Rounding Is Exact

1. Register an installment expense with total amount `100`, category `Tecnología`, and `3` installments.
2. Inspect the generated monthly rows through the UI or API.
3. Expected result: the installment amounts are distributed across three rows and sum exactly to `100.00`.
4. Expected result: no floating-point artifacts are visible in currency formatting.

## Scenario 4: Future Start Month

1. Register an installment expense with total amount `600`, `6` installments, and a start date two months in the future.
2. Open the current month budget view.
3. Expected result: no installment from this purchase appears in the current month.
4. Open the selected future start month.
5. Expected result: the first installment appears in that month.

## Scenario 5: Category Limit Warning Uses Monthly Installment Only

1. Set a monthly limit of `500` for `Tecnología`.
2. Register a `600` purchase in `6` installments for `Tecnología`.
3. Open the first installment month summary.
4. Expected result: `Tecnología` spent includes `100` from the installment, not `600`.
5. Expected result: status is based on the monthly category total after adding `100`.

## Scenario 6: Delete Full Series With Confirmation

1. In a month containing an installment row, choose delete for the installment purchase.
2. Expected result: the UI asks for clear Spanish confirmation that all related installments will be deleted.
3. Confirm deletion.
4. Expected result: all rows in the series disappear from current and future months.
5. Expected result: unrelated single expenses and other series remain unchanged.

## API Validation

Use the contracts in `specs/001-add-installment-expenses/contracts/` to validate request and response shapes:

- `contracts/budget-expenses.md`
- `contracts/budget-summary.md`

## Static Checks

```bash
npm run lint
```

Expected result: lint completes without new errors from the installment feature.
