# Feature Specification: Email Reminder Notifications

**Feature Branch**: `main`

**Created**: 2026-10-08

**Status**: Draft

**Input**: User description: "for this new email reminder notifications feature."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enable Email Notices For A Reminder (Priority: P1)

As an authenticated Saverah user, I want to enable email notifications on a reminder and choose when notices are sent so I can receive payment reminders without opening the app every day.

**Why this priority**: This is the core user value of the feature. Without per-reminder notification settings, the system cannot know which reminders should produce emails or when users expect to receive them.

**Independent Test**: Can be fully tested by creating or editing a reminder, enabling email notifications, selecting notice timings, saving the reminder, and confirming the saved reminder displays the selected notification settings.

**Acceptance Scenarios**:

1. **Given** an authenticated user is creating a reminder, **When** they enable email notifications and select one or more notice timings, **Then** the reminder is saved with email notifications enabled and the selected timings retained.
2. **Given** an authenticated user is editing a reminder with email notifications enabled, **When** they disable email notifications and save, **Then** the reminder no longer produces future email notifications.
3. **Given** an authenticated user enables email notifications without selecting any notice timing, **When** they try to save the reminder, **Then** they see a Spanish validation message explaining that at least one timing must be selected.

---

### User Story 2 - Receive Upcoming Payment Emails (Priority: P1)

As a user with email notifications enabled, I want to receive a clear email before or on the due date of an unpaid reminder so I can pay bills on time and avoid late fees.

**Why this priority**: Sending the reminder email is the primary outcome of the feature and must work independently from optional visibility or audit improvements.

**Independent Test**: Can be fully tested by configuring an unpaid reminder that is due on a selected timing, running the scheduled notification check, and verifying exactly one email is sent to the user's account email.

**Acceptance Scenarios**:

1. **Given** a user has an active unpaid reminder with email notifications enabled for 1 day before due date, **When** the reminder is due tomorrow and the notification check runs, **Then** the user receives one email in Spanish describing the reminder and due timing.
2. **Given** a user has an active unpaid reminder with email notifications enabled for same-day notices, **When** the reminder is due today and the notification check runs, **Then** the user receives one email in Spanish indicating the reminder vence hoy.
3. **Given** a user has already marked the reminder as paid for the current cycle, **When** the notification check runs, **Then** no email is sent for that reminder in that cycle.

---

### User Story 3 - Prevent Duplicate Notifications (Priority: P2)

As a user, I want Saverah to avoid sending duplicate reminder emails for the same reminder and timing so my inbox stays useful and trustworthy.

**Why this priority**: Scheduled checks may run more than once or retry after failures. Duplicate prevention protects user trust and reduces unnecessary email volume.

**Independent Test**: Can be fully tested by running the notification check twice for the same eligible reminder and confirming only one successful email is sent for the same notification date and timing.

**Acceptance Scenarios**:

1. **Given** an eligible reminder has already produced a successful email for today's notification timing, **When** the notification check runs again, **Then** no second email is sent for that same reminder and timing.
2. **Given** an eligible reminder email attempt fails, **When** the failure is recorded, **Then** the system keeps enough information for the user or operator to understand that the notification was not delivered successfully.

---

### User Story 4 - Understand Notification Status (Priority: P3)

As a user, I want to see whether email notifications are enabled for each reminder so I can understand which bills will produce email notices.

**Why this priority**: Visibility reduces confusion, but the feature still delivers core value if notification sending works before detailed status display is expanded.

**Independent Test**: Can be fully tested by viewing reminders with different notification settings and confirming each reminder clearly indicates whether email notifications are enabled.

**Acceptance Scenarios**:

1. **Given** a reminder has email notifications enabled, **When** the user views the reminder list or detail, **Then** the reminder shows a Spanish indication that email notices are active.
2. **Given** a reminder has email notifications disabled, **When** the user views the reminder list or detail, **Then** the reminder does not imply that email notices will be sent.

### Edge Cases

