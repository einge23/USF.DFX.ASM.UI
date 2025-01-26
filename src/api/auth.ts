import { UserData } from "@/types/UserData";
import { api } from "./api-base";
import { useMutation } from "@tanstack/react-query";

export interface LoginRequest {
    scanner_message: string;
}

export const useLogin = () => {
    return useMutation({
        mutationFn: async (data: LoginRequest) => {
            const response = await api.post<UserData>("/auth/login", data);
            return response.data;
        },
    });
};
