import axios from 'axios';
export const mutateHandler = async <T>(url: string, payload: T) => {
    const response = await axios.post(url, payload);
    return response?.data?.data
}

export const mutateProtectedHandler = async<T>(url: string, payload: T) => {
    const response = await axios.post(url, payload);
    return response?.data?.data
}
export const updateProtectedHandler = async<T>(url: string, payload: T) => {
    const response = await axios.patch(url, payload);
    return response?.data?.data
}

export const updateVerifyProtectedHandler = async (url: string) => {
    const response = await axios.patch(url, {});
    return response?.data?.data;
};

export const patchProtectedHandler = async<T>(url: string, payload: T) => {
    const response = await axios.patch(url, payload, );
    return response?.data?.data
}