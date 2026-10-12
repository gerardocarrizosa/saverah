# Quickstart: Email Reminder Notifications

This guide validates the planned feature end-to-end. It assumes implementation tasks have been completed after this design phase.

## Prerequisites

1. Install dependencies with `npm install`, including the Resend SDK added during implementation.
2. Configure local environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   RESEND_API_KEY=...
   REMINDER_EMAIL_FROM=Recordatorios Saverah <recordatorios@example.com>
   CRON_SECRET=local-dev-secret
   ```
3. Apply Supabase migrations for the reminder notification columns, `reminder_notifications` table, RLS policies, and duplicate-prevention index.
4. Start the app with `npm run dev`.

## Implementation Notes

1. `RESEND_API_KEY` must be configured only on the server so the Resend client can send reminder emails.
2. `REMINDER_EMAIL_FROM` controls the Spanish sender label used for notifications, for example `Recordatorios Saverah <recordatorios@example.com>`.
3. `CRON_SECRET` protects `POST /api/reminders/notifications/run`; cron callers must send it as `Authorization: Bearer <CRON_SECRET>`.
4. `SUPABASE_SERVICE_ROLE_KEY` is required by the trusted cron route to evaluate reminders across users without a browser Supabase session; never expose it to client code.
5. For deterministic local validation, include a JSON body such as `{ "notification_date": "2026-10-08" }` when invoking the cron endpoint.

## Validation Scenario 1: Enable Notifications On A Reminder

1. Sign in as a Saverah user.
2. Create or edit a reminder from the reminder form.
3. Enable email notifications.
4. Select `1 día antes` and `El mismo día`.
5. Save the reminder.
6. Re-open the reminder list or detail view.

Expected outcome: the reminder is saved and displayed with Spanish text indicating email notifications are active and showing the selected timings. The API response follows `contracts/openapi.yaml#/components/schemas/Reminder`.

## Validation Scenario 2: Enforce Timing Selection

1. Create or edit a reminder.
2. Enable email notifications.
3. Leave all notification timings unselected.
4. Attempt to save.

Expected outcome: the form blocks submission or the API returns `422` with a Spanish validation message explaining that at least one timing is required.

## Validation Scenario 3: Send An Upcoming Reminder Email

1. Create an active unpaid reminder whose due date matches tomorrow.
2. Enable email notifications and select `1 día antes`.
3. Run the notification check:
   ```bash
   curl -X POST http://localhost:3000/api/reminders/notifications/run \
     -H "Authorization: Bearer local-dev-secret" \
     -H "Content-Type: application/json"
   ```
4. Inspect the response and the Resend test inbox or dashboard.

Expected outcome: one Spanish email is sent to the authenticated owner's account email. A `reminder_notifications` row is recorded with `status = 'sent'`, `channel = 'email'`, `timing_days_before = 1`, and the Resend provider message ID when available.

## Validation Scenario 4: Prevent Duplicate Successful Sends

1. Keep the reminder from Scenario 3 eligible for the same notification date and timing.
2. Run the same notification check again.

Expected outcome: no second successful email is sent for the same reminder, channel, notification date, and timing. The response reports the reminder as skipped or already sent, and the database contains only one successful matching notification row.

## Validation Scenario 5: Skip Paid Current-Cycle Reminders

1. Mark an eligible reminder as paid for the current cycle.
2. Run the notification check.

Expected outcome: no email is sent for that reminder during the cycle. Other eligible reminders in the run are still evaluated and sent as appropriate.

## Validation Scenario 6: Continue After Provider Failure

1. Configure an invalid `RESEND_API_KEY` or force the Resend client mock to reject one send.
2. Include at least two eligible reminders in the notification run.
3. Run the notification check.

Expected outcome: the failed reminder records a `failed` notification outcome with a concise error message, and unrelated eligible reminders are still processed.

## Supporting References

1. Data shape and persistence rules: `data-model.md`.
2. API route contract: `contracts/openapi.yaml`.
3. Feature requirements and acceptance scenarios: `spec.md`.
