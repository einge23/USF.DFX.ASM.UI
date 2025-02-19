import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Extend InternalAxiosRequestConfig to include _retry
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

// Store access token in memory
let inMemoryToken: string | null = null;

export const api = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Important for cookies
});

export const setAuthTokenApi = (token: string | null) => {
    if (token) {
        inMemoryToken = token;
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        inMemoryToken = null;
        delete api.defaults.headers.common["Authorization"];
    }
};

// Add response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as ExtendedAxiosRequestConfig;
        if (!originalRequest) return Promise.reject(error);

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Attempt to refresh using HttpOnly cookie
                const response = await axios.post<{ access_token: string }>(
                    `${api.defaults.baseURL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                const newAccessToken = response.data.access_token;
                setAuthTokenApi(newAccessToken);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                return axios(originalRequest);
            } catch (refreshError) {
                setAuthTokenApi(null);
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

api.interceptors.request.use(
    (config) => {
        if (inMemoryToken) {
            config.headers.Authorization = `Bearer ${inMemoryToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
