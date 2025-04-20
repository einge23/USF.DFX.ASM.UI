import { useState, useMemo } from "react";
import { usePrinters } from "@/api/printers";
import {
    useAllActiveReservations,
    cancelActiveReservation as apiCancelReservation,
} from "@/api/reservations"; // Import reservation hook and cancel function
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@chakra-ui/react";
import { PrinterBox } from "@/components/features/PrinterView/PrinterBox";
import { Printer } from "@/types/Printer";
import { Reservation } from "@/types/Reservation";
import { ReservationDetailsModal } from "./Reservations/ReservationDetailsModal"; // Import new modal
import { CancelReservationModal } from "./Reservations/CancelReservationModal"; // Import new modal
import {
    showErrorToast,
    showSuccessToast,
} from "@/components/common/CustomToaster";
import { Button } from "@/components/ui/button"; // Import Button
import { ChevronLeft, ChevronRight } from "lucide-react"; // Import pagination icons

export function ReservationsManagement() {
    const queryClient = useQueryClient();

    // Fetch printers and active reservations
    const {
        data: printers,
        isLoading: isLoadingPrinters,
        error: printersError,
    } = usePrinters();
    const {
        data: activeReservations,
        isLoading: isLoadingReservations,
        error: reservationsError,
    } = useAllActiveReservations();

    // State for modals and selected items
    const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(
        null
    );
    const [selectedReservation, setSelectedReservation] =
        useState<Reservation | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isCancelConfirmModalOpen, setIsCancelConfirmModalOpen] =
        useState(false);
    const [currentPage, setCurrentPage] = useState(0); // State for pagination

    // --- Cancel Reservation Mutation ---
    const cancelReservationMutation = useMutation({
        mutationFn: (reservationId: number) =>
            apiCancelReservation({
                reservation_id: reservationId,
                printer_id: selectedPrinter?.id,
            }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["printers"] });
            queryClient.invalidateQueries({
                queryKey: ["allActiveReservations"],
            });
            queryClient.invalidateQueries({
                queryKey: ["reservations", "history"],
            });
            showSuccessToast(
                "Reservation Cancelled",
                `Reservation cancelled successfully.`
            );
            // Close both modals
            setIsCancelConfirmModalOpen(false);
            setIsDetailsModalOpen(false);
            setSelectedPrinter(null);
            setSelectedReservation(null);
        },
        onError: (error: any) => {
            showErrorToast(
                "Cancellation Failed",
                `Failed to cancel reservation. ${
                    error.message || "Unknown error"
                }`
            );
            // Keep modals open for user context or close confirmation? Let's close confirm.
            setIsCancelConfirmModalOpen(false);
        },
    });

    // Group printers by rack (similar to PrintersManagement)
    const printersByRack = useMemo(() => {
        if (!printers) return [];
        const grouped: { [key: string]: Printer[] } = {};
        printers.forEach((printer) => {
            const rackId = printer.rack;
            if (!grouped[rackId]) {
                grouped[rackId] = [];
            }
            // Sort printers within the rack by their position
            grouped[rackId].push(printer);
            grouped[rackId].sort((a, b) => a.rack_position - b.rack_position);
        });

        // Convert to array of racks for pagination, sorted by rack ID
        return Object.entries(grouped)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([rackId, printers]) => ({
                rackId,
                printers,
            }));
    }, [printers]);

    // Pagination logic
    const totalPages = printersByRack.length;
    const currentRack = printersByRack[currentPage] || {
        rackId: "",
        printers: [],
    };

    // Efficiently map reservations to printer IDs
    const reservationMap = useMemo(() => {
        const map = new Map<number, Reservation>();
        if (activeReservations) {
            activeReservations.forEach((res) => map.set(res.printer_id, res));
        }
        return map;
    }, [activeReservations]);

    // Handle clicking on a printer box
    const handlePrinterClick = (printer: Printer) => {
        if (printer.in_use) {
            const reservation = reservationMap.get(printer.id);
            if (reservation) {
                setSelectedPrinter(printer);
                setSelectedReservation(reservation);
                setIsDetailsModalOpen(true);
            } else {
                // Should ideally not happen if printer.in_use is true, but handle defensively
                console.warn(
                    `Printer ${printer.id} is in use but no active reservation found.`
                );
                showErrorToast(
                    "Data Mismatch",
                    `Could not find active reservation details for printer ${printer.name}.`
                );
            }
        }
        // Do nothing if printer is not in use in this view
    };

    // --- Modal Control Functions ---
    const closeDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedPrinter(null);
        setSelectedReservation(null);
    };

    const openCancelConfirmModal = () => {
        // Details modal should already be open with selected items
        if (selectedPrinter && selectedReservation) {
            setIsCancelConfirmModalOpen(true);
        }
    };

    const closeCancelConfirmModal = () => {
        setIsCancelConfirmModalOpen(false);
        // Keep details modal open unless cancel is confirmed
    };

    const handleConfirmCancel = () => {
        if (selectedReservation) {
            cancelReservationMutation.mutate(selectedReservation.id);
        }
    };

    // --- Loading and Error States ---
    const isLoading = isLoadingPrinters || isLoadingReservations;
    const error = printersError || reservationsError;

    if (isLoading)
        return (
            <div className="flex items-center justify-center h-full">
                <Spinner size="xl" />
            </div>
        );

    if (error)
        return (
            <div className="p-4 text-red-500">
                Error loading data: {error.message}
            </div>
        );

    // Determine grid layout based on printer count *in the current rack*
    const getGridColumns = (count: number) => {
        if (count <= 4) return "grid-cols-2";
        if (count <= 9) return "grid-cols-3";
        if (count <= 16) return "grid-cols-4";
        return "grid-cols-5"; // Adjust as needed
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header with Pagination Info */}
            <div className="p-4 mb-4 bg-gray-800 rounded-lg">
                <h2 className="text-2xl font-bold text-white">
                    Active Reservations - Rack {currentRack.rackId} (
                    {currentPage + 1} of {totalPages})
                </h2>
            </div>

            {/* Main Content Area with Pagination Controls */}
            <div
                className="flex-grow flex items-center justify-center"
                style={{ minHeight: 0 }} // Prevent flex-grow from expanding beyond viewport height
            >
                {/* Previous Button */}
                <Button
                    variant="outline"
                    size="lg" // Make button larger
                    onClick={() =>
                        setCurrentPage((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentPage === 0}
                    className="mr-4 p-4 h-auto" // Adjust padding and height
                >
                    <ChevronRight className="w-6 h-6" />
                </Button>

                {/* Printer Grid for Current Rack */}
                <div
                    className={`flex-1 grid ${getGridColumns(
                        currentRack.printers.length // Use current rack's printer count
                    )} gap-4 h-[calc(100vh-200px)] overflow-y-auto p-1 items-stretch`} // Added overflow-y-auto
                >
                    {currentRack.printers.map((printer) => (
                        <PrinterBox
                            key={printer.id}
                            printer={printer}
                            rackSize={currentRack.printers.length} // Pass current rack size
                            reservation={reservationMap.get(printer.id)}
                            onClick={() => handlePrinterClick(printer)}
                            dimIfNotReserved={true} // Enable dimming
                        />
                    ))}
                </div>

                {/* Next Button */}
                <Button
                    variant="outline"
                    size="lg" // Make button larger
                    onClick={() =>
                        setCurrentPage((prev) =>
                            Math.min(totalPages - 1, prev + 1)
                        )
                    }
                    disabled={currentPage === totalPages - 1}
                    className="ml-4 p-4 h-auto" // Adjust padding and height
                >
                    <ChevronRight className="w-6 h-6" />
                </Button>
            </div>

            {/* Modals */}
            <ReservationDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={closeDetailsModal}
                printer={selectedPrinter}
                reservation={selectedReservation}
                onOpenCancelConfirm={openCancelConfirmModal}
            />

            <CancelReservationModal
                isOpen={isCancelConfirmModalOpen}
                onClose={closeCancelConfirmModal}
                printer={selectedPrinter}
                reservation={selectedReservation}
                onConfirmCancel={handleConfirmCancel}
            />
        </div>
    );
}
