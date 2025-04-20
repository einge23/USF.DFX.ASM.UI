import { PrinterView } from "@/components/features/PrinterView/PrinterView";
import { usePrinters } from "@/api/printers";
import { Navbar } from "@/components/features/Common/Navbar/Navbar";
import { Spinner } from "@chakra-ui/react";
import ReservationSidebar from "@/components/features/Reservations/ReservationSidebar";
import { useAuth } from "@/context/authContext";
import {
    allActiveReservations,
    reservationHistory,
    userActiveReservations,
} from "@/api/reservations";
import { Printer } from "@/types/Printer"; // Ensure Printer type is imported

export function HomePage() {
    const { data: printers, isLoading, error } = usePrinters();
    const auth = useAuth();
    const userId = auth.userData?.id.toString() || "";
    const {
        data: userActiveReservationsData,
        isLoading: reservationsLoading,
        error: reservationsError,
    } = userActiveReservations(userId);

    const {
        data: allActiveReservationsData,
        isLoading: allReservationsLoading,
        error: allReservationsError,
    } = allActiveReservations();

    const {
        data: reservationsHistory,
        isLoading: reservationHistoryLoading,
        error: reservationHistoryError,
    } = reservationHistory(userId);

    if (
        isLoading ||
        reservationsLoading ||
        allReservationsLoading ||
        reservationHistoryLoading
    )
        return <Spinner />; // Combine loading states
    if (error) return <div>Error loading printers: {error.message}</div>;
    if (reservationsError)
        return (
            <div>Error loading reservations: {reservationsError.message}</div>
        );
    if (allReservationsError)
        return (
            <div>
                Error loading all reservations: {allReservationsError.message}
            </div>
        );
    if (reservationHistoryError)
        return (
            <div>
                Error loading reservation history:{" "}
                {reservationHistoryError.message}
            </div>
        );

    // Filter printers based on user's active reservations, ensuring it's an array
    const reservedPrinters =
        printers?.filter(
            (printer) =>
                // Add Array.isArray check
                Array.isArray(userActiveReservationsData) &&
                userActiveReservationsData.some(
                    (reservation) => reservation.printer_id === printer.id
                )
        ) || []; // Default to empty array if printers or reservations are undefined/not an array

    // NOTE: To directly control printer box size and navigation button style/position,
    // modifications are likely needed within the PrinterView component itself
    // (src/components/features/PrinterView/PrinterView.tsx).
    // Reducing padding here might help fit content, but direct control is in PrinterView.
    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-gray-800 to-green-900">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
                {/* Reduced padding from p-4 to p-2 to provide more space */}
                <main className="flex-1 p-2 overflow-y-auto">
                    {printers && printers.length > 0 ? (
                        <PrinterView
                            printers={printers}
                            reservations={allActiveReservationsData}
                        />
                    ) : (
                        <div className="text-white text-center text-xl">
                            No printers found
                        </div>
                    )}
                </main>
                <ReservationSidebar
                    activeReservations={userActiveReservationsData}
                    reservationHistory={reservationsHistory}
                    reservedPrinters={reservedPrinters}
                />
            </div>
        </div>
    );
}
