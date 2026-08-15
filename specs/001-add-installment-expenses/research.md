# Research: Add Installment Expenses

## Decision: Reuse the existing `expenses` table for installment rows

**Rationale**: The user explicitly prefers existing entities where possible. The budget summary already calculates totals and category warnings by summing `expenses.amount` inside the monthly `spent_at` range. If each installment is stored as one monthly `expenses` row, current and future budgets naturally include only the installment due in that month without a new query path or join.

**Alternatives considered**: A dedicated `installment_purchases` parent table plus `installment_payments` child table would model the domain more explicitly, but adds entities, RLS policies, joins, and API contracts before the current requirements prove that complexity is needed. A single parent row with derived future installments at read time avoids row generation, but complicates monthly summaries, category limits, editing, and exact historical display.

## Decision: Extend `expenses` with nullable installment metadata

**Rationale**: The current `expenses` fields can represent each visible monthly charge: `description`, `amount`, `category`, and `spent_at`. Additional nullable columns are needed only to connect rows in a series and display progress/details: `installment_group_id`, `installment_number`, `installment_total`, `installment_total_amount`, `installment_start_date`, and `installment_end_date`. Single expenses leave these fields null.

**Alternatives considered**: Encoding metadata in `notes` was rejected because it is fragile, user-editable text and cannot be reliably queried. Adding a separate table was rejected for this phase because the existing table can satisfy the functional requirements with fewer moving parts.

## Decision: Treat one installment as a single expense

**Rationale**: FR-011 requires a one-installment selection to avoid creating a series. The API should normalize `installment_count` values of `undefined`, `null`, or `1` into the existing single-expense creation path. Installment metadata remains null.

**Alternatives considered**: Creating one-row series for every expense would simplify type branching, but would pollute the UI with unnecessary installment labels and violate the requirement to treat one installment as a normal expense.

## Decision: Split amounts using integer cents and allocate rounding remainder deterministically

**Rationale**: FR-006 and SC-003 require the sum of installments to exactly match the user-entered total. Calculating in cents avoids floating-point drift. The base installment amount is `floor(totalCents / installmentCount)` and the remaining cents are distributed one cent at a time to the earliest installments until the remainder is exhausted.

**Alternatives considered**: Equal decimal division rounded to two places can produce totals that differ by one or more cents. Assigning all remainder to the last installment also works, but early distribution keeps installment amounts as balanced as possible.

## Decision: Generate monthly installment dates by calendar month from the selected start date

**Rationale**: The first installment applies to the month of `spent_at`; subsequent installments are consecutive calendar months. The generated `spent_at` value should preserve the selected day where valid and clamp to the last day of shorter months if necessary. This handles year changes without special-case UI logic.

**Alternatives considered**: Always using the first day of each month would make monthly filtering easy, but loses the date the user chose for the purchase. Adding fixed 30-day increments was rejected because it drifts across calendar months.

## Decision: Keep monthly summary logic based on `expenses.spent_at`

**Rationale**: Existing `getBudgetSummary` already filters current-month expenses and sums category totals. Because installment rows are monthly expense rows, summaries and category warnings work with minimal changes. The implementation only needs to support selecting the month under review if future-month browsing is not already implemented.

**Alternatives considered**: Calculating installments dynamically in the summary endpoint would avoid persisted future rows, but adds read-time complexity and risks inconsistent category warning behavior.

## Decision: Mutations happen through existing expense endpoints with extended payloads

**Rationale**: `/api/budget/expenses` is already the expense creation endpoint. Extending its POST payload with optional installment fields preserves the API route boundary and avoids a separate endpoint until a new entity is justified. Deleting or editing a full series can be expressed through query/body options on existing `/api/budget/expenses/:id` contracts.

**Alternatives considered**: A dedicated `/api/budget/installments` endpoint would make the domain explicit, but implies a distinct external contract for a concept that is still persisted as `expenses` rows.

## Decision: Series edit/delete should operate by `installment_group_id`

**Rationale**: A clear confirmation can warn users that all related installments will be affected. Server-side functions can filter by both `user_id` and `installment_group_id` to enforce ownership and avoid affecting unrelated rows. This supports FR-013 and FR-014 without a new parent table.

**Alternatives considered**: Deleting only the clicked installment is useful for some workflows, but the specification emphasizes deleting a purchase in installments. The contract can still allow single-row deletion as the default for non-series expenses.
