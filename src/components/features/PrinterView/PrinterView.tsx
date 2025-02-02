import { Printer } from "@/types/Printer";

import { PrinterBox } from "./PrinterBox";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { reservePrinter } from "@/api/printers";
import { useAuth } from "@/context/authContext";
import { ReservationModal } from "../Reservations/ReservationModal";

interface PrinterViewProps {
    printers: Printer[];
}

export function PrinterView({ printers }: PrinterViewProps) {
    const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(
        null
    );
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [reservationTime, setReservationTime] = useState<number>(0);
    const reservePrinterMutation = reservePrinter();
    const auth = useAuth();
    const queryClient = useQueryClient();

    const handlePrinterClick = (printer: Printer) => {
        if (printer.in_use) return;
        setSelectedPrinter(printer);
        setModalOpen(true);
    };

    const handleAddTime = () => {
        reservationTime < 24 ? setReservationTime((prev) => prev + 1) : null;
    };

    const handleRemoveTime = () => {
        reservationTime > 0 ? setReservationTime((prev) => prev - 1) : null;
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setSelectedPrinter(null);
        setReservationTime(0);
    };

    const handleReserve = async () => {
        if (!selectedPrinter || !auth.userData?.id) return;
        try {
            await reservePrinterMutation.mutateAsync({
                printer_id: selectedPrinter.id,
                user_id: auth.userData?.id,
                time_mins: reservationTime,
            });
            setSelectedPrinter(null);
            setReservationTime(0);
            await new Promise((resolve) => setTimeout(resolve, 50));
            await queryClient.invalidateQueries({ queryKey: ["printers"] });
        } catch (error) {
            console.error("Error reserving printer:", error);
        }
    };
    const [currentPage, setCurrentPage] = useState(0);
    const printersPerPage = 9;
    const totalPages = Math.ceil(printers.length / printersPerPage);
    const paginatedPrinters = printers.slice(
        currentPage * printersPerPage,
        (currentPage + 1) * printersPerPage
    );

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
                {paginatedPrinters.map((printer) => (
                    <PrinterBox
                        key={printer.id}
                        printer={printer}
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
                    onReserve={handleReserve}
                    printer={selectedPrinter}
                />
            )}
        </div>
    );
}
