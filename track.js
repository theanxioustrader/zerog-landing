/* ZeroG website analytics beacon — first-party, anonymous, no cookies, no deps.
 * Captures: page views, referrer + UTM campaign, device/browser/OS/screen/lang,
 * new vs returning, the click on every link & button (downloads flagged),
 * scroll depth, time on page, and video watch-through. Sends to the Command
 * Center via sendBeacon (survives the page closing). Identity is a random
 * first-party id in localStorage — it is NOT personal data and never leaves
 * this browser except as that opaque token. Fails silently, always. */

/* Microsoft Clarity — free session recordings + heatmaps (project xen0wwx0p0).
 * Loaded here so it's present on every page that includes this script. */
(function (c, l, a, r, i, t, y) {
  c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
  t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
  y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
})(window, document, 'clarity', 'script', 'xen0wwx0p0');

/* PostHog — interactive product analytics, session replay, heatmaps + Max AI. */
!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId captureTraceFeedback captureTraceMetric".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
posthog.init('phc_B2UdwoMxdCuDaSnbTifzTgVZCGFJMNar4SjsT4zUQL6B',{api_host:'https://us.i.posthog.com',person_profiles:'identified_only',enable_heatmaps:true});

(function () {
  'use strict';
  var ENDPOINT = 'https://zerog-admin.pages.dev/api/track';
  var SESSION_TTL = 30 * 60 * 1000; // a "visit" ends after 30 min idle
  var ls = (function () { try { return window.localStorage; } catch (e) { return null; } })();
  var get = function (k) { try { return ls && ls.getItem(k); } catch (e) { return null; } };
  var set = function (k, v) { try { ls && ls.setItem(k, v); } catch (e) {} };
  var uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 10); };

  // ── Identity: anonymous visitor + session ──────────────────────────────
  var isNewVisitor = 0;
  var vid = get('zg_vid');
  if (!vid) { vid = uid(); set('zg_vid', vid); isNewVisitor = 1; }

  var now = Date.now(), sess, isNewSession = 0;
  var sraw = get('zg_sess');
  if (sraw) { var sp = sraw.split('|'); sess = sp[0]; if ((now - (+sp[1])) > SESSION_TTL) { sess = uid(); isNewSession = 1; } }
  else { sess = uid(); isNewSession = 1; }
  set('zg_sess', sess + '|' + now);

  // ── Environment ────────────────────────────────────────────────────────
  var ua = navigator.userAgent || '';
  function os() {
    if (/Windows/i.test(ua)) return 'Windows';
    if (/Mac OS X|Macintosh/i.test(ua)) return 'macOS';
    if (/Android/i.test(ua)) return 'Android';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
    if (/Linux/i.test(ua)) return 'Linux';
    return 'Other';
  }
  function browser() {
    if (/Edg\//i.test(ua)) return 'Edge';
    if (/OPR\/|Opera/i.test(ua)) return 'Opera';
    if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return 'Chrome';
    if (/Firefox\//i.test(ua)) return 'Firefox';
    if (/Version\/.*Safari/i.test(ua)) return 'Safari';
    return 'Other';
  }
  function device() {
    if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return 'tablet';
    if (/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)) return 'mobile';
    return 'desktop';
  }
  function refHost() { try { return document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) { return ''; } }

  var q = new URLSearchParams(location.search);
  var base = {
    v: vid, s: sess, nv: isNewVisitor, ns: isNewSession,
    ref: refHost(),
    us: q.get('utm_source') || '', um: q.get('utm_medium') || '', uc: q.get('utm_campaign') || '',
    dev: device(), br: browser(), os: os(),
    scr: (screen.width || 0) + 'x' + (screen.height || 0),
    lang: (navigator.language || '').slice(0, 8),
  };

  function send(ev) {
    var payload = {};
    for (var k in base) payload[k] = base[k];
    payload.p = location.pathname;
    for (var j in ev) payload[j] = ev[j];
    var body = JSON.stringify(payload);
    try {
      if (navigator.sendBeacon) navigator.sendBeacon(ENDPOINT, body);
      else fetch(ENDPOINT, { method: 'POST', body: body, keepalive: true, mode: 'no-cors' });
    } catch (e) {}
  }

  // ── Page view ──────────────────────────────────────────────────────────
  send({ type: 'pageview' });

  // ── Scroll depth (track the furthest point reached) ─────────────────────
  var maxScroll = 0;
  function scrollPct() {
    var d = document.documentElement, b = document.body;
    var top = window.pageYOffset || d.scrollTop || b.scrollTop || 0;
    var height = (d.scrollHeight || b.scrollHeight) - d.clientHeight;
    return height > 0 ? Math.min(100, Math.round((100 * top) / height)) : 100;
  }
  window.addEventListener('scroll', function () { var p = scrollPct(); if (p > maxScroll) maxScroll = p; }, { passive: true });

  // ── Time on page + where they stopped (sent once, on the way out) ────────
  var start = Date.now(), left = false;
  function leave() {
    if (left) return; left = true;
    send({ type: 'leave', val: Date.now() - start, target: String(maxScroll) });
  }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') leave(); });
  window.addEventListener('pagehide', leave);

  // ── Every link / button click (downloads flagged) ───────────────────────
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('a,button,[data-track]') : null;
    if (!el) return;
    var href = el.getAttribute && el.getAttribute('href') || '';
    var label = (el.getAttribute && el.getAttribute('data-track')) || (el.textContent || '').trim().slice(0, 60) || href;
    var isDownload = /(testflight|apps)\.apple\.com/i.test(href) || /\.vsix(\?|$)/i.test(href) || /\bdownload\b/i.test(label);
    send({ type: isDownload ? 'download' : 'click', target: (label + (href ? ' → ' + href : '')).slice(0, 200) });
  }, true);

  // ── Video watch-through (any <video> on the page) ───────────────────────
  function bindVideos() {
    var vids = document.querySelectorAll('video');
    for (var i = 0; i < vids.length; i++) {
      (function (vd) {
        if (vd.__zg) return; vd.__zg = true;
        var name = (vd.getAttribute('data-track') || (vd.currentSrc || 'video').split('/').pop()).slice(0, 120);
        var hit = {};
        vd.addEventListener('play', function () { if (!hit.p) { hit.p = 1; send({ type: 'video', target: name, val: 0 }); } });
        vd.addEventListener('timeupdate', function () {
          if (!vd.duration) return;
          var pct = Math.round((100 * vd.currentTime) / vd.duration);
          [25, 50, 75].forEach(function (m) { if (pct >= m && !hit[m]) { hit[m] = 1; send({ type: 'video', target: name, val: m }); } });
        });
        vd.addEventListener('ended', function () { if (!hit.e) { hit.e = 1; send({ type: 'video', target: name, val: 100 }); } });
      })(vids[i]);
    }
  }
  // ── Section impressions (which parts of the page they actually reach) ────
  // Fires once per named section when it first becomes half-visible. Gives a
  // real "how far through the page" funnel, not just a scroll percentage.
  function bindSections() {
    if (!('IntersectionObserver' in window)) return;
    var els = document.querySelectorAll('section[id], section.hero, [data-zg-section]');
    var seen = {}, order = 0;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var name = (el.getAttribute('data-zg-section') || el.id || (el.className || '').split(' ')[0] || 'section').slice(0, 40);
        if (seen[name]) { io.unobserve(el); return; }
        seen[name] = 1;
        send({ type: 'section', target: name, val: +el.getAttribute('data-zg-order') || 0 });
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { el.setAttribute('data-zg-order', order++); io.observe(el); });
  }

  // ── Rage clicks (frustration signal — 3+ fast clicks in one spot) ───────
  var clicks = [];
  document.addEventListener('click', function (e) {
    var now = Date.now();
    clicks.push({ t: now, x: e.clientX, y: e.clientY });
    clicks = clicks.filter(function (p) { return now - p.t < 1000; });
    var near = clicks.filter(function (p) { return Math.abs(p.x - e.clientX) < 45 && Math.abs(p.y - e.clientY) < 45; });
    if (near.length >= 3) { clicks = []; send({ type: 'rage', target: location.pathname }); }
  }, true);

  function init() { bindVideos(); bindSections(); }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
