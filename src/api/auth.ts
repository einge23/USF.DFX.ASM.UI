import { UserData } from "@/types/UserData";
import { api, setAuthTokenApi } from "./api-base";
import { useMutation } from "@tanstack/react-query";

export interface LoginRequest {
    scanner_message: string;
}

export interface LoginResponse {
    user: UserData;
    access_token: string;
}

export interface LoginError {
    status: number;
    message: string;
}

export const useLogin = () => {
    return useMutation({
        mutationFn: async (data: LoginRequest) => {
            try {
                const response = await api.post<LoginResponse>(
                    "/auth/login",
                    data
                );
                const { access_token, user } = response.data;

                if (access_token) {
                    setAuthTokenApi(access_token);
                }

                return { user, access_token };
            } catch (error: any) {
                if (error.response) {
                    switch (error.response.status) {
                        case 400:
                            throw new Error("Invalid scanner message");
                        case 401:
                            throw new Error(
                                "User does not exist. Please check your credentials."
                            );
                        case 403:
                            throw new Error(
                                "User has not completed required training."
                            );
                        default:
                            throw new Error(
                                `Server error: ${
                                    error.response.data?.message ||
                                    "Unknown error"
                                }`
                            );
                    }
                }
                throw new Error("Network error - Please check your connection");
            }
        },
    });
};
