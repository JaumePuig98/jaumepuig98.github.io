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
        function closeNav() {
            navLinks.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        }
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
       Live particle tracks in page headers (canvas). Random showers fan out from
       a vertex, grow, linger, and fade. Pauses off-screen; static under reduced motion.
    --------------------------------------------------------- */
    (function () {
        var bands = document.querySelectorAll('[data-tracks]');
        if (!bands.length) { return; }
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var EMITTERS = {
            a: [[0.93, -0.10], [0.72, -0.16], [1.02, 0.12]],
            b: [[0.60, -0.14], [0.86, -0.08], [0.99, 0.18]]
        };
        function rnd(lo, hi) { return lo + Math.random() * (hi - lo); }

        bands.forEach(function (band) {
            var canvas = band.querySelector('canvas.tracks');
            if (!canvas || !canvas.getContext) { return; }
            var ctx = canvas.getContext('2d');
            var emitters = EMITTERS[band.getAttribute('data-tracks')] || EMITTERS.a;
            var W = 0, H = 0, showers = [], nextSpawn = 0, last = 0, raf = 0, visible = true;

            function resize() {
                var r = band.getBoundingClientRect();
                var dpr = Math.min(window.devicePixelRatio || 1, 2);
                W = r.width; H = r.height;
                canvas.width = Math.round(W * dpr);
                canvas.height = Math.round(H * dpr);
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }

            function makeShower() {
                var e = emitters[Math.floor(Math.random() * emitters.length)];
                var ox = e[0] * W + rnd(-30, 30), oy = e[1] * H;
                var n = Math.round(rnd(5, 9));
                var lo = rnd(95, 120), hi = lo + rnd(40, 60);
                var sign = Math.random() < 0.5 ? -1 : 1;
                var maxLen = Math.min(W, 1000) * rnd(0.28, 0.5) + 120;
                var widths = [0.8, 1, 1.2, 1.5];
                var tracks = [];
                for (var k = 0; k < n; k++) {
                    var ang = (lo + (hi - lo) * (k / (n - 1)) + rnd(-4, 4)) * Math.PI / 180;
                    var curv = sign * rnd(0.0015, 0.007);
                    var len = rnd(0.55, 1) * maxLen, step = 6;
                    var x = ox, y = oy, pts = [[x, y]];
                    for (var i = 0; i < len / step; i++) {
                        ang += curv;
                        x += Math.cos(ang) * step; y += Math.sin(ang) * step;
                        pts.push([x, y]);
                    }
                    tracks.push({ pts: pts, w: widths[Math.floor(rnd(0, 4))] });
                }
                return { t: 0, tracks: tracks, grow: rnd(1.1, 1.8), hold: rnd(1.2, 2.2), fade: rnd(2.2, 3.2) };
            }

            function drawShower(s) {
                var p = Math.min(1, s.t / s.grow);
                p = 1 - (1 - p) * (1 - p);
                var life = s.t < s.grow + s.hold ? 1 : Math.max(0, 1 - (s.t - s.grow - s.hold) / s.fade);
                if (life <= 0) { return; }
                ctx.lineCap = 'round';
                s.tracks.forEach(function (tr) {
                    var last = Math.max(1, Math.floor(p * (tr.pts.length - 1)));
                    var chunks = [[0, 1, 0.30], [1, 2, 0.18], [2, 3, 0.08]];
                    for (var c = 0; c < chunks.length; c++) {
                        var a0 = Math.floor(last * chunks[c][0] / 3), a1 = Math.floor(last * chunks[c][1] / 3);
                        if (c === 2) { a1 = last; }
                        if (a1 <= a0) { continue; }
                        ctx.strokeStyle = 'rgba(160,228,240,' + (chunks[c][2] * life).toFixed(3) + ')';
                        ctx.lineWidth = tr.w;
                        ctx.beginPath();
                        ctx.moveTo(tr.pts[a0][0], tr.pts[a0][1]);
                        for (var i = a0 + 1; i <= a1; i++) { ctx.lineTo(tr.pts[i][0], tr.pts[i][1]); }
                        ctx.stroke();
                    }
                    if (p < 1) {
                        ctx.fillStyle = 'rgba(190,245,255,' + (0.7 * life).toFixed(3) + ')';
                        ctx.beginPath();
                        ctx.arc(tr.pts[last][0], tr.pts[last][1], tr.w + 0.6, 0, 6.2832);
                        ctx.fill();
                    }
                });
            }

            function frame(now) {
                raf = 0;
                if (!visible) { return; }
                var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
                last = now;
                ctx.clearRect(0, 0, W, H);
                nextSpawn -= dt;
                if (nextSpawn <= 0 && showers.length < 4) {
                    showers.push(makeShower());
                    nextSpawn = rnd(0.9, 2.4);
                }
                showers = showers.filter(function (s) {
                    s.t += dt;
                    drawShower(s);
                    return s.t < s.grow + s.hold + s.fade;
                });
                raf = requestAnimationFrame(frame);
            }

            function start() { if (!raf && visible && !reduce) { last = 0; raf = requestAnimationFrame(frame); } }

            function drawStatic() {
                ctx.clearRect(0, 0, W, H);
                for (var i = 0; i < 3; i++) {
                    var s = makeShower();
                    s.t = s.grow;
                    drawShower(s);
                }
            }

            resize();
            if (reduce) {
                drawStatic();
            } else {
                for (var i = 0; i < 2; i++) { var s = makeShower(); s.t = rnd(0.5, 2.5); showers.push(s); }
                nextSpawn = 0.6;
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
