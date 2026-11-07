# Flock Community Portal — Deployment Setup

The /flock/ area is a private member portal. The public website remains available without an account. Member access requires an email/password sign-in followed by a TOTP code from an authenticator app.

## What is included

- /flock/login.html: sign-in, self-registration, password recovery, and authenticator setup/challenge.
- /flock/: the private community landing page with four intentionally empty classroom placeholders.
- functions/_middleware.js: protects the portal pages and their assets on the server.
- functions/api/community/config.js: returns only the public Supabase URL and publishable/anon key.
- functions/api/community/session.js: validates a Supabase access token with Supabase, requires aal2 and a TOTP authentication method, then sets a signed HttpOnly cookie.
- functions/api/community/logout.js: clears the portal cookie.
- Cookie name: __Secure-lbg_flock. It is HMAC-signed, Secure, HttpOnly, SameSite=Strict, scoped to /flock, and expires within one hour.

The portal currently has no classroom content, posting, chat, member directory, or classroom-management backend. Those spaces are deliberately placeholders for the community to shape.

## 1. Create a Supabase project

Create a project in Supabase and open Project Settings → API. Obtain:

- Project URL, usually https://YOUR_PROJECT_REF.supabase.co.
- The public publishable key (or legacy anon key).

Do not use the service-role key in the website or in these Pages variables. It is not needed by this implementation.

## 2. Configure Supabase Auth

In Authentication → URL Configuration:

- Set the Site URL to https://lowbatterygoose.pages.dev.
- Add https://lowbatterygoose.pages.dev/flock/login to the allowed redirect URLs (Cloudflare Pages clean URLs remove the `.html` suffix).
- Do not use wildcard redirect URLs for production.

In Authentication → Sign In / Providers → Email:

- Enable email/password sign-up.
- Keep email confirmation enabled.
- Configure production SMTP so confirmation and password-reset messages are deliverable.
- Set the minimum password length to at least 12 characters.

In Authentication → Multi-Factor Authentication:

- Enable Authenticator Assurance Level / TOTP verification.
- Allow the TOTP authenticator factor.
- Do not disable MFA challenge or verification.

The app does not let a member into the portal until Supabase reports aal2 and an authentication method of totp. Members set up an authenticator during their first successful sign-in, then enter a fresh code each later sign-in.

## 3. Add Cloudflare Pages environment variables

In Cloudflare Dashboard → Workers & Pages → your Low Battery Goose Pages project → Settings → Variables and Secrets, add these values to the Production environment:

| Variable | Value |
|---|---|
| SUPABASE_URL | Your Supabase project URL |
| SUPABASE_ANON_KEY | Supabase publishable key or legacy anon key |
| COMMUNITY_SESSION_SECRET | A new random secret, at least 32 characters |

Generate the session secret locally. Do not commit it or paste it into this repository:

~~~sh
openssl rand -hex 32
~~~

Set the same three variables in Preview only if you intend to test member login on preview deployments. Prefer a separate Supabase test project and separate session secret for previews.

## 4. Configure the governance intake separately

The public governance application endpoint is separate from the Flock login. Add these in Cloudflare Pages → Settings → Variables and Secrets for Production:

| Variable | Value |
|---|---|
| AIRTABLE_TOKEN | Airtable personal access token restricted to the application base and record creation only |
| GOVERNANCE_INTAKE_ENABLED | Keep `false` until the endpoint, Airtable token, and edge rate limit have been verified; set to `true` only when ready to accept applications |

The endpoint intentionally returns a closed status until both values are present and the enable flag is exactly `true`. The browser checks this status before enabling the submit button. Do not use a token with workspace-wide access or read/write access to unrelated bases.

Create a Cloudflare WAF rate-limiting rule scoped to `POST /api/governance-application`, keyed by source IP. Start conservatively (for example, 5 POST requests per 10 minutes per IP) and block or managed-challenge requests that exceed the threshold. Tune after observing legitimate community traffic. The form honeypot and server validation are not rate limiting and do not replace this edge rule. The current form does not integrate a CAPTCHA provider; do not claim CAPTCHA protection is active.

Do not submit a real applicant record as a connectivity test without authorization. Validate the field mapping and use a designated test record or an owner-approved test submission, then remove the test record according to the retention policy. Only enable the intake after the successful write has been confirmed in Airtable.

## 5. Deploy and verify

Deploy the lbgv6/ directory as the Cloudflare Pages project root, as the existing site does. There is no build command.

After deployment, test the following in a private browser window:

