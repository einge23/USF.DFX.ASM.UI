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

interface CancelReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    printer: Printer | null;
    reservation: Reservation | null;
    onConfirmCancel: () => void;
}

export function CancelReservationModal({
    isOpen,
    onClose,
    printer,
    reservation,
    onConfirmCancel,
}: CancelReservationModalProps) {
    if (!printer || !reservation) return null;

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
                        printer{" "}
                        <strong className="text-white">{printer.name}</strong>{" "}
                        (ID:{" "}
                        <strong className="text-white">{printer.id}</strong>)
                        made by user
                        <strong className="text-white">
                            {reservation.username}
                        </strong>
                        ?
                    </p>
                    <p className="text-yellow-400 text-base">
                        This action cannot be undone.
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
