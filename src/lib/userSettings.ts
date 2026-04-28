// Browser-only helpers for the per-visitor preferences saved by the Settings page.
// Persisted as a single JSON blob in localStorage so the schema can grow easily.

export interface UserSettings {
    zip?: string;
    timezone?: string;
    clockFormat?: "12h" | "24h";
    theme?: "light" | "dark";
}

const KEY = "retro-shell:settings";

export function loadSettings(): UserSettings {
    if (typeof localStorage === "undefined") return {};
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return {};
        return JSON.parse(raw) as UserSettings;
    } catch {
        return {};
    }
}

export function saveSettings(next: UserSettings): void {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(KEY, JSON.stringify(next));
}

export function clearSettings(): void {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(KEY);
}
