# Contract: Budget Expenses API

Base path: `/api/budget/expenses`

All endpoints require an authenticated Supabase session cookie. Client calls must use the configured Axios instance from `src/lib/axios`.

## GET `/api/budget/expenses`

Returns expenses for the selected month. Existing behavior returns the current month. Implementation may add month query parameters if future-month browsing is not already available.

### Query Parameters

| Name    | Required | Description                                                       |
| ------- | -------- | ----------------------------------------------------------------- |
| `month` | No       | Month to view in `YYYY-MM` format. Defaults to the current month. |

### Success Response

Status: `200`

```json
{
  "data": [
    {
      "id": "3f891836-42ef-4d55-a052-138c6636d414",
      "user_id": "authenticated-user-id",
      "description": "Laptop",
      "amount": 100,
      "category": "Tecnología",
      "spent_at": "2026-08-14",
      "notes": "Compra financiada",
      "created_at": "2026-08-14T16:00:00.000Z",
      "installment_group_id": "bbf121a4-f093-4f15-b8c7-db1de6ef6817",
      "installment_number": 1,
      "installment_total": 6,
      "installment_total_amount": 600,
      "installment_start_date": "2026-08-14",
      "installment_end_date": "2027-01-14"
    }
  ]
}
```

## POST `/api/budget/expenses`

Creates either one single expense or a full monthly installment series.

### Request Body: Single Expense

```json
{
  "description": "Supermercado",
  "amount": 850.5,
  "category": "Alimentación",
  "spent_at": "2026-08-14",
  "notes": "Compra semanal"
}
```

### Request Body: Installment Expense

```json
{
  "description": "Laptop",
  "amount": 600,
  "category": "Tecnología",
  "spent_at": "2026-08-14",
  "notes": "Compra financiada",
  "is_installment": true,
  "installment_count": 6
}
```

### Validation

- `description` is required and max 200 characters.
- `amount` is required and greater than 0. For installment creation, it is the original total purchase amount.
- `category` is required.
- `spent_at` is required and represents the first installment date.
- `notes` is optional and max 500 characters.
- `installment_count` is optional for single expenses.
- If `is_installment` is true, `installment_count` must be an integer greater than or equal to 2.
- If `installment_count` is 1 or omitted, the request is treated as a single expense.

### Success Response: Single Expense

Status: `201`

```json
{
  "data": {
    "id": "2f31f6a6-2058-489d-a203-1f2ce0678ac8",
    "description": "Supermercado",
    "amount": 850.5,
    "category": "Alimentación",
    "spent_at": "2026-08-14",
    "notes": "Compra semanal",
    "installment_group_id": null,
    "installment_number": null,
    "installment_total": null,
    "installment_total_amount": null,
    "installment_start_date": null,
    "installment_end_date": null
  }
}
```

### Success Response: Installment Expense

Status: `201`

The endpoint returns all generated monthly expense rows so the client can refresh current and future views consistently.

```json
{
  "data": [
    {
      "description": "Laptop",
      "amount": 100,
      "category": "Tecnología",
      "spent_at": "2026-08-14",
      "installment_group_id": "bbf121a4-f093-4f15-b8c7-db1de6ef6817",
      "installment_number": 1,
      "installment_total": 6,
      "installment_total_amount": 600,
      "installment_start_date": "2026-08-14",
      "installment_end_date": "2027-01-14"
    }
  ]
}
```

### Error Responses

- `401`: `{ "error": "Unauthorized" }`
- `422`: `{ "error": "La cantidad de cuotas debe ser un número entero mayor o igual a 2" }`
- `500`: `{ "error": "Internal server error" }`

## PATCH `/api/budget/expenses/:id`

Updates a single expense or an installment series.

### Query Parameters

| Name    | Required | Description                                                                                                        |
| ------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `scope` | No       | `single` updates only `:id`. `series` updates all rows with the same `installment_group_id`. Defaults to `single`. |

### Series Update Request Body

```json
{
  "description": "Laptop actualizada",
  "amount": 720,
  "category": "Tecnología",
  "spent_at": "2026-08-14",
  "notes": "Nuevo total",
  "is_installment": true,
  "installment_count": 6
}
```

### Behavior

- `scope=single` keeps existing behavior for normal expenses.
- `scope=series` validates that the target expense belongs to an installment series for the authenticated user.
- Series update regenerates installment rows so the sum remains equal to the new total.
- Server logic must avoid leaving rows with inconsistent total/count metadata.

### Success Response

Status: `200`

```json
{
  "data": {
    "updated": true,
    "scope": "series",
    "installment_group_id": "bbf121a4-f093-4f15-b8c7-db1de6ef6817"
  }
}
```

## DELETE `/api/budget/expenses/:id`

Deletes a single expense or a full installment series.

### Query Parameters

| Name    | Required | Description                                                                                                        |
| ------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `scope` | No       | `single` deletes only `:id`. `series` deletes all rows with the same `installment_group_id`. Defaults to `single`. |

### Behavior

- For non-installment expenses, `scope=single` deletes the row by `id` and `user_id`.
- For installment rows, UI should show Spanish confirmation before using `scope=series`, for example: `Esto eliminará todas las cuotas de esta compra.`
- Server must filter by authenticated `user_id` and the target row's `installment_group_id`.

### Success Response

Status: `200`

```json
{
  "data": {
    "success": true,
    "deleted_count": 6,
    "scope": "series"
  }
}
```
