import { UserData } from "@/types/UserData";
import { api } from "./api-base";

export async function getUserData(scannerMessage: string): Promise<UserData> {
    const response = await api.post<UserData>(`/admin/users/getUser`, {
        scanner_message: scannerMessage,
    });
    return response.data;
}
