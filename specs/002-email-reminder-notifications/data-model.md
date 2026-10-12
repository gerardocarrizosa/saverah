# Data Model: Email Reminder Notifications

## Reminder

Existing user-owned bill, subscription, credit card, or service reminder.

**New fields**:

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `email_notifications_enabled` | `boolean` | yes | `false` | Opt-in flag for reminder email notices. Existing and new reminders are disabled unless the user enables this. |
| `email_notification_timings` | `integer[]` | yes | empty array | Selected days before due date. Valid values are `0`, `1`, `3`, and `7`; `0` means same-day notice. |

**Existing relevant fields**:

| Field | Type | Notes |
|-------|------|-------|
| `id` | `uuid` | Primary key. |
| `user_id` | `uuid` | Owner; references `auth.users(id)`. |
| `name` | `text` | Included in email content. |
| `due_day` | `integer` | Used with recurrence to determine notification eligibility. |
| `cutoff_day` | `integer` or `null` | Existing credit-card behavior remains unchanged. |
| `recurrence` | `text` | `monthly`, `yearly`, or `weekly`. |
| `category` | `text` | Display and form grouping. |
| `notes` | `text` or `null` | Existing optional content. |
| `is_active` | `boolean` | Inactive reminders never send notifications. |

**Validation rules**:

| Rule | Enforcement |
|------|-------------|
| Email notifications are opt-in | Database default `false`; form defaults disabled. |
| Timings must be selectable values only | Yup schema and database check constrain to `0`, `1`, `3`, `7`. |
| Enabled reminders require at least one timing | Shared Yup schema returns Spanish validation message. |
| Disabled reminders may have no timings | Shared Yup schema allows an empty array when disabled. |
| Ownership cannot be client supplied | API routes derive `user_id` from Supabase auth. |

**Relationships**:

| Relationship | Cardinality | Notes |
|--------------|-------------|-------|
| Reminder to User Account | many-to-one | `reminders.user_id -> auth.users.id`. |
| Reminder to Reminder Payment | one-to-many | Existing payment history determines paid-current-cycle exclusion. |
| Reminder to Reminder Notification | one-to-many | One row per notification attempt/outcome. |

## Reminder Notification

Audit record for a reminder notification attempt or skip decision that must be surfaced operationally or used for duplicate prevention.

**Fields**:

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | `uuid` | yes | `gen_random_uuid()` | Primary key. |
| `user_id` | `uuid` | yes | none | Owner; references `auth.users(id)`. |
| `reminder_id` | `uuid` | yes | none | References `reminders(id)` with cascade delete. |
| `channel` | `text` | yes | `email` | First version supports only `email`. |
| `notification_date` | `date` | yes | none | Date the notice is evaluated/sent. |
| `due_date` | `date` | yes | none | Concrete due date for the reminder cycle that produced eligibility. |
| `timing_days_before` | `integer` | yes | none | One of `0`, `1`, `3`, `7`. |
| `status` | `text` | yes | none | `sent`, `failed`, or `skipped`. |
| `recipient_email` | `text` | no | null | User account email used for the send; null when unavailable. |
| `provider` | `text` | no | `resend` | Provider used for attempted delivery. |
| `provider_message_id` | `text` | no | null | Resend message ID for successful sends when returned. |
| `error_message` | `text` | no | null | Failure or skipped reason; keep concise and non-sensitive. |
| `created_at` | `timestamptz` | yes | `now()` | Attempt record creation time. |

**Validation rules**:

| Rule | Enforcement |
|------|-------------|
| `channel` must be `email` | Database check and TypeScript type. |
| `status` must be `sent`, `failed`, or `skipped` | Database check and TypeScript type. |
| `timing_days_before` must be `0`, `1`, `3`, or `7` | Database check and TypeScript type. |
| Duplicate successful sends are forbidden | Partial unique index for successful email notifications on `reminder_id`, `channel`, `notification_date`, `timing_days_before`. |
| Records are user-owned | `user_id` required and RLS policy restricts all access to owner. |

**State transitions**:

| From | To | Trigger |
|------|----|---------|
| none | `sent` | Resend accepts the email and returns success. |
| none | `failed` | Resend send fails or required delivery data is unavailable after eligibility is reached. |
| none | `skipped` | Reminder is eligible for evaluation but cannot be sent for a recoverable reason, such as missing recipient email. |

Notification records are immutable audit events. Retries create additional failed records until one successful record exists for the same reminder/date/timing; the partial unique index prevents a second successful record.

## User Account

Supabase Auth user that owns reminders and receives emails.

**Relevant fields**:

| Field | Type | Notes |
|-------|------|-------|
| `id` | `uuid` | Used as `user_id` on reminders and notification records. |
| `email` | `string` or `null` | Destination for reminder emails. Missing email causes a skipped or failed notification record and no provider call. |

**Validation rules**:

| Rule | Enforcement |
|------|-------------|
| Emails are sent only to owner account email | Notification service loads the owning Supabase auth user and ignores client-provided recipients. |
| User data is isolated | Supabase RLS plus server queries filtered by `user_id`. |
