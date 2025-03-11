import { useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Clock } from "lucide-react";
import { Printer } from "@/types/Printer";
import { reservePrinter } from "@/api/printers";
import { useAuth } from "@/context/authContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    showErrorToast,
    showSuccessToast,
} from "@/components/common/CustomToaster";

interface ReservationModalProps {
    printer: Printer;
    onClose: () => void;
    onReserve: () => void;
}

export function ReservationModal({
    printer,
    onClose,
    onReserve,
}: ReservationModalProps) {
    const [minutes, setMinutes] = useState(30);
    const { mutateAsync: reservePrinterMutation, isPending } = reservePrinter();
    const auth = useAuth();
    const queryClient = useQueryClient();

    // Calculate max time in hours (minimum of user's remaining time or 8 hours)
    const maxHours = useMemo(() => {
        const userMaxMinutes = auth.userData.weekly_minutes || 480;
        const userMaxHours = Math.floor(userMaxMinutes / 60);
        return Math.min(8, userMaxHours);
    }, [auth.userData.weekly_minutes]);

    // Convert slider value (in 15-min increments) to minutes
    const handleSliderChange = (value: number[]) => {
        // Each step is 15 minutes
        setMinutes(value[0] * 15);
    };

    const formatTimeDisplay = (mins: number): string => {
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;

        if (remainingMins === 0) {
            return `${hours} hour${hours !== 1 ? "s" : ""}`;
        } else {
            return `${hours} hour${
                hours !== 1 ? "s" : ""
            } ${remainingMins} min${remainingMins !== 1 ? "s" : ""}`;
        }
    };

    const handleReserve = async () => {
        if (!auth.userData?.id) return;
        try {
            await reservePrinterMutation({
                printer_id: printer.id,
                user_id: auth.userData.id,
                time_mins: minutes,
            });

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["printers"] }),
                queryClient.invalidateQueries({ queryKey: ["reservations"] }),
                queryClient.invalidateQueries({
                    queryKey: ["reservations", "history"],
                }),
            ]);

            showSuccessToast(
                "Success",
                `Successfully reserved ${printer.name} for ${formatTimeDisplay(
                    minutes
                )}`
            );
            onReserve();
        } catch (error) {
            console.error("Error reserving printer:", error);
            showErrorToast("Error", "Failed to reserve printer. Try again.");
        }
    };

    const getTimeRemaining = (time: number): string => {
        const hours = Math.floor(time / 60);
        const mins = time % 60;
        return `${hours} hours ${mins} mins`;
    };

    // Calculate current slider value from minutes (convert back to slider steps)
    const sliderValue = minutes / 15;

    // Calculate max steps (convert max hours to 15-min increments)
    const maxSteps = maxHours * 4;

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] sm:h-[400px] bg-gray-800 text-white flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-bold">
                        Reserve {printer.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 flex-grow">
                    <div className="text-2xl mb-6">
                        <span className="text-gray-400">
                            Weekly print time remaining:{" "}
                        </span>
                        <span className="text-green-400 font-medium">
                            {getTimeRemaining(
                                auth.userData.weekly_minutes - minutes
                            )}
                        </span>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <Clock className="w-8 h-8 text-green-400" />
                            <span className="font-medium text-green-400 text-2xl">
                                {formatTimeDisplay(minutes)}
                            </span>
                        </div>
                        <Slider
                            min={1}
                            max={maxSteps}
                            step={1}
                            value={[sliderValue]}
                            onValueChange={handleSliderChange}
                            className="[&_[role=slider]]:bg-green-400 [&_[role=slider]]:h-10 [&_[role=slider]]:w-10"
                        />
                    </div>
                </div>

                <DialogFooter className="mt-auto">
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="text-lg py-6 px-8 text-green-400 border-green-400 hover:bg-green-400 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-green-400"
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReserve}
                            className="text-lg py-6 px-8 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-600"
                            disabled={isPending}
                        >
                            {isPending ? "Reserving..." : "Reserve"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