1. Open /flock/ while signed out. It must redirect to /flock/login.html.
2. Create a test member account and confirm the email address.
3. Sign in with the password. On first use, the portal must require authenticator enrollment and a valid six-digit code.
4. Sign out, sign in again, and verify that the existing authenticator factor is challenged.
5. Open /flock/ in another tab without a valid session. It must redirect to login.
6. Sign out and verify the prior portal cookie no longer works.
7. Wait for the session to expire (no longer than one hour) and confirm a new sign-in is required.
8. Confirm the public home page and the current Telegram/community links still work.

The login library is pinned to @supabase/supabase-js 2.119.0 through jsDelivr. The Content Security Policy allows that pinned CDN and the default *.supabase.co API host. If using a custom Supabase domain, update connect-src in lbgv6/_headers to that exact host.

## 6. Security boundaries and operational notes

- The browser receives only the Supabase publishable/anon key. Never expose the Supabase service-role key.
- Passwords and TOTP secrets are handled by Supabase Auth. Access and refresh tokens remain in the login page's JavaScript memory only and are cleared after the signed portal cookie is issued. The short-lived PKCE code verifier is the only auth-flow value stored temporarily in localStorage; it is removed when the code is exchanged.
- Supabase validates the access token at /auth/v1/user; the Pages Function then checks the signed JWT's aal2 and totp claims before creating the portal cookie.
- The portal cookie is HMAC-signed with COMMUNITY_SESSION_SECRET, HttpOnly, Secure, SameSite=Strict, scoped to /flock, and expires within one hour. The session is stateless, so a stolen cookie cannot be individually revoked server-side before it expires; changing COMMUNITY_SESSION_SECRET invalidates all portal cookies.
- Logging out clears the browser's portal cookie. Changing an account password or removing an MFA factor at the provider invalidates the underlying Supabase session, but an already-issued stateless portal cookie can remain usable until its expiry or until the session secret is rotated.
- Members who lose their authenticator currently need an account-recovery procedure administered through Supabase. Do not bypass the AAL2 check to recover access.
- Review Supabase Auth rate limits and abuse controls before opening registration broadly. CAPTCHA is not integrated by the current login page, so do not enable a CAPTCHA requirement until the client-side integration is implemented and tested.
- This implementation is authentication, not classroom authorization. Everyone who can create and verify an account is a member; there are no admin/moderator roles yet.
- The public website's existing governance application endpoint is unchanged. The portal does not grant governance, treasury, wallet, or signing privileges.

## Request flow

~~~text
Member browser
  ├─ email + password ───────────────> Supabase Auth (aal1)
  ├─ enroll TOTP or challenge factor ─> Supabase Auth
  ├─ verify six-digit TOTP ──────────> Supabase Auth (aal2)
  └─ POST access token ──────────────> Pages /api/community/session
                                        ├─ validates token with Supabase /auth/v1/user
                                        ├─ requires aal2 + amr method totp
                                        └─ issues signed HttpOnly portal cookie

Later request to /flock/*
  └─ Pages middleware verifies cookie signature + expiry
       ├─ valid   → serve private portal page/asset
       └─ invalid → redirect to /flock/login.html
~~~


## Governance intake rate-limiting service

Cloudflare Pages Functions do not expose the Workers Rate Limiting binding directly. This repository therefore includes a small internal Worker at `workers/governance-rate-limiter/`, called through a Pages Service binding. Cloudflare's rate-limiting binding is approximate and local to each Cloudflare location; it is a useful abuse-control layer, not a globally strict quota.

1. Add the GitHub Actions repository secret `CLOUDFLARE_API_TOKEN` with permission to deploy Workers Scripts in this account. The Worker config contains the account ID; no token belongs in the repository.
2. Run the **Deploy governance rate limiter** workflow (or push a change under `workers/governance-rate-limiter/`). It deploys the Worker named `lbg-governance-rate-limiter` with a limit of 5 checks per 60 seconds per source IP.
3. In Cloudflare Pages → `lowbatterygoose` → Settings → Bindings → Add → Service binding, create:
   - Variable name: `GOVERNANCE_RATE_LIMITER`
   - Service: `lbg-governance-rate-limiter`
4. Save and redeploy the Pages project so the binding is available to the Function.
5. Confirm `GET /api/governance-application` returns an available response only when the Airtable token, service binding, and explicit enable flag are all present.

The Pages Function fails closed (503) if the service binding is absent or unavailable and returns 429 when the Worker reports a limit breach. The Worker has no public `workers.dev` endpoint; it is intended to be called only through the Pages service binding.

Keep `GOVERNANCE_INTAKE_ENABLED=false` until the Airtable personal access token has been rotated, scoped to the application base with record-create permission only, and verified with an owner-approved test record. Then enable intake explicitly and verify the public form readiness message. Do not create a real applicant record as a test.
