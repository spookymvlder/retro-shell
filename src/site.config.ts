// Edit this file to customize your retro shell template.
// Everything user-facing — site name, links, weather location, toolbar
// contents — is configured here so the shell components stay generic.

export type IconSize = "small" | "medium" | "large";

export interface ToolbarLink {
    href: string;
    label: string;
    /** Icon filename (without extension) under /public/icons */
    icon: string;
    iconSize?: IconSize;
    /** Opens in a new tab with rel=noopener noreferrer */
    external?: boolean;
}

export interface SiteConfig {
    /** Shown in the address bar prefix and title bar (e.g. "yoursite.com") */
    siteName: string;
    /** Shown after the page title in <title>: "Home | siteName" */
    titleSuffix: string;
    /** Default description used in <meta> and Open Graph tags. Pages may override per-page. */
    description: string;
    /** Default Open Graph image, relative to /public. Recommended size: 1200x630. */
    ogImage: string;
    /** Toolbar rows — each inner array becomes one row of buttons */
    toolbarRows: ToolbarLink[][];
    weather: {
        enabled: boolean;
        lat: number;
        lon: number;
        /** weather.gov requires a User-Agent identifying the caller */
        userAgent: string;
        /** Country code for zippopotam.us zip-to-coords lookup ("us", "ca", "gb", ...) */
        zipCountry: string;
    };
    clock: {
        enabled: boolean;
        /** IANA timezone used when the visitor hasn't picked one in Settings */
        defaultTimezone: string;
        defaultFormat: "12h" | "24h";
        /** Options shown in the Settings page dropdown */
        timezoneOptions: { value: string; label: string }[];
    };
    settings: {
        enabled: boolean;
    };
    search: {
        enabled: boolean;
        /** Where the search form submits to, with ?q=... appended */
        path: string;
    };
    guestbook: {
        enabled: boolean;
        /** Per-IP rate limits enforced by the API endpoint */
        rateLimit: {
            /** Minimum seconds between posts from the same IP */
            minSecondsBetweenPosts: number;
            /** Max posts from the same IP within the rolling window */
            maxPostsPerWindow: number;
            /** Window length in seconds */
            windowSeconds: number;
        };
        /** Maximum length of a single entry's message field */
        maxMessageLength: number;
        /** Maximum length of the name field */
        maxNameLength: number;
        /** How many entries to show on the guestbook page */
        entriesPerPage: number;
    };
}

export const site: SiteConfig = {
    siteName: "yoursite.com",
    titleSuffix: "yoursite.com",
    description: "A personal website wrapped in a fake late-90s browser. Built with Retro Shell.",
    ogImage: "/og-image.png",

    toolbarRows: [
        [
            { href: "/projects", label: "Projects", icon: "folder", iconSize: "large" },
            { href: "https://github.com/YOUR_USERNAME", label: "GitHub", icon: "github", external: true },
            { href: "https://www.linkedin.com/in/YOUR_USERNAME", label: "LinkedIn", icon: "linkedin", external: true },
            { href: "/contact", label: "Contact", icon: "mail" },
        ],
        [
            { href: "/guestbook", label: "Guestbook", icon: "guestbook" },
            { href: "/about", label: "About", icon: "info" },
            { href: "/settings", label: "Settings", icon: "info" },
            { href: "https://github.com/spookymvlder/retro-shell", label: "Get Retro Shell!", icon: "template" },
        ],
    ],

    weather: {
        enabled: true,
        // Default lat/lon: Tacoma, WA. Replace with your own (or use Settings → zip).
        lat: 47.205,
        lon: -122.540,
        // weather.gov requires a contact string. Update this with your domain
        // and an email address before deploying — they'll block generic UAs.
        userAgent: "yoursite.com weather widget (contact@yoursite.com)",
        zipCountry: "us",
    },

    clock: {
        enabled: true,
        defaultTimezone: "America/Los_Angeles",
        defaultFormat: "12h",
        timezoneOptions: [
            { value: "America/Los_Angeles", label: "Pacific Time" },
            { value: "America/Denver", label: "Mountain Time" },
            { value: "America/Chicago", label: "Central Time" },
            { value: "America/New_York", label: "Eastern Time" },
            { value: "America/Anchorage", label: "Alaska Time" },
            { value: "Pacific/Honolulu", label: "Hawaii Time" },
            { value: "UTC", label: "UTC" },
            { value: "Europe/London", label: "London" },
            { value: "Europe/Paris", label: "Paris / Berlin" },
            { value: "Asia/Tokyo", label: "Tokyo" },
            { value: "Australia/Sydney", label: "Sydney" },
        ],
    },

    settings: {
        enabled: true,
    },

    search: {
        enabled: true,
        path: "/search",
    },

    guestbook: {
        enabled: true,
        rateLimit: {
            minSecondsBetweenPosts: 30,
            maxPostsPerWindow: 3,
            windowSeconds: 3600,
        },
        maxMessageLength: 1000,
        maxNameLength: 60,
        entriesPerPage: 50,
    },
};
