# Security model

This is a public, static GitHub Pages marketing website. It has no application
server, database, customer accounts, private user records, or privileged API.
All shipped files and JavaScript must be treated as public.

## Administration

Edit and publish through authenticated GitHub access to this repository. The
old browser-only editor and password verifier have been removed. Do not restore
them or put passwords in JavaScript, HTML, environment files in this repository,
or public build output. Require two-factor authentication or a passkey for GitHub
and review repository collaborators and account sessions regularly.

A future web-based admin panel requires a real server and an established identity
provider. Every privileged endpoint must verify authentication and authorization
on the server, with least-privilege roles, CSRF defenses for cookie-based sessions,
secure HttpOnly cookies and server-enforced abuse limits. If passwords are ever
stored, use an established Argon2id implementation with per-password salts, not
the removed browser SHA-256 verifier.

## Enquiries

Web3Forms is the external enquiry API. Its form access key and the shared
Web3Forms hCaptcha site key are intentionally public identifiers, not secrets.
Form data is submitted by HTTPS JSON to its fixed API endpoint, never rendered
as HTML or persisted in browser storage. The browser stores only attempt times.
Input validation, duplicate-request protection, a browser cooldown and CAPTCHA
are defense in depth; they do not authorize direct requests to the provider.

In the Web3Forms dashboard, enable **mandatory hCaptcha** on this form and review
server-side spam/rate limits and usage alerts. If your plan supports it, restrict
the form to `jrtextiles.com` and `www.jrtextiles.com`. Domain restrictions help
with misuse but do not replace CAPTCHA and provider-side enforcement. Never
put the hCaptcha secret or an email-service private key in frontend code.

The frontend fails closed when CAPTCHA is unavailable; WhatsApp, email and phone
remain available. A live delivery test requires a completed human challenge.

## Hosting controls

GitHub Pages serves static files; this repository cannot set arbitrary HTTP
response headers or implement a server-side IP rate limiter. The HTML CSP and
referrer policy are active browser controls. Do not add a fake `_headers` file
and claim it changes GitHub Pages response headers.

Enable Enforce HTTPS in repository Settings > Pages and verify domain ownership
under GitHub account Settings > Pages. Review collaborators, deploy keys,
connected applications, Actions permissions and branch rules. Make the security
workflow a required check on main if your account plan permits it.

For additional HTTP headers, use a correctly configured edge proxy or a host
supporting custom response headers, preserving the domain and HTTPS origin.
Start with:

```text
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
Strict-Transport-Security: max-age=31536000
```

Also send the CSP from index.html as an HTTP header, adding
`frame-ancestors 'none'`. That directive and HSTS cannot be enforced by an HTML
meta tag. Do not enable HSTS includeSubDomains/preload until every affected
subdomain has working HTTPS. Styles currently allow inline CSS to preserve the
existing design; inline JavaScript, event handlers, eval, plugins and base URL
overrides are blocked. hCaptcha scripts and frames are limited to its documented
origins; local scripts and Google Fonts are the other permitted sources.

## Historical credentials

Older commits contain the removed editor's plaintext credentials. Treat that
password as compromised and change it anywhere it was reused. The removed
editor was local-only and could not itself publish to GitHub. Removing its code
invalidates that path on the current website, but does not erase copies of old
commits. Rewriting shared history is a separate coordinated operation and cannot
revoke credentials or remove existing clones or caches.

## Maintenance

Run `python3 scripts/check-security.py` and `node --test tests/security.test.cjs`
before publishing. CI also performs JavaScript syntax checks and a redacted
Gitleaks scan of the current tree. The 2026-10-19 audit separately inspected all
then-reachable Git history. There are no application package dependencies to
upgrade; Dependabot reviews pinned GitHub Actions. Review the pinned Gitleaks
release and its SHA-256 together when updating it. Do not commit scan reports
containing secrets or customer enquiries.

Report security issues privately to the repository owner rather than including
credentials, enquiry contents, or exploit payloads in a public issue.
