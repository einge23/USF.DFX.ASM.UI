import { TimeSettingsState } from "@/types/TimeSettings";
import { api } from "./api-base";

export async function getTimeSettings(): Promise<TimeSettingsState> {
    const response = await api.get<TimeSettingsState>(`/settings/getSettings`);
    return response.data;
}

export async function setTimeSettings(
    settings: TimeSettingsState
): Promise<TimeSettingsState> {
    const response = await api.put<TimeSettingsState>(
        `/admin/settings/setSettings`,
        settings
    );
    return response.data;
}
