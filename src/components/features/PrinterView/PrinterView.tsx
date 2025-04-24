import { Printer } from "@/types/Printer";
import { PrinterBox } from "./PrinterBox";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ReservationModal } from "../Reservations/ReservationModal";
import { Reservation } from "@/types/Reservation";
import { useAuth } from "@/context/authContext";
import { showErrorToast } from "@/components/common/CustomToaster";

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
    const { userData: user } = useAuth();
    const [currentPage, setCurrentPage] = useState(0);

    // Group printers by rack
    const printersByRack = useMemo(() => {
        const grouped: { [key: string]: Printer[] } = {};
        printers.forEach((printer) => {
            const rackId = printer.rack;
            if (!grouped[rackId]) {
                grouped[rackId] = [];
            }
            grouped[rackId].push(printer);
        });

        // Convert to array of racks for pagination
        return Object.entries(grouped).map(([rackId, printers]) => ({
            rackId,
            printers,
        }));
    }, [printers]);

    const totalPages = printersByRack.length;
    const currentRack = printersByRack[currentPage] || {
        rackId: "",
        printers: [],
    };

    // Determine grid layout based on printer count
    const getGridColumns = (count: number) => {
        if (count <= 4) return "grid-cols-2"; // 2x2
        if (count <= 9) return "grid-cols-3"; // 3x3
        return "grid-cols-4"; // 4x4 for larger racks
    };

    const handlePrinterClick = (printer: Printer) => {
        if (printer.in_use) return;

        if (!user.has_executive_access && printer.is_executive) {
            showErrorToast(
                "Access Denied",
                "You do not have access to reserve this printer."
            );
            return;
        }

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

    const safeReservations = Array.isArray(reservations) ? reservations : [];

    return (
        <div className="flex flex-col h-full w-full overflow-y-hidden">
            <div className="flex-grow">
                <div
                    className={`grid ${getGridColumns(
                        currentRack.printers.length
                    )} gap-4 h-full`}
                >
                    {currentRack.printers.map((printer) => (
                        <PrinterBox
                            key={printer.id}
                            rackSize={currentRack.printers.length}
                            printer={printer}
                            reservation={safeReservations.find(
                                (res) => res.printer_id === printer.id
                            )}
                            onClick={() => handlePrinterClick(printer)}
                        />
                    ))}
                </div>
            </div>

            <div className="flex justify-center items-center space-x-2 mt-4 pb-4">
                <Button
                    variant="outline"
                    className="h-10 w-full justify-center bg-green-950"
                    onClick={() =>
                        setCurrentPage((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentPage === 0}
                >
                    <ChevronLeft className="!h-6 !w-6" />
                </Button>
                <span className="text-xl w-full font-semibold text-white text-center">
                    Rack {currentPage + 1} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    className="h-10 w-full justify-center bg-green-950"
                    onClick={() =>
                        setCurrentPage((prev) =>
                            Math.min(totalPages - 1, prev + 1)
                        )
                    }
                    disabled={currentPage === totalPages - 1}
                >
                    <ChevronRight className="!h-6 !w-6" />
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