- If the user account has no deliverable email address, no notification email is sent and the skipped notification is recorded or surfaced as a recoverable issue.
- If a reminder is inactive, it never sends email notifications even when due.
- If a reminder is paid for the current cycle before the notification check runs, no email is sent for that cycle.
- If the notification check runs more than once on the same day, successful notifications are not duplicated for the same reminder and selected timing.
- If email delivery fails, the failure is recorded without blocking other eligible reminder emails from being attempted.
- If a due day does not exist in the current month, the reminder uses the existing Saverah due-date behavior for determining the next due occurrence.
- If a user changes notification timings after an email has already been sent for a reminder, the change applies only to future notification checks.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to enable or disable email notifications independently for each reminder.
- **FR-002**: Users MUST be able to choose one or more notification timings from same day, 1 day before, 3 days before, and 7 days before the reminder due date.
- **FR-003**: The system MUST require at least one selected timing when email notifications are enabled for a reminder.
- **FR-004**: The system MUST preserve selected email notification settings when reminders are created, edited, listed, or viewed in detail.
- **FR-005**: The system MUST send reminder emails only for active reminders with email notifications enabled and a selected timing matching the reminder's current due timing.
- **FR-006**: The system MUST send reminder emails only to the authenticated owner's account email address.
- **FR-007**: The system MUST skip reminder emails when the reminder has already been paid for the current billing cycle.
- **FR-008**: The system MUST prevent duplicate successful emails for the same reminder, notification channel, notification date, and selected timing.
- **FR-009**: The system MUST record the outcome of each attempted reminder email, including whether it was sent or failed.
- **FR-010**: Reminder email content MUST be written in Spanish and include the reminder name, when it is due, and guidance to mark it as paid if already completed.
- **FR-011**: Users MUST be able to identify whether email notifications are enabled for a reminder from reminder-facing screens.
- **FR-012**: The system MUST continue processing other eligible reminders if one reminder email cannot be sent.
- **FR-013**: The system MUST not expose one user's reminder or notification information to another user.
- **FR-014**: The system MUST treat email notifications as opt-in; existing reminders and newly created reminders are not emailed unless the user enables the setting.

### Key Entities *(include if feature involves data)*

- **Reminder**: A user-owned bill, subscription, card, or service reminder. Relevant attributes include due timing, active status, paid status for the current cycle, email notification enabled state, and selected email notice timings.
- **Reminder Notification**: A record of a notification attempt for a reminder. Relevant attributes include owner, reminder, notification channel, notification date, selected timing, delivery status, provider reference if available, error details if failed, and creation time.
- **User Account**: The authenticated owner of reminders. Relevant attributes include account email address and ownership relationship to reminders and notification records.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 95% of users can enable email notifications for an existing reminder in under 60 seconds during usability testing.
- **SC-002**: 100% of eligible unpaid reminders produce no more than one successful email per selected timing on a given notification date.
- **SC-003**: 100% of reminders marked paid for the current cycle are excluded from email notifications during that cycle.
- **SC-004**: At least 99% of eligible reminder notification checks complete without a single failed reminder blocking other eligible reminders from being evaluated.
- **SC-005**: At least 90% of users reviewing a reminder can correctly identify whether email notifications are enabled and when emails will be sent.
- **SC-006**: All user-facing notification settings, validation messages, and reminder email content are presented in Spanish.

## Assumptions

- Email notifications are opt-in per reminder and are disabled by default for both existing and newly created reminders.
- Default selectable notification timings are same day, 1 day before, 3 days before, and 7 days before the due date.
- The user's account email is the destination for reminder emails.
- The scheduled notification check runs once per day, and duplicate prevention handles retries or accidental repeated runs.
- Existing Saverah payment-cycle logic determines whether a reminder is already paid for the current cycle.
- Existing Saverah due-date logic determines how monthly, weekly, yearly, and end-of-month edge cases are interpreted.
- Detailed unsubscribe management is outside this feature's first version because notifications are enabled explicitly per reminder and can be disabled from reminder settings.
