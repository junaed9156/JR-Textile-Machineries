/* Plain-text enquiry validation and browser-side duplicate/spam friction.
 * The form provider must enforce CAPTCHA and abuse limits on its server.
 * This module is dependency-free and never renders HTML or logs form data.
 */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.JRSecurity = factory();
})(typeof window === 'object' ? window : this, function () {
  'use strict';
  var MACHINES = ['', 'Repair Loom', 'Air Jet Loom', 'Water Jet Loom', 'Spare Parts Only', 'Multiple / Not Sure'];
  var LICENSES = ['', 'Yes, I have my own license', 'No - please handle import for me', 'Not sure, need guidance'];
  var COUNTRIES = ['', 'Bangladesh', 'India', 'Pakistan', 'China', 'Turkey', 'Sri Lanka', 'Nepal', 'Vietnam', 'Indonesia', 'Egypt', 'United Arab Emirates', 'Saudi Arabia', 'Uzbekistan', 'Other'];
  var ENDPOINT = 'https://api.web3forms.com/submit';
  var ATTEMPT_STORAGE_NAME = 'jrEnquiryAttemptsV1';
  var WINDOW = 15 * 60 * 1000;
  var COOLDOWN = 60 * 1000;

  function text(value, max, multiline) {
    if (typeof value !== 'string' || value.length > max) throw new Error('Please shorten the highlighted information and try again.');
    value = value.normalize('NFC').trim();
    if (/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value) || (!multiline && /[\r\n\t]/.test(value))) {
      throw new Error('Please use plain text without HTML or control characters.');
    }
    return multiline ? value.replace(/\r\n?/g, '\n') : value;
  }

  function validateEnquiry(raw) {
    try {
      if (!raw || typeof raw !== 'object') throw new Error('Please check your enquiry.');
      var data = {
        name: text(raw.name, 100), company: text(raw.company, 150),
        email: text(raw.email, 254), phone: text(raw.phone, 32),
        country: text(raw.country, 40), machine: text(raw.machine, 40),
        license: text(raw.license, 60), message: text(raw.message, 4000, true)
      };
      if (!data.name) throw new Error('Please enter your name.');
      if (!data.email && !data.phone) throw new Error('Please enter email or phone number.');
      if (data.email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email)) throw new Error('Please enter a valid email address.');
      var phoneRaw = raw.phoneRaw === undefined ? data.phone : text(raw.phoneRaw, 32);
      if (phoneRaw && (!/^\+?[\d\s().-]+$/.test(phoneRaw) || !/^\+?\d{7,15}$/.test(data.phone.replace(/[\s().-]/g, '')))) {
        throw new Error('Please enter a valid phone number, including its country code.');
      }
      if (MACHINES.indexOf(data.machine) === -1 || LICENSES.indexOf(data.license) === -1 || COUNTRIES.indexOf(data.country) === -1) {
        throw new Error('Please choose one of the available form options.');
      }
      data.phone = data.phone.replace(/[\s().-]/g, '');
      return {ok: true, data: data};
    } catch (error) {
      return {ok: false, error: error.message};
    }
  }

  function failure(code) { var error = new Error('Unable to send enquiry.'); error.code = code; return error; }
  function createEnquiryController(options) {
    if (options.endpoint !== ENDPOINT || typeof options.fetch !== 'function') throw failure('CONFIG');
    var inFlight = false, attempts = [];
    function recent(now) {
      var saved = [];
      try { saved = JSON.parse(options.storage.getItem(ATTEMPT_STORAGE_NAME) || '[]'); } catch (_) {}
      if (!Array.isArray(saved)) saved = [];
      return Array.from(new Set(attempts.concat(saved))).filter(function (time) {
        return Number.isFinite(time) && time <= now && now - time < WINDOW;
      }).sort(function (a, b) { return a - b; });
    }
    return {
      submit: async function (raw, key, captcha) {
        var checked = validateEnquiry(raw);
        if (!checked.ok) throw failure('VALIDATION');
        if (typeof key !== 'string' || !/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(key)) throw failure('CONFIG');
        if (typeof captcha !== 'string' || !captcha || captcha.length > 16384) throw failure('CAPTCHA');
        if (inFlight) throw failure('BUSY');
        var now = options.now();
        attempts = recent(now);
        if (attempts.length >= 5 || (attempts.length && now - attempts[attempts.length - 1] < COOLDOWN)) throw failure('COOLDOWN');
        attempts.push(now);
        try { options.storage.setItem(ATTEMPT_STORAGE_NAME, JSON.stringify(attempts)); } catch (_) {}
        inFlight = true;
        var controller = new AbortController();
        var timer = setTimeout(function () { controller.abort(); }, 15000);
        var data = checked.data;
        try {
          var response = await options.fetch(ENDPOINT, {
            method: 'POST', mode: 'cors', credentials: 'omit', redirect: 'error',
            referrerPolicy: 'strict-origin-when-cross-origin', signal: controller.signal,
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
            body: JSON.stringify({
              access_key: key, subject: 'New Machine Inquiry — JR Textile Machineries',
              from_name: 'JR Textile Website', name: data.name, company: data.company,
              email: data.email || 'no-email@provided.com', phone: data.phone,
              country: data.country, machine_type: data.machine, import_license: data.license,
              message: data.message || '(no message)', botcheck: false,
              'h-captcha-response': captcha
            })
          });
          if (!response.ok) throw failure(response.status === 429 ? 'COOLDOWN' : 'PROVIDER');
          var result = await response.json();
          if (!result || result.success !== true) throw failure('PROVIDER');
          return true;
        } catch (error) {
          throw failure(error.code === 'COOLDOWN' ? 'COOLDOWN' : 'PROVIDER');
        } finally {
          clearTimeout(timer); inFlight = false;
        }
      }
    };
  }
  return Object.freeze({validateEnquiry: validateEnquiry, createEnquiryController: createEnquiryController});
});
