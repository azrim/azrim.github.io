/* azrim.my.id: language switch, the year, the field in the record card, and one reveal. */
(function () {
  'use strict';

  var root = document.documentElement;
  var keys = document.querySelectorAll('[data-lang-choice]');
  var KEY = 'azrim-lang';

  function apply(lang) {
    root.lang = lang;
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    for (var i = 0; i < keys.length; i += 1) {
      keys[i].setAttribute('aria-pressed', String(keys[i].getAttribute('data-lang-choice') === lang));
    }
  }

  for (var i = 0; i < keys.length; i += 1) {
    keys[i].addEventListener('click', function () {
      apply(this.getAttribute('data-lang-choice'));
    });
  }

  apply(root.lang === 'id' ? 'id' : 'en');

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var revealCheck = null;

  /* ---- the field: characters on an 8 by 16 cell, a lens at the pointer ---- */
  (function field() {
    var canvas = document.getElementById('card-field');
    var hero = document.querySelector('.hero');
    if (!canvas || !hero || !canvas.getContext) return;

    var ctx = canvas.getContext('2d');
    var CW = 8, CH = 16;
    var RAMP = ' .,:;-=+*#%@';
    var ALPHA = [0.16, 0.28, 0.45, 0.7];
    var STRIDE = 6;

    var cols = 0, rows = 0, dpr = 1;
    var seen = null;
    var atlas = null;
    var pointer = { x: -999, y: -999, on: false };
    var clock = 0, frames = 0, last = 0, raf = 0, live = false, inView = true;

    function hash(x, y, z) {
      var h = (x * 374761393 + y * 668265263 + z * 1442695041) | 0;
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
    }

    function smooth(k) { return k * k * (3 - 2 * k); }
    function mix(a, b, k) { return a + (b - a) * k; }

    function noise(x, y, z) {
      var xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
      var u = smooth(x - xi), v = smooth(y - yi), w = smooth(z - zi);
      var a = mix(mix(hash(xi, yi, zi), hash(xi + 1, yi, zi), u), mix(hash(xi, yi + 1, zi), hash(xi + 1, yi + 1, zi), u), v);
      var b = mix(mix(hash(xi, yi, zi + 1), hash(xi + 1, yi, zi + 1), u), mix(hash(xi, yi + 1, zi + 1), hash(xi + 1, yi + 1, zi + 1), u), v);
      return mix(a, b, w);
    }

    function level(cx, cy) {
      var n = noise(cx * 0.085, cy * 0.16, clock * 0.22);
      var sway = 0.5 + 0.5 * Math.sin(cx * 0.055 - cy * 0.14 + clock * 0.5);
      var rightward = 0.45 + 0.55 * (cx / Math.max(1, cols - 1));
      var d = Math.pow(n, 1.7) * (0.55 + 0.45 * sway) * rightward;
      var diag = (cx / Math.max(1, cols) + (cy / Math.max(1, rows)) * 0.55) / 1.55;
      var sweepAt = ((clock * 0.36) % 1.5) - 0.22;
      d += Math.exp(-Math.pow((diag - sweepAt) / 0.055, 2)) * 0.38;
      if (pointer.on) {
        var dx = cx - pointer.x;
        var dy = (cy - pointer.y) * 0.55;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 10) d += (1 - dist / 10) * 0.85;
      }
      if (d < 0.04) return 0;
      return Math.min(9, 1 + Math.floor(d * 12));
    }

    function buildAtlas() {
      var style = getComputedStyle(canvas);
      var tint = style.getPropertyValue('--color-graphite-glyph-3').trim() || 'currentColor';
      var face = style.getPropertyValue('--font-outlier').trim() || 'monospace';
      atlas = [];
      for (var g = 1; g < RAMP.length; g += 1) {
        var c = document.createElement('canvas');
        c.width = Math.ceil(CW * dpr);
        c.height = Math.ceil(CH * dpr);
        var cx = c.getContext('2d');
        cx.scale(dpr, dpr);
        cx.fillStyle = tint;
        cx.font = '11px ' + face;
        cx.textAlign = 'center';
        cx.textBaseline = 'middle';
        cx.fillText(RAMP.charAt(g), CW / 2, CH / 2 + 0.5);
        atlas.push(c);
      }
    }

    function size() {
      var rect = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cols = Math.max(1, Math.floor(rect.width / CW));
      rows = Math.max(1, Math.floor(rect.height / CH));
      canvas.width = Math.ceil(cols * CW * dpr);
      canvas.height = Math.ceil(rows * CH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cols * CW, rows * CH);
      seen = new Uint8Array(cols * rows);
      buildAtlas();
      printAll(true);
    }

    function paint(i, cx, cy) {
      var n = level(cx, cy);
      if (seen[i] === n) return;
      seen[i] = n;
      var x = cx * CW, y = cy * CH;
      ctx.clearRect(x, y, CW, CH);
      if (n > 0 && atlas) {
        ctx.globalAlpha = ALPHA[Math.min(3, Math.floor((n - 1) / 2.4))];
        ctx.drawImage(atlas[n - 1], x, y, CW, CH);
        ctx.globalAlpha = 1;
      }
    }

    function printAll(force) {
      if (!seen) return;
      for (var cy = 0; cy < rows; cy += 1) {
        for (var cx = 0; cx < cols; cx += 1) {
          var i = cy * cols + cx;
          if (force) seen[i] = 255;
          paint(i, cx, cy);
        }
      }
    }

    function step(now) {
      if (!live) return;
      raf = requestAnimationFrame(step);
      if (now - last < 33) return;
      last = now;
      clock += 0.02;
      frames += 1;
      var phase = frames % STRIDE;
      for (var cy = 0; cy < rows; cy += 1) {
        for (var cx = phase; cx < cols; cx += STRIDE) {
          paint(cy * cols + cx, cx, cy);
        }
      }
      if (pointer.on) {
        var r = 9;
        for (var yy = Math.max(0, Math.floor(pointer.y) - r * 2); yy < Math.min(rows, Math.ceil(pointer.y) + r * 2); yy += 1) {
          for (var xx = Math.max(0, Math.floor(pointer.x) - r); xx < Math.min(cols, Math.ceil(pointer.x) + r); xx += 1) {
            paint(yy * cols + xx, xx, yy);
          }
        }
      }
    }

    function go() {
      if (live || reduce.matches) return;
      live = true;
      last = 0;
      raf = requestAnimationFrame(step);
    }

    function stop() {
      live = false;
      cancelAnimationFrame(raf);
    }

    function still() {
      stop();
      clock = 4.2;
      printAll(true);
    }

    hero.addEventListener('pointermove', function (e) {
      var rect = canvas.getBoundingClientRect();
      pointer.x = (e.clientX - rect.left) / CW;
      pointer.y = (e.clientY - rect.top) / CH;
      pointer.on = pointer.x > -4 && pointer.x < cols + 4 && pointer.y > -4 && pointer.y < rows + 4;
      if (reduce.matches) { printAll(false); }
    }, { passive: true });

    hero.addEventListener('pointerleave', function () {
      pointer.on = false;
      if (reduce.matches) printAll(false);
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else if (inView) go();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) go(); else stop();
      }, { threshold: 0 }).observe(hero);
    }

    var t0 = 0;
    window.addEventListener('resize', function () {
      clearTimeout(t0);
      t0 = setTimeout(function () {
        size();
        if (reduce.matches) still(); else go();
      }, 150);
    });

    function boot() {
      size();
      if (reduce.matches) still(); else go();
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
          buildAtlas();
          printAll(true);
        });
      }
    }

    boot();

    reduce.addEventListener('change', function () {
      if (reduce.matches) still(); else go();
    });
  })();

  /* ---- one reveal, below the fold, once ---- */
  (function reveal() {
    var groups = [
      '#work .head-block', '.rail-card',
      '#focus .head-block', '#focus .shot', '#focus .rows li',
      '#record .head-block', '#record .ruler li',
      '#contact h2', '#contact .close-row'
    ];
    var items = [];
    groups.forEach(function (sel) {
      var found = document.querySelectorAll(sel);
      for (var i = 0; i < found.length; i += 1) {
        found[i].style.setProperty('--i', String(i));
        if (found[i].getBoundingClientRect().top > window.innerHeight * 0.85) items.push(found[i]);
      }
    });
    if (!items.length) return;
    items.forEach(function (el) { el.classList.add('will-reveal'); });
    revealCheck = function () {
      var vh = window.innerHeight || 1;
      for (var i = items.length - 1; i >= 0; i -= 1) {
        var r = items[i].getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > -vh * 0.2) {
          items[i].classList.add('is-in');
          items.splice(i, 1);
        }
      }
      if (!items.length) revealCheck = null;
    };
    revealCheck();
  })();

  /* ---- scroll: the page leans and drifts, and the card follows the pointer ---- */
  (function scrollMotion() {
    var grid = document.querySelector('.hero-grid');
    var card = document.querySelector('.card');
    var copy = document.querySelector('.hero-copy');
    var shot = document.querySelector('.shot > img');
    var years = [].slice.call(document.querySelectorAll('.ruler li'));
    var heads = [].slice.call(document.querySelectorAll('.head-block, .close h2'));
    var rail = document.querySelector('.rail');
    var track = document.querySelector('.rail-track');
    var bar = document.getElementById('rail-bar');
    var pinned = window.matchMedia('(min-width: 56rem) and (prefers-reduced-motion: no-preference)');
    var railDist = 0;
    if (!grid || !card) return;
    if (window.matchMedia('(pointer: coarse)').matches) { grid = null; }

    var lean = { rx: 0, ry: 0, trx: 0, trys: 0 };
    var cardY = 0, copyY = 0;
    var leanFrame = 0;

    function progress(el) {
      var r = el.getBoundingClientRect();
      var vh = window.innerHeight || 1;
      var p = (vh - r.top) / (vh + r.height);
      return p < -0.15 ? -0.15 : (p > 1.15 ? 1.15 : p);
    }

    function sizeRail() {
      if (!rail || !track) return;
      if (!pinned.matches) {
        rail.style.height = '';
        track.style.transform = '';
        railDist = 0;
        return;
      }
      track.style.transform = 'translate3d(0,0,0)';
      var win = track.parentElement;
      railDist = Math.max(0, track.scrollWidth - win.clientWidth);
      rail.style.height = (window.innerHeight + railDist) + 'px';
      paint();
    }

    function writeCard() {
      card.style.transform = 'translate3d(0,' + cardY.toFixed(2) + 'px,0) rotateX(' + lean.rx.toFixed(2) + 'deg) rotateY(' + lean.ry.toFixed(2) + 'deg)';
    }

    function paint() {
      if (revealCheck) revealCheck();
      if (copy) {
        copyY = (0.5 - progress(copy)) * 54;
        copy.style.transform = 'translate3d(0,' + copyY.toFixed(2) + 'px,0)';
      }
      cardY = (0.5 - progress(card)) * 72;
      writeCard();
      if (shot) {
        var yr = (0.5 - progress(shot)) * 46;
        shot.style.transform = 'scale(1.14) translate3d(0,' + yr.toFixed(2) + 'px,0)';
      }
      for (var i = 0; i < years.length; i += 1) {
        var y = (0.5 - progress(years[i])) * (34 + i * 9);
        years[i].style.transform = 'translate3d(0,' + y.toFixed(2) + 'px,0)';
        var box = years[i].getBoundingClientRect();
        var k = ((window.innerHeight * 0.82) - box.top) / (window.innerHeight * 0.42);
        years[i].style.setProperty('--k', (k < 0 ? 0 : (k > 1 ? 1 : k)).toFixed(3));
      }
      if (rail && track && railDist > 0) {
        var p = Math.min(1, Math.max(0, -rail.getBoundingClientRect().top / railDist));
        track.style.transform = 'translate3d(' + (-p * railDist).toFixed(1) + 'px,0,0)';
        if (bar) bar.style.transform = 'scaleX(' + p.toFixed(3) + ')';
      }
      for (var h = 0; h < heads.length; h += 1) {
        var hy = (0.5 - progress(heads[h])) * 40;
        heads[h].style.transform = 'translate3d(0,' + hy.toFixed(2) + 'px,0)';
      }
    }

    var queued = false, rafId = 0, timerId = 0;

    function run() {
      if (!queued) return;
      queued = false;
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
      paint();
    }

    function ask() {
      if (queued) return;
      queued = true;
      rafId = requestAnimationFrame(run);
      timerId = setTimeout(run, 120);
    }

    function leanStep() {
      leanFrame = 0;
      lean.rx += (lean.trx - lean.rx) * 0.14;
      lean.ry += (lean.trys - lean.ry) * 0.14;
      writeCard();
      if (Math.abs(lean.trx - lean.rx) > 0.01 || Math.abs(lean.trys - lean.ry) > 0.01) {
        leanFrame = requestAnimationFrame(leanStep);
      }
    }

    if (grid) {
      grid.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        px = Math.min(1.35, Math.max(-0.35, px));
        py = Math.min(1.35, Math.max(-0.35, py));
        lean.trx = (0.5 - py) * 5.2;
        lean.trys = (px - 0.5) * 5.2;
        if (!leanFrame) leanFrame = requestAnimationFrame(leanStep);
      }, { passive: true });

      grid.addEventListener('pointerleave', function () {
        lean.trx = 0;
        lean.trys = 0;
        if (!leanFrame) leanFrame = requestAnimationFrame(leanStep);
      });
    }

    window.addEventListener('scroll', ask, { passive: true });
    window.addEventListener('resize', function () { sizeRail(); ask(); });

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeRail);
    pinned.addEventListener('change', sizeRail);
    sizeRail();

    var lastY = -1;
    (function loop() {
      requestAnimationFrame(loop);
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (y === lastY) return;
      lastY = y;
      ask();
    })();

    paint();
  })();
})();
