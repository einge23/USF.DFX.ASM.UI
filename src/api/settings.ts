import { TimeSettings } from "@/types/TimeSettings";
import { api } from "./api-base";
import { PrinterSettings } from "@/types/PrinterSettings";

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

export async function getPrinterSettings(): Promise<PrinterSettings> {
    const response = await api.get<PrinterSettings>(
        `/admin/settings/getPrinterSettings`
    );
    return response.data;
}

export async function setPrinterSettings(
    max_active_reservations: number
): Promise<boolean> {
    const response = await api.put<boolean>(
        `/admin/settings/setPrinterSettings`,
        { max_active_reservations: max_active_reservations }
    );
    return response.data;
}
