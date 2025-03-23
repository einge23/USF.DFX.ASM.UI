import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TimeSettingsState } from "@/types/TimeSettings";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setTimeSettings } from "@/api/settings";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
    showErrorToast,
    showSuccessToast,
} from "@/components/common/CustomToaster";

type EditTimeSettingsModalProps = {
    open: boolean;
    onClose: () => void;
    timeSettings: TimeSettingsState;
    onSave: (updatedSettings: TimeSettingsState) => void;
};

export default function EditTimeSettingsModal({
    open,
    onClose,
    timeSettings,
    onSave,
}: EditTimeSettingsModalProps) {
    const [editedSettings, setEditedSettings] =
        useState<TimeSettingsState>(timeSettings);

    const queryClient = useQueryClient();
    const settingsMutation = useMutation({
        mutationFn: setTimeSettings,
        onSuccess: (data) => {
            showSuccessToast("Success", "Time settings updated successfully.");
            onSave(data);
            onClose();
        },
        onSettled: () => {
            // Force a complete refetch of time settings
            queryClient.invalidateQueries({
                queryKey: ["timeSettings"],
                refetchType: "all",
            });
        },
        onError: (error) => {
            showErrorToast("Error", "Failed to update time settings.");
            console.error("Error updating settings:", error);
        },
    });

    useEffect(() => {
        if (open) {
            setEditedSettings(timeSettings);
        }
    }, [open, timeSettings]);

    // Convert a decimal hour value to HH:MM format
    const decimalToTimeString = (decimal: number): string => {
        const hours = Math.floor(decimal);
        const minutes = Math.round((decimal - hours) * 60);
        // Only pad minutes with leading zeros, not hours
        return `${hours}:${minutes.toString().padStart(2, "0")}`;
    };

    // Convert HH:MM format to decimal hours
    const timeStringToDecimal = (timeString: string): number => {
        // Handle decimal strings (like "9.75")
        if (timeString.includes(".")) {
            return parseFloat(timeString);
        }

        // Handle HH:MM format
        if (timeString.includes(":")) {
            const [hours, minutes] = timeString
                .split(":")
                .map((part) => parseInt(part, 10));
            return hours + minutes / 60;
        }

        return parseFloat(timeString);
    };

    // Format a time value (decimal or HH:MM) to AM/PM time (like 8:30 AM)
    const formatTimeToAMPM = (time: string | number): string => {
        // Convert input to a numeric decimal value
        const timeValue =
            typeof time === "string" ? timeStringToDecimal(time) : time;

        if (isNaN(timeValue)) return "Invalid";

        // Extract hours and minutes
        const hours = Math.floor(timeValue);
        const minutes = Math.round((timeValue - hours) * 60);

        // Handle 12-hour format
        const period = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM

        // Format with leading zeros for minutes
        const displayMinutes = minutes.toString().padStart(2, "0");

        return `${displayHours}:${displayMinutes} ${period}`;
    };

    const updateHourValue = (path: string[], increment: boolean) => {
        setEditedSettings((prev) => {
            const newSettings = JSON.parse(JSON.stringify(prev));
            let target = newSettings;

            for (let i = 0; i < path.length - 1; i++) {
                target = target[path[i]];
            }

            const lastKey = path[path.length - 1];
            target[lastKey] = Math.max(
                0,
                target[lastKey] + (increment ? 1 : -1)
            );

            return newSettings;
        });
    };

    const updateTimeValue = (path: string[], increment: boolean) => {
        setEditedSettings((prev) => {
            const newSettings = JSON.parse(JSON.stringify(prev));
            let target = newSettings;

            for (let i = 0; i < path.length - 1; i++) {
                target = target[path[i]];
            }

            const lastKey = path[path.length - 1];

            // Convert current value to decimal for calculation
            const currentValue = timeStringToDecimal(target[lastKey]);

            // Handle NaN case
            const validCurrentValue = isNaN(currentValue) ? 0 : currentValue;

            // Increment/decrement by 0.25 (15 minutes)
            let newValue = validCurrentValue + (increment ? 0.25 : -0.25);

            // Ensure value wraps between 0-23.75
            if (newValue < 0) newValue = 23.75;
            if (newValue >= 24) newValue = 0;

            // Store as HH:MM string
            target[lastKey] = decimalToTimeString(newValue);

            return newSettings;
        });
    };

    const handleSave = () => {
        // Make sure all time values are in the correct format before saving
        const formattedSettings = JSON.parse(JSON.stringify(editedSettings));

        // Convert day_start and night_start to HH:MM format
        if (typeof formattedSettings.time_settings.day_start === "string") {
            const decimalValue = timeStringToDecimal(
                formattedSettings.time_settings.day_start
            );
            formattedSettings.time_settings.day_start =
                decimalToTimeString(decimalValue);
        }

        if (typeof formattedSettings.time_settings.night_start === "string") {
            const decimalValue = timeStringToDecimal(
                formattedSettings.time_settings.night_start
            );
            formattedSettings.time_settings.night_start =
                decimalToTimeString(decimalValue);
        }

        // Trigger the mutation with the formatted settings
        settingsMutation.mutate(formattedSettings);
    };

    // Compact control component
    const ValueControl = ({
        label,
        value,
        onIncrement,
        onDecrement,
        isTime = false,
    }) => (
        <div className="bg-gray-800 p-2 rounded flex items-center justify-between">
            <div className="flex-1">
                <p className="text-gray-300 text-sm font-medium">{label}</p>
                <p className="text-white text-lg font-semibold font-mono min-w-[90px] w-full">
                    {isTime ? formatTimeToAMPM(value) : value}
                </p>
            </div>
            <div className="flex flex-col items-center ">
                <button
                    onClick={onIncrement}
                    className="flex items-center justify-center p-1 bg-green-600 w-[60px] h-[40px] text-white rounded-t-md hover:bg-green-700 focus:outline-none"
                >
                    <ChevronUp size={18} />
                </button>
                <button
                    onClick={onDecrement}
                    className="flex items-center justify-center p-1 bg-green-600 w-[60px] h-[40px] text-white rounded-b-md hover:bg-green-700 focus:outline-none"
                >
                    <ChevronDown size={18} />
                </button>
            </div>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl w-[700px] bg-gray-800 p-4">
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Weekday Settings Card */}
                        <div className="bg-gray-700 p-3 rounded-lg shadow-md">
                            <h4 className="text-base font-bold text-white border-b border-gray-600 pb-1 mb-2">
                                Weekday Settings
                            </h4>
                            <div className="space-y-2">
                                <ValueControl
                                    label="Day Max Hours"
                                    value={
                                        editedSettings.time_settings
                                            .weekday_print_time
                                            .day_max_print_hours
                                    }
                                    onIncrement={() =>
                                        updateHourValue(
                                            [
                                                "time_settings",
                                                "weekday_print_time",
                                                "day_max_print_hours",
                                            ],
                                            true
                                        )
                                    }
                                    onDecrement={() =>
                                        updateHourValue(
                                            [
                                                "time_settings",
                                                "weekday_print_time",
                                                "day_max_print_hours",
                                            ],
                                            false
                                        )
                                    }
                                />

                                <ValueControl
                                    label="Night Max Hours"
                                    value={
                                        editedSettings.time_settings
                                            .weekday_print_time
                                            .night_max_print_hours
                                    }
                                    onIncrement={() =>
                                        updateHourValue(
                                            [
                                                "time_settings",
                                                "weekday_print_time",
                                                "night_max_print_hours",
                                            ],
                                            true
                                        )
                                    }
                                    onDecrement={() =>
                                        updateHourValue(
                                            [
                                                "time_settings",
                                                "weekday_print_time",
                                                "night_max_print_hours",
                                            ],
                                            false
                                        )
                                    }
                                />
                            </div>
                        </div>

                        {/* Weekend Settings Card */}
                        <div className="bg-gray-700 p-3 rounded-lg shadow-md">
                            <h4 className="text-base font-bold text-white border-b border-gray-600 pb-1 mb-2">
                                Weekend Settings
                            </h4>
                            <div className="space-y-2">
                                <ValueControl
                                    label="Day Max Hours"
                                    value={
                                        editedSettings.time_settings
                                            .weekend_print_time
                                            .day_max_print_hours
                                    }
                                    onIncrement={() =>
                                        updateHourValue(
                                            [
                                                "time_settings",
                                                "weekend_print_time",
                                                "day_max_print_hours",
                                            ],
                                            true
                                        )
                                    }
                                    onDecrement={() =>
                                        updateHourValue(
                                            [
                                                "time_settings",
                                                "weekend_print_time",
                                                "day_max_print_hours",
                                            ],
                                            false
                                        )
                                    }
                                />

                                <ValueControl
                                    label="Night Max Hours"
                                    value={
                                        editedSettings.time_settings
                                            .weekend_print_time
                                            .night_max_print_hours
                                    }
                                    onIncrement={() =>
                                        updateHourValue(
                                            [
                                                "time_settings",
                                                "weekend_print_time",
                                                "night_max_print_hours",
                                            ],
                                            true
                                        )
                                    }
                                    onDecrement={() =>
                                        updateHourValue(
                                            [
                                                "time_settings",
                                                "weekend_print_time",
                                                "night_max_print_hours",
                                            ],
                                            false
                                        )
                                    }
                                />
                            </div>
                        </div>

                        {/* Weekly Hours */}
                        <div className="bg-gray-700 p-3 rounded-lg shadow-md">
                            <h4 className="text-base font-bold text-white border-b border-gray-600 pb-1 mb-2">
                                Weekly Hours
                            </h4>
                            <ValueControl
                                label="Hours"
                                value={
                                    editedSettings.time_settings
                                        .default_user_weekly_hours
                                }
                                onIncrement={() =>
                                    updateHourValue(
                                        [
                                            "time_settings",
                                            "default_user_weekly_hours",
                                        ],
                                        true
                                    )
                                }
                                onDecrement={() =>
                                    updateHourValue(
                                        [
                                            "time_settings",
                                            "default_user_weekly_hours",
                                        ],
                                        false
                                    )
                                }
                            />
                        </div>
                    </div>

                    {/* Day/Night Times */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-gray-700 p-3 rounded-lg shadow-md">
                            <h4 className="text-base font-bold text-white border-b border-gray-600 pb-1 mb-2">
                                Day Start
                            </h4>
                            <ValueControl
                                label="Time"
                                value={editedSettings.time_settings.day_start}
                                onIncrement={() =>
                                    updateTimeValue(
                                        ["time_settings", "day_start"],
                                        true
                                    )
                                }
                                onDecrement={() =>
                                    updateTimeValue(
                                        ["time_settings", "day_start"],
                                        false
                                    )
                                }
                                isTime={true}
                            />
                        </div>

                        <div className="bg-gray-700 p-3 rounded-lg shadow-md">
                            <h4 className="text-base font-bold text-white border-b border-gray-600 pb-1 mb-2">
                                Night Start
                            </h4>
                            <ValueControl
                                label="Time"
                                value={editedSettings.time_settings.night_start}
                                onIncrement={() =>
                                    updateTimeValue(
                                        ["time_settings", "night_start"],
                                        true
                                    )
                                }
                                onDecrement={() =>
                                    updateTimeValue(
                                        ["time_settings", "night_start"],
                                        false
                                    )
                                }
                                isTime={true}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 text-white text-base font-medium rounded-md hover:bg-gray-500 focus:outline-none"
                            disabled={settingsMutation.isPending}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-green-600 text-white text-base font-medium rounded-md hover:bg-green-700 focus:outline-none flex items-center justify-center min-w-[80px]"
                            disabled={settingsMutation.isPending}
                        >
                            {settingsMutation.isPending ? (
                                <>
                                    <Loader2
                                        size={18}
                                        className="animate-spin mr-2"
                                    />
                                    Saving...
                                </>
                            ) : (
                                "Save"
                            )}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
