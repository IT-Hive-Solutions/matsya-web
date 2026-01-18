import axios from "axios"


export interface SearchFilter {
    searchQuery?: string;
    fromDate?: string;
    toDate?: string;
}

export const fetchHandler = async (url: string) => {
    const response = await axios.get(url);
    return { data: response?.data?.data, meta: response?.data?.meta };
}
export const fetchProtectedHandler = async (url: string, filter?: SearchFilter) => {

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
    return { data: response?.data?.data, meta: response?.data?.meta };
}