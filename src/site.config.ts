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
    /** Toolbar rows — each inner array becomes one row of buttons */
    toolbarRows: ToolbarLink[][];
    weather: {
        enabled: boolean;
        lat: number;
        lon: number;
        /** weather.gov requires a User-Agent identifying the caller */
        userAgent: string;
    };
    search: {
        enabled: boolean;
        /** Where the search form submits to, with ?q=... appended */
        path: string;
    };
}

export const site: SiteConfig = {
    siteName: "carlcarlcarl.com",
    titleSuffix: "carlcarlcarl.com",

    toolbarRows: [
        [
            { href: "/projects", label: "Projects", icon: "folder", iconSize: "large" },
            { href: "https://github.com/YOUR_USERNAME", label: "GitHub", icon: "github", external: true },
            { href: "https://www.linkedin.com/in/YOUR_USERNAME", label: "LinkedIn", icon: "linkedin", external: true },
            { href: "/contact", label: "Contact", icon: "mail" },
        ],
        [
            { href: "/apollo-interface", label: "Apollo Interface", icon: "apollo", iconSize: "large" },
            { href: "/guestbook", label: "Guestbook", icon: "guestbook" },
            { href: "/about", label: "About", icon: "info" },
            { href: "/template", label: "Get the template!", icon: "template" },
        ],
    ],

    weather: {
        enabled: true,
        lat: 47.205,
        lon: -122.540,
        userAgent: "carlcarlcarl.com weather widget",
    },

    search: {
        enabled: true,
        path: "/search",
    },
};
