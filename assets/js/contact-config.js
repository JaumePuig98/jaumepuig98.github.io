/**
 * contact-config.js
 * Contact data used to generate the downloadable vCard (Save Contact button).
 * Note: this does NOT drive the visible business card markup in contact-me.html
 * (phone numbers, email, etc. are hardcoded there) — update both places if
 * contact details change.
 */

const CONTACT = {
    name: {
        first: "Jaume",
        last: "Puig",
        full: "Jaume Puig"
    },
    title: "Space Radiobiologist and Engineer",
    role: "PhD Researcher & CTO",
    org: "SNOLAB & Barding Industries",

    phones: [
        { number: "+12498799837", label: "Direct/CA", type: "voice" },
        { number: "+34628745714", label: "WhatsApp/ES", type: "voice" }
    ],

    email: "jaume.puig98@gmail.com",

    urls: {
        portfolio:  "https://jaumepuig98.github.io",
        contactCard: "https://jaumepuig98.github.io/contact-me.html",
        linkedin:   "https://linkedin.com/in/jaume-puig",
    },

    quote: "Space exploration begins within us.",
    note: "Space Radiobiologist and Engineer. PhD at SNOLAB. CTO at Barding Industries.",

};


/**
 * generateVCard()
 * Builds a vCard 4.0 string from the CONTACT object above.
 * Called on button click, no static .vcf file needed.
 */
function generateVCard() {
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const phones = CONTACT.phones
        .map(p => `TEL;VALUE=uri;PREF=1;TYPE="voice";X-ABLabel="${p.label}":tel:${p.number}`)
        .join('\r\n');

    const vcf = [
        'BEGIN:VCARD',
        'VERSION:4.0',
        `PRODID:-//Jaume Puig//Space Radiobiologist and Engineer//EN`,
        `N:${CONTACT.name.last};${CONTACT.name.first};;;`,
        `FN:${CONTACT.name.full}`,
        `ORG:${CONTACT.org}`,
        `TITLE:${CONTACT.title}`,
        `ROLE:${CONTACT.role}`,
        `PHOTO;ENCODING=b;TYPE=PNG:${typeof CONTACT_PHOTO !== 'undefined' ? CONTACT_PHOTO : ''}`,
        phones,
        `EMAIL;TYPE=PREF:${CONTACT.email}`,
        `URL;TYPE=Portfolio:${CONTACT.urls.portfolio}`,
        `URL;TYPE=LinkedIn:${CONTACT.urls.linkedin}`,
        `NOTE:${CONTACT.note}`,
        `REV:${now}`,
        'END:VCARD'
    ].join('\r\n');

    return vcf;
}

/**
 * downloadVCard()
 * Triggers a .vcf file download in the browser.
 * Attach to the "Save Contact" button.
 * The vCard photo is lazy-loaded from contact-photo.js on first use, so the
 * ~170KB base64 blob never loads unless someone actually clicks this button.
 */
function downloadVCard() {
    function buildAndDownload() {
        const vcf = generateVCard();
        const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'jaume-puig.vcf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    if (typeof CONTACT_PHOTO !== 'undefined') {
        buildAndDownload();
        return;
    }

    const script = document.createElement('script');
    script.src = 'assets/js/contact-photo.min.js';
    script.onload = buildAndDownload;
    script.onerror = buildAndDownload;
    document.body.appendChild(script);
}