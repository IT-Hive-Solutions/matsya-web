const API_BASE = "/api/proxy";

let isRefreshing = false;

let refreshQueue: Array<{
    resolve: () => void;
    reject: (err: Error) => void;
}> = [];

function drainQueue(success: boolean) {
    const error = new Error("Session expired");
    refreshQueue.forEach(({ resolve, reject }) =>
        success ? resolve() : reject(error)
    );
    refreshQueue = [];
}

async function refreshTokens(): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
            method: "POST",
            credentials: "same-origin",
        });


        return res.ok;
    } catch {
        return false;
    }
}

function redirectToLogin() {
    if (typeof window !== "undefined") {
        window.location.href = "/auth/login?reason=session_expired";
    }
}

export async function apiFetch(
    path: string,
    options?: RequestInit
): Promise<Response> {
    const res = await fetch(`${API_BASE}/${path}`, {
        ...options,
        credentials: "same-origin",
    });
    console.log("response statis---------", res.status);

    // Request succeeded — return as-is
    if (res.status !== 401 && res.status !== 500) return res;

    //  Got a 401 — attempt token refresh, but only one refresh at a time
    if (isRefreshing) {
        // Another request is already refreshing — queue this one
        return new Promise<Response>((resolve, reject) => {
            refreshQueue.push({
                resolve: () =>
                    apiFetch(path, options).then(resolve).catch(reject),
                reject,
            });
        });
    }


    isRefreshing = true;

    const refreshed = await refreshTokens();
    isRefreshing = false;

    if (!refreshed) {
        drainQueue(false);
        redirectToLogin();
        throw new Error("Session expired");
    }

    drainQueue(true);

    return apiFetch(path, options);
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

    get: (path: string, options?: RequestInit) => apiFetch(path, options),
    post: (path: string, body: unknown) =>
        apiFetch(path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }),
    patch: (path: string, body: unknown) =>
        apiFetch(path, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }),

    delete: (path: string) => apiFetch(path, { method: "DELETE" }),
};