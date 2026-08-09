# RFab ↔ Institute Bridge — institute-side implementation notes (2026-08-09)

Branch: `rfab-bridge`. Contract: `RFAB_INSTITUTE_BRIDGE.md` (v1, in the RFab
workspace `DOCS/`). Goal: one shared identity + one shared token wallet across
rfab.ai and parrhesia.io, invisible to existing users. RFab is the system of
record for identity and balances; linkage lives in a new `rfab_identity_map`
table (institute rows are never re-keyed).

**Nothing here is deployed.** Deploying requires: the DB migration, new env
vars, `npm install` (one new dependency), and the RFab side of the bridge
being live.

## What changed

### New modules
| File | What it is |
|---|---|
| `server/services/rfabBridge.js` | HTTP client for the bridge API (native fetch, 5 s timeouts, retry-once on network error for balance/credit only, **never** debit). With `RFAB_BRIDGE_SECRET` unset every method returns `{ bridgeDisabled: true }` and the app is fully local. |
| `server/services/identityBridge.js` | `rfab_identity_map` handling: attach-or-create after verified Google logins, password provision/verify mapping, one-time local-balance migration grant (`institute-migration:<user_id>` ref, replay-safe, zeroes `users.tokens` after the credit lands). Best-effort — never blocks a login. |
| `server/services/spendGate.js` | Server-derived billing context (session userId → users.tenant_id → tenants.billing_mode; `settings.free_token_monthly_limit` + `user_monthly_token_usage`), `precheck()` before every OpenAI call, `recordUsage()` after. Mapped student-mode users: allowance portion recorded locally, over-allowance fraction debited via `/wallet/debit`; unmapped/school: legacy `CALL save_token_usage` unchanged. Owner exemption (Collins/Simone) mirrored from the old frontend gate. |
| `server/config/session.js` | Shared express-session middleware: `SESSION_SECRET` env (throws in prod if unset), `express-mysql-session` store on the existing pool (`sessions` table auto-created), `httpOnly` + `sameSite=lax` + `secure:'auto'` cookie. Shared with Socket.IO. |
| `server/middlewares/rateLimitMiddleware.js` | Minimal in-memory per-IP limiter (guest AI route). |
| `migrations/2026-08-09-rfab-bridge.sql` | `rfab_identity_map` + unique `stripe_session_id` on `user_receipts`/`tenant_receipts`. |
| `scripts/bridge-smoke.js` | Dependency-free stub of the RFab side + 19 checks over the client (all passing). |

