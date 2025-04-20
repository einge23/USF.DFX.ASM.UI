import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogOverlay,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Printer } from "@/types/Printer";
import { AlertTriangle, Ban } from "lucide-react"; // Added Ban icon

interface DeletePrinterModalProps {
    isOpen: boolean;
    onClose: () => void;
    printer: Printer | null;
    onDelete: () => void;
}

export function DeletePrinterModal({
    isOpen,
    onClose,
    printer,
    onDelete,
}: DeletePrinterModalProps) {
    if (!printer) return null;

    const isPrinterActive = printer.in_use; // Check if the printer is active

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogOverlay className="bg-black/80" />
            <DialogContent className="bg-gray-800 text-white p-6 rounded-lg shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-red-500 flex items-center gap-2">
                        {/* Change icon and title if printer is active */}
                        {isPrinterActive ? (
                            <Ban className="w-6 h-6" />
                        ) : (
                            <AlertTriangle className="w-6 h-6" />
                        )}
                        {isPrinterActive
                            ? "Cannot Delete Active Printer"
                            : "Confirm Printer Deletion"}
                    </DialogTitle>
                </DialogHeader>

                <DialogDescription className="mt-4 space-y-3 text-gray-300">
                    {/* Show different message if printer is active */}
                    {isPrinterActive ? (
                        <p className="text-orange-400 font-semibold border border-orange-600 bg-orange-900/30 p-3 rounded-md">
                            Printer{" "}
                            <strong className="text-white">
                                {printer.name}
                            </strong>{" "}
                            (ID:{" "}
                            <strong className="text-white">{printer.id}</strong>
                            ) is currently in use and cannot be deleted. Please
                            wait until it is available.
                        </p>
                    ) : (
                        <>
                            <p className="text-yellow-400 font-semibold border border-yellow-600 bg-yellow-900/30 p-3 rounded-md">
                                Warning: Deleting a printer will also remove its
                                associated reservation history. This action
                                cannot be undone.
                            </p>
                            <p className="text-lg">
                                Are you sure you want to remove printer{" "}
                                <strong className="text-white">
                                    {printer.name}
                                </strong>{" "}
                                (ID:{" "}
                                <strong className="text-white">
                                    {printer.id}
                                </strong>
                                )?
                            </p>
                        </>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                        <span>Color:</span>
                        <div
                            className="w-4 h-4 rounded-full border border-gray-500"
                            style={{ backgroundColor: printer.color }}
                        />
                        <span>Rack: {printer.rack}</span>
                    </div>
                </DialogDescription>

                <div className="flex gap-4 mt-6">
                    <Button
                        type="button"
                        onClick={onClose}
                        variant="outline"
                        className="flex-1 h-12 text-lg bg-green-600 hover:bg-green-700 border-gray-600 hover:border-gray-700"
                    >
                        {/* Change Cancel button text if printer is active */}
                        {isPrinterActive ? "Close" : "Cancel"}
                    </Button>
                    {/* Conditionally render Delete button only if printer is not active */}
                    {!isPrinterActive && (
                        <Button
                            type="button"
                            onClick={onDelete}
                            variant="destructive"
                            className="flex-1 h-12 text-lg"
                            // Disable button if printer is active (redundant due to conditional rendering, but safe)
                            disabled={isPrinterActive}
                        >
                            Delete Printer
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
