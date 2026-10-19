'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {validateEnquiry, createEnquiryController} = require('../assets/security.js');
const VALID = {name: 'মোঃ Junaed Ahmed', company: 'JR Textile', email: 'buyer@example.com', phone: '+880 1876284203', country: 'Bangladesh', machine: 'Air Jet Loom', license: '', message: 'Need 4 looms.\nPlease quote.'};
// A test fixture, never a production provider key.
const KEY = '00000000-0000-0000-0000-000000000000';
const ENDPOINT = 'https://api.web3forms.com/submit';
function setup(fetch = async () => ({ok: true, json: async () => ({success: true})}), storage) {
  let now = 1000000;
  const controller = createEnquiryController({endpoint: ENDPOINT, fetch, storage, now: () => now});
  return {controller, tick: ms => { now += ms; }};
}
test('accepts multilingual plain text and normalizes telephone punctuation', () => {
  const result = validateEnquiry(VALID);
  assert.equal(result.ok, true); assert.equal(result.data.phone, '+8801876284203');
  assert.equal(result.data.message, VALID.message);
});
test('rejects markup, header injection, malformed email and oversized input', () => {
  for (const change of [{name: '<img src=x onerror=alert(1)>'}, {message: '<script>alert(1)</script>'}, {email: 'buyer@example.com\r\nBcc: victim@example.com'}, {email: 'bad-address'}, {name: 'a'.repeat(101)}, {message: 'a'.repeat(4001)}, {name: 'a\u0000b'}, {phoneRaw: '+88<script>', phone: '+8801876284203'}]) {
    assert.equal(validateEnquiry({...VALID, ...change}).ok, false, JSON.stringify(change));
  }
});
test('rejects forged select values and requires a name and contact', () => {
  for (const change of [{machine: 'fake'}, {license: 'fake'}, {country: '__proto__'}, {name: ''}, {email: '', phone: ''}]) assert.equal(validateEnquiry({...VALID, ...change}).ok, false);
  assert.equal(validateEnquiry({...VALID, email: ''}).ok, true);
  assert.equal(validateEnquiry({...VALID, phone: ''}).ok, true);
});
test('uses only the fixed HTTPS provider, sends JSON, omits cookies and carries CAPTCHA', async () => {
  let called = 0;
  const {controller} = setup(async (url, options) => {
    called++; assert.equal(url, ENDPOINT); assert.equal(options.credentials, 'omit'); assert.equal(options.redirect, 'error');
    const data = JSON.parse(options.body);
    assert.equal(data['h-captcha-response'], 'test-token'); assert.equal(data.name, VALID.name);
    assert.equal(data.admin, undefined); assert.equal(data.subject, 'New Machine Inquiry — JR Textile Machineries');
    return {ok: true, json: async () => ({success: true})};
  });
  await controller.submit({...VALID, admin: true}, KEY, 'test-token'); assert.equal(called, 1);
  assert.throws(() => createEnquiryController({endpoint: 'https://evil.example', fetch() {}}), {code: 'CONFIG'});
});
test('invalid data, missing CAPTCHA and invalid keys do not make network calls', async () => {
  let called = 0; const {controller} = setup(async () => { called++; });
  await assert.rejects(controller.submit({...VALID, message: '<b>x</b>'}, KEY, 'x'), {code: 'VALIDATION'});
  await assert.rejects(controller.submit(VALID, KEY, ''), {code: 'CAPTCHA'});
  await assert.rejects(controller.submit(VALID, 'invalid', 'x'), {code: 'CONFIG'});
  assert.equal(called, 0);
});
test('blocks concurrent submissions and enforces browser cooldown and rolling attempt limit', async () => {
  let release, called = 0;
  const {controller, tick} = setup(() => {called++; return new Promise(resolve => {release = () => resolve({ok: true, json: async () => ({success: true})});});});
  const pending = controller.submit(VALID, KEY, 'x');
  await assert.rejects(controller.submit(VALID, KEY, 'x'), {code: 'BUSY'}); release(); await pending;
  await assert.rejects(controller.submit(VALID, KEY, 'x'), {code: 'COOLDOWN'});
  for (let i = 0; i < 4; i++) {tick(60000); const next = controller.submit(VALID, KEY, 'x'); release(); await next;}
  tick(60000); await assert.rejects(controller.submit(VALID, KEY, 'x'), {code: 'COOLDOWN'}); assert.equal(called, 5);
  tick(15 * 60000); const next = controller.submit(VALID, KEY, 'x'); release(); await next;
});
test('survives blocked/corrupt storage and remembers attempts across controller recreation', async () => {
  const saved = new Map(); const storage = {getItem: k => saved.get(k), setItem: (k, v) => saved.set(k, v)};
  await setup(undefined, storage).controller.submit(VALID, KEY, 'x');
  await assert.rejects(setup(undefined, storage).controller.submit(VALID, KEY, 'x'), {code: 'COOLDOWN'});
  await setup(undefined, {getItem() {throw new Error('blocked');}, setItem() {throw new Error('blocked');}}).controller.submit(VALID, KEY, 'x');
  await setup(undefined, {getItem() {return '{}';}, setItem() {}}).controller.submit(VALID, KEY, 'x');
});
test('provider failures are generic and release the in-flight lock for later retries', async () => {
  for (const response of [{ok: false, status: 500}, {ok: true, json: async () => ({success: false, message: '<private provider detail>'})}, {ok: true, json: async () => {throw new Error('invalid JSON');}}]) {
    const {controller, tick} = setup(async () => response);
    await assert.rejects(controller.submit(VALID, KEY, 'x'), {code: 'PROVIDER', message: 'Unable to send enquiry.'});
    tick(60000); await assert.rejects(controller.submit(VALID, KEY, 'x'), {code: 'PROVIDER'});
  }
  await assert.rejects(setup(async () => ({ok: false, status: 429})).controller.submit(VALID, KEY, 'x'), {code: 'COOLDOWN'});
});
