import { authClient } from '@/core/lib/apiClient';
import axios from 'axios';
export const mutateApiRouteHandler = async <T>(url: string, payload: T) => {
    const response = await axios.post(url, payload, { withCredentials: true });
    return response?.data?.data
}

export const updateApiRouteHandler = async<T>(url: string, payload: T) => {
    const response = await axios.put(url, payload, { withCredentials: true });
    return response?.data?.data
}

export const mutateHandler = async <T = unknown>(
    url: string,
    payload: T
): Promise<unknown> => {
    const res = await authClient.post(url, payload)

    if (!res.ok) {
        throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    return json?.data;
};

export const updateHandler = async <T = unknown>(
    url: string,
    payload: T
): Promise<unknown> => {
    const res = await authClient.patch(url, payload);

    if (!res.ok) {
        throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    return json?.data;
};

