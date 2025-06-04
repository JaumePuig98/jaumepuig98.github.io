// assets/script-bcard.js
// This script handles the automatic theme switching based on user's system preference.

// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    
    /**
     * Sets the theme by adding/updating the 'data-theme' attribute on the HTML element.
     * The CSS uses this attribute to apply the correct theme variables.
     * @param {string} theme - The theme to set ('light' or 'dark').
     */
    const setTheme = (theme) => {
        // Set the data-theme attribute on the root <html> element
        document.documentElement.setAttribute('data-theme', theme);
        
        // Optional: Log to console for debugging purposes
        // console.log(`Theme set to: ${theme}`);

        // Optional: Save theme preference to localStorage if you add a manual toggle button later.
        // This would allow the user's choice to persist across sessions.
        // localStorage.setItem('theme', theme); 
    };

    // --- Theme Detection and Application ---
    // This section determines the initial theme.
    // It's currently set up to prioritize system preference.
    // If you implement localStorage for user-selected themes, the commented-out
    // localStorage check would be used first.

    // const savedTheme = localStorage.getItem('theme'); // Check for a user-saved theme
    // if (savedTheme) {
    //     setTheme(savedTheme); // Apply saved theme if it exists
    // } else {
        // If no saved theme, detect system preference using matchMedia.
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Set initial theme based on current system preference
        if (prefersDarkScheme.matches) {
            setTheme('dark'); // System prefers dark mode
        } else {
            setTheme('light'); // System prefers light mode (or no preference)
        }
    // }

    // Listen for changes in the system's color scheme preference.
    // This allows the theme to update dynamically if the user changes their system settings
    // (e.g., from light to dark mode) while the page is open.
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        // This condition would prevent overriding a manually set theme if localStorage was used.
        // For now, it always follows system changes.
        // if (!localStorage.getItem('theme')) { 
            if (event.matches) {
                // System switched to dark mode
                setTheme('dark');
            } else {
                // System switched to light mode
                setTheme('light');
            }
        // }
    });

    // --- Placeholder for Manual Theme Toggle (Optional Future Enhancement) ---
    // If you wanted to add a button to let users manually switch themes:
    // 1. Add a button to your HTML (e.g., <button id="theme-toggle-button">Toggle Theme</button>).
    // 2. Uncomment and adapt the following JavaScript:
    // const themeToggleButton = document.getElementById('theme-toggle-button');
    // if (themeToggleButton) {
    //     themeToggleButton.addEventListener('click', () => {
    //         const currentTheme = document.documentElement.getAttribute('data-theme');
    //         if (currentTheme === 'dark') {
    //             setTheme('light');
    //         } else {
    //             setTheme('dark');
    //         }
    //     });
    // }

    // Log to console to confirm the script has loaded and processed.
    console.log('Digital card script loaded. Theme detection active.');
});
