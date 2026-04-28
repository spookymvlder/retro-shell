import type { APIContext } from "astro";
import { site } from "../../site.config";

interface Env {
    DB: D1Database;
    TURNSTILE_SECRET: string;
    IP_HASH_SALT: string;
}

function getEnv(context: APIContext): Env {
    const runtime = (context.locals as { runtime?: { env: Env } }).runtime;
    if (!runtime) throw new Error("Cloudflare runtime not available");
    return runtime.env;
}

async function hashIp(ip: string, salt: string): Promise<string> {
    const data = new TextEncoder().encode(`${salt}:${ip}`);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

async function verifyTurnstile(token: string, secret: string, ip: string): Promise<boolean> {
    const body = new FormData();
    body.append("secret", secret);
    body.append("response", token);
    body.append("remoteip", ip);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body,
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
}

function jsonError(status: number, message: string) {
    return Response.json({ error: message }, { status });
}

export async function POST(context: APIContext) {
    if (!site.guestbook.enabled) return jsonError(404, "Guestbook is disabled.");

    const env = getEnv(context);
    const ip = context.request.headers.get("CF-Connecting-IP") ?? "0.0.0.0";

    let form: FormData;
    try {
        form = await context.request.formData();
    } catch {
        return jsonError(400, "Invalid form submission.");
    }

    const name = String(form.get("name") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const token = String(form.get("cf-turnstile-response") ?? "");

    if (!name) return jsonError(400, "Please enter a name.");
    if (!message) return jsonError(400, "Please enter a message.");
    if (name.length > site.guestbook.maxNameLength) {
        return jsonError(400, `Name must be ${site.guestbook.maxNameLength} characters or fewer.`);
    }
    if (message.length > site.guestbook.maxMessageLength) {
        return jsonError(400, `Message must be ${site.guestbook.maxMessageLength} characters or fewer.`);
    }
    if (!token) return jsonError(400, "Please complete the challenge.");

    const verified = await verifyTurnstile(token, env.TURNSTILE_SECRET, ip);
    if (!verified) return jsonError(403, "Challenge failed. Please try again.");

    const ipHash = await hashIp(ip, env.IP_HASH_SALT);
    const now = Math.floor(Date.now() / 1000);
    const { minSecondsBetweenPosts, maxPostsPerWindow, windowSeconds } = site.guestbook.rateLimit;

    // Burst check: any post from this IP within the last N seconds?
    const recentRow = await env.DB.prepare(
        "SELECT MAX(created_at) AS last FROM entries WHERE ip_hash = ?",
    )
        .bind(ipHash)
        .first<{ last: number | null }>();

    if (recentRow?.last && now - recentRow.last < minSecondsBetweenPosts) {
        return jsonError(429, "You're posting too fast. Please wait a moment.");
    }

    // Window check: too many posts within the rolling window?
    const countRow = await env.DB.prepare(
        "SELECT COUNT(*) AS n FROM entries WHERE ip_hash = ? AND created_at > ?",
    )
        .bind(ipHash, now - windowSeconds)
        .first<{ n: number }>();

    if ((countRow?.n ?? 0) >= maxPostsPerWindow) {
        return jsonError(429, "You've reached the posting limit for now. Try again later.");
    }

    await env.DB.prepare(
        "INSERT INTO entries (name, message, ip_hash, created_at) VALUES (?, ?, ?, ?)",
    )
        .bind(name, message, ipHash, now)
        .run();

    return Response.redirect(new URL("/guestbook", context.request.url).toString(), 303);
}
