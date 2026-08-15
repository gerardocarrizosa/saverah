<!--
Sync Impact Report
Version change: none -> 1.0.0
Modified principles: none; initial constitution adoption
Added sections: Core Principles, Technical Constraints, Development Workflow, Governance
Removed sections: none
Follow-up TODOs: none
-->
# Saverah Constitution

## Core Principles

### I. API Routes Are The Primary Data Layer

All client-visible reads and mutations MUST go through `app/api/` Route Handlers.
Client Components MUST use the configured Axios client to call those API routes. Server
Components MAY call `lib/api/` directly only for SSR initial render and MUST NOT perform
client-side mutations. Server Actions MUST NOT be introduced for application data changes.

Every API route MUST authenticate the Supabase session before data access, validate request
bodies with the shared Yup schema, call server-side data functions from `lib/api/`, and return
the standard JSON shape of `{ data: ... }` for success or `{ error: ... }` for failure.
Rationale: one data boundary keeps authorization, validation, error handling, and future client
distribution predictable.

### II. SSR And Server Components By Default

Pages and layouts MUST be Server Components unless they require browser-only interactivity.
Initial page data MUST be fetched during SSR through `lib/api/` and passed into leaf Client
Components as initial data. Client Components MUST NOT use `useEffect` to fetch the initial
page state from scratch when SSR data can be provided.

Slow or independently loaded server UI MUST use Suspense boundaries with meaningful skeletons.
Rationale: Saverah prioritizes fast first render, minimal JavaScript, and predictable hydration
for finance workflows.

### III. Client HTTP And Forms Are Standardized

All client-side HTTP requests MUST use the configured Axios instance from `lib/axios`; raw
client-side `fetch` is prohibited. Axios MUST centralize base API URL handling, credentials,
and global unauthorized-session behavior.

All application forms MUST be Client Components built with Formik and validated with shared Yup
schemas from `lib/validations/`. The same schemas MUST be used by API routes before database
mutation. Rationale: one form and validation model prevents drift between the Spanish user
interface and server-enforced business rules.

### IV. User Data Ownership And Security Are Mandatory

Supabase Row Level Security MUST be enabled for every user-owned table. Every such table MUST
include `user_id`, and all policies and queries MUST restrict access to the authenticated user's
own rows. API routes MUST ignore client-supplied user identifiers and derive ownership from
`supabase.auth.getUser()`.

Sensitive mutation endpoints MUST validate input before database access and return appropriate
HTTP status codes: 401 for unauthenticated requests, 403 for forbidden access, 404 for missing
resources, 422 for validation failures, and 500 for unexpected server errors. User-generated
content MUST be rendered safely. Rationale: personal finance data requires strict isolation and
auditable failure behavior.

### V. Performance, Localization, And Clean Boundaries

Feature code MUST preserve clean boundaries: domain and database logic in `lib/api/` or
`lib/utils/`, API response types in `types/`, constants in `config/`, and interactivity in
leaf-level Client Components. Independent server queries MUST run in parallel with `Promise.all`.
Heavy Client Components such as charts MUST be lazy-loaded when they are not needed for initial
render.

All user-facing webapp copy MUST be written in Spanish. File names, route segment names,
component names, TypeScript identifiers, and database-facing names MUST remain in English.
Rationale: this preserves a Spanish product experience while keeping the codebase consistent
with common engineering conventions.

## Technical Constraints

Saverah is a Next.js 15 App Router application written in strict TypeScript. The required stack
is Tailwind CSS with DaisyUI for styling, Lucide for icons, Supabase Auth and PostgreSQL for
identity and persistence, Axios for client HTTP, Formik with Yup for forms, and npm for package
management.

The application has two primary product domains: bill and payment reminders, and budget tracking.
Reminder functionality MUST support bills, credit cards, subscriptions, services, due-date
countdowns, payment history, and per-reminder analytics. Budget functionality MUST support steady
and variable income, categorized expenses, category spending limits, and warning states when usage
approaches or exceeds limits.

The `app/api/` directory is the contract surface for application data. Shared API responses MUST
follow the documented success and error shapes. Date, currency, reminder analytics, and budget
warning calculations MUST live outside components in reusable utility or API-layer modules.

Environment variables MUST NOT be committed with secrets. Supabase public URL and anon key MAY be
exposed through `NEXT_PUBLIC_` variables because access control is enforced by Supabase RLS and
server-side authorization checks.

## Development Workflow

New features MUST start by defining or updating types, validation schemas, API route contracts,
and server-side data functions before wiring Client Components. Server Components own initial
rendering and pass initial data to Client Components; Client Components own form state,
interactions, and Axios refreshes.

Changes that affect data access MUST include authentication, ownership filtering, validation, and
structured error handling in the same change. Changes that affect business logic MUST place that
logic in `lib/api/` or `lib/utils/` and include tests where practical. Unit tests target
`lib/api/`, `lib/utils/`, and Yup schemas; component tests target forms and interactive UI;
end-to-end tests target critical auth, reminder, expense, and budget-warning flows.

Reviews MUST verify compliance with this constitution, especially API-route data flow, SSR-first
rendering, Axios-only client HTTP, RLS-backed ownership, Spanish user-facing copy, and English
code naming. Any exception MUST be documented in the relevant specification or pull request with
the reason, scope, and planned removal date if temporary.

## Governance

This constitution supersedes conflicting project guidance. `AGENTS.md`, README documentation,
templates, plans, specs, and implementation work MUST comply with these principles. If another
document conflicts with this constitution, the constitution wins until it is amended.

Amendments MUST update this file, include a Sync Impact Report, explain the version change, and
preserve applicable project-specific rules from prior versions. Template or command files MUST
not be edited as part of a constitution-only update unless a separate approved workflow requires
it.

Versioning follows semantic versioning. MAJOR increments apply to backward-incompatible
governance changes, removed principles, or redefined principles. MINOR increments apply to new
principles, new required sections, or materially expanded guidance. PATCH increments apply to
clarifications, wording improvements, and non-semantic corrections.

Compliance review is required for every feature specification, implementation plan, and pull
request. Work that violates a MUST-level rule cannot be accepted until corrected or until this
constitution is amended. Deferred exceptions MUST be tracked explicitly with an owner and a
follow-up action.

**Version**: 1.0.0 | **Ratified**: 2026-08-14 | **Last Amended**: 2026-08-14
