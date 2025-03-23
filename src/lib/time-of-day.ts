import { TimeSettings } from "@/types/TimeSettings";

export type TimeOfDay = "day" | "night";

export const getTimeOfDay = (timeSettings: TimeSettings): TimeOfDay => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [dayStartHour, dayStartMinute] = timeSettings.day_start
        .split(":")
        .map(Number);
    const [nightStartHour, nightStartMinute] = timeSettings.night_start
        .split(":")
        .map(Number);

    const dayStartMinutes = dayStartHour * 60 + dayStartMinute;
    const nightStartMinutes = nightStartHour * 60 + nightStartMinute;

    return currentMinutes >= dayStartMinutes &&
        currentMinutes < nightStartMinutes
        ? "day"
        : "night";
};
