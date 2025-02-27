import { PrinterView } from "@/components/features/PrinterView/PrinterView";
import { usePrinters } from "@/api/printers";
import { Navbar } from "@/components/features/Common/Navbar/Navbar";
import { Spinner } from "@chakra-ui/react";
import ReservationSidebar from "@/components/features/Reservations/ReservationSidebar";
import { useAuth } from "@/context/authContext";
import { activeReservations, reservationHistory } from "@/api/reservations";
export function HomePage() {
    const { data: printers, isLoading, error } = usePrinters();
    const auth = useAuth();
    const userId = auth.userData?.id.toString() || "";
    const {
        data: reservations,
        isLoading: reservationsLoading,
        error: reservationsError,
    } = activeReservations(userId);

    const {
        data: reservationsHistory,
        isLoading: reservationHistoryLoading,
        error: reservationHistoryError,
    } = reservationHistory(userId);

    if (isLoading) return <Spinner />;
    if (error) return <div>Error: {error.message}</div>;
    if (!printers) return <div>No printers found</div>;
    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-gray-800 to-green-900">
            <Navbar />
            <div className="flex-1 flex overflow-hidden">
                <main className="flex-1 overflow-y-auto p-4">
                    <PrinterView
                        printers={printers}
                        reservations={reservations}
                    />
                </main>
                <ReservationSidebar
                    activeReservations={reservations}
                    reservationHistory={reservationsHistory}
                />
            </div>
        </div>
    );
}
