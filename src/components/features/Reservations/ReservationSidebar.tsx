import { Button } from "@/components/ui/button";
import { Reservation } from "@/types/Reservation";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import Countdown from "react-countdown";
import { History, Trash2 } from "lucide-react";
import { useState } from "react";
import ReservationHistoryDrawer from "./ReservationHistoryDrawer";
import { cancelActiveReservation } from "@/api/reservations";
import { CancelReservationModal } from "@/components/features/Admin/Reservations/CancelReservationModal";
import { Printer } from "@/types/Printer";
import { formatName } from "@/lib/format-name";
import { useAuth } from "@/context/authContext";
interface ReservationSidebarProps {
    activeReservations?: Reservation[];
    reservedPrinters?: Printer[];
    reservationHistory?: Reservation[];
    userName: string;
}

export default function ReservationSidebar({
    activeReservations,
    reservedPrinters,
    reservationHistory,
    userName,
}: ReservationSidebarProps) {
    const queryClient = useQueryClient();
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [reservationToCancel, setReservationToCancel] =
        useState<Reservation | null>(null);
    // Add state for the printer corresponding to the reservation to cancel
    const [printerToCancel, setPrinterToCancel] = useState<Printer | null>(
        null
    );

    const { userData: user } = useAuth();

    const cancelMutation = useMutation({
        mutationFn: ({
            reservation_id,
            printer_id,
        }: {
            reservation_id: number;
            printer_id: number;
        }) => cancelActiveReservation({ reservation_id, printer_id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reservations"] });
            queryClient.invalidateQueries({ queryKey: ["printers"] });
            queryClient.invalidateQueries({
                queryKey: ["reservations", "history"],
            });
            queryClient.invalidateQueries({
                queryKey: [`userWeeklyMinutes${user.id}`],
            });
            handleCloseCancelModal();
        },
    });

    const handleOpenCancelModal = (reservation: Reservation) => {
        setReservationToCancel(reservation);
        // Find the corresponding printer from the reservedPrinters prop
        const printer =
            reservedPrinters?.find((p) => p.id === reservation.printer_id) ||
            null;
        setPrinterToCancel(printer);
        setIsCancelModalOpen(true);
    };

    const handleCloseCancelModal = () => {
        setIsCancelModalOpen(false);
        setReservationToCancel(null);
        setPrinterToCancel(null); // Reset printer state as well
    };

    const handleConfirmCancel = () => {
        if (reservationToCancel) {
            cancelMutation.mutate({
                reservation_id: reservationToCancel.id,
                printer_id: reservationToCancel.printer_id,
            });
        }
    };

    const handleReservationComplete = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["reservations"] }),
            queryClient.invalidateQueries({ queryKey: ["printers"] }),
            queryClient.invalidateQueries({
                queryKey: ["reservations", "history"],
            }),
        ]);
    };

    return (
        <div className="w-64 bg-gray-800 border-l border-gray-700 flex flex-col shadow-lg relative z-10">
            <div className="p-4 border-b border-gray-700 flex-grow overflow-y-auto text-center">
                <h1 className="text-xl font-semibold text-white border-2 border-gray-700 rounded-lg p-2 mb-4 bg-gray-700 shadow-md">
                    {formatName(userName)}
                </h1>
                <h3 className="font-semibold text-gray-200 mb-2">
                    Your Reservations
                </h3>
                {!activeReservations || activeReservations.length === 0 ? (
                    <p className="text-gray-400 text-xl mt-2">
                        You have no active reservations
                    </p>
                ) : (
                    <div className="space-y-2 mt-2">
                        {activeReservations.map((reservation) => (
                            <div
                                key={reservation.id}
                                className="text-left flex flex-col p-2 bg-gray-700 rounded-md"
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <div>
                                        <span className="block text-gray-200 text-xl">
                                            Printer:{" "}
                                            {reservation.printer_name.length > 8
                                                ? reservation.printer_name.substring(
                                                      0,
                                                      8
                                                  ) + "..."
                                                : reservation.printer_name}
                                        </span>
                                        <span className="block text-gray-400 text-sm">
                                            {" "}
                                            (Id: {reservation.printer_id})
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="h-10 text-red-500 hover:text-red-400 hover:bg-gray-600 p-2"
                                        onClick={() =>
                                            handleOpenCancelModal(reservation)
                                        }
                                        aria-label="Cancel reservation"
                                    >
                                        <Trash2 className="!w-8 !h-8" />
                                    </Button>
                                </div>
                                <div className="text-gray-300 text-xl">
                                    <Countdown
                                        date={
                                            new Date(reservation.time_complete)
                                        }
                                        onComplete={handleReservationComplete}
                                        renderer={({
                                            hours,
                                            minutes,
                                            seconds,
                                        }) => (
                                            <span>
                                                Time remaining:{" "}
                                                {hours
                                                    .toString()
                                                    .padStart(2, "0")}
                                                :
                                                {minutes
                                                    .toString()
                                                    .padStart(2, "0")}
                                                :
                                                {seconds
                                                    .toString()
                                                    .padStart(2, "0")}
                                            </span>
                                        )}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="p-4">
                <ReservationHistoryDrawer
                    reservationHistory={reservationHistory}
                >
                    <Button
                        variant="outline"
                        className="w-full h-14 px-6 flex items-center justify-center gap-2 text-gray-300 hover:text-white bg-green-600 hover:bg-green-700"
                    >
                        <History className="w-4 h-4" />
                        Show History
                    </Button>
                </ReservationHistoryDrawer>
            </div>

            {reservationToCancel && (
                <CancelReservationModal
                    isOpen={isCancelModalOpen}
                    onClose={handleCloseCancelModal}
                    reservation={reservationToCancel}
                    onConfirmCancel={handleConfirmCancel}
                    printer={printerToCancel}
                />
            )}
        </div>
    );
}
