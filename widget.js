/*!
 * Fasqoo Speed Test Widget v1.0.0
 * https://fasqoo.com/widget
 *
 * ── Auto-Einbindung ──
 *   <div id="fasqoo-widget"></div>
 *   <script src="https://lite.fasqoo.com/widget.js"
 *           data-target="fasqoo-widget"
 *           data-width="320"
 *           data-theme="auto"
 *           data-accent="#ef4444"
 *           data-autostart="true"></script>
 *
 * ── Programmatisch ──
 *   <script src="https://lite.fasqoo.com/widget.js"></script>
 *   <div id="fasqoo-widget"></div>
 *   <script>
 *     FasqooWidget.init({
 *       target: '#fasqoo-widget',
 *       width: 320,          // number or '100%'
 *       height: 'auto',      // number or 'auto'
 *       theme: 'auto',       // 'auto' | 'light' | 'dark'
 *       accent: '#ef4444',
 *       autostart: true,
 *       showBranding: true,
 *       onComplete: r => console.log(r)
 *     });
 *   </script>
 */
(function () {
  'use strict';

  var VERSION = '1.0.0';
  var SPEED_HOST = 'https://speed.cloudflare.com';

  var DEFAULTS = {
    target: null,
    width: 320,
    height: 'auto',
    theme: 'auto',
    accent: '#ef4444',
    autostart: true,
    showBranding: true,
    onStart: null,
    onProgress: null,
    onComplete: null,
    onError: null
  };

  /* ───────────── Styles (injected into shadow root) ───────────── */
  function buildStyles(accent, theme) {
    var dark = theme === 'dark';
    var light = theme === 'light';
    var bg = dark ? '#0f1117' : light ? '#ffffff' : 'color-mix(in srgb, Canvas 94%, CanvasText 6%)';
    var panel = dark ? 'rgba(255,255,255,.04)' : light ? 'rgba(15,23,42,.035)' : 'color-mix(in srgb, Canvas 96%, CanvasText 4%)';
    var text = dark ? '#f1f5f9' : light ? '#0f172a' : 'CanvasText';
    var muted = dark ? '#94a3b8' : light ? '#64748b' : 'color-mix(in srgb, CanvasText 55%, transparent)';
    var border = dark ? 'rgba(255,255,255,.09)' : light ? 'rgba(15,23,42,.08)' : 'color-mix(in srgb, CanvasText 12%, transparent)';

    return `
      :host{display:inline-block;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;line-height:1.4;-webkit-font-smoothing:antialiased}
      *{box-sizing:border-box}
      .fq-wrap{
        width:100%;height:100%;
        padding:18px 18px 14px;
        border:1px solid ${border};
        border-radius:20px;
        background:${bg};
        color:${text};
        box-shadow:0 10px 30px rgba(0,0,0,${dark?'.28':'.06'});
        display:flex;flex-direction:column;gap:14px;
      }
      .fq-head{display:flex;align-items:center;gap:8px}
      .fq-logo{
        width:22px;height:22px;border-radius:7px;
        background:linear-gradient(135deg,${accent},${accent}cc);
        color:#fff;display:grid;place-items:center;
        font-weight:800;font-size:12px;flex-shrink:0;
      }
      .fq-title{font-size:12px;font-weight:700;letter-spacing:-.2px}
      .fq-live{
        margin-left:auto;font-size:9px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;
        color:${muted};display:flex;align-items:center;gap:5px;
      }
      .fq-dot{width:6px;height:6px;border-radius:50%;background:#22c55e}
      .fq-dot.idle{background:${muted};opacity:.5}
      .fq-dot.run{background:#22c55e;animation:fqPulse 1.2s ease-in-out infinite}
      @keyframes fqPulse{0%,100%{opacity:1}50%{opacity:.35}}
      .fq-arc-wrap{position:relative;width:100%;display:flex;justify-content:center}
      .fq-arc{width:100%;max-width:210px;aspect-ratio:1;display:block}
      .fq-arc .bg{fill:none;stroke:${panel};stroke-width:9;stroke-linecap:round}
      .fq-arc .track{fill:none;stroke:${border};stroke-width:9;stroke-linecap:round;opacity:.6}
      .fq-arc .prog{fill:none;stroke:url(#fqGrad);stroke-width:9;stroke-linecap:round;transition:stroke-dasharray .35s cubic-bezier(.4,0,.2,1)}
      .fq-center{
        position:absolute;inset:0;display:grid;place-content:center;text-align:center;
        pointer-events:none;padding-bottom:6px;
      }
      .fq-num{font-size:clamp(30px,10vw,46px);font-weight:800;letter-spacing:-2px;line-height:1;font-variant-numeric:tabular-nums}
      .fq-unit{margin-top:3px;font-size:10px;font-weight:800;color:${accent};letter-spacing:2px}
      .fq-cap{margin-top:4px;font-size:9px;font-weight:700;color:${muted};letter-spacing:1px;text-transform:uppercase}
      .fq-grid{
        display:grid;grid-template-columns:1fr 1fr;gap:7px;
      }
      .fq-card{
        padding:10px 11px;border:1px solid ${border};border-radius:12px;
        background:${panel};
      }
      .fq-card-l{font-size:9px;font-weight:800;color:${muted};letter-spacing:.8px;text-transform:uppercase}
      .fq-card-v{margin-top:4px;font-size:14px;font-weight:800;font-variant-numeric:tabular-nums}
      .fq-card-v span{font-size:9px;color:${muted};font-weight:600;margin-left:2px}
      .fq-btn{
        width:100%;padding:11px 14px;border:0;border-radius:11px;
        background:${text};color:${bg};
        font-weight:800;font-size:11px;letter-spacing:1px;text-transform:uppercase;
        cursor:pointer;transition:transform .12s,opacity .12s;
      }
      .fq-btn:hover{transform:translateY(-1px)}
      .fq-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
      .fq-btn.primary{background:${accent};color:#fff}
      .fq-foot{
        text-align:center;font-size:9px;color:${muted};letter-spacing:.4px;
        padding-top:4px;border-top:1px solid ${border};
      }
      .fq-foot a{color:${muted};text-decoration:none}
      .fq-foot a:hover{color:${accent}}
      .fq-err{font-size:10px;color:${muted};text-align:center;padding:6px 0}
    `;
  }

  /* ───────────── Template ───────────── */
  function buildTemplate(accent) {
    return `
      <div class="fq-wrap">
        <div class="fq-head">
          <div class="fq-logo">F</div>
          <div class="fq-title">Fasqoo Speed Test</div>
          <div class="fq-live"><span class="fq-dot idle" data-role="dot"></span><span data-role="state">Ready</span></div>
        </div>

        <div class="fq-arc-wrap">
          <svg class="fq-arc" viewBox="0 0 120 120" aria-hidden="true">
            <defs>
              <linearGradient id="fqGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="${accent}"/>
                <stop offset="100%" stop-color="${accent}aa"/>
              </linearGradient>
            </defs>
            <circle class="bg"   cx="60" cy="60" r="50"/>
            <circle class="track" cx="60" cy="60" r="50"
                    transform="rotate(135 60 60)"
                    stroke-dasharray="235.62 1000"/>
            <circle class="prog"  cx="60" cy="60" r="50"
                    transform="rotate(135 60 60)"
                    stroke-dasharray="0 1000"/>
          </svg>
          <div class="fq-center">
            <div class="fq-num" data-role="num">0</div>
            <div class="fq-unit">Mbps</div>
            <div class="fq-cap" data-role="cap">Ready to test</div>
          </div>
        </div>

        <div class="fq-grid">
          <div class="fq-card">
            <div class="fq-card-l">Ping</div>
            <div class="fq-card-v" data-role="ping">—<span>ms</span></div>
          </div>
          <div class="fq-card">
            <div class="fq-card-l">Jitter</div>
            <div class="fq-card-v" data-role="jitter">—<span>ms</span></div>
          </div>
          <div class="fq-card">
            <div class="fq-card-l">Download</div>
            <div class="fq-card-v" data-role="down">—<span>Mbps</span></div>
          </div>
          <div class="fq-card">
            <div class="fq-card-l">Upload</div>
            <div class="fq-card-v" data-role="up">—<span>Mbps</span></div>
          </div>
        </div>

        <button class="fq-btn primary" type="button" data-role="btn">Start Test</button>

        <div class="fq-foot" data-role="foot">
          Powered by <a href="https://fasqoo.com" target="_blank" rel="noopener">Fasqoo</a>
        </div>
      </div>
    `;
  }

  /* ───────────── Helpers ───────────── */
  function fmt(mbps) {
    if (!isFinite(mbps)) return '0.0';
    if (mbps < 100) return mbps.toFixed(1);
    return Math.round(mbps).toString();
  }
  function median(a) {
    var v = a.filter(Number.isFinite).slice().sort(function (x, y) { return x - y; });
    if (!v.length) return NaN;
    var m = Math.floor(v.length / 2);
    return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
  }
  function rand32() {
    if (self.crypto && crypto.randomUUID) return crypto.randomUUID();
    return Math.random().toString(36).slice(2);
  }
  function makeBody(size) {
    var b = new Uint8Array(size);
    var c = 65536;
    for (var o = 0; o < size; o += c) {
      if (self.crypto && crypto.getRandomValues) {
        crypto.getRandomValues(b.subarray(o, Math.min(o + c, size)));
      } else {
        for (var i = o; i < Math.min(o + c, size); i++) b[i] = (Math.random() * 256) | 0;
      }
    }
    return b;
  }
  // Map 0..1000 Mbps logarithmically onto 0..235.62 (270° arc)
  function arcLen(mbps) {
    if (!isFinite(mbps) || mbps <= 0) return 0;
    var r = Math.min(1, Math.log10(1 + mbps) / Math.log10(1001));
    return (r * 235.62).toFixed(2);
  }

  /* ───────────── Speed test (compact) ───────────── */
  async function measurePing() {
    var samples = [];
    for (var i = 0; i < 6; i++) {
      try {
        var url = SPEED_HOST + '/__down?bytes=0&r=' + rand32();
        var t0 = performance.now();
        var res = await fetch(url, { cache: 'no-store', credentials: 'omit' });
        await res.arrayBuffer();
        var ms = performance.now() - t0;
        if (res.ok && ms > 0 && ms < 5000) samples.push(ms);
        if (i < 5) await new Promise(function (r) { setTimeout(r, 40); });
      } catch (e) { /* skip */ }
    }
    samples = samples.slice(1); // drop first (DNS/TCP/TLS)
    if (samples.length < 3) throw new Error('Ping measurement failed');
    var ping = median(samples);
    var sum = 0;
    for (var j = 1; j < samples.length; j++) sum += Math.abs(samples[j] - samples[j - 1]);
    var jitter = samples.length > 1 ? sum / (samples.length - 1) : 0;
    return { ping: ping, jitter: jitter };
  }

  async function measureDown(onRate, signal) {
    var MIN_S = 3;
    var MAX_S = 5;
    var WARM = 0.6;
    var MAX_STREAMS = 6;
    var started = performance.now();
    var totalBytes = 0, warm = null, stopped = false;
    var streams = 3;
    var done = false;

    function rate(now) {
      if (!warm) return NaN;
      var dt = (now - warm.time) / 1000;
      if (dt < 0.5) return NaN;
      return ((totalBytes - warm.bytes) * 8) / dt / 1e6;
    }

    async function worker(idx) {
      while (!stopped) {
        try {
          var r = await fetch(
            SPEED_HOST + '/__down?bytes=' + (4 * 1024 * 1024) + '&s=' + idx + '&r=' + rand32(),
            { cache: 'no-store', credentials: 'omit', signal: signal }
          );
          if (!r.ok || !r.body) return;
          var reader = r.body.getReader();
          while (true) {
            var p = await reader.read();
            if (p.done) break;
            totalBytes += p.value.byteLength;
          }
        } catch (e) { return; }
      }
    }

    var workers = [];
    for (var i = 0; i < streams; i++) workers.push(worker(i));

    var ticker = setInterval(function () {
      var now = performance.now();
      var el = (now - started) / 1000;
      if (!warm && el >= WARM) warm = { bytes: totalBytes, time: now };
      var r = rate(now);
      if (isFinite(r) && r > 0) onRate(r);
      if (el > MIN_S && streams < MAX_STREAMS) {
        streams = MAX_STREAMS;
        for (var k = 3; k < MAX_STREAMS; k++) workers.push(worker(k));
      }
      if (!done && el >= MAX_S) {
        done = true; stopped = true;
        try { signal.abort(); } catch (e) {}
      }
    }, 120);

    await new Promise(function (resolve) {
      var check = function () {
        if (stopped) resolve();
        else setTimeout(check, 40);
      };
      check();
    });
    clearInterval(ticker);
    await Promise.allSettled(workers);

    if (!warm) warm = { bytes: 0, time: started };
    var bytes = totalBytes - warm.bytes;
    var secs = (performance.now() - warm.time) / 1000;
    if (bytes <= 0 || secs <= 0) throw new Error('No download data');
    return (bytes * 8) / secs / 1e6;
  }

  async function measureUp(onRate) {
    var MIN_S = 3;
    var MAX_S = 5;
    var WARM = 0.6;
    var UP = 2 * 1024 * 1024;
    var body = makeBody(UP);
    var started = performance.now();
    var totalBytes = 0, warm = null, stopped = false;
    var active = new Set();
    var streams = 3;

    function rate(now) {
      if (!warm) return NaN;
      var dt = (now - warm.time) / 1000;
      if (dt < 0.5) return NaN;
      return ((totalBytes - warm.bytes) * 8) / dt / 1e6;
    }

    function send(idx) {
      return new Promise(function (resolve) {
        var xhr = new XMLHttpRequest();
        var last = 0;
        active.add(xhr);
        xhr.open('POST', SPEED_HOST + '/__up?bytes=' + UP + '&s=' + idx + '&r=' + rand32());
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');
        xhr.upload.onprogress = function (e) {
          if (e.lengthComputable) {
            var d = e.loaded - last;
            if (d > 0) { totalBytes += d; last = e.loaded; }
          }
        };
        xhr.onload = function () {
          if (last < body.byteLength) { totalBytes += body.byteLength - last; }
          active.delete(xhr);
          resolve();
        };
        xhr.onerror = function () { active.delete(xhr); resolve(); };
        xhr.onabort = function () { active.delete(xhr); resolve(); };
        xhr.send(body);
      });
    }

    async function worker(idx) {
      var i = 0;
      while (!stopped) await send(idx + '-' + (i++));
    }

    var workers = [];
    for (var i = 0; i < streams; i++) workers.push(worker(i));

    var ticker = setInterval(function () {
      var now = performance.now();
      var el = (now - started) / 1000;
      if (!warm && el >= WARM) warm = { bytes: totalBytes, time: now };
      var r = rate(now);
      if (isFinite(r) && r > 0) onRate(r);
      if (el > MIN_S && streams < 6) {
        streams = 6;
        for (var k = 3; k < 6; k++) workers.push(worker(k));
      }
      if (!stopped && el >= MAX_S) {
        stopped = true;
        active.forEach(function (x) { try { x.abort(); } catch (e) {} });
      }
    }, 120);

    await new Promise(function (resolve) {
      var check = function () {
        if (stopped) resolve();
        else setTimeout(check, 40);
      };
      check();
    });
    clearInterval(ticker);
    await Promise.allSettled(workers);

    if (!warm) warm = { bytes: 0, time: started };
    var bytes = totalBytes - warm.bytes;
    var secs = (performance.now() - warm.time) / 1000;
    if (bytes <= 0 || secs <= 0) throw new Error('No upload data');
    return (bytes * 8) / secs / 1e6;
  }

  /* ───────────── Widget factory ───────────── */
  function createWidget(host, options) {
    host.innerHTML = '';

    var shadow = host.attachShadow({ mode: 'open' });
    var styleEl = document.createElement('style');
    styleEl.textContent = buildStyles(options.accent, options.theme);
    shadow.appendChild(styleEl);

    var container = document.createElement('div');
    container.style.width = (typeof options.width === 'number') ? options.width + 'px' : options.width;
    container.style.height = (typeof options.height === 'number') ? options.height + 'px' : options.height;
    container.innerHTML = buildTemplate(options.accent);
    shadow.appendChild(container);

    var q = function (role) { return shadow.querySelector('[data-role="' + role + '"]'); };
    var elNum = q('num'), elCap = q('cap'), elPing = q('ping'),
        elJitter = q('jitter'), elDown = q('down'), elUp = q('up'),
        elBtn = q('btn'), elState = q('state'), elDot = q('dot'),
        elFoot = q('foot');
    var elProg = shadow.querySelector('.prog');

    if (!options.showBranding && elFoot) elFoot.remove();

    var busy = false;

    function setArc(mbps) {
      if (elProg) elProg.setAttribute('stroke-dasharray', arcLen(mbps) + ' 1000');
    }
    function setState(text, mode) {
      if (elState) elState.textContent = text;
      if (elDot) {
        elDot.className = 'fq-dot ' + (mode || 'idle');
      }
    }
    function reset() {
      elNum.textContent = '0';
      elCap.textContent = 'Ready to test';
      elPing.innerHTML = '—<span>ms</span>';
      elJitter.innerHTML = '—<span>ms</span>';
      elDown.innerHTML = '—<span>Mbps</span>';
      elUp.innerHTML = '—<span>Mbps</span>';
      setArc(0);
    }

    async function start() {
      if (busy) return;
      busy = true;
      elBtn.disabled = true;
      elBtn.textContent = 'Testing…';
      reset();
      setState('Running', 'run');
      if (typeof options.onStart === 'function') options.onStart();

      var controller = new AbortController();

      try {
        // 1) Ping + jitter
        elCap.textContent = 'Measuring ping…';
        var lat = await measurePing();
        elPing.innerHTML = (lat.ping < 10 ? lat.ping.toFixed(1) : lat.ping.toFixed(0)) + '<span>ms</span>';
        elJitter.innerHTML = lat.jitter.toFixed(1) + '<span>ms</span>';

        // 2) Download
        elCap.textContent = 'Measuring download…';
        setState('Download', 'run');
        var downBuf = [];
        var downFinal = await measureDown(function (r) {
          if (typeof options.onProgress === 'function') options.onProgress({ phase: 'download', mbps: r });
          downBuf.push(r);
          if (downBuf.length > 6) downBuf.shift();
          var d = median(downBuf);
          if (isFinite(d) && d > 0) {
            elNum.textContent = fmt(d);
            setArc(d);
          }
        }, controller.signal);
        elDown.innerHTML = fmt(downFinal) + '<span>Mbps</span>';

        // 3) Upload
        elCap.textContent = 'Measuring upload…';
        setState('Upload', 'run');
        var upBuf = [];
        var upFinal = await measureUp(function (r) {
          if (typeof options.onProgress === 'function') options.onProgress({ phase: 'upload', mbps: r });
          upBuf.push(r);
          if (upBuf.length > 6) upBuf.shift();
          var u = median(upBuf);
          if (isFinite(u) && u > 0) {
            elNum.textContent = fmt(u);
            setArc(u);
          }
        });
        elUp.innerHTML = fmt(upFinal) + '<span>Mbps</span>';

        // Finish: show download result in the big number
        elNum.textContent = fmt(downFinal);
        setArc(downFinal);
        elCap.textContent = 'Download';
        setState('Complete', 'idle');

        if (typeof options.onComplete === 'function') {
          options.onComplete({
            ping: lat.ping,
            jitter: lat.jitter,
            download: downFinal,
            upload: upFinal
          });
        }
      } catch (err) {
        console.error('[FasqooWidget]', err);
        elCap.textContent = 'Measurement failed';
        setState('Error', 'idle');
        elNum.textContent = '—';
        setArc(0);
        if (typeof options.onError === 'function') options.onError(err);
      } finally {
        busy = false;
        elBtn.disabled = false;
        elBtn.textContent = 'Test Again';
      }
    }

    elBtn.addEventListener('click', start);

    if (options.autostart) {
      setTimeout(start, 600);
    }

    return {
      start: start,
      destroy: function () {
        try { host.innerHTML = ''; } catch (e) {}
      }
    };
  }

  /* ───────────── Public API ───────────── */
  function init(userOptions) {
    var options = Object.assign({}, DEFAULTS, userOptions || {});
    var target = null;

    if (typeof options.target === 'string') {
      target = document.querySelector(options.target);
    } else if (options.target instanceof Element) {
      target = options.target;
    }

    if (!target) {
      console.error('[FasqooWidget] Target not found:', options.target);
      return null;
    }

    // Auto theme
    if (options.theme === 'auto') {
      try {
        options.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } catch (e) {
        options.theme = 'dark';
      }
    }

    return createWidget(target, options);
  }

  /* ───────────── Auto-init from <script data-target> ───────────── */
  function autoInit() {
    var scripts = document.querySelectorAll('script[src*="widget.js"], script[data-fasqoo-widget]');
    scripts.forEach(function (script) {
      var target = script.getAttribute('data-target');
      if (!target) return;

      var opts = {
        target: '#' + target.replace(/^#/, ''),
        width: script.getAttribute('data-width') || DEFAULTS.width,
        height: script.getAttribute('data-height') || DEFAULTS.height,
        theme: script.getAttribute('data-theme') || DEFAULTS.theme,
        accent: script.getAttribute('data-accent') || DEFAULTS.accent,
        autostart: script.getAttribute('data-autostart') !== 'false',
        showBranding: script.getAttribute('data-branding') !== 'false'
      };

      if (typeof opts.width === 'string' && /^\d+$/.test(opts.width)) opts.width = parseInt(opts.width, 10);
      if (typeof opts.height === 'string' && /^\d+$/.test(opts.height)) opts.height = parseInt(opts.height, 10);

      init(opts);
    });
  }

  window.FasqooWidget = {
    init: init,
    version: VERSION
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
})();
