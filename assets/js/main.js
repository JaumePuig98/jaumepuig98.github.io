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
       Live particle tracks in page headers (canvas), like a cloud chamber:
       single tracks flash in at random places and fade away. Long, nearly
       straight "muons" cross the field; short, curling "electrons" appear
       and spiral. Pauses off-screen; a few still tracks under reduced motion.
    --------------------------------------------------------- */
    (function () {
        var bands = document.querySelectorAll('[data-tracks]');
        if (!bands.length) { return; }
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        function rnd(lo, hi) { return lo + Math.random() * (hi - lo); }

        bands.forEach(function (band) {
            var canvas = band.querySelector('canvas.tracks');
            if (!canvas || !canvas.getContext) { return; }
            var ctx = canvas.getContext('2d');
            var W = 0, H = 0, tracks = [], nextSpawn = 0, last = 0, raf = 0, visible = true;

            function resize() {
                var r = band.getBoundingClientRect();
                var dpr = Math.min(window.devicePixelRatio || 1, 2);
                W = r.width; H = r.height;
                canvas.width = Math.round(W * dpr);
                canvas.height = Math.round(H * dpr);
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }

            function makeTrack() {
                var pts = [], x, y, ang, curv, grow = 0, step, i, n;
                var kind = Math.random() < 0.6 ? 'muon' : 'electron';
                if (kind === 'muon') {
                    step = 6;
                    if (Math.random() < 0.75) {            // enters through the top edge
                        x = rnd(-0.05 * W, 1.05 * W); y = -8; ang = rnd(55, 125) * Math.PI / 180;
                    } else if (Math.random() < 0.5) {       // enters from the left edge
                        x = -8; y = rnd(0, 0.5 * H); ang = rnd(5, 50) * Math.PI / 180;
                    } else {                                // enters from the right edge
                        x = W + 8; y = rnd(0, 0.5 * H); ang = rnd(130, 175) * Math.PI / 180;
                    }
                    curv = (Math.random() < 0.5 ? -1 : 1) * rnd(0.0003, 0.0016);
                    n = Math.ceil(Math.max(W, H) * 1.5 / step);
                    pts.push([x, y]);
                    for (i = 0; i < n; i++) { ang += curv; x += Math.cos(ang) * step; y += Math.sin(ang) * step; pts.push([x, y]); }
                    grow = 0.16;
                } else {
                    step = 3;
                    x = rnd(0.05 * W, 0.95 * W); y = rnd(0.02 * H, 0.6 * H); ang = rnd(0, 6.2832);
                    var sign = Math.random() < 0.5 ? -1 : 1, k = rnd(0.012, 0.03), loss = rnd(0.0004, 0.0011);
                    n = Math.round(rnd(60, 130));
                    pts.push([x, y]);
                    for (i = 0; i < n; i++) {
                        ang += sign * (k + i * loss);       // tighter curl as it loses energy
                        x += Math.cos(ang) * step; y += Math.sin(ang) * step; pts.push([x, y]);
                    }
                    grow = 0.09;
                }
                return { pts: pts, age: 0, grow: grow, hold: rnd(0.08, 0.2), fade: rnd(0.9, 1.7),
                         alpha: kind === 'muon' ? rnd(0.3, 0.5) : rnd(0.28, 0.45), w: kind === 'muon' ? rnd(1, 1.5) : rnd(1.1, 1.6) };
            }

            function drawTrack(t) {
                var p = Math.min(1, t.age / t.grow);
                var life = t.age < t.grow + t.hold ? 1 : Math.max(0, 1 - (t.age - t.grow - t.hold) / t.fade);
                life = life * life;
                if (life <= 0) { return; }
                var end = Math.max(1, Math.floor(p * (t.pts.length - 1)));
                var chunks = [[0, 1 / 3, 1], [1 / 3, 2 / 3, 0.8], [2 / 3, 1, 0.55]];
                ctx.lineCap = 'round';
                ctx.lineWidth = t.w;
                for (var c = 0; c < 3; c++) {
                    var a0 = Math.floor(end * chunks[c][0]), a1 = c === 2 ? end : Math.floor(end * chunks[c][1]);
                    if (a1 <= a0) { continue; }
                    ctx.strokeStyle = 'rgba(170,232,244,' + (t.alpha * chunks[c][2] * life).toFixed(3) + ')';
                    ctx.beginPath();
                    ctx.moveTo(t.pts[a0][0], t.pts[a0][1]);
                    for (var i = a0 + 1; i <= a1; i++) { ctx.lineTo(t.pts[i][0], t.pts[i][1]); }
                    ctx.stroke();
                }
            }

            function frame(now) {
                raf = 0;
                if (!visible) { return; }
                var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
                last = now;
                ctx.clearRect(0, 0, W, H);
                nextSpawn -= dt;
                if (nextSpawn <= 0 && tracks.length < 6) {
                    tracks.push(makeTrack());
                    nextSpawn = rnd(0.35, 1.6);
                }
                tracks = tracks.filter(function (t) {
                    t.age += dt;
                    drawTrack(t);
                    return t.age < t.grow + t.hold + t.fade;
                });
                raf = requestAnimationFrame(frame);
            }

            function start() { if (!raf && visible && !reduce) { last = 0; raf = requestAnimationFrame(frame); } }

            function drawStatic() {
                ctx.clearRect(0, 0, W, H);
                for (var i = 0; i < 4; i++) {
                    var t = makeTrack();
                    t.age = t.grow + t.hold;
                    t.alpha *= 0.6;
                    drawTrack(t);
                }
            }

            resize();
            if (reduce) {
                drawStatic();
            } else {
                nextSpawn = 0.2;
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
