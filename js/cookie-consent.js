/* Art of Breath — cookie consent + Google Analytics 4.
   Implements cookie-consent-guide.md. Self-contained: injects its own styles and markup,
   so every page needs one <script src="js/cookie-consent.js" defer> and nothing else.

   The contract, in short: nothing from Google is requested until the visitor clicks
   "Akzeptieren". There is no gtag/googletagmanager tag in any HTML file; the script
   element is created inside loadAnalytics() and nowhere else. The trainer map is not
   gated, it sets no cookies (see Datenschutzerklärung §7).

   Layout since 2026-11-12 (Nico's decision, Asana 1220158834171960): first layer
   "Einstellungen" (outline) | "Akzeptieren" (filled); second layer the Statistik box,
   never pre-ticked, with "Auswahl speichern" | "Akzeptieren". Focus lands on the dialog,
   not on a button. A refusal is asked again after 6 months, consent after 12. Every
   display and every choice is counted anonymously (count(), n8n "Consent-Zähler"
   Rbgc5Yoo3SHz25z1 → Google Sheet): event, choice, device type, time; no ID, nothing
   stored in the browser. Described in datenschutz.html, section 4.

   Presentation changed on request 2026-08-03: a centred dialog over a dimmed page,
   instead of the bottom-left card the guide's step 5 originally described. It is modal
   now, so the page waits for an answer. What does not change, and is the part that
   still holds: there is no pre-ticked box, and nothing from Google loads before a yes.

   ─────────────────────────────────────────────────────────────────────────────
   MEASUREMENT_ID is the GA4 property "art-of-breath.com" (account "Art of Breath",
   property 561151426), created 2026-10-28. Retention 2 months, Google Signals off,
   matching the Datenschutzerklärung. If the ID is ever reset to the placeholder,
   init() shows no banner and hides the footer link (no tracking, no consent prompt).
   ───────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var MEASUREMENT_ID = 'G-BDV0S4ZF69';   // GA4 property art-of-breath.com (2026-10-28)
  var STORAGE_KEY    = 'aob-consent';
  var CONSENT_MAX_AGE = 365 * 24 * 60 * 60 * 1000;   // consent: 12 months, then ask again
  var DECLINE_MAX_AGE = 182 * 24 * 60 * 60 * 1000;   // refusal: 6 months, then ask again
  var COUNTER_URL    = 'https://n8n.nicosmat.com/webhook/consent-zaehler';

  /* Anonymous counter: which event, which choice, phone or computer. No ID, no storage.
     Only the live site counts, so previews and local work do not skew the rates. */
  function count(ereignis, analytics) {
    if (!/(^|\.)art-of-breath\.com$/.test(location.hostname)) return;
    try {
      var body = { seite: 'art-of-breath.com', ereignis: ereignis,
                   geraet: window.matchMedia('(max-width: 767px)').matches ? 'mobil' : 'desktop' };
      if (typeof analytics === 'boolean') body.statistik = analytics;
      fetch(COUNTER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' },
                           body: JSON.stringify(body), keepalive: true }).catch(function () {});
    } catch (e) { /* the counter must never get in the way */ }
  }
  var PRIVACY_URL    = 'datenschutz.html';

  /* ---------- where the choice lives -------------------------------------- */
  /* localStorage first, as the Datenschutzerklärung describes. Some contexts refuse it
     outright and throw on access: Safari on file:// URLs, private windows, browsers set
     to block all site data. There the visitor would be asked again on every single page,
     so fall back to a first-party cookie holding the same JSON. It is strictly necessary
     under § 25 Abs. 2 TDDDG for exactly the reason the localStorage entry is: without it
     the site cannot remember that you said no. */
  function storageRead() {
    try {
      var v = window.localStorage.getItem(STORAGE_KEY);
      if (v) return v;
    } catch (e) { /* storage blocked, try the cookie */ }
    var m = document.cookie.match(/(?:^|;\s*)aob-consent=([^;]*)/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function storageWrite(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
      return;
    } catch (e) { /* fall through */ }
    document.cookie = STORAGE_KEY + '=' + encodeURIComponent(value) +
      '; path=/; max-age=' + Math.floor(CONSENT_MAX_AGE / 1000) + '; SameSite=Lax' +
      (location.protocol === 'https:' ? '; Secure' : '');
  }

  /* ---------- stored choice ---------------------------------------------- */
  /* Shape: { v: 1, analytics: true|false, ts: "<ISO date>" }. Anything malformed,
     from an older version, or older than 12 months counts as "never asked". */
  function readConsent() {
    try {
      var raw = storageRead();
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.v !== 1 || typeof parsed.analytics !== 'boolean') return null;
      var ts = Date.parse(parsed.ts);
      var maxAge = parsed.analytics ? CONSENT_MAX_AGE : DECLINE_MAX_AGE;
      if (!isFinite(ts) || (Date.now() - ts) > maxAge) return null;
      return parsed;
    } catch (e) {
      return null;   // private mode / storage disabled: behave as if nothing was stored
    }
  }

  function writeConsent(analytics) {
    storageWrite(JSON.stringify({
      v: 1, analytics: analytics, ts: new Date().toISOString()
    }));
  }

  /* ---------- Google Analytics 4 ------------------------------------------ */
  function loadAnalytics() {
    if (window.__aobGaLoaded) return;
    window.__aobGaLoaded = true;

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;

    // Consent Mode v2: analytics is the only thing this site ever uses.
    // The ad_* signals stay denied forever, there is no advertising here.
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'granted'
    });

    gtag('js', new Date());
    gtag('config', MEASUREMENT_ID);

    if (MEASUREMENT_ID === 'G-XXXXXXXXXX') {
      // Guard: firing a request with the placeholder ID would hit Google for nothing.
      console.warn('[aob-consent] GA4 measurement ID is still the placeholder, gtag.js not loaded.');
      return;
    }

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
    document.head.appendChild(s);
  }

  /* Withdrawing consent: drop Google's cookies. GA sets them on the registrable
     domain, so clear the host and every parent variant, not just the exact host. */
  function clearGoogleCookies() {
    var names = document.cookie.split(';')
      .map(function (c) { return c.split('=')[0].trim(); })
      .filter(function (n) { return n === '_ga' || n.indexOf('_ga_') === 0; });
    if (!names.length) return;

    var host = location.hostname;
    var domains = ['', host, '.' + host];
    var parts = host.split('.');
    for (var i = 1; i < parts.length - 1; i++) domains.push('.' + parts.slice(i).join('.'));

    names.forEach(function (name) {
      domains.forEach(function (d) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' +
                          (d ? '; domain=' + d : '');
      });
    });
  }

  /* ---------- banner ------------------------------------------------------ */
  /* Design derives from each page's :root tokens (fallbacks included in case a page is
     ever served without them). A centred dialog over a dimmed page, which makes it the
     sibling of the trainer card on ausbilder.html: the scrim colour, the blur, the
     centring and the settle-into-place entrance are that component's values, reused
     rather than reinvented so the site has one way of asking for attention. */
  var STYLES = [
    '.aob-cc-scrim {',
    '  position: fixed; inset: 0; z-index: 998;',
    '  background: rgba(40,37,33,.34);',
    '  opacity: 0; pointer-events: none; transition: opacity .22s ease;',
    '}',
    '@supports (backdrop-filter: blur(2px)) {',
    '  .aob-cc-scrim { backdrop-filter: blur(3px); }',
    '}',
    '.aob-cc-scrim.is-open { opacity: 1; pointer-events: auto; }',
    '.aob-cc {',
    '  position: fixed; left: 50%; top: 50%; z-index: 999;',
    '  width: min(420px, calc(100vw - 40px));',
    '  background: var(--card, #FBFAF7); color: var(--ink, #383530);',
    '  border: 1px solid var(--line, #E1DBD1); border-radius: var(--r-card, 18px);',
    '  box-shadow: var(--shadow-h, 0 2px 4px rgba(56,53,48,.05), 0 22px 44px -22px rgba(56,53,48,.34));',
    '  padding: 26px 26px 24px;',
    '  font-family: var(--sans, "Raleway", ui-sans-serif, system-ui, sans-serif);',
    '  opacity: 0; pointer-events: none;',
    '  transform: translate(-50%, -48%) scale(.98);',
    '  transition: opacity .22s ease, transform .22s ease;',
    '}',
    '.aob-cc.is-open { opacity: 1; pointer-events: auto; transform: translate(-50%, -50%) scale(1); }',
    '.aob-cc-title {',
    '  font-family: var(--serif, "Playfair Display", Georgia, serif); font-weight: 500;',
    '  font-size: 18px; line-height: 1.25; color: var(--ink, #383530); margin: 0 0 9px;',
    '}',
    '.aob-cc-text {',
    '  font-size: 13.5px; line-height: 1.6; color: var(--muted, #7C705C); margin: 0 0 18px;',
    '}',
    '.aob-cc-text a { color: var(--muted, #7C705C); text-underline-offset: 3px; }',
    '.aob-cc-text a:hover { color: var(--ink, #383530); }',
    '.aob-cc-actions { display: flex; gap: 10px; }',
    /* Equal weight: same box, same row, both visible. Only the fill differs. */
    '.aob-cc-btn {',
    '  flex: 1 1 0; min-width: 0; cursor: pointer;',
    '  font-family: inherit; font-size: 13.5px; font-weight: 600; letter-spacing: .02em;',
    '  padding: 12px 14px; border-radius: var(--r-btn, 18px); border: 1px solid transparent;',
    '  transition: background .2s ease, border-color .2s ease, color .2s ease;',
    '}',
    '.aob-cc-btn-quiet {',
    '  background: transparent; color: var(--ink, #383530); border-color: var(--line, #E1DBD1);',
    '}',
    '.aob-cc-btn-quiet:hover { border-color: var(--muted, #7C705C); }',
    '.aob-cc-btn-solid { background: var(--btn, #6B6150); color: var(--inverse, #F2EEE9); }',
    '.aob-cc-btn-solid:hover { background: var(--btn-hover, #5B5244); }',
    '.aob-cc-btn:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(124,112,92,.4); }',
    '.aob-cc:focus { outline: none; }',
    '.aob-cc-opts { display: none; margin: 0 0 18px; }',
    '.aob-cc.is-details .aob-cc-opts { display: block; }',
    '.aob-cc-opt {',
    '  display: flex; gap: 12px; align-items: flex-start; cursor: pointer;',
    '  border: 1px solid var(--line, #E1DBD1); border-radius: 14px; padding: 12px 14px;',
    '  font-size: 13.5px; line-height: 1.45; color: var(--ink, #383530);',
    '}',
    '.aob-cc-opt input { margin: 3px 0 0; width: 16px; height: 16px; flex: none; accent-color: var(--btn, #6B6150); }',
    '.aob-cc-opt small { display: block; font-size: 13px; color: var(--muted, #7C705C); }',
    '.aob-cc.is-details .aob-cc-actions { flex-direction: column; }',
    '@media (max-width: 560px) {',
    '  .aob-cc { width: calc(100vw - 28px); padding: 22px 20px 20px; }',
    '}',
    /* Reduced motion: appear in place, no travel and no scaling. The centring transform
       has to survive, so it is restated rather than dropped. */
    '@media (prefers-reduced-motion: reduce) {',
    '  .aob-cc, .aob-cc-scrim { transition: none; }',
    '  .aob-cc { transform: translate(-50%, -50%) scale(1); }',
    '}'
  ].join('\n');

  var banner = null;
  var scrim = null;
  var lastFocus = null;

  function buildBanner() {
    if (banner) return banner;

    var style = document.createElement('style');
    style.textContent = STYLES;
    document.head.appendChild(style);

    scrim = document.createElement('div');
    scrim.className = 'aob-cc-scrim';
    document.body.appendChild(scrim);

    banner = document.createElement('div');
    banner.className = 'aob-cc';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'true');
    banner.setAttribute('aria-labelledby', 'aob-cc-title');
    banner.innerHTML =
      '<h2 class="aob-cc-title" id="aob-cc-title">Kurz gefragt: Dürfen wir messen, was ankommt?</h2>' +
      '<p class="aob-cc-text">Mit deinem Okay sehen wir, welche Inhalte Menschen zu einem Ausbilder ' +
        'in ihrer Nähe führen (Google Analytics). Dafür setzt der Dienst Cookies, nur mit deiner ' +
        'Zustimmung. Ändern kannst du das jederzeit unter „Cookie-Einstellungen“ im Fußbereich. ' +
        'Mehr dazu in der <a href="' + PRIVACY_URL + '">Datenschutzerklärung</a>.</p>' +
      '<div class="aob-cc-opts">' +
        '<label class="aob-cc-opt"><input type="checkbox" data-aob-cc="analytics" />' +
          '<span><strong>Statistik</strong><small>Google Analytics: welche Seiten wie genutzt werden.</small></span></label>' +
      '</div>' +
      '<div class="aob-cc-actions">' +
        '<button type="button" class="aob-cc-btn aob-cc-btn-quiet" data-aob-cc="settings">Einstellungen</button>' +
        '<button type="button" class="aob-cc-btn aob-cc-btn-solid" data-aob-cc="accept">Akzeptieren</button>' +
      '</div>';
    banner.tabIndex = -1;

    /* One quiet button, two jobs: on the first layer it opens the categories, on the
       second it saves what is ticked. */
    banner.querySelector('[data-aob-cc="settings"]').addEventListener('click', function () {
      if (banner.classList.contains('is-details')) {
        decide(banner.querySelector('[data-aob-cc="analytics"]').checked);
      } else {
        showDetails(true);
        count('einstellungen');
      }
    });
    banner.querySelector('[data-aob-cc="accept"]').addEventListener('click', function () { decide(true); });

    document.body.appendChild(banner);
    return banner;
  }

  function showDetails(on) {
    banner.classList.toggle('is-details', on);
    banner.querySelector('[data-aob-cc="settings"]').textContent = on ? 'Auswahl speichern' : 'Einstellungen';
  }

  /* The dialog covers the page, so keyboard focus has to stay inside it and the page
     behind must not scroll away underneath. Locking the scrollbar away would shift the
     layout, so its width is added back as padding. */
  function focusables() {
    return banner ? [].slice.call(banner.querySelectorAll('a[href], button, input')).filter(function (n) { return n.offsetParent !== null; }) : [];
  }

  function lockScroll(on) {
    var doc = document.documentElement;
    if (on) {
      var gap = window.innerWidth - doc.clientWidth;
      doc.style.overflow = 'hidden';
      if (gap > 0) doc.style.paddingRight = gap + 'px';
    } else {
      doc.style.overflow = '';
      doc.style.paddingRight = '';
    }
  }

  /* `trigger` is passed explicitly rather than read from document.activeElement: Safari on
     macOS does not focus a <button> when it is clicked, so the footer link would not be
     found there and focus would have nowhere to return to. */
  function openBanner(trigger) {
    var el = buildBanner();
    lastFocus = trigger || document.activeElement;
    // Someone who already chose and comes back through the footer wants the categories.
    var stored = readConsent();
    showDetails(!!stored);
    el.querySelector('[data-aob-cc="analytics"]').checked = !!(stored && stored.analytics);
    if (!stored) count('gezeigt');
    lockScroll(true);
    // Next frame, so the opening transition actually runs from the closed state.
    requestAnimationFrame(function () {
      scrim.classList.add('is-open');
      el.classList.add('is-open');
    });
    el.focus();
  }

  function closeBanner() {
    if (!banner) return;
    banner.classList.remove('is-open');
    scrim.classList.remove('is-open');
    lockScroll(false);
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
    lastFocus = null;
  }

  function isOpen() {
    return !!(banner && banner.classList.contains('is-open'));
  }

  function decide(analytics) {
    var previous = readConsent();
    var wasGranted = !!(previous && previous.analytics);

    writeConsent(analytics);
    count(previous ? 'geaendert' : analytics ? 'akzeptiert' : 'abgelehnt', analytics);
    closeBanner();

    if (analytics) {
      loadAnalytics();
    } else if (wasGranted) {
      // Consent withdrawn: drop Google's cookies and reload, so an already-loaded
      // gtag.js cannot keep measuring in this tab.
      clearGoogleCookies();
      location.reload();
    }
  }

  /* ---------- wiring ------------------------------------------------------ */
  function init() {
    // No real GA4 ID yet means no tracking, so there is nothing to consent to: no banner,
    // no footer link, nothing stored. Setting MEASUREMENT_ID switches all of it back on.
    if (MEASUREMENT_ID === 'G-XXXXXXXXXX') {
      document.querySelectorAll('[data-consent-open]').forEach(function (el) {
        el.style.display = 'none';
      });
      return;
    }

    var stored = readConsent();

    if (!stored) {
      openBanner();               // never asked, or the answer expired
    } else if (stored.analytics) {
      loadAnalytics();            // already agreed, no banner
    }                             // declined: nothing to do, nothing to load

    // "Cookie-Einstellungen" in the footer of every page.
    document.querySelectorAll('[data-consent-open]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        openBanner(el);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;

      // Escape closes only when a choice already exists, so dismissing the dialog can
      // never be mistaken for answering it.
      if (e.key === 'Escape') {
        if (readConsent()) closeBanner();
        return;
      }

      // Keep Tab inside the dialog while it covers the page.
      if (e.key === 'Tab') {
        var items = focusables();
        if (!items.length) return;
        var first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        } else if (items.indexOf(document.activeElement) === -1) {
          e.preventDefault(); first.focus();
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
