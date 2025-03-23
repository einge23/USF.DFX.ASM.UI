import { Button } from "@/components/ui/button";
import { useTimeSettings } from "@/contexts/TimeSettingsContext";
import { Edit } from "lucide-react";
import { useState } from "react";
import EditTimeSettingsModal from "./EditTimeSettingsModal";

// Helper function to format time to AM/PM
export const formatTimeToAMPM = (time) => {
    if (!time) return "N/A";

    // Handle different time formats
    if (typeof time === "string") {
        // Handle HH:MM format
        if (time.includes(":")) {
            const [hours, minutes] = time.split(":").map(Number);
            const period = hours >= 12 ? "PM" : "AM";
            const displayHours = hours % 12 || 12;
            return `${displayHours}:${minutes
                .toString()
                .padStart(2, "0")} ${period}`;
        }

        // Handle decimal format (like "9.75")
        if (time.includes(".")) {
            const decimal = parseFloat(time);
            const hours = Math.floor(decimal);
            const minutes = Math.round((decimal - hours) * 60);
            const period = hours >= 12 ? "PM" : "AM";
            const displayHours = hours % 12 || 12;
            return `${displayHours}:${minutes
                .toString()
                .padStart(2, "0")} ${period}`;
        }
    }

    // Fallback for other formats
    return time;
};

export function TimeSettingsManagement() {
    const { timeSettings, isLoading, error, refreshSettings } =
        useTimeSettings();
    const [editMode, setEditMode] = useState(false);

    const handleEdit = () => {
        setEditMode(true);
    };

    const handleSaveSettings = () => {
        setEditMode(false);
        refreshSettings();
    };

    return (
        <>
            <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <h2 className="text-xl font-bold text-white md:mb-0">
                        Time Settings Management
                    </h2>
                </div>
            </div>
            <div className="mt-4">
                {isLoading && (
                    <p className="text-blue-400">Loading time settings...</p>
                )}
                {error && (
                    <p className="text-red-400">Error: {error.message}</p>
                )}
                {timeSettings && (
                    <div className="space-y-6">
                        {/* Global Time Settings Card */}
                        <div className="bg-gray-700 p-5 rounded-lg shadow-md">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-800 p-3 rounded">
                                    <p className="text-gray-400 text-sm">
                                        Day Start Time
                                    </p>
                                    <p className="text-white text-lg font-medium">
                                        {formatTimeToAMPM(
                                            timeSettings.time_settings.day_start
                                        )}
                                    </p>
                                </div>
                                <div className="bg-gray-800 p-3 rounded">
                                    <p className="text-gray-400 text-sm">
                                        Night Start Time
                                    </p>
                                    <p className="text-white text-lg font-medium">
                                        {formatTimeToAMPM(
                                            timeSettings.time_settings
                                                .night_start
                                        )}
                                    </p>
                                </div>
                                <div className="bg-gray-800 p-3 rounded">
                                    <p className="text-gray-400 text-sm">
                                        Default Weekly Hours
                                    </p>
                                    <p className="text-white text-lg font-medium">
                                        {
                                            timeSettings.time_settings
                                                .default_user_weekly_hours
                                        }{" "}
                                        hours
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Weekday Settings Card */}
                            <div className="bg-gray-700 p-5 rounded-lg shadow-md">
                                <h4 className="text-lg font-semibold text-white border-b border-gray-600 pb-2 mb-4">
                                    Weekday Print Time Limits
                                </h4>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-800 p-3 rounded">
                                            <p className="text-gray-400 text-sm">
                                                Day Max Hours
                                            </p>
                                            <p className="text-white text-lg font-medium">
                                                {
                                                    timeSettings.time_settings
                                                        .weekday_print_time
                                                        .day_max_print_hours
                                                }{" "}
                                                hours
                                            </p>
                                        </div>
                                        <div className="bg-gray-800 p-3 rounded">
                                            <p className="text-gray-400 text-sm">
                                                Night Max Hours
                                            </p>
                                            <p className="text-white text-lg font-medium">
                                                {
                                                    timeSettings.time_settings
                                                        .weekday_print_time
                                                        .night_max_print_hours
                                                }{" "}
                                                hours
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Weekend Settings Card */}
                            <div className="bg-gray-700 p-5 rounded-lg shadow-md">
                                <h4 className="text-lg font-semibold text-white border-b border-gray-600 pb-2 mb-4">
                                    Weekend Print Time Limits
                                </h4>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-800 p-3 rounded">
                                            <p className="text-gray-400 text-sm">
                                                Day Max Hours
                                            </p>
                                            <p className="text-white text-lg font-medium">
                                                {
                                                    timeSettings.time_settings
                                                        .weekend_print_time
                                                        .day_max_print_hours
                                                }{" "}
                                                hours
                                            </p>
                                        </div>
                                        <div className="bg-gray-800 p-3 rounded">
                                            <p className="text-gray-400 text-sm">
                                                Night Max Hours
                                            </p>
                                            <p className="text-white text-lg font-medium">
                                                {
                                                    timeSettings.time_settings
                                                        .weekend_print_time
                                                        .night_max_print_hours
                                                }{" "}
                                                hours
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <Button
                                onClick={handleEdit}
                                className="w-auto px-8 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg flex items-center"
                            >
                                <Edit className="mr-2 h-5 w-5" />
                                Edit Time Settings
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            {editMode && (
                <EditTimeSettingsModal
                    open={editMode}
                    onClose={() => setEditMode(false)}
                    timeSettings={timeSettings}
                    onSave={handleSaveSettings}
                />
            )}
        </>
    );
}
