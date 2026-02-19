import axios from "axios";

export const deleteApiRouteHandler = async (url: string) => {
    const response = await axios.delete(url);
    return response.data?.data;
}

export const deleteHandler = async (url: string): Promise<unknown> => {
    const res = await fetch(url, {
        method: "DELETE",
    });

    if (!res.ok) {
        throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    return json?.data;
};
