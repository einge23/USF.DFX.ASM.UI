import { UserData } from "@/types/UserData";
import { api } from "./api-base";
import { useMutation } from "@tanstack/react-query";

export interface LoginRequest {
    scanner_message: string;
}

export interface LoginError {
    status: number;
    message: string;
}

export const useLogin = () => {
    return useMutation({
        mutationFn: async (data: LoginRequest) => {
            try {
                const response = await api.post<UserData>("/auth/login", data);
                return response.data;
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
