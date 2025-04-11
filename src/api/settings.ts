import { TimeSettings } from "@/types/TimeSettings";
import { api } from "./api-base";

export async function getTimeSettings(): Promise<TimeSettings> {
    const response = await api.get<TimeSettings>(`/settings/getTimeSettings`);
    return response.data;
}

export async function setTimeSettings(
    settings: TimeSettings
): Promise<TimeSettings> {
    const response = await api.put<TimeSettings>(
        `/admin/settings/setTimeSettings`,
        { time_settings: settings }
    );
    return response.data;
}