### Changed behavior (server)
- **Google auth (`server/app.js`)**: ID tokens verified with
  `google-auth-library` (audience = `GOOGLE_CLIENT_ID`, `email_verified`
  required). All work happens in the POST handlers; the module-global
  `googleUserDetails`/`googleLoginResult` (shared across ALL users — a race
  could log someone into another person's account) are gone;
  `/google-login-result` now reads from the caller's session. `accountType`
  allowlisted to `student|instructor`. Redirect responses preserved, so the
  frontend flow is unchanged.
- **Password login (`/login-attempt`)**: unchanged for existing local users;
  additionally (bridge only) an unmapped user gets an RFab account provisioned
  with the same password (409 `EMAIL_EXISTS` ⇒ stays unmapped), and an unknown
  username that looks like an email is verified against RFab — success
  auto-provisions a local student account (uuidv7, default avatar,
  `unlockInitialSkills`, bcrypt-stored password) mapped as `password_verify`.
- **Sessions**: env secret, MariaDB store, cookie flags, `trust proxy`;
  `/get-session-details` returns an explicit allowlist
  (`isLoggedIn,userId,userName,firstName,lastName,role`) instead of the raw
  session object.
- **Socket.IO**: shares the session middleware; unauthenticated sockets are
  disconnected; handlers take `userId` from the session and **ignore** payload
  identity/billing fields; per-message spend pre-check.
- **Spend points wired through spendGate** (pre-check + recording):
  socket `new-message`/`ask-question`/`new-learning-objective-message`,
  `ai-tutor` `/assessing/assess` + `/stt/convert`, `skills`
  `/find-with-context` + `/get-recommended-skills`, `questions`
  `/check-questions` + `/mark-essay-question` + `/mark-image-question`,
  `resources` `/generate-sources`.
- **Auth holes closed**: `isAuthenticated` on `/ai-tutor/stt/convert`,
  `/ai-tutor/new-vector-store`, `/questions/mark-*`, `/questions/check-questions`,
  `/resources/generate-sources`; platform-admin gate on
  `/users/new-instructor/add` and `/users/new-editor/add`; rate limit on
  `/skills/guest-user/get-recommended-skills`.
- **Stripe (`server/routes/tokens.js`)**: checkout requires session auth and
  identifies the buyer from the session (module-global `userId`/`tenantId`
  cross-purchase bug removed); `client_reference_id` carries identity;
  `/success` requires `payment_status === 'paid'` and inserts the receipt
  (unique `stripe_session_id`) BEFORE crediting, so replays are no-ops. Mapped
  users are credited via `/wallet/credit` (`stripe-institute:<session_id>`;
  a failed bridge credit rolls the receipt back so revisiting the success URL
  retries); unmapped users and school pools credit locally. Receipts endpoints
  now require auth (self / own school / platform admin).
- **Balance reads**: `/users/show/:id` (the only endpoint serving
  `users.tokens` as a balance) returns the RFab wallet balance for mapped
  users; bridge problems fall back to the local value.

## Env needed (see `.env.example`)
```
SESSION_SECRET=<generate>                 # REQUIRED in production
GOOGLE_CLIENT_ID=13191319610-qectaoi146ce1pm4v95jtgctsbtmqb3t.apps.googleusercontent.com
RFAB_BRIDGE_URL=https://api.rfab.ai
RFAB_BRIDGE_SECRET=<same secret as RFab>  # empty = bridge off, fully local
RFAB_TOKENS_PER_INSTITUTE_TOKEN=1         # exchange rate, DECISION PENDING
```

## Migration to run (before deploy)
```
mysql -u <user> -p <db> < migrations/2026-08-09-rfab-bridge.sql
```
Also `npm install` (adds `google-auth-library`; `express-mysql-session` was
already a dependency).

## Manual test plan

Local, no bridge (RFAB_BRIDGE_SECRET empty) — regression sweep:
1. `node scripts/bridge-smoke.js` → 19/19 PASS.
2. Password login (existing user) → lands as before; `GET /get-session-details`
   returns only the allowlisted fields.
3. Google login (existing + brand-new account) → same landing pages as before;
   two different browsers logging in simultaneously stay two different users.
4. AI tutor chat (socket) → streams; usage row appears via `save_token_usage`;
   a logged-out socket (clear cookies) is disconnected with `server-error`.
5. Set a user over the free limit with `tokens = 0` → tutor call is refused
   server-side (previously only the UI hid the button).
6. Stripe test purchase → tokens credited once; refresh `/tokens/success` →
   no double credit (receipt row carries `stripe_session_id`).
7. `POST /users/new-editor/add` unauthenticated → 403.

With the bridge (staging RFab + shared secret):
8. Google login with an email that exists on RFab → `rfab_identity_map` row
   (`matched_via='google'`); if the institute user had `tokens > 0`, RFab
   wallet credited `tokens × RATE`, local `tokens` zeroed,
   `migrated_tokens/migrated_at` recorded; replaying the login does not
   double-credit.
9. Password login by an institute user with a novel email → RFab account
   provisioned (`password_provision`); same email already on RFab → 409, no
   map row.
10. Login with an RFab email+password that has no institute account →
    local student account auto-created and mapped (`password_verify`).
11. Mapped user: `/users/show/:id` shows the RFab balance; tutor usage past
    the free allowance debits the wallet (RFab `token_transactions`); at zero
    wallet balance the tutor call is refused (402 / `server-error`).
12. Mapped user Stripe purchase → wallet credit with ref
    `stripe-institute:<session_id>`; replayed success URL → `alreadyProcessed`,
    no double credit.
13. Stop the RFab API → institute logins still work (mapping skipped, logged);
    mapped users' spends fail closed; unmapped users unaffected.

## Known gaps / decisions to confirm
- **Exchange rate** `RFAB_TOKENS_PER_INSTITUTE_TOKEN` defaults to 1:1 —
  Collins decision pending.
- For **mapped** users the legacy `save_token_usage` procedure is bypassed
  (spec) — monthly usage is written to `user_monthly_token_usage` directly.
  If the proc also feeds other tables (its source lives only in the DB),
  those stats won't accrue for mapped users.
- The wallet **debit sends the over-allowance fraction** of the raw
  prompt/completion token counts; RFab prices them with its own TOKEN_RATES.
  The institute's legacy 0.4×output TTS markup applies only to the local
  allowance accounting.
- `/google-editor-signup-attempt` (Google editor signup page) still works
  (verified tokens, role fixed to `editor`); the spec's §7 only gated the
  password variants. Flag if editor self-signup should die entirely.
- Users whose Google email changed on RFab attach by `googleSub` on the RFab
  side; institute-side lookup stays by institute email.
- Socket payloads still choose `threadId`/`assistantId` client-side (thread
  ownership is not verified) — pre-existing, out of scope v1.
