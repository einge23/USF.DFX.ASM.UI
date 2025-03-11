import { Button } from "@/components/ui/button";
import { Reservation } from "@/types/Reservation";
import { useQueryClient } from "@tanstack/react-query";
import Countdown from "react-countdown";
import { History } from "lucide-react";
import { useState } from "react";
import ReservationHistoryDrawer from "./ReservationHistoryDrawer";
import { reservationHistory } from "@/api/reservations";

interface ReservationSidebarProps {
    activeReservations?: Reservation[];
    reservationHistory?: Reservation[];
}

export default function ReservationSidebar({
    activeReservations,
    reservationHistory,
}: ReservationSidebarProps) {
    const queryClient = useQueryClient();

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
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">
                    Your Reservations
                </h2>
                {!activeReservations || activeReservations.length === 0 ? (
                    <p className="text-gray-400 text-xl mt-2">
                        You have no active reservations
                    </p>
                ) : (
                    <div className="space-y-2 mt-2">
                        {activeReservations.map((reservation) => (
                            <div
                                key={reservation.id}
                                className="flex flex-col p-2 bg-gray-700 rounded-md"
                            >
                                <p className="text-gray-200 text-xl">
                                    Printer: {reservation.printer_id}
                                </p>
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
                        className="w-full h-14 px-6 flex items-center justify-center gap-2 text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                        <History className="w-4 h-4" />
                        Show History
                    </Button>
                </ReservationHistoryDrawer>
            </div>
        </div>
    );
}
