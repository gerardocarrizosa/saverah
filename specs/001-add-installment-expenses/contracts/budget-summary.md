# Contract: Budget Summary API

Base path: `/api/budget/summary`

All endpoints require an authenticated Supabase session cookie. Client calls must use the configured Axios instance from `src/lib/axios`.

## GET `/api/budget/summary`

Returns income, expense totals, balance, and category warning states for the selected month. Installment expenses are included exactly like other `expenses` rows: only rows whose `spent_at` falls in the viewed month affect totals.

### Query Parameters

| Name    | Required | Description                                                            |
| ------- | -------- | ---------------------------------------------------------------------- |
| `month` | No       | Month to summarize in `YYYY-MM` format. Defaults to the current month. |

### Installment Behavior

- A 600 purchase split into 6 installments from August 2026 creates one 100 expense row in each month from August 2026 through January 2027.
- `GET /api/budget/summary?month=2026-08` includes 100 in `total_expenses` and the relevant category.
- `GET /api/budget/summary?month=2026-09` includes the September installment only.
- `GET /api/budget/summary?month=2027-02` does not include the installment series.

### Success Response

Status: `200`

```json
{
  "data": {
    "total_income": 3000,
    "total_expenses": 1250,
    "balance": 1750,
    "categories": [
      {
        "category": "Tecnología",
        "spent": 100,
        "limit": 500,
        "percentage": 20,
        "status": "ok"
      },
      {
        "category": "Alimentación",
        "spent": 900,
        "limit": 1000,
        "percentage": 90,
        "status": "warning"
      }
    ]
  }
}
```

### Error Responses

- `401`: `{ "error": "Unauthorized" }`
- `422`: `{ "error": "El mes debe tener formato YYYY-MM" }`
- `500`: `{ "error": "Internal server error" }`

## Category Warning Rules

- `ok`: no limit exists, or monthly spent is below 80% of limit.
- `warning`: monthly spent is greater than or equal to 80% and below 100% of limit.
- `exceeded`: monthly spent is greater than or equal to 100% of limit.

Installment rows participate in these rules only for the month represented by their `spent_at` date.
