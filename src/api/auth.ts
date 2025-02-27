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
                // Check if it's an axios error with a response
                if (error.response) {
                    const errorMessage = error.response.data?.message;

                    // If we have a specific error message from the server, use it
                    if (errorMessage) {
                        throw new Error(errorMessage);
                    }

                    // Otherwise, use our status-based messages
                    switch (error.response.status) {
                        case 400:
                            throw new Error(
                                "Invalid card swipe. Please try again."
                            );
                        case 401:
                            throw new Error(
                                "Card not recognized. Please check with an administrator."
                            );
                        case 403:
                            throw new Error(
                                "Access denied. Required training not completed."
                            );
                        case 404:
                            throw new Error(
                                "User not found. Please contact an administrator."
                            );
                        case 429:
                            throw new Error(
                                "Too many attempts. Please wait a moment and try again."
                            );
                        case 500:
                            throw new Error(
                                "Server error. Please try again later."
                            );
                        default:
                            throw new Error(
                                "An unexpected error occurred. Please try again."
                            );
                    }
                }

                // For network errors or other non-HTTP errors
                if (error.request) {
                    throw new Error(
                        "Network error - Please check your connection and try again."
                    );
                }

                // For everything else
                throw new Error(
                    "An unexpected error occurred. Please try again."
                );
            }
        },
    });
};
