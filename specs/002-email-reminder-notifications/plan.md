# Implementation Plan: Email Reminder Notifications

**Branch**: `002-email-reminder-notifications` | **Date**: 2026-10-08 | **Spec**: `specs/002-email-reminder-notifications/spec.md`

**Input**: Feature specification from `specs/002-email-reminder-notifications/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command; its definition describes the execution workflow.

## Summary

Add opt-in email notification settings to reminders, send Spanish reminder emails through Resend for eligible unpaid reminders, and persist notification attempt outcomes to prevent duplicates. The implementation will extend the existing Supabase reminder model, shared Yup schemas, API routes, and reminder UI while adding a server-only scheduled notification route that evaluates reminders daily and sends emails without blocking the full run when one reminder fails.

## Technical Context

**Language/Version**: TypeScript 5 with Next.js 15 App Router and React 19

**Primary Dependencies**: Next.js, Supabase Auth/PostgreSQL, `@supabase/ssr`, Axios, Formik, Yup, Tailwind CSS/DaisyUI, Lucide, Resend Node SDK

**Storage**: Supabase PostgreSQL with RLS on `reminders`, `reminder_payments`, and new `reminder_notifications`

**Testing**: `npm run lint`; planned Vitest unit tests for date/notification eligibility and Yup schemas, component tests for reminder forms, and route tests with mocked Supabase/Resend clients

**Target Platform**: Web application on Next.js server runtime; scheduled notification route callable by a trusted cron runner

**Project Type**: Full-stack web application

**Performance Goals**: Notification checks process all eligible reminders for the day without one provider failure blocking the batch; duplicate checks avoid repeated successful sends for the same reminder/date/timing; user reminder pages preserve fast SSR initial render

**Constraints**: Spanish user-facing copy and email content; server-only Resend API key; API routes remain the client-visible data layer; Client Components use Axios only; shared Yup validation; Supabase RLS and user-scoped queries; email notifications default disabled; no duplicate successful notifications per reminder/channel/date/timing

**Scale/Scope**: Per-reminder notification settings, daily batch evaluation for active reminders, Resend email delivery, notification attempt audit records, and reminder list/detail/form visibility

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**I. API Routes Are The Primary Data Layer**: PASS. Reminder settings continue through `src/app/api/reminders` Route Handlers with shared Yup validation. The scheduled notification run is an internal API Route Handler that authenticates with a server-side cron secret before invoking `lib/api/` notification logic.

**II. SSR And Server Components By Default**: PASS. Reminder pages continue to fetch initial reminder data through server-side data functions and pass data into leaf Client Components for form/list interactivity.

**III. Client HTTP And Forms Are Standardized**: PASS. Reminder form updates use Formik plus shared Yup schemas, and client-side mutations use the configured Axios instance.

**IV. User Data Ownership And Security Are Mandatory**: PASS. New notification records include `user_id`, RLS policies, ownership filters, and no client-supplied user IDs. Resend credentials remain server-only.

**V. Performance, Localization, And Clean Boundaries**: PASS. Notification eligibility and delivery orchestration live outside components in `src/lib/api/` and `src/lib/utils/`; user-facing app copy and email content are Spanish; independent reads for reminders/payments/notification records use parallel queries where practical.

## Project Structure

### Documentation (this feature)

```text
specs/002-email-reminder-notifications/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
```text
src/
├── app/
│   ├── (app)/reminders/              # SSR reminder list/detail/new/edit pages
│   └── api/
│       └── reminders/
│           ├── route.ts              # GET/POST include notification settings
│           ├── [id]/route.ts         # GET/PATCH include notification settings
│           └── notifications/run/route.ts # trusted scheduled notification check
├── components/reminders/             # Formik reminder forms and reminder status UI
├── config/constants.ts                # selectable notification timings
├── lib/
│   ├── api/
│   │   ├── reminders.ts              # reminder CRUD with notification fields
│   │   └── reminderNotifications.ts   # eligibility, audit records, Resend send orchestration
│   ├── email/resend.ts                # server-only Resend client wrapper
│   ├── utils/dates.ts                 # due-date and notification-date helpers
│   └── validations/reminder.schemas.ts # shared reminder notification validation
├── types/reminder.types.ts            # reminder and notification types
└── types/api.types.ts                 # route response types if needed

supabase/
└── migrations/                        # reminder notification columns/table/RLS/indexes
```

**Structure Decision**: Use the existing single Next.js application under `src/`, preserving current App Router, API Route, Supabase, and component boundaries. Add only the reminder notification paths required for persistence, scheduled processing, Resend delivery, and UI visibility.

## Post-Design Constitution Check

**I. API Routes Are The Primary Data Layer**: PASS. Contracts define API Route changes only; no Server Actions or raw client fetches are introduced.

**II. SSR And Server Components By Default**: PASS. UI design keeps reminder pages as Server Components and limits client code to forms/actions/status interactivity.

**III. Client HTTP And Forms Are Standardized**: PASS. `data-model.md` and contracts require shared Yup validation and Axios client calls for reminder mutations.

**IV. User Data Ownership And Security Are Mandatory**: PASS. `data-model.md` requires `user_id`, RLS, ownership filters, and a unique duplicate-prevention constraint.

**V. Performance, Localization, And Clean Boundaries**: PASS. `research.md` and contracts keep Resend usage server-side, email text Spanish, constants centralized, and batch processing resilient.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
