import { api } from "./api-base";

export async function getUserWeeklyMinutes(userId: number): Promise<number> {
    const response = await api.get<number>(`/users/weeklyMinutes/${userId}`);
    return response.data;
}
