document.addEventListener('DOMContentLoaded', () => {
    
    const contactLinks = document.querySelectorAll('.contact-link');
    const toast = document.getElementById('copy-toast');
    let toastTimeout;

    contactLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            
            // Check if the user is using a fine pointer (mouse/trackpad on desktop)
            const isDesktop = window.matchMedia("(pointer: fine)").matches;

            if (isDesktop) {
                // Prevent the default action (don't try to make a call or open an email app)
                e.preventDefault();

                // Grab the data we want to copy
                const textToCopy = link.getAttribute('data-copy');
                
                // Copy to clipboard
                navigator.clipboard.writeText(textToCopy).then(() => {
                    // Show toast
                    toast.classList.remove('hidden');
                    clearTimeout(toastTimeout);
                    toastTimeout = setTimeout(() => {
                        toast.classList.add('hidden');
                    }, 2500);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            }
            // If it's NOT desktop (meaning it's a touchscreen), we do nothing here.
            // The browser will naturally follow the href="tel:..." or href="mailto:..."
        });
    });
});