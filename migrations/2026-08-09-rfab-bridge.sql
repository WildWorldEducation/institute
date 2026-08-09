-- RFab <-> Collins Institute bridge, institute-side schema
-- (RFAB_INSTITUTE_BRIDGE.md v1, 2026-08-09).
--
-- Run once against the institute database BEFORE deploying the bridge code:
--   mysql -u <user> -p <database> < migrations/2026-08-09-rfab-bridge.sql
--
-- rfab_identity_map links institute users to RFab users. Institute rows are
-- never re-keyed; all linkage lives here.

CREATE TABLE IF NOT EXISTS rfab_identity_map (
  institute_user_id VARCHAR(36) NOT NULL PRIMARY KEY,
  rfab_user_id      VARCHAR(36) NOT NULL,
  matched_via       ENUM('google','password_provision','password_verify','manual') NOT NULL,
  matched_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  migrated_tokens   INT NULL,
  migrated_at       DATETIME NULL,
  KEY idx_rfab_user (rfab_user_id)
);

-- Stripe replay protection: /tokens/success is idempotent via a unique
-- checkout-session id on the receipt row (INSERT receipt FIRST; duplicate
-- key means the session was already credited).
ALTER TABLE user_receipts   ADD COLUMN stripe_session_id VARCHAR(255) NULL, ADD UNIQUE KEY uq_ur_ss (stripe_session_id);
ALTER TABLE tenant_receipts ADD COLUMN stripe_session_id VARCHAR(255) NULL, ADD UNIQUE KEY uq_tr_ss (stripe_session_id);
