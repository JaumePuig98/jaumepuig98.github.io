// ===============================
// PROJECT FILTER BUTTONS LOGIC
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.getAttribute('data-filter');
            projectCards.forEach(card => {
                const tags = card.getAttribute('data-tags').split(',');
                if (filter === 'all' || tags.includes(filter)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});
/**
 * Main JavaScript File
 * Jaume Puig
 * Version: 4.0
 *
 * This file contains the core client-side logic for the website.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ===============================
    // SMOOTH SCROLLING FOR ANCHOR LINKS
    // ===============================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                const mobileMenu = document.getElementById('mobile-menu');
                const header = document.querySelector('header');
                if (targetElement) {
                    let headerOffset = 0;
                    if (header && window.getComputedStyle(header).position === 'sticky') {
                        headerOffset = header.offsetHeight;
                    }
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    // Close mobile menu if open
                    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                        mobileMenu.classList.add('hidden');
                        const menuButtonIcon = document.getElementById('mobile-menu-button');
                        if (menuButtonIcon) {
                            const iconElement = menuButtonIcon.querySelector('i');
                            if (iconElement) {
                                iconElement.classList.remove('fa-times');
                                iconElement.classList.add('fa-bars');
                            }
                        }
                    }
                }
            } else if (href === "#" || href === "#banner" || href === "#hero-banner") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    const menuButtonIcon = document.getElementById('mobile-menu-button');
                    if (menuButtonIcon) {
                        const iconElement = menuButtonIcon.querySelector('i');
                        if (iconElement) {
                            iconElement.classList.remove('fa-times');
                            iconElement.classList.add('fa-bars');
                        }
                    }
                }
            }
        });
    });

    // ===============================
    // SCROLL TO TOP BUTTON LOGIC
    // ===============================
    const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
    if (scrollToTopBtn) {
        const toggleVisibility = () => {
            if (window.scrollY > 400) {
                scrollToTopBtn.classList.add('is-visible');
            } else {
                scrollToTopBtn.classList.remove('is-visible');
            }
        };
        const scrollToTop = () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        };
        window.addEventListener('scroll', toggleVisibility);
        scrollToTopBtn.addEventListener('click', scrollToTop);
    }
    
    // ===============================
    // FADE-IN SECTION ANIMATION ON SCROLL
    // ===============================
    const fadeInSections = document.querySelectorAll('.fade-in-section');
    
    if (fadeInSections.length > 0) {
        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                // If the element is in view
                if (entry.isIntersecting) {
                    // Add the 'is-visible' class to trigger the animation
                    entry.target.classList.add('is-visible');
                    // Stop observing the element so the animation doesn't re-trigger
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1 // Trigger when 10% of the element is visible
        });

        // Start observing each of the sections
        fadeInSections.forEach(section => {
            sectionObserver.observe(section);
        });
    }
    
    // ===============================
    // PROJECT FILTER BUTTONS LOGIC
    // ===============================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.getAttribute('data-filter');
            projectCards.forEach(card => {
                const tags = card.getAttribute('data-tags').split(',');
                if (filter === 'all' || tags.includes(filter)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});