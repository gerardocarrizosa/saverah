# Tasks: Email Reminder Notifications

**Input**: Design documents from `/specs/002-email-reminder-notifications/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: No automated test framework is currently configured in `package.json`. Tasks include manual/API validation and `npm run lint`; add automated tests only if the project test setup is introduced during implementation.

**Organization**: Tasks are grouped by user story and priority so the P1 settings and delivery paths can ship as the MVP before duplicate auditing visibility and status polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other tasks that touch different files and does not depend on incomplete tasks.
- **[Story]**: User story traceability: `US1`, `US2`, `US3`, or `US4`; setup, foundational, and polish tasks do not use story labels.
- Every implementation task references exact project paths.

---

## Phase 1: Setup

**Purpose**: Add provider dependency and local configuration scaffolding required before notification implementation.

- [X] T001 Install the Resend SDK dependency and update `package.json` and `package-lock.json`
- [X] T002 [P] Add `RESEND_API_KEY`, `REMINDER_EMAIL_FROM`, and `CRON_SECRET` placeholders to `.env.example`
- [X] T003 [P] Add feature implementation notes for required environment variables and cron invocation to `specs/002-email-reminder-notifications/quickstart.md`

**Checkpoint**: Resend can be imported by server-side code and required operational configuration is documented.

---

## Phase 2: Foundational

**Purpose**: Add shared persistence, types, constants, validation, and utility primitives that block all user stories.

- [X] T004 Create `supabase/migrations/006_add_reminder_email_notifications.sql` to add `reminders.email_notifications_enabled boolean not null default false`, `reminders.email_notification_timings integer[] not null default '{}'`, `reminder_notifications` table, RLS policies, timing/status/channel checks, foreign keys, owner indexes, and the partial unique index preventing duplicate successful email notifications per reminder/channel/notification_date/timing
- [X] T005 Update `src/types/supabase.ts` with the new `reminders` columns and the `reminder_notifications` Row/Insert/Update table definitions
- [X] T006 [P] Update `src/types/reminder.types.ts` with `Reminder.email_notifications_enabled`, `Reminder.email_notification_timings`, `ReminderNotification`, `ReminderNotificationTiming`, `ReminderNotificationStatus`, `NotificationOutcome`, and `NotificationRunResult` types
- [X] T007 [P] Add `EMAIL_NOTIFICATION_TIMINGS` and Spanish timing labels for values `0`, `1`, `3`, and `7` to `src/config/constants.ts`
- [X] T008 Update `src/lib/validations/reminder.schemas.ts` so create and update reminder schemas accept email notification fields, restrict timings to `0`, `1`, `3`, and `7`, default notifications to disabled, and return Spanish validation when enabled reminders have no timing selected
- [X] T009 [P] Add concrete due-date and notification-date helpers for reminder notification eligibility to `src/lib/utils/dates.ts`, reusing existing monthly, yearly, weekly, and end-of-month behavior where applicable
- [X] T010 [P] Add server-only Resend client wrapper and Spanish sender configuration validation in `src/lib/email/resend.ts`
- [X] T011 Update `src/lib/api/reminders.ts` so reminder create/update payloads persist notification fields, disabled reminders store an empty `email_notification_timings` array, and all returned reminders include the new fields

**Checkpoint**: Database, shared types, validation, constants, and server-only email plumbing are ready; no user story work should start before this foundation is complete.

---

## Phase 3: User Story 1 - Enable Email Notices For A Reminder (Priority: P1) MVP

**Goal**: Authenticated users can enable email notifications per reminder, choose one or more timings, save the settings, and see the saved configuration retained.

**Independent Test**: Create or edit a reminder, enable email notifications, select `1 día antes` and `El mismo día`, save, reopen the reminder, and confirm the settings are retained; enabling notifications with no selected timing shows a Spanish validation message.

### Implementation for User Story 1

- [X] T012 [P] [US1] Update `src/hooks/useReminders.ts` create and update payload typings so Axios can submit `email_notifications_enabled` and `email_notification_timings` without raw client `fetch`
- [X] T013 [US1] Add Formik controls for enabling email notifications and selecting timing checkboxes with Spanish copy in `src/components/reminders/ReminderForm.tsx`
- [X] T014 [US1] Ensure `src/components/reminders/ReminderForm.tsx` submits disabled notifications as `email_notifications_enabled: false` with empty `email_notification_timings` and enabled notifications with the selected timing array
- [X] T015 [US1] Add notification settings to edit initial values, Formik controls, and PATCH payloads in `src/components/reminders/ReminderEditForm.tsx`
- [X] T016 [US1] Update `src/app/api/reminders/route.ts` POST validation error handling to return all Yup errors as structured Spanish `422` JSON while preserving authenticated Supabase checks
- [X] T017 [US1] Update `src/app/api/reminders/[id]/route.ts` PATCH validation error handling to return all Yup errors as structured Spanish `422` JSON while preserving authenticated ownership checks
- [X] T018 [US1] Manually validate `POST /api/reminders` and `PATCH /api/reminders/:id` against `specs/002-email-reminder-notifications/contracts/openapi.yaml` for enabled notifications with timings, disabled notifications, and enabled notifications with no timings
- [X] T019 [US1] Run `npm run lint` from `package.json` and fix any lint/type issues introduced in `src/components/reminders/ReminderForm.tsx`, `src/components/reminders/ReminderEditForm.tsx`, `src/app/api/reminders/route.ts`, and `src/app/api/reminders/[id]/route.ts`

**Checkpoint**: P1 settings are independently functional and notification preferences survive create, edit, list, and detail retrieval.

---

## Phase 4: User Story 2 - Receive Upcoming Payment Emails (Priority: P1)

**Goal**: A trusted scheduled route sends one Spanish email for each eligible active, unpaid reminder whose selected timing matches the notification date.

**Independent Test**: Configure an active unpaid reminder due tomorrow with `1 día antes`, call `POST /api/reminders/notifications/run` with a valid cron bearer token, and verify one Spanish email is sent to the owning account email with a `sent` notification record.

### Implementation for User Story 2

- [X] T020 [P] [US2] Add Spanish email subject and body builder for reminder notifications in `src/lib/email/reminderEmail.ts`, including reminder name, due timing text, and guidance to mark the reminder paid if already completed
- [X] T021 [US2] Add `src/lib/api/reminderNotifications.ts` with `runReminderEmailNotifications` that loads active reminders with enabled notification settings, their current-cycle payments, existing successful notification records, and owner account emails using authenticated server-side Supabase access
- [X] T022 [US2] Implement eligibility filtering in `src/lib/api/reminderNotifications.ts` so only active unpaid reminders with a matching selected timing for the notification date are sent
- [X] T023 [US2] Implement Resend delivery orchestration in `src/lib/api/reminderNotifications.ts` so each eligible reminder send is isolated in its own try/catch and one failure does not block the rest of the batch
- [X] T024 [US2] Record `sent`, `failed`, and missing-email `skipped` outcomes in `reminder_notifications` from `src/lib/api/reminderNotifications.ts` with `user_id`, `reminder_id`, `channel`, `notification_date`, `due_date`, `timing_days_before`, `recipient_email`, `provider`, `provider_message_id`, and concise `error_message` values
- [X] T025 [US2] Create `src/app/api/reminders/notifications/run/route.ts` with `POST` cron bearer authentication using `CRON_SECRET`, optional `notification_date` override for deterministic validation, and `{ data: NotificationRunResult }` response shape from `specs/002-email-reminder-notifications/contracts/openapi.yaml`
- [X] T026 [US2] Ensure `src/app/api/reminders/notifications/run/route.ts` returns `401` structured JSON for missing or invalid cron bearer tokens and never relies on client-supplied user IDs or recipients
- [X] T027 [US2] Manually validate the quickstart scenarios for sending a `1 día antes` email, sending a same-day `vence hoy` email, skipping a paid current-cycle reminder, and continuing after a forced provider failure using `specs/002-email-reminder-notifications/quickstart.md`
- [X] T028 [US2] Run `npm run lint` from `package.json` and fix any lint/type issues introduced in `src/lib/api/reminderNotifications.ts`, `src/lib/email/reminderEmail.ts`, and `src/app/api/reminders/notifications/run/route.ts`

**Checkpoint**: P1 delivery is independently functional: eligible unpaid reminders produce Spanish Resend emails through the scheduled route and failures are recorded without stopping the run.

---

## Phase 5: User Story 3 - Prevent Duplicate Notifications (Priority: P2)

**Goal**: Repeated scheduled runs do not send duplicate successful emails for the same reminder, channel, notification date, and selected timing, while failed attempts remain auditable.

**Independent Test**: Run the notification check twice for the same eligible reminder and confirm only one successful email exists for the same reminder/channel/notification_date/timing; failed attempts record error details without creating a duplicate success.

### Implementation for User Story 3

- [X] T029 [US3] Update `src/lib/api/reminderNotifications.ts` to check existing successful `reminder_notifications` rows before sending and skip already-sent reminder/timing/date combinations
- [X] T030 [US3] Update `src/lib/api/reminderNotifications.ts` to handle the database partial unique index defensively so a race that inserts a duplicate successful notification is returned as a skipped or already-sent outcome instead of crashing the full run
- [X] T031 [US3] Include skipped duplicate outcomes and failed attempt IDs in `NotificationRunResult` from `src/lib/api/reminderNotifications.ts` for operational review
- [X] T032 [US3] Manually validate duplicate prevention from `specs/002-email-reminder-notifications/quickstart.md` by calling `POST /api/reminders/notifications/run` twice for the same eligible reminder and inspecting Resend plus `reminder_notifications` rows for exactly one successful matching record
- [X] T033 [US3] Run `npm run lint` from `package.json` and fix any lint/type issues introduced in `src/lib/api/reminderNotifications.ts`

**Checkpoint**: P2 duplicate prevention is independently functional and scheduled retries are safe for user inboxes.

---

## Phase 6: User Story 4 - Understand Notification Status (Priority: P3)

**Goal**: Reminder-facing screens clearly show whether email notifications are enabled and which timings are active without implying disabled reminders will send email.

**Independent Test**: View reminders with enabled and disabled notification settings in list and detail screens and confirm Spanish UI clearly identifies active email notices and selected timings only when enabled.

### Implementation for User Story 4

- [X] T034 [P] [US4] Add notification timing display helpers with Spanish labels such as `El mismo día`, `1 día antes`, `3 días antes`, and `7 días antes` to `src/lib/utils/reminders.ts`
- [X] T035 [US4] Update `src/components/reminders/ReminderCard.tsx` to show a compact Spanish email-notification badge and selected timing summary only when `email_notifications_enabled` is true
- [X] T036 [US4] Update `src/components/reminders/ReminderListItem.tsx` to show active email notification status in the reminder list without changing disabled reminder presentation
- [X] T037 [US4] Update `src/app/(app)/reminders/[id]/page.tsx` to add a Spanish notification settings panel showing enabled/disabled status and selected timings for the reminder detail
- [X] T038 [US4] Manually validate enabled and disabled notification status display in `src/app/(app)/reminders/page.tsx` and `src/app/(app)/reminders/[id]/page.tsx` across desktop and mobile widths
- [X] T039 [US4] Run `npm run lint` from `package.json` and fix any lint/type issues introduced in `src/components/reminders/ReminderCard.tsx`, `src/components/reminders/ReminderListItem.tsx`, and `src/app/(app)/reminders/[id]/page.tsx`

**Checkpoint**: P3 visibility is independently functional and users can understand which reminders will send email notices.

---

## Phase 7: Polish And Cross-Cutting Validation

**Purpose**: Verify end-to-end behavior, security boundaries, localization, and project standards after the prioritized user stories are complete.

- [X] T040 Execute all scenarios in `specs/002-email-reminder-notifications/quickstart.md` and record any deviations as follow-up tasks in `specs/002-email-reminder-notifications/tasks.md`
- [X] T041 Review `src/app/api/reminders/route.ts`, `src/app/api/reminders/[id]/route.ts`, and `src/app/api/reminders/notifications/run/route.ts` for authenticated or cron-secret access checks, standard `{ data }` / `{ error }` JSON, and no client-supplied ownership or recipient data
- [X] T042 Review `src/lib/api/reminders.ts` and `src/lib/api/reminderNotifications.ts` for user-scoped Supabase filters, parallel independent queries where practical, immutable notification audit records, and no raw provider credentials exposed to client code
- [X] T043 Review `src/components/reminders/ReminderForm.tsx`, `src/components/reminders/ReminderEditForm.tsx`, `src/components/reminders/ReminderCard.tsx`, `src/components/reminders/ReminderListItem.tsx`, and `src/app/(app)/reminders/[id]/page.tsx` for Spanish user-facing copy, Formik plus shared Yup validation, and responsive behavior
- [X] T044 Review `src/lib/email/reminderEmail.ts` for Spanish email content, reminder name inclusion, due timing inclusion, and guidance to mark already completed reminders as paid
- [X] T045 Run final `npm run lint` from `package.json` and fix remaining lint/type issues across `src/app/api/reminders/`, `src/lib/api/reminderNotifications.ts`, `src/lib/email/`, and `src/components/reminders/` before marking the feature complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup** has no feature dependencies and should complete before importing Resend or configuring cron behavior.
- **Phase 2: Foundational** depends on Phase 1 and blocks all user stories.
- **Phase 3: US1 (P1 settings)** depends on Phase 2 and is the first MVP slice.
- **Phase 4: US2 (P1 delivery)** depends on Phase 2 and benefits from US1 settings for browser-driven validation, but can be validated through seeded/API-created reminders.
- **Phase 5: US3 (P2 duplicate prevention)** depends on US2 because it hardens the scheduled notification run.
- **Phase 6: US4 (P3 visibility)** depends on Phase 2 and can be implemented after US1; it does not block email delivery.
- **Phase 7: Polish** depends on the selected user stories being complete.

### User Story Dependencies

- **US1**: No dependency on US2, US3, or US4. Delivers opt-in settings and validation.
- **US2**: Requires shared persistence and notification settings from Phase 2; delivery behavior can be tested independently of UI status polish.
- **US3**: Depends on US2 notification run and audit recording.
- **US4**: Uses settings introduced by Phase 2 and can be completed after US1 for best user validation.

### Parallel Opportunities

- T002 and T003 can run in parallel with T001 because they touch docs/config scaffolding only.
- T006, T007, T009, and T010 can run in parallel during Phase 2 because they touch separate type, constants, utility, and email wrapper files.
- T012 can run in parallel with form UI planning in US1 because it touches only `src/hooks/useReminders.ts`.
- T020 can run in parallel with T021 planning in US2 because email content is isolated from notification orchestration.
- T034 can run in parallel with US4 UI updates because it is a utility-only task.
- Manual validation tasks should run only after their story implementation tasks are complete.

## Implementation Strategy

### MVP First

1. Complete Phase 1 setup and Phase 2 foundation.
2. Complete Phase 3 US1 tasks T012-T019 so users can configure notification preferences.
3. Complete Phase 4 US2 tasks T020-T028 so configured reminders produce emails.
4. Stop and validate the P1 quickstart scenarios before implementing P2/P3 polish.

### Incremental Delivery

1. Ship US1 settings with validation and persisted reminder fields.
2. Ship US2 scheduled delivery through Resend with Spanish email content and audit records.
3. Add US3 duplicate prevention hardening for retries and race conditions.
4. Add US4 reminder-facing status visibility.
5. Run the full quickstart scenarios and final lint.

## Coding Standards Checklist

- User-facing app copy, validation messages, and email content must be Spanish.
- File names, identifiers, route names, and database columns remain English.
- Client HTTP must use `src/lib/axios`; no raw client `fetch`.
- Forms must use Formik and shared Yup schemas from `src/lib/validations/`.
- API routes must authenticate with Supabase or validate `CRON_SECRET` before work, validate input before mutation, and return structured JSON.
- Supabase queries must filter by authenticated `userId` and never trust client-supplied ownership or recipient emails.
- Business logic belongs in `src/lib/api/`, `src/lib/utils/`, or `src/lib/email/`, not inside UI components.
- Resend credentials must remain server-only and never be imported into Client Components.
- Keep SSR initial data loading in Server Components; do not replace it with client `useEffect` initial loads.
