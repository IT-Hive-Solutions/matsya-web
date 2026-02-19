import { authClient } from "@/core/lib/apiClient";
import axios from "axios";

export const deleteApiRouteHandler = async (url: string) => {
    const response = await axios.delete(url);
    return response.data?.data;
}

export const deleteHandler = async (url: string): Promise<unknown> => {
    const res = await authClient.delete(url)

    if (!res.ok) {
        throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }

    // 204 No Content — Directus returns nothing on successful delete
    if (res.status === 204) return null;

    // Some Directus versions do return a body on delete
    const text = await res.text();
    if (!text) return null;

    const json = JSON.parse(text);
    return json?.data ?? null;

};
