import { UserData } from "@/types/UserData";
import { api } from "./api-base";

export async function getUserData(scannerMessage: string): Promise<UserData> {
    const response = await api.post<UserData>(`/admin/users/getUser`, {
        scanner_message: scannerMessage,
    });
    return response.data;
}

export async function createUser(
    scanner_message: string,
    trained: boolean,
    admin: boolean
): Promise<boolean> {
    try {
        const response = await api.post<{ success: boolean }>(
            "/admin/users/create",
            {
                scanner_message,
                trained,
                admin,
            }
        );
        return response.data.success;
    } catch (error) {
        console.error("Error creating user:", error);
        throw new Error("Failed to create user. Try again.");
    }
}

export async function setTrained(userId: number): Promise<boolean> {
    try {
        const response = await api.put<{ success: boolean }>(
            `/admin/users/setTrained/${userId}`
        );

        return response.data.success;
    } catch (error) {
        console.error("Error setting using trained status");
        throw new Error("Failed to update user trained status. Try again.");
    }
}

export async function setExecutiveAccess(userId: number): Promise<boolean> {
    try {
        const response = await api.put<{ success: boolean }>(
            `/admin/users/setExecutiveAccess/${userId}`
        );

        return response.data.success;
    } catch (error) {
        console.error("Error setting using executive status");
        throw new Error("Failed to update user executive status. Try again.");
    }
}
