import { UserData } from "@/types/UserData";
import { api, setAuthTokenApi } from "./api-base";
import { useMutation } from "@tanstack/react-query";
import { setBanTime } from "./admin";
import { showErrorToast } from "@/components/common/CustomToaster";

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
                if (user.ban_time_end) {
                    const banTimestamp =
                        typeof user.ban_time_end === "string"
                            ? new Date(user.ban_time_end).getTime()
                            : user.ban_time_end instanceof Date
                            ? user.ban_time_end.getTime()
                            : user.ban_time_end;

                    if (Date.now() < banTimestamp) {
                        showErrorToast(
                            "Banned",
                            `User is banned until ${new Date(
                                user.ban_time_end
                            ).toLocaleString()}`
                        );
                        throw new Error(
                            `User is banned until ${new Date(
                                user.ban_time_end
                            ).toLocaleString()}`
                        );
                    } else {
                        setBanTime(user.id, -1);
                    }
                }

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
                            showErrorToast(
                                "Error",
                                "Invalid card swipe. Please try again."
                            );
                            throw new Error(
                                "Invalid card swipe. Please try again."
                            );
                        case 401:
                            showErrorToast(
                                "Error",
                                "Card not authorized. Please check with an administrator."
                            );
                            throw new Error(
                                "Card not recognized. Please check with an administrator."
                            );
                        case 403:
                            showErrorToast(
                                "Error",
                                "Access denied. Required training not completed."
                            );
                            throw new Error(
                                "Access denied. Required training not completed."
                            );
                        case 404:
                            showErrorToast(
                                "Error",
                                "User not found. Please contact an administrator."
                            );
                            throw new Error(
                                "User not found. Please contact an administrator."
                            );
                        case 429:
                            showErrorToast(
                                "Error",
                                "Too many attempts. Please wait a moment and try again."
                            );
                            throw new Error(
                                "Too many attempts. Please wait a moment and try again."
                            );
                        case 500:
                            showErrorToast(
                                "Server Error",
                                "Server error. Please try again later."
                            );
                            throw new Error(
                                "Server error. Please try again later."
                            );
                        default:
                            showErrorToast(
                                "Server Error",
                                "Server error. Please try again later."
                            );
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
            }
        },
    });
};
