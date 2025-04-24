import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogOverlay,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Reservation } from "@/types/Reservation";
import { Printer } from "@/types/Printer";
import { AlertTriangle } from "lucide-react";
import { formatName } from "@/lib/format-name";

const formatDuration = (start: Date, end: Date): string => {
    const diffMs = end.getTime() - start.getTime();

    // If the difference is zero or negative, return 00:00:00
    if (diffMs <= 0) {
        return "00:00:00";
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

interface CancelReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservation: Reservation | null;
    printer: Printer | null;
    onConfirmCancel: () => void;
}

export function CancelReservationModal({
    isOpen,
    onClose,
    reservation,
    printer,
    onConfirmCancel,
}: CancelReservationModalProps) {
    // State to hold the countdown string
    const [countdown, setCountdown] = useState<string>("00:00:00");

    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        if (isOpen && reservation) {
            const reservationEndTime = new Date(reservation.time_complete);

            const updateCountdown = () => {
                const now = new Date();
                const durationText = formatDuration(now, reservationEndTime);
                setCountdown(durationText);

                // Stop the interval if the countdown reaches zero
                if (durationText === "00:00:00" && intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            };

            // Initial update
            updateCountdown();

            // Set up the interval only if the end time is in the future
            if (reservationEndTime.getTime() > Date.now()) {
                intervalId = setInterval(updateCountdown, 1000);
            }
        }

        // Cleanup function to clear the interval when the modal closes or component unmounts
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isOpen, reservation]); // Rerun effect if isOpen or reservation changes

    // Check for reservation only, as printer might be null if not found,
    // but we still might want to show the modal with just the ID.
    if (!reservation) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogOverlay className="bg-black/80" />
            <DialogContent className="bg-gray-800 text-white p-6 rounded-lg shadow-xl max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-red-500 flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6" />
                        Confirm Cancellation
                    </DialogTitle>
                </DialogHeader>

                <DialogDescription className="mt-4 space-y-3 text-gray-300 text-lg">
                    <p>
                        Are you sure you want to cancel the reservation for
                        {/* Conditionally display printer name or just ID */}
                        {printer ? (
                            <>
                                {" "}
                                printer{" "}
                                <strong className="text-white">
                                    {printer.name}
                                </strong>{" "}
                                (ID:{" "}
                                <strong className="text-white">
                                    {reservation.printer_id}
                                </strong>
                                )
                            </>
                        ) : (
                            <>
                                {" "}
                                printer ID{" "}
                                <strong className="text-white">
                                    {reservation.printer_id}
                                </strong>
                            </>
                        )}{" "}
                        (Reservation ID:{" "}
                        <strong className="text-white">{reservation.id}</strong>
                        )?
                    </p>
                    <p className="text-yellow-400 text-base">
                        This action cannot be undone.
                    </p>
                    <p className="text-yellow-400 text-sm">
                        {formatName(reservation.username)} will be refunded{" "}
                        <strong>{countdown}</strong> to their weekly hours.
                    </p>
                </DialogDescription>

                <div className="flex gap-4 mt-6">
                    <Button
                        type="button"
                        onClick={onClose}
                        variant="outline"
                        className="flex-1 h-12 text-lg bg-gray-600 hover:bg-gray-700 border-gray-600 hover:border-gray-700"
                    >
                        Back
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirmCancel}
                        variant="destructive"
                        className="flex-1 h-12 text-lg bg-red-600 hover:bg-red-700"
                    >
                        Cancel Reservation
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
