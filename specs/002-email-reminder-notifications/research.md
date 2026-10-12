# Research: Email Reminder Notifications

## Decision: Use Resend For Email Delivery

**Rationale**: The user selected Resend for this feature. Resend fits the Next.js server runtime model because the API key can stay server-only, delivery can be invoked from Route Handlers or server-side library code, and provider message IDs can be stored as audit references in Supabase. The implementation will add the `resend` npm dependency and require `RESEND_API_KEY`, `REMINDER_EMAIL_FROM`, and the existing app base URL for links in emails.

**Alternatives considered**: Supabase Edge Functions email delivery and SMTP libraries such as Nodemailer. Supabase Edge Functions would add a second runtime and deployment surface for a feature that already has a Next.js server data layer. Nodemailer would require SMTP credential management and more transport-specific configuration. Resend is simpler for transactional product emails in this app.

## Decision: Send Emails From A Trusted Scheduled API Route

**Rationale**: A new internal Route Handler at `POST /api/reminders/notifications/run` will run the daily notification check. It will require an `Authorization: Bearer <CRON_SECRET>` header rather than a user Supabase session, because scheduled jobs are operational calls rather than browser user actions. The route will delegate to `src/lib/api/reminderNotifications.ts`, keeping data access and delivery orchestration outside the route body.

**Alternatives considered**: Server Actions and client-triggered notification checks. Server Actions violate the project constitution for application data changes. Client-triggered checks are unreliable, expose operational behavior to users, and cannot guarantee daily delivery.

## Decision: Store Notification Settings On `reminders`

**Rationale**: Email notification settings are per-reminder configuration and must be returned when reminders are created, edited, listed, or viewed. Adding `email_notifications_enabled boolean default false` and `email_notification_timings int[] default '{}'` keeps the settings colocated with the reminder and avoids extra joins for reminder pages. Yup validation will require at least one timing when notifications are enabled and restrict timings to `0`, `1`, `3`, and `7` days before due date.

**Alternatives considered**: A separate `reminder_notification_settings` table. That would be useful for multiple channels or complex preferences, but it adds joins and more mutation paths before there is a concrete need. The current feature only needs email settings for each reminder.

## Decision: Store Attempts In `reminder_notifications`

**Rationale**: Requirements need duplicate prevention and visibility into sent/failed/skipped outcomes. A dedicated table with `user_id`, `reminder_id`, `channel`, `notification_date`, `timing_days_before`, `due_date`, `status`, `provider_message_id`, `error_message`, and timestamps provides an audit trail. A partial unique index on successful email notifications for `(reminder_id, channel, notification_date, timing_days_before)` prevents duplicate successful sends while still allowing failed attempts to be recorded.

**Alternatives considered**: Only relying on Resend idempotency keys or logs. Provider-level controls do not satisfy local audit and product visibility requirements, and they do not protect future provider swaps. A local uniqueness constraint is the authoritative duplicate guard.

## Decision: Reuse Existing Due-Date And Payment-Cycle Logic

**Rationale**: The spec explicitly defers monthly edge cases and paid-current-cycle decisions to existing Saverah logic. Notification eligibility will reuse date helpers from `src/lib/utils/dates.ts` and payment-cycle checks from `src/lib/utils/reminders.ts`, adding small helper functions only where needed to compute the concrete due date and selected timing date.

**Alternatives considered**: Implement separate notification-specific due-date logic. That risks drift from the reminder UI and analytics behavior, especially for weekly/yearly recurrence and end-of-month handling.

## Decision: Continue Processing After Individual Failures

**Rationale**: The daily notification run should produce per-reminder results and record failures without aborting the whole batch. Each eligible reminder send will be isolated in its own try/catch, and the route response will return aggregate counts plus failed/skipped IDs for operational review.

**Alternatives considered**: Fail-fast batch execution. It would make error handling simpler, but it violates FR-012 and SC-004 by allowing one provider or data issue to block unrelated reminder emails.

## Decision: Spanish Copy For Settings, Validation, And Email Content

**Rationale**: The constitution and SC-006 require Spanish user-facing content. UI labels, validation messages, email subject lines, and email body text will be Spanish, while TypeScript identifiers, route names, constants, and database columns remain English.

**Alternatives considered**: English implementation copy with later localization. That would violate current requirements and produce an incomplete feature.
