import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogOverlay,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "@/types/Printer";
import { Reservation } from "@/types/Reservation"; // Assuming Reservation type exists
import { Clock, User, Printer as PrinterIcon, XCircle } from "lucide-react";
import Countdown from "react-countdown";
import { format } from "date-fns";

interface ReservationDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    printer: Printer | null;
    reservation: Reservation | null;
    onOpenCancelConfirm: () => void; // Function to open the cancel confirmation modal
}

export function ReservationDetailsModal({
    isOpen,
    onClose,
    printer,
    reservation,
    onOpenCancelConfirm,
}: ReservationDetailsModalProps) {
    if (!printer || !reservation) return null;

    const timeStart = new Date(reservation.time_reserved);
    const timeComplete = new Date(reservation.time_complete);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogOverlay className="bg-black/80" />
            <DialogContent className="bg-gray-800 text-white p-6 rounded-lg shadow-xl max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Clock className="w-6 h-6 text-blue-400" />
                        Active Reservation Details
                    </DialogTitle>
                </DialogHeader>

                <DialogDescription className="mt-4 space-y-4 text-gray-300">
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-md">
                        <PrinterIcon className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">Printer:</span>
                        <strong className="text-white">
                            {printer.name}
                        </strong>{" "}
                        (ID: {printer.id})
                        <div
                            className="ml-auto w-5 h-5 rounded-full border border-gray-500"
                            style={{ backgroundColor: printer.color }}
                        />
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-md">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">Reserved By:</span>
                        <strong className="text-white">
                            {reservation.username}
                        </strong>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-md">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">Started:</span>
                        <strong className="text-white">
                            {format(timeStart, "PPpp")}
                        </strong>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-md">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">Ends:</span>
                        <strong className="text-white">
                            {format(timeComplete, "PPpp")}
                        </strong>
                    </div>
                    <div className="flex items-center justify-center gap-3 p-4 bg-gray-900 rounded-md text-center">
                        <span className="font-medium text-lg">
                            Time Remaining:
                        </span>
                        <Countdown
                            date={timeComplete}
                            renderer={({
                                hours,
                                minutes,
                                seconds,
                                completed,
                            }) => {
                                if (completed) {
                                    return (
                                        <span className="text-xl font-bold text-gray-400">
                                            Completed
                                        </span>
                                    );
                                }
                                return (
                                    <span className="text-2xl font-bold text-white tracking-wider">
                                        {hours.toString().padStart(2, "0")}:
                                        {minutes.toString().padStart(2, "0")}:
                                        {seconds.toString().padStart(2, "0")}
                                    </span>
                                );
                            }}
                        />
                    </div>
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
                        onClick={onOpenCancelConfirm}
                        variant="destructive"
                        className="flex-1 h-12 text-lg bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
                    >
                        <XCircle className="w-5 h-5" />
                        Cancel Reservation
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
