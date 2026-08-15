# Data Model: Add Installment Expenses

## Persistence Strategy

Use the existing `expenses` table as the single persisted monthly expense entity. A normal expense remains one row. An installment purchase creates one `expenses` row per month, each representing the amount that impacts that month.

This design intentionally avoids a new `installment_purchases` table for the initial implementation. If future requirements need partial payment status, per-series attachments, audit history, or complex refinancing, a parent entity can be introduced later.

## Entity: Expense

Existing table: `expenses`

### Existing Fields

| Field         | Type           | Required | Notes                                                                                        |
| ------------- | -------------- | -------- | -------------------------------------------------------------------------------------------- |
| `id`          | UUID           | Yes      | Primary key.                                                                                 |
| `user_id`     | UUID           | Yes      | References `auth.users(id)` and is enforced by RLS.                                          |
| `description` | text           | Yes      | User-facing description in expense lists.                                                    |
| `amount`      | numeric(12, 2) | Yes      | For installment rows, this is the monthly installment amount, not the total purchase amount. |
| `category`    | text           | Yes      | Used for category summaries and limits.                                                      |
| `spent_at`    | date           | Yes      | Month that the expense impacts. For installments, each row has its own monthly date.         |
| `notes`       | text           | No       | User-entered notes.                                                                          |
| `created_at`  | timestamptz    | Yes      | Creation timestamp.                                                                          |

### New Nullable Fields On `expenses`

| Field                      | Type           | Required | Notes                                                                              |
| -------------------------- | -------------- | -------- | ---------------------------------------------------------------------------------- |
| `installment_group_id`     | UUID           | No       | Shared UUID across all rows in one installment purchase. Null for single expenses. |
| `installment_number`       | integer        | No       | 1-based sequence number for this monthly installment. Null for single expenses.    |
| `installment_total`        | integer        | No       | Total number of installments in the series. Null for single expenses.              |
| `installment_total_amount` | numeric(12, 2) | No       | Original full purchase amount entered by the user. Null for single expenses.       |
| `installment_start_date`   | date           | No       | Date selected for the first installment. Null for single expenses.                 |
| `installment_end_date`     | date           | No       | Date generated for the final installment. Null for single expenses.                |

### Validation Rules

Single expense rows:

- `description` is required and max 200 characters.
- `amount` is required and greater than 0.
- `category` is required.
- `spent_at` is required.
- `notes` is optional and max 500 characters.
- All installment metadata fields are null.

Installment rows:

- `installment_group_id` is present on every generated row in the series.
- `installment_number` is an integer from 1 through `installment_total`.
- `installment_total` is an integer greater than or equal to 2.
- `installment_total_amount` is greater than 0.
- `installment_start_date` equals the first row's `spent_at` date.
- `installment_end_date` equals the final generated row's `spent_at` date.
- The sum of `amount` across all rows with the same `user_id` and `installment_group_id` equals `installment_total_amount` exactly.
- All rows in a series share `description`, `category`, `notes`, `installment_group_id`, `installment_total`, `installment_total_amount`, `installment_start_date`, and `installment_end_date`.

### Relationships

- `expenses.user_id` belongs to one authenticated user.
- `expenses.category` participates in monthly category summaries with `budget_limits.category` for the same `user_id`.
- `expenses.installment_group_id` creates an implicit self-group among installment rows. There is no separate parent table in this design.

### State Interpretation

- Single expense: `installment_group_id` is null.
- Installment series: two or more `expenses` rows share `installment_group_id`.
- Current installment: row where `spent_at` falls inside the viewed month.
- Future installment: row where `spent_at` falls after the current viewed month.
- Completed series: all generated installment rows are before the month after `installment_end_date`; no extra persisted state is required.

## Entity: Monthly Expense Impact

This is not a separate table. It is the monthly view of `expenses` filtered by `spent_at`.

### Fields Exposed To UI

| Field                      | Source                                      | Notes                                         |
| -------------------------- | ------------------------------------------- | --------------------------------------------- |
| `id`                       | `expenses.id`                               | Used for editing/deleting.                    |
| `description`              | `expenses.description`                      | Displayed in Spanish UI.                      |
| `amount`                   | `expenses.amount`                           | Amount included in the viewed month.          |
| `category`                 | `expenses.category`                         | Used for grouping and badges.                 |
| `spent_at`                 | `expenses.spent_at`                         | Date inside the viewed month.                 |
| `is_installment`           | Derived from `installment_group_id != null` | Helps distinguish single vs installment rows. |
| `installment_label`        | Derived                                     | Example Spanish copy: `Cuota 2 de 6`.         |
| `installment_total_amount` | `expenses.installment_total_amount`         | Shows the original purchase total.            |
| `installment_start_date`   | `expenses.installment_start_date`           | Shows when the series starts.                 |
| `installment_end_date`     | `expenses.installment_end_date`             | Shows estimated final month.                  |

## Entity: Budget Category

Existing table: `budget_limits`

### Behavior With Installments

- Monthly category spent is still the sum of `expenses.amount` for rows in the viewed month.
- Installment rows count only in the month represented by their own `spent_at`.
- Warning thresholds remain unchanged: `warning` at 80% or more, `exceeded` at 100% or more.

## Generated Installment Algorithm

Inputs:

- `description`
- `category`
- `amount` as total purchase amount
- `spent_at` as start date
- `installment_count`
- `notes`

Rules:

1. If `installment_count` is missing or equals 1, create one normal `expenses` row with `amount` unchanged.
2. If `installment_count` is greater than 1, convert total amount to cents.
3. Calculate `baseCents = floor(totalCents / installment_count)`.
4. Calculate `remainderCents = totalCents % installment_count`.
5. For each installment number from 1 to `installment_count`, assign `baseCents + 1` while remainder remains, otherwise `baseCents`.
6. Generate each `spent_at` by adding `installment_number - 1` calendar months to the start date, clamping the day to the last valid day of the target month.
7. Insert all rows with a shared `installment_group_id` and identical series metadata.

## Database Migration Notes

The implementation phase should add a migration similar to `supabase/migrations/005_add_expense_installment_metadata.sql` that alters `expenses` only. It should include checks for nullable installment fields when present and indexes for efficient series operations.

Candidate indexes:

- `(user_id, installment_group_id)` for series edit/delete.
- Existing `(user_id)` and `(spent_at)` indexes continue supporting monthly budget reads.

Candidate constraints:

- `installment_total is null or installment_total >= 2`.
- `installment_number is null or installment_number >= 1`.
- Installment metadata should be either all null for single expenses or all present for installment rows, where practical in a table check.
