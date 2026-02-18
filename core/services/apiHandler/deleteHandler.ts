import axios from "axios";

export const deleteProtectedHandler = async (url: string) => {
    const response = await axios.delete(url);
    return response.data?.data;
}