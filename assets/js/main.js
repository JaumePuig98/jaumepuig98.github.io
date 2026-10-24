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
       Lattice glow follows the cursor (fine pointers only)
    --------------------------------------------------------- */
    if (window.matchMedia('(pointer: fine)').matches) {
        document.querySelectorAll('[data-lattice]').forEach(function (band) {
            band.addEventListener('pointermove', function (e) {
                var r = band.getBoundingClientRect();
                band.style.setProperty('--cx', (e.clientX - r.left) + 'px');
                band.style.setProperty('--cy', (e.clientY - r.top) + 'px');
            }, { passive: true });
            band.addEventListener('pointerleave', function () {
                band.style.removeProperty('--cx');
                band.style.removeProperty('--cy');
            });
        });
    }

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
