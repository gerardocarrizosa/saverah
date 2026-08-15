-- Add nullable installment metadata to existing expenses rows.
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS installment_group_id UUID,
  ADD COLUMN IF NOT EXISTS installment_number INTEGER,
  ADD COLUMN IF NOT EXISTS installment_total INTEGER,
  ADD COLUMN IF NOT EXISTS installment_total_amount NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS installment_start_date DATE,
  ADD COLUMN IF NOT EXISTS installment_end_date DATE;

CREATE INDEX IF NOT EXISTS idx_expenses_user_installment_group
  ON expenses(user_id, installment_group_id)
  WHERE installment_group_id IS NOT NULL;

ALTER TABLE expenses
  ADD CONSTRAINT expenses_installment_total_check
  CHECK (installment_total IS NULL OR installment_total >= 2),
  ADD CONSTRAINT expenses_installment_number_check
  CHECK (installment_number IS NULL OR installment_number >= 1),
  ADD CONSTRAINT expenses_installment_number_total_check
  CHECK (
    installment_number IS NULL
    OR installment_total IS NULL
    OR installment_number <= installment_total
  ),
  ADD CONSTRAINT expenses_installment_total_amount_check
  CHECK (installment_total_amount IS NULL OR installment_total_amount > 0),
  ADD CONSTRAINT expenses_installment_metadata_all_or_none_check
  CHECK (
    (
      installment_group_id IS NULL
      AND installment_number IS NULL
      AND installment_total IS NULL
      AND installment_total_amount IS NULL
      AND installment_start_date IS NULL
      AND installment_end_date IS NULL
    )
    OR
    (
      installment_group_id IS NOT NULL
      AND installment_number IS NOT NULL
      AND installment_total IS NOT NULL
      AND installment_total_amount IS NOT NULL
      AND installment_start_date IS NOT NULL
      AND installment_end_date IS NOT NULL
    )
  );
