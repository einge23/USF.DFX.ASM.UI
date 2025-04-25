import { Button } from "@/components/ui/button";
import { useTimeSettings } from "@/contexts/TimeSettingsContext";
import { Edit } from "lucide-react";
import { useState } from "react";
import EditTimeSettingsModal from "./EditTimeSettingsModal";
import { PrinterSettings } from "@/types/PrinterSettings";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setPrinterSettings } from "@/api/settings";
import {
    showErrorToast,
    showSuccessToast,
} from "@/components/common/CustomToaster";

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

interface SettingsManagementProps {
    printerSettings: PrinterSettings;
}

export function SettingsManagement({
    printerSettings,
}: SettingsManagementProps) {
    const queryClient = useQueryClient();
    const { timeSettings, isLoading, error, refreshSettings } =
        useTimeSettings();
    const [editMode, setEditMode] = useState(false);
    const maxActiveReservations = printerSettings.max_active_reservations;
    const [editMaxActive, setEditMaxActive] = useState(false);
    const [maxActiveInput, setMaxActiveInput] = useState(maxActiveReservations);
    const [isLoadingMax, setIsLoadingMax] = useState(false);
    const [maxError, setMaxError] = useState("");

    const { isPending, mutate: updateMaxActiveReservations } = useMutation({
        mutationFn: async (newMaxActive: number) => {
            setIsLoadingMax(true);
            try {
                const response = await setPrinterSettings(newMaxActive);
                if (response !== true) {
                    throw new Error("Failed to update max active reservations");
                }
            } catch (error) {
                setMaxError("Failed to update max active reservations");
            } finally {
                setIsLoadingMax(false);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["printerSettings"],
            });
            showSuccessToast(
                "Success!",
                "Max active reservations updated successfully!"
            );
        },
        onError: (error) => {
            showErrorToast(
                "Error",
                "Failed to update max active reservations. Please try again."
            );
            setMaxError("Failed to update max active reservations");
            console.error("Error updating max active reservations:", error);
        },
    });

    const handleMaxChange = (direction: "up" | "down") => {
        setMaxError("");
        setMaxActiveInput((prev) =>
            direction === "up" ? Math.min(9, prev + 1) : Math.max(1, prev - 1)
        );
    };
    const handleEdit = () => {
        setEditMode(true);
    };

    const handleSaveSettings = () => {
        setEditMode(false);
        refreshSettings();
    };

    const handleUpdateMaxActive = async () => {
        setMaxError("");
        if (maxActiveInput < 1 || maxActiveInput > 9) {
            setMaxError("Max active reservations must be between 1 and 9.");
            return;
        }
        await updateMaxActiveReservations(maxActiveInput);
        setEditMaxActive(false);
    };

    return (
        <div className="h-full">
            <div className="bg-gray-800 rounded-lg">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center p-4">
                    <h2 className="text-xl font-bold text-white md:mb-0">
                        Settings Management
                    </h2>
                    <div className="mt-4 md:mt-0  p-1 rounded-md flex  items-center space-x-4">
                        <p className="text-white font-medium">
                            Max Active Reservations: {maxActiveReservations}
                        </p>
                        <Button
                            onClick={() => setEditMaxActive(true)}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <Edit className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
            <div className="mt-4">
                {isLoading && (
                    <p className="text-green-400">Loading settings...</p>
                )}
                {error && (
                    <p className="text-red-400">Error: {error.message}</p>
                )}
                {timeSettings && (
                    <div className="space-y-4">
                        {/* Global Time Settings Card */}
                        <div className="p-5 bg-gray-700 rounded-lg shadow-md">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="p-3 bg-gray-800 rounded">
                                    <p className="text-sm text-gray-400">
                                        Day Start Time
                                    </p>
                                    <p className="text-lg font-medium text-white">
                                        {formatTimeToAMPM(
                                            timeSettings.day_start
                                        )}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-800 rounded">
                                    <p className="text-sm text-gray-400">
                                        Night Start Time
                                    </p>
                                    <p className="text-lg font-medium text-white">
                                        {formatTimeToAMPM(
                                            timeSettings.night_start
                                        )}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-800 rounded">
                                    <p className="text-sm text-gray-400">
                                        Default Weekly Hours
                                    </p>
                                    <p className="text-lg font-medium text-white">
                                        {timeSettings.default_user_weekly_hours}{" "}
                                        hours
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Weekday Settings Card */}
                            <div className="p-5 bg-gray-700 rounded-lg shadow-md">
                                <h4 className="pb-2 mb-4 text-lg font-semibold text-white border-b border-gray-600">
                                    Weekday Print Time Limits
                                </h4>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-gray-800 rounded">
                                            <p className="text-sm text-gray-400">
                                                Day Max Hours
                                            </p>
                                            <p className="text-lg font-medium text-white">
                                                {
                                                    timeSettings
                                                        .weekday_print_time
                                                        .day_max_print_hours
                                                }{" "}
                                                hours
                                            </p>
                                        </div>
                                        <div className="p-3 bg-gray-800 rounded">
                                            <p className="text-sm text-gray-400">
                                                Night Max Hours
                                            </p>
                                            <p className="text-lg font-medium text-white">
                                                {
                                                    timeSettings
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
                            <div className="p-5 bg-gray-700 rounded-lg shadow-md">
                                <h4 className="pb-2 mb-4 text-lg font-semibold text-white border-b border-gray-600">
                                    Weekend Print Time Limits
                                </h4>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-gray-800 rounded">
                                            <p className="text-sm text-gray-400">
                                                Day Max Hours
                                            </p>
                                            <p className="text-lg font-medium text-white">
                                                {
                                                    timeSettings
                                                        .weekend_print_time
                                                        .day_max_print_hours
                                                }{" "}
                                                hours
                                            </p>
                                        </div>
                                        <div className="p-3 bg-gray-800 rounded">
                                            <p className="text-sm text-gray-400">
                                                Night Max Hours
                                            </p>
                                            <p className="text-lg font-medium text-white">
                                                {
                                                    timeSettings
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
                                className="flex items-center w-auto px-8 py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
                            >
                                <Edit className="w-5 h-5 mr-2" />
                                Edit Time Settings
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            {editMode && timeSettings && (
                <EditTimeSettingsModal
                    open={editMode}
                    onClose={() => setEditMode(false)}
                    timeSettings={timeSettings}
                    onSave={handleSaveSettings}
                />
            )}
            {/* modal for editing max active reservations */}
            {editMaxActive && (
                <Dialog open={editMaxActive} onOpenChange={setEditMaxActive}>
                    <DialogContent className="bg-gray-800">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-bold text-center">
                                Edit Max Active Reservations
                            </DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center space-y-4">
                            <Label className="text-xl font-medium">Count</Label>
                            <div className="flex items-center space-x-4">
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    className="p-5 h-20 w-20"
                                    onClick={() => handleMaxChange("down")}
                                    disabled={
                                        isLoadingMax || maxActiveInput <= 1
                                    }
                                >
                                    <Minus className="!w-10 !h-10" />
                                </Button>
                                <div className="text-7xl font-bold w-28 text-center bg-gray-900 p-4 rounded">
                                    {maxActiveInput}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    className="p-5 h-20 w-20"
                                    onClick={() => handleMaxChange("up")}
                                    disabled={
                                        isLoadingMax || maxActiveInput >= 9
                                    }
                                >
                                    <Plus className="!w-10 !h-10" />
                                </Button>
                            </div>
                            {maxError && (
                                <em
                                    role="alert"
                                    className="text-red-500 text-lg"
                                >
                                    {maxError}
                                </em>
                            )}
                        </div>
                        <div className="flex gap-4 pt-6">
                            <Button
                                type="button"
                                onClick={() => setEditMaxActive(false)}
                                variant="outline"
                                className="flex-1 text-xl py-5 bg-gray-600 hover:bg-gray-700"
                                disabled={isLoadingMax}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleUpdateMaxActive}
                                className="flex-1 text-xl py-5 bg-green-600 hover:bg-green-700"
                                disabled={isLoadingMax}
                            >
                                {isLoadingMax ? (
                                    <Loader2 className="mr-2 h-7 w-7 animate-spin" />
                                ) : null}
                                {isLoadingMax ? "Loading..." : "Confirm"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
