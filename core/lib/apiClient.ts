const API_BASE = "/api/proxy";

async function apiFetch(path: string, options?: RequestInit) {
    const res = await fetch(`${API_BASE}/${path}`, {
        ...options,
        credentials: "same-origin", // sends cookies automatically
    });

    if (res.status === 401) {
        // Token expired and refresh failed server-side → redirect to login
        if (typeof window !== "undefined") {
            window.location.href = "/auth/login?reason=session_expired";
        }
        throw new Error("Session expired");
    }

    return res;
}

export const authClient = {
    login: (email: string, password: string) =>
        fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            credentials: "same-origin",
        }),

    logout: () =>
        fetch("/api/auth/logout", {
            method: "POST",
            credentials: "same-origin",
        }),

    get: (path: string) => apiFetch(path),
    post: (path: string, body: unknown) =>
        apiFetch(path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }),
    put: (path: string, body: unknown) =>
        apiFetch(path, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }),

    delete: (path: string) => apiFetch(path, { method: "DELETE" }),
};