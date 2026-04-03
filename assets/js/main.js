/**
 * Main JavaScript File
 * Jaume Puig - 2026 Brand Refresh
 */

document.addEventListener('DOMContentLoaded', () => {

    // ===============================
    // 1. SMOOTH SCROLLING FOR ANCHOR LINKS
    // ===============================
    const nav = document.getElementById('main-nav');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const targetElement = document.getElementById(href.substring(1));
                if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth' });
                if (navLinks) { navLinks.classList.remove('is-open'); navToggle.setAttribute('aria-expanded', 'false'); }
            } else if (href === '#' || href === '#banner') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                if (navLinks) { navLinks.classList.remove('is-open'); navToggle.setAttribute('aria-expanded', 'false'); }
            }
        });
    });

    // ===============================
    // 2. NAVIGATION — SCROLLED STATE, AOS/LOS, ACTIVE LINKS, MOBILE TOGGLE
    // ===============================
    const allNavLinks = document.querySelectorAll('.nav-link');

    // 2a. Nav background on scroll
    const handleNavScroll = () => {
        if (window.scrollY > 20) {
            nav.classList.add('nav-scrolled');
        } else {
            nav.classList.remove('nav-scrolled');
        }
    };

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();

    // 2b. Active nav link
    const sections = document.querySelectorAll('section[id]');
    const highlightNav = () => {
        const navHeight = nav ? nav.offsetHeight : 64;
        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - navHeight - 20) current = section.getAttribute('id');
        });
        allNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
        });
    };
    window.addEventListener('scroll', highlightNav, { passive: true });
    highlightNav();

    // 2c. Mobile nav toggle
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', isOpen);
        });
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target)) { navLinks.classList.remove('is-open'); navToggle.setAttribute('aria-expanded', 'false'); }
        });
    }

    // ===============================
    // 3. SCROLL TO TOP BUTTON
    // ===============================
    const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            scrollToTopBtn.classList.toggle('is-visible', window.scrollY > 400);
        }, { passive: true });
        scrollToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // ===============================
    // 4. FADE-IN SECTION ANIMATION (Staggered)
    // ===============================
    const fadeInSections = document.querySelectorAll('.fade-in-section, .project-card');
    if (fadeInSections.length > 0) {
        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => entry.target.classList.add('is-visible'), index * 75);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        fadeInSections.forEach(section => sectionObserver.observe(section));
    }

    // ===============================
    // 5. PROJECT FILTER BUTTONS
    // ===============================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.getAttribute('data-filter');
            projectCards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    const tags = card.getAttribute('data-tags').split(',');
                    if (filter === 'all' || tags.includes(filter)) {
                        card.style.display = 'flex';
                        void card.offsetWidth;
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1) translateY(0)';
                    } else {
                        card.style.display = 'none';
                    }
                }, 250);
            });
        });
    });

    // ===============================
    // 7. SHOW MORE / SHOW LESS — Experience entries
    // ===============================
    document.querySelectorAll('.show-more-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const more = this.previousElementSibling;
            const isExpanded = this.getAttribute('aria-expanded') === 'true';

            if (isExpanded) {
                more.classList.remove('is-open');
                more.hidden = true;
                this.setAttribute('aria-expanded', 'false');
                this.innerHTML = 'Show more <i class="fas fa-chevron-down" aria-hidden="true"></i>';
            } else {
                more.hidden = false;
                requestAnimationFrame(() => more.classList.add('is-open'));
                this.setAttribute('aria-expanded', 'true');
                this.innerHTML = 'Show less <i class="fas fa-chevron-down" aria-hidden="true"></i>';
            }
        });
    });

    // end DOMContentLoaded
});