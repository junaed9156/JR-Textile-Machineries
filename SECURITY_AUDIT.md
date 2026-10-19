# JR Textile Machineries security audit — 2026-10-19

## Scope and evidence

Reviewed `junaed9156/JR-Textile-Machineries`, starting at main commit
`6006fae9637a005d6fc485098539280636a60b22`, and the live HTTPS site
`https://www.jrtextiles.com/`. All 60 commits reachable from the cloned main and
remaining remote development branch were enumerated, including 91 unique
path/blob combinations. A targeted credential scan inspected historical text
blobs; Gitleaks 8.30.1 separately inspected all reachable history (34 non-merge
patch-bearing commits; approximately 4.42 MB). No history was rewritten.

The application is HTML, CSS and local JavaScript with Google Fonts and an
external Web3Forms enquiry API. No application backend, database, environment
file, package manifest, lockfile, customer account store or server debug mode was
found in the current repository. Hosting/provider dashboards, account sessions,
unreachable/deleted Git objects, other repositories, DNS control panels and
provider-side data were outside the available access.

## Findings and remediation

| Finding | Evidence | Status |
| --- | --- | --- |
| Browser-only administration was bypassable | Public login/editor DOM and a client-side SHA-256 verifier controlled only a local editing/export UI | Removed the complete editor, verifier, hidden entry points and upload/export code. Publishing now uses authenticated GitHub access. |
| Old editor password was public | Plaintext `ADMIN_PASS` assignments in 13 historical index.html blobs | Removed from current runtime by deleting the editor; treat the historical password as compromised. Change any reused credentials. History remains public. |
| Unsafe HTML assembly in editor and chat | Editor used HTML interpolation for arbitrary content and exports; chat assembled action links as HTML strings | Removed editor paths and replaced remaining HTML-string operations with DOM nodes, textContent and property setters. No user text is parsed as markup. |
| Scripts had no restrictive document policy | Inline scripts/event handlers and absent CSP | Moved executable scripts to local files; added CSP blocking inline JavaScript, event handlers, eval, objects and base overrides, restricting network/resource origins. Added referrer policy and opener protection. |
| Enquiries lacked robust browser checks | Only name/contact presence checked; repeated sends and unbounded text possible | Added bounded plain-text validation, CRLF/control rejection for single-line fields, email/phone checks, option allowlists, request timeout, duplicate-request lock, generic errors and a browser attempt throttle. |
| CAPTCHA enforcement requires provider control | Public provider API is directly callable | Added the provider's documented shared hCaptcha integration and token submission, failing closed in the frontend without a token. Mandatory server-side CAPTCHA, domain restrictions and rate-limit policy still require the provider dashboard. |
| Some security headers absent on live response | Initial HTTPS response lacked CSP, HSTS, nosniff, X-Frame-Options and Permissions-Policy | Document-level CSP and referrer policy implemented. Additional HTTP headers require hosting/edge configuration. GitHub Pages does not apply arbitrary repository header files. |
| Main branch not protected | GitHub branch metadata returned `protected: false` | Added read-only security CI and Dependabot for pinned Actions. Making checks required and restricting direct pushes requires repository rule settings; not changed through the available connector. |
| Unnecessary public tooling and source masters | Root publishing originally included ancillary source assets | Added Jekyll deployment exclusions for source masters, tests, scripts and security notes, plus gitignore patterns for credentials, dumps, backups and local exports. Repository history/source remain public. |

## Verification

- JavaScript syntax checks for local runtime files.
- Eight Node regression groups covering validation, multilingual text, markup and
  header-injection rejection, forged options, missing CAPTCHA, fixed HTTPS
  destination, credential omission, duplicate requests, browser throttling,
  blocked/corrupt storage and provider failure recovery.
- Six-language DOM smoke checks: English, Bengali, Hindi, Urdu, Chinese and
  Turkish; verified theme switching, About tabs, chat treating markup as text,
  invalid-form rejection and a mocked successful submission with a test token.
- Static checks for duplicate IDs, missing local resources, new-tab link
  protection, executable inline scripts, unsafe HTML sinks and CSP boundaries.
- Gitleaks scan of current source and all then-reachable history. Historical
  plaintext admin credentials were identified separately by targeted scanning;
  a clean default Gitleaks history result alone is not proof of no credentials.
  The shared public CAPTCHA identifier has an exact-line inline allow marker;
  it is not a private API key.
- Read-only production probes: `/` returned 200; `/.env`, `/.git/config`,
  `/admin`, `/admin/`, `/api/`, `/debug`, `/config.json`, `/database.sql`,
  `/index.html.bak` and `/package.json` returned 404.

Form tests used a mock transport and did not email real recipients. CAPTCHA
completion, actual email delivery and the provider's rejection of direct
requests without CAPTCHA have not been verified. Browser throttling is not an
IP-based or server-enforced rate limiter. DOM simulation does not enforce CSP;
browser/production observations should be used to check it after deployment.

## Remaining owner controls

1. Enable mandatory hCaptcha and review spam/rate settings in Web3Forms. If
   supported by the current plan, allow only the actual site domains. Verify
   a real human enquiry arrives, and that direct tokenless requests are rejected.
2. Change the old editor password anywhere it was reused. Enable a GitHub
   passkey/2FA and review collaborators, deploy keys, app grants and sessions.
3. Enable/verify Enforce HTTPS and custom-domain ownership in GitHub Pages.
   Configure branch rules requiring the security check if available.
4. Use hosting/edge response-header controls for HSTS, nosniff, framing and
   Permissions-Policy; see SECURITY.md for the exact settings and constraints.
5. If a web admin panel or database is later introduced, implement server-side
   authentication/authorization and data isolation before exposing it. Do not
   reintroduce a frontend password check as access control.

This is a source/history and configuration review with targeted regression
testing, not a guarantee that the website cannot be compromised or an exhaustive
penetration test of GitHub, the form provider, DNS or the owner's accounts.
