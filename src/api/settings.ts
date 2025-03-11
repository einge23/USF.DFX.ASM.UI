import { TimeSettingsState } from "@/types/TimeSettings";
import { api } from "./api-base";

export async function getTimeSettings(): Promise<TimeSettingsState> {
    const response = await api.get<TimeSettingsState>(`/settings/getSettings`);
    return response.data;
}
