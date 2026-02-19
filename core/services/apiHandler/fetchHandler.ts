import { authClient } from "@/core/lib/apiClient"
import axios from "axios";

export interface SearchFilter {
    searchQuery?: string;
    fromDate?: string;
    toDate?: string;
}

export interface FetchResult<T = any> {
    data: T;
    meta?: {
        total_count?: number;
        filter_count?: number;
    };
}


export const fetchHandler = async <T = any>(
    url: string,
    filter?: SearchFilter
): Promise<FetchResult<T>> => {
    // Build Directus filter query params
    const params = new URLSearchParams();

    if (filter?.searchQuery) {
        params.set("search", filter.searchQuery);
    }
    if (filter?.fromDate) {
        params.set("filter[date_created][_gte]", filter.fromDate);
    }
    if (filter?.toDate) {
        params.set("filter[date_created][_lte]", filter.toDate);
    }

    const queryString = params.toString();
    const fullPath = queryString ? `${url}?${queryString}` : url;

    const res = await authClient.get(fullPath);

    if (!res.ok) {
        throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    return { data: json?.data, meta: json?.meta };
};




export const fetchApiRouteHandler = async  <T = any>(url: string, filter?: SearchFilter): Promise<FetchResult<T>> => {

    let params: any = {
    }

    if (filter) {
        params = {
            ...params,
            ...filter
        };
    }

    const response = await axios.get(url, {
        params,
    });
    return { data: response?.data?.data?.data, meta: response?.data?.meta };
}
