#!/usr/bin/env python3
"""Dependency-free regression checks for the public static website."""
from html.parser import HTMLParser
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]

class SecurityHTML(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.errors = []
        self.csp = ''
        self.referrer = ''
    def handle_starttag(self, tag, attributes):
        a = dict(attributes)
        if a.get('id'):
            if a['id'] in self.ids: self.errors.append('Duplicate element ID: ' + a['id'])
            self.ids.add(a['id'])
        if any(name.lower().startswith('on') for name in a): self.errors.append('Inline event handler')
        if tag == 'script' and not a.get('src') and a.get('type') != 'application/ld+json': self.errors.append('Executable inline script')
        if tag in ('object', 'embed', 'base'): self.errors.append('Unexpected active element: ' + tag)
        if tag == 'a' and a.get('target') == '_blank' and not {'noopener','noreferrer'} <= set(a.get('rel','').split()): self.errors.append('Unsafe new-tab link')
        if a.get('href','').lower().startswith(('javascript:', 'data:')): self.errors.append('Unsafe link scheme')
        if tag == 'meta':
            if a.get('http-equiv','').lower() == 'content-security-policy': self.csp = a.get('content','')
            if a.get('name') == 'referrer': self.referrer = a.get('content','')
        if a.get('src','').startswith('assets/') and not (ROOT / a['src'].split('?')[0]).is_file(): self.errors.append('Missing local script/image')

html = (ROOT / 'index.html').read_text()
parsed = SecurityHTML()
parsed.feed(html)
errors = parsed.errors
for directive in ["default-src 'none'", "script-src-attr 'none'", "object-src 'none'", "base-uri 'none'", "form-action 'none'", 'upgrade-insecure-requests']:
    if directive not in parsed.csp: errors.append('Missing CSP directive: ' + directive)
script_policy = next((p for p in parsed.csp.split(';') if p.strip().startswith('script-src ')), '')
if any(term in script_policy for term in ["'unsafe-inline'", "'unsafe-eval'", 'data:', 'https:;']): errors.append('Unsafe script policy')
if parsed.referrer != 'strict-origin-when-cross-origin': errors.append('Missing referrer policy')
if not {'enquiry-form','f-botcheck','form-status'} <= parsed.ids: errors.append('Missing enquiry safeguards')
if {'ap','lm','l-pass'} & parsed.ids: errors.append('Public editor returned')
for filename in ['index.html','assets/app.js','assets/security.js','assets/theme.js','assets/i18n.js']:
    source = (ROOT / filename).read_text()
    if re.search(r'\b(?:ADMIN_HASH|ADMIN_PASS(?:WORD)?)\b|#admin|\.innerHTML\s*=|\.outerHTML\s*=|insertAdjacentHTML\s*\(|\beval\s*\(|new\s+Function\s*\(|document\.write\s*\(|\bdebugger\b', source): errors.append('Unsafe editor/HTML execution/debug construct: ' + filename)
    if re.search(r'(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)', source): errors.append('Possible secret: ' + filename)

if errors:
    print('\n'.join('FAIL: ' + e for e in errors)); sys.exit(1)
print('Static security checks passed: CSP, no editor/inline scripts/HTML sinks, local assets, links and form.')
