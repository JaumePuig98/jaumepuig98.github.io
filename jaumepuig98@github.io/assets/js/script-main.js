// assets/js/script-main.js (or main.js)
// This script handles theme switching, smooth scrolling, and other interactive features for the main webpage.

document.addEventListener('DOMContentLoaded', () => {
    // --- THEME DETECTION AND SWITCHING LOGIC (from script-bcard.js) ---
    /**
     * Sets the theme by adding/updating the 'data-theme' attribute on the HTML element.
     * The CSS (styles-main.css) uses this attribute to apply the correct theme variables.
     * @param {string} theme - The theme to set ('light' or 'dark').
     */
    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        // console.log(`Main page theme set to: ${theme}`); // For debugging
    };

    // Detect system preference for theme
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Set initial theme based on system preference
    if (prefersDarkScheme.matches) {
        setTheme('dark');
    } else {
        setTheme('light');
    }

    // Listen for changes in the system's color scheme preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (event.matches) {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    });
    console.log('Main page theme detection active.');

    // --- EXISTING INTERACTIVE FEATURES from script-main.js ---

    // Example: Add hover effect to navigation links (if you have a <nav> element in your main page header)
    // This was in your original script-main.js. Ensure your main page HTML has 'nav a' selectors.
    // If your main page nav links have a specific class like '.nav-link', use that instead.
    const mainNavLinks = document.querySelectorAll('header nav a'); // More specific selector for header nav links
    if (mainNavLinks.length > 0) {
        mainNavLinks.forEach(link => {
            // Storing original color to revert correctly, especially if set by CSS variables
            const originalColor = getComputedStyle(link).color;
            link.addEventListener('mouseover', () => {
                // Consider using a CSS class for hover state for better maintainability
                // instead of direct style manipulation if your theme variables handle hover.
                // For now, keeping your original logic but with a more theme-aware color.
                // This yellow (#ffc107) was from your original styles-main.css.
                // You might want to define it as a CSS variable if used extensively.
                link.style.color = 'var(--original-secondary-color, #ffc107)'; // Fallback to yellow
            });

            link.addEventListener('mouseout', () => {
                link.style.color = originalColor; // Reset to original computed color
            });
        });
        console.log('Main page nav link hover effects active.');
    }


    // Smooth scroll for all anchor links starting with "#"
    // This combines and refines your existing smooth scroll logic.
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Ensure it's a valid internal link (not just "#")
            if (href && href.startsWith('#') && href.length > 1) {
                e.preventDefault(); // Prevent default jump
                const targetId = href.substring(1); // Get ID without '#'
                const targetElement = document.getElementById(targetId);
                
                // Mobile menu closing logic (if your main page has a mobile menu with this ID)
                const mobileMenu = document.getElementById('mobile-menu'); // Assuming main page has this
                const header = document.querySelector('header'); // Assuming main page has a header

                if (targetElement) {
                    let headerOffset = 0;
                    // Calculate offset only if header exists and is sticky
                    if (header && window.getComputedStyle(header).position === 'sticky') {
                        headerOffset = header.offsetHeight;
                    }
                    
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Close mobile menu if it's open
                    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                        mobileMenu.classList.add('hidden');
                        const menuButtonIcon = document.getElementById('mobile-menu-button'); // Assuming this button exists
                        if (menuButtonIcon) {
                            const iconElement = menuButtonIcon.querySelector('i');
                            if (iconElement) {
                                iconElement.classList.remove('fa-times');
                                iconElement.classList.add('fa-bars');
                            }
                        }
                    }
                }
            } else if (href === "#" || (targetId && targetId === "banner" || targetId === "hero-banner")) { 
                // Handle links to the top of the page (e.g., href="#" or href="#banner")
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                 // Also close mobile menu if open
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
            // For other types of links (external, etc.), let the default browser action occur.
        });
    });
    console.log('Main page smooth scrolling active.');

    // Mobile menu toggle functionality (if your main page uses these IDs)
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        const menuButtonIcon = mobileMenuButton.querySelector('i');
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            if (menuButtonIcon) {
                if (mobileMenu.classList.contains('hidden')) {
                    menuButtonIcon.classList.remove('fa-times');
                    menuButtonIcon.classList.add('fa-bars');
                } else {
                    menuButtonIcon.classList.remove('fa-bars');
                    menuButtonIcon.classList.add('fa-times');
                }
            }
        });
        console.log('Main page mobile menu toggle active.');
    }

    // Set current year in footer (if your main page footer has an element with id="currentYear")
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
        console.log('Footer year updated.');
    }

    console.log('Main page script fully loaded and initialized.');

    // --- SCROLL TO TOP BUTTON LOGIC ---
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const bannerSection = document.getElementById('banner'); // Assuming your banner has id="banner"

    if (scrollToTopBtn && bannerSection) {
        // Function to show/hide the button based on scroll position
        const toggleScrollToTopButton = () => {
            // Get the height of the banner
            const bannerHeight = bannerSection.offsetHeight;
            // Or show after scrolling down a fixed amount, e.g., window.innerHeight
            // const scrollThreshold = window.innerHeight * 0.8; // 80% of viewport height

            if (window.pageYOffset > bannerHeight) { // Show button after scrolling past the banner
            // if (window.pageYOffset > scrollThreshold) { // Alternative threshold
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        };

        // Listen for scroll events
        window.addEventListener('scroll', toggleScrollToTopButton);

        // Click event for the button (uses existing smooth scroll logic if preferred, or a direct one)
        // Your existing smooth scroll for 'a[href^="#"]' should already handle this
        // as the button is an <a href="#banner">.
        // If you want to be explicit or if there are issues:
        /*
        scrollToTopBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default anchor jump
            window.scrollTo({
                top: 0, // Scroll to the very top
                behavior: 'smooth'
            });
            // Alternatively, to scroll to the banner specifically:
            // const bannerTop = bannerSection.offsetTop;
            // window.scrollTo({
            //     top: bannerTop, // Adjust if you have a sticky header
            //     behavior: 'smooth'
            // });
        });
        */
        console.log('Scroll to top button initialized.');
    } else {
        if (!scrollToTopBtn) console.error('Scroll to top button not found.');
        if (!bannerSection) console.error('Banner section for scroll threshold not found.');
    }
});

