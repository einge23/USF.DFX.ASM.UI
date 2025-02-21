import { Printer } from "@/types/Printer";
import { PrinterBox } from "./PrinterBox";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ReservationModal } from "../Reservations/ReservationModal";
import { Reservation } from "@/types/Reservation";

interface PrinterViewProps {
    printers: Printer[];
    reservations: Reservation[] | undefined;
}

export function PrinterView({ printers, reservations }: PrinterViewProps) {
    const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(
        null
    );
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const queryClient = useQueryClient();

    const handlePrinterClick = (printer: Printer) => {
        if (printer.in_use) return;
        setSelectedPrinter(printer);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setSelectedPrinter(null);
    };

    const handleReservationComplete = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["printers"] }),
            queryClient.invalidateQueries({ queryKey: ["reservations"] }),
            queryClient.invalidateQueries({
                queryKey: ["reservations", "history"],
            }),
        ]);
        handleModalClose();
    };

    const [currentPage, setCurrentPage] = useState(0);
    const printersPerPage = 9;
    const totalPages = Math.ceil(printers.length / printersPerPage);
    const paginatedPrinters = printers.slice(
        currentPage * printersPerPage,
        (currentPage + 1) * printersPerPage
    );

    const safeReservations = Array.isArray(reservations) ? reservations : [];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
                {paginatedPrinters.map((printer) => (
                    <PrinterBox
                        key={printer.id}
                        printer={printer}
                        reservation={safeReservations.find(
                            (res) => res.printer_id === printer.id
                        )}
                        onClick={() => handlePrinterClick(printer)}
                    />
                ))}
            </div>
            <div className="flex justify-center items-center space-x-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                        setCurrentPage((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentPage === 0}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                    Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                        setCurrentPage((prev) =>
                            Math.min(totalPages - 1, prev + 1)
                        )
                    }
                    disabled={currentPage === totalPages - 1}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
            {selectedPrinter && modalOpen && (
                <ReservationModal
                    onClose={handleModalClose}
                    onReserve={handleReservationComplete}
                    printer={selectedPrinter}
                />
            )}
        </div>
    );
}
