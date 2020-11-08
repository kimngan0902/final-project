import Constants from "../appConstants.js";

const axiosClient = axios.create({
    baseURL: Constants.API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosClient.interceptors.response.use(
    function (response) {
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        return response.data;
    },
    function (error) {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        return Promise.reject(error);
    }
);

export default axiosClient;