(function () {
    'use strict';

    /* ---------------------------------------------------------
       Scroll progress bar
    --------------------------------------------------------- */
    var progressBar = document.getElementById('scroll-progress');
    var mainNav = document.getElementById('main-nav');
    function updateScrollProgress() {
        var scrollTop = window.scrollY || document.documentElement.scrollTop;
        if (progressBar) {
            var docHeight = document.documentElement.scrollHeight - window.innerHeight;
            var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = pct + '%';
        }
        if (mainNav) {
            mainNav.classList.toggle('nav-scrolled', scrollTop > 40);
        }
    }
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    /* ---------------------------------------------------------
       Skip link: move keyboard focus to main content on activation
       (some browsers don't focus a tabindex="-1" target from a
       fragment link alone).
    --------------------------------------------------------- */
    var skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', function () {
            var targetId = skipLink.getAttribute('href').slice(1);
            var target = document.getElementById(targetId);
            if (target) {
                setTimeout(function () { target.focus(); }, 0);
            }
        });
    }

    /* ---------------------------------------------------------
       Nav: mobile toggle
    --------------------------------------------------------- */
    var navToggle = document.getElementById('nav-toggle');
    var navLinks = document.getElementById('nav-links');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            var isOpen = navLinks.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
        var closeNav = function () {
            navLinks.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        };
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && navLinks.classList.contains('open')) {
                closeNav();
                navToggle.focus();
            }
        });
        document.addEventListener('click', function (e) {
            if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !navToggle.contains(e.target)) {
                closeNav();
            }
        });
    }

    /* ---------------------------------------------------------
       Reveal on scroll
    --------------------------------------------------------- */
    var revealEls = document.querySelectorAll('.fade-in-section');
    if ('IntersectionObserver' in window && revealEls.length) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }


    /* ---------------------------------------------------------
       Project filters
    --------------------------------------------------------- */
    var filterBtns = document.querySelectorAll('.filter-btn');
    var projectCards = document.querySelectorAll('.project-card');
    var filterStatus = document.getElementById('filter-status');
    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            filterBtns.forEach(function (b) {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            var filter = btn.getAttribute('data-filter');
            var shown = 0;
            projectCards.forEach(function (card) {
                var tags = card.getAttribute('data-tags') || '';
                var show = filter === 'all' || tags.indexOf(filter) !== -1;
                card.style.display = show ? '' : 'none';
                if (show) { shown++; }
            });
            if (filterStatus) {
                filterStatus.textContent = 'Showing ' + shown + (shown === 1 ? ' project' : ' projects') + (filter === 'all' ? '' : ' for ' + filter);
            }
        });
    });

    /* ---------------------------------------------------------
       Back to top
    --------------------------------------------------------- */
    var backToTop = document.getElementById('scroll-to-top-btn');
    if (backToTop) {
        window.addEventListener('scroll', function () {
            backToTop.classList.toggle('visible', window.scrollY > 500);
        }, { passive: true });
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ---------------------------------------------------------
       Live particle tracks in page headers: a stylised diffusion cloud chamber.
       Each species is an independent Poisson process (random, memoryless arrivals)
       with the look of the real thing at sea level:
         - muon (cosmic ray): long, thin, straight; zenith angle ~ cos^2; the rarest
           of the common tracks; occasionally throws off a short delta-ray electron
         - alpha (radon chain): short (about 4-5 cm range), thick, bright, straight,
           slightly brighter and bent at the very end (Bragg peak + scattering)
         - electron (Compton / beta): thin and tortuous; straight while fast, curling
           ever tighter as it loses energy (multiple scattering)
       Tracks flash in, linger ~1 s, and slowly sink and fade. Pauses off-screen;
       a few still tracks under reduced motion.
    --------------------------------------------------------- */
    (function () {
        var bands = document.querySelectorAll('[data-tracks]');
        if (!bands.length) { return; }
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        function rnd(lo, hi) { return lo + Math.random() * (hi - lo); }
        function gauss() { return Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(6.2832 * Math.random()); }
        function expWait(rate) { return -Math.log(1 - Math.random()) / rate; }   // seconds to next event
        /* zenith angle (radians from vertical) with density ~ cos^2 */
        function zenith() {
            for (;;) {
                var t = rnd(-1.5708, 1.5708);
                if (Math.random() < Math.cos(t) * Math.cos(t)) { return t; }
            }
        }
        /* events per second, per header */
        var RATES = { electron: 0.5, muon: 0.14, alpha: 0.09 };

        bands.forEach(function (band) {
            var canvas = band.querySelector('canvas.tracks');
            if (!canvas || !canvas.getContext) { return; }
            var ctx = canvas.getContext('2d');
            var W = 0, H = 0, S = 1, tracks = [], next = {}, last = 0, raf = 0, visible = true;

            function resize() {
                var r = band.getBoundingClientRect();
                var dpr = Math.min(window.devicePixelRatio || 1, 2);
                W = r.width; H = r.height;
                S = Math.max(0.6, Math.min(1.3, W / 1200));      /* px per cm scales with the viewport */
                canvas.width = Math.round(W * dpr);
                canvas.height = Math.round(H * dpr);
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }

            /* random-walk helper: straight at first, scattering harder as energy drops */
            function walk(x, y, ang, steps, step, sigma0, sigmaGrow) {
                var pts = [[x, y]];
                for (var i = 0; i < steps; i++) {
                    var f = i / steps;
                    ang += gauss() * (sigma0 + sigmaGrow * f * f);
                    x += Math.cos(ang) * step; y += Math.sin(ang) * step;
                    pts.push([x, y]);
                }
                return pts;
            }

            function build(kind) {
                var t = { age: 0, kind: kind, hold: rnd(0.15, 0.3), fade: rnd(0.9, 1.5), taper: [1, 0.85, 0.7], sink: rnd(5, 9) * S };
                var x, y, ang, i;
                if (kind === 'muon') {
                    var th = zenith();                                    /* 0 = straight down */
                    x = rnd(-0.1 * W, 1.1 * W); y = -8;
                    ang = 1.5708 - th;                                    /* canvas angle from +x */
                    t.pts = walk(x, y, ang, Math.ceil(Math.max(W, H) * 1.6 / 6), 6, 0.0012, 0.0012);
                    t.w = rnd(0.9, 1.2); t.alpha = rnd(0.16, 0.26); t.grow = 0.05;
                    t.deltas = [];
                    if (Math.random() < 0.18) {                           /* knock-on (delta-ray) electron */
                        var j = Math.floor(rnd(0.15, 0.6) * Math.min(t.pts.length - 1, H / 6));
                        var base = t.pts[j], dir = Math.atan2(t.pts[j + 1][1] - base[1], t.pts[j + 1][0] - base[0]) + (Math.random() < 0.5 ? -1 : 1) * rnd(0.9, 1.5);
                        t.deltas.push(walk(base[0], base[1], dir, Math.round(rnd(8, 18)), 3, 0.05, 0.35));
                    }
                } else if (kind === 'alpha') {
                    x = rnd(0.05 * W, 0.95 * W); y = rnd(0.03 * H, 0.6 * H); ang = rnd(0, 6.2832);
                    var range = rnd(3.8, 5.5) * 46 * S, step = 4, n = Math.round(range / step);
                    t.pts = walk(x, y, ang, n, step, 0.0025, 0.0);
                    /* small deflection in the last few mm */
                    var end = t.pts[n], bend = (Math.random() < 0.5 ? -1 : 1) * rnd(0.25, 0.6), a2 = ang + bend;
                    for (i = 1; i <= 4; i++) { t.pts.push([end[0] + Math.cos(a2) * step * i, end[1] + Math.sin(a2) * step * i]); }
                    t.w = rnd(2.2, 2.8); t.alpha = rnd(0.26, 0.38); t.grow = 0.04; t.taper = [0.7, 0.85, 1];
                } else {
                    x = rnd(0.04 * W, 0.96 * W); y = rnd(0.02 * H, 0.62 * H); ang = rnd(0, 6.2832);
                    var len = rnd(0.5, 2.6) * 46 * S, st = 3;             /* ~0.5-2.6 cm of visible track */
                    t.pts = walk(x, y, ang, Math.round(len / st), st, 0.025, rnd(0.2, 0.45));
                    t.w = rnd(1, 1.3); t.alpha = rnd(0.16, 0.28); t.grow = 0.06; t.taper = [0.8, 0.9, 1];
                }
                return t;
            }

            function strokePath(pts, from, to, alpha, w, yOff) {
                if (to <= from) { return; }
                ctx.lineWidth = w;
                ctx.strokeStyle = 'rgba(175,232,244,' + alpha.toFixed(3) + ')';
                ctx.beginPath();
                ctx.moveTo(pts[from][0], pts[from][1] + yOff);
                for (var i = from + 1; i <= to; i++) { ctx.lineTo(pts[i][0], pts[i][1] + yOff); }
                ctx.stroke();
            }

            function draw(t) {
                var p = Math.min(1, t.age / t.grow);
                var life = t.age < t.grow + t.hold ? 1 : Math.max(0, 1 - (t.age - t.grow - t.hold) / t.fade);
                life = life * life;
                if (life <= 0) { return; }
                var yOff = t.age * t.sink;                                /* droplets slowly sink */
                var end = Math.max(1, Math.floor(p * (t.pts.length - 1)));
                ctx.lineCap = 'round'; ctx.lineJoin = 'round';
                for (var c = 0; c < 3; c++) {
                    var a0 = Math.floor(end * c / 3), a1 = c === 2 ? end : Math.floor(end * (c + 1) / 3);
                    strokePath(t.pts, a0, a1, t.alpha * t.taper[c] * life, t.w, yOff);
                }
                if (t.deltas) {
                    t.deltas.forEach(function (d) { strokePath(d, 0, Math.floor(p * (d.length - 1)), t.alpha * 0.9 * life, 1, yOff); });
                }
            }

            function frame(now) {
                raf = 0;
                if (!visible) { return; }
                var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
                last = now;
                ctx.clearRect(0, 0, W, H);
                Object.keys(RATES).forEach(function (k) {
                    next[k] -= dt;
                    if (next[k] <= 0) {
                        if (tracks.length < 14) { tracks.push(build(k)); }
                        next[k] = expWait(RATES[k]);
                    }
                });
                tracks = tracks.filter(function (t) {
                    t.age += dt;
                    draw(t);
                    return t.age < t.grow + t.hold + t.fade;
                });
                raf = requestAnimationFrame(frame);
            }

            function start() { if (!raf && visible && !reduce) { last = 0; raf = requestAnimationFrame(frame); } }

            function drawStatic() {
                ctx.clearRect(0, 0, W, H);
                ['electron', 'electron', 'muon', 'alpha', 'electron'].forEach(function (k) {
                    var t = build(k); t.age = t.grow + t.hold * 0.5; t.alpha *= 0.7; t.sink = 0; draw(t);
                });
            }

            resize();
            if (reduce) {
                drawStatic();
            } else {
                Object.keys(RATES).forEach(function (k) { next[k] = rnd(0.1, 1.2); });
                start();
                if ('IntersectionObserver' in window) {
                    new IntersectionObserver(function (entries) {
                        visible = entries[0].isIntersecting;
                        if (visible) { start(); }
                    }).observe(band);
                }
            }
            var resizeTimer;
            window.addEventListener('resize', function () {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function () {
                    resize();
                    if (reduce) { drawStatic(); }
                }, 150);
            });
        });
    })();

    /* ---------------------------------------------------------
       External links: tell assistive tech they open a new tab
    --------------------------------------------------------- */
    document.querySelectorAll('a[target="_blank"]').forEach(function (a) {
        var label = a.getAttribute('aria-label');
        if (label) {
            a.setAttribute('aria-label', label + ' (opens in a new tab)');
        } else {
            var note = document.createElement('span');
            note.className = 'sr-only';
            note.textContent = ' (opens in a new tab)';
            a.appendChild(note);
        }
    });

    /* ---------------------------------------------------------
       In-page section menu: highlight the section being read
    --------------------------------------------------------- */
    (function () {
        var links = document.querySelectorAll('.cv-subnav a[href^="#"]');
        if (!links.length || !('IntersectionObserver' in window)) { return; }
        var map = {};
        links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
        function setCurrent(id) {
            links.forEach(function (a) { a.removeAttribute('aria-current'); });
            if (map[id]) {
                map[id].setAttribute('aria-current', 'true');
                var bar = map[id].parentNode;
                if (bar.scrollWidth > bar.clientWidth) { bar.scrollLeft = map[id].offsetLeft - 16; }
            }
        }
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) { if (e.isIntersecting) { setCurrent(e.target.id); } });
        }, { rootMargin: '-35% 0px -60% 0px' });
        Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) { io.observe(el); } });
    })();

    /* ---------------------------------------------------------
       Cookie consent (gates Google Analytics)
    --------------------------------------------------------- */
    var cookieBar = document.getElementById('cookie-bar');
    var cookieAccept = document.getElementById('cookie-accept');
    var cookieDeny = document.getElementById('cookie-deny');
    var consentKey = 'cookie-consent';

    /* Analytics is only ever loaded after consent (see __loadGA in each page's head). */
    function enableAnalytics() {
        if (typeof window.__loadGA === 'function') { window.__loadGA(); }
    }
    function readConsent() {
        try { return localStorage.getItem(consentKey); } catch (e) { return null; }
    }
    function writeConsent(value) {
        try { localStorage.setItem(consentKey, value); } catch (e) { /* storage blocked: ignore */ }
    }

    var existingConsent = readConsent();
    if (cookieBar) {
        if (!existingConsent) {
            setTimeout(function () { cookieBar.classList.add('visible'); }, 900);
        }
        /* Note: the "already accepted" case is handled by each page's own
           inline head script at initial load, so it isn't repeated here. */

        if (cookieAccept) {
            cookieAccept.addEventListener('click', function () {
                writeConsent('accepted');
                cookieBar.classList.remove('visible');
                enableAnalytics();
            });
        }
        if (cookieDeny) {
            cookieDeny.addEventListener('click', function () {
                writeConsent('declined');
                cookieBar.classList.remove('visible');
            });
        }
    }

})();
