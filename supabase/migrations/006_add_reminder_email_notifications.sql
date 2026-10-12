-- Email notification settings and audit trail for reminders

ALTER TABLE reminders
  ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_notification_timings INTEGER[] NOT NULL DEFAULT '{}';

ALTER TABLE reminders
  ADD CONSTRAINT reminders_email_notification_timings_check
  CHECK (email_notification_timings <@ ARRAY[0, 1, 3, 7]);

CREATE TABLE IF NOT EXISTS reminder_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_id UUID NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'email',
  notification_date DATE NOT NULL,
  due_date DATE NOT NULL,
  timing_days_before INTEGER NOT NULL,
  status TEXT NOT NULL,
  recipient_email TEXT,
  provider TEXT DEFAULT 'resend',
  provider_message_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT reminder_notifications_channel_check CHECK (channel = 'email'),
  CONSTRAINT reminder_notifications_status_check CHECK (status IN ('sent', 'failed', 'skipped')),
  CONSTRAINT reminder_notifications_timing_check CHECK (timing_days_before IN (0, 1, 3, 7))
);

ALTER TABLE reminder_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their reminder notifications" ON reminder_notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reminders_email_notifications_enabled
  ON reminders(user_id, is_active, email_notifications_enabled);

CREATE INDEX IF NOT EXISTS idx_reminder_notifications_user_id
  ON reminder_notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_reminder_notifications_reminder_id
  ON reminder_notifications(reminder_id);

CREATE INDEX IF NOT EXISTS idx_reminder_notifications_notification_date
  ON reminder_notifications(notification_date);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_sent_reminder_email_notification
  ON reminder_notifications(reminder_id, channel, notification_date, timing_days_before)
  WHERE status = 'sent' AND channel = 'email';

COMMENT ON COLUMN reminders.email_notifications_enabled IS 'Opt-in flag for reminder email notices';
COMMENT ON COLUMN reminders.email_notification_timings IS 'Selected notification timing days before due date: 0, 1, 3, or 7';
COMMENT ON TABLE reminder_notifications IS 'Immutable audit records for reminder email notification outcomes';
