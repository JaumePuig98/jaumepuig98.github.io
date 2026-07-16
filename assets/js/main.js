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
    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            filterBtns.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            var filter = btn.getAttribute('data-filter');
            projectCards.forEach(function (card) {
                var tags = card.getAttribute('data-tags') || '';
                var show = filter === 'all' || tags.indexOf(filter) !== -1;
                card.style.display = show ? '' : 'none';
            });
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
       Cookie consent (gates Google Analytics)
    --------------------------------------------------------- */
    var cookieBar = document.getElementById('cookie-bar');
    var cookieAccept = document.getElementById('cookie-accept');
    var cookieDeny = document.getElementById('cookie-deny');
    var consentKey = 'cookie-consent';

    function enableAnalytics() {
        if (typeof gtag === 'function' && window.__gaId) {
            gtag('config', window.__gaId);
        }
    }

    var existingConsent = localStorage.getItem(consentKey);
    if (cookieBar) {
        if (!existingConsent) {
            setTimeout(function () { cookieBar.classList.add('visible'); }, 900);
        }
        /* Note: the "already accepted" case is handled by each page's own
           inline head script at initial load, so it isn't repeated here. */

        if (cookieAccept) {
            cookieAccept.addEventListener('click', function () {
                localStorage.setItem(consentKey, 'accepted');
                cookieBar.classList.remove('visible');
                enableAnalytics();
            });
        }
        if (cookieDeny) {
            cookieDeny.addEventListener('click', function () {
                localStorage.setItem(consentKey, 'declined');
                cookieBar.classList.remove('visible');
            });
        }
    }

})();
