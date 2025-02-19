import { Reservation } from "@/types/Reservation";

interface ReservationSidebarProps {
    reservations?: Reservation[];
}

export default function ReservationSidebar({
    reservations,
}: ReservationSidebarProps) {
    return (
        <div className="w-64 bg-gray-800 border-l border-gray-700 flex flex-col shadow-lg relative z-10">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">
                    Your Reservations
                </h2>
                {!reservations || reservations.length === 0 ? (
                    <p className="text-gray-400 text-sm mt-2">
                        You have no reservations
                    </p>
                ) : (
                    <div className="space-y-2 mt-2">
                        {reservations.map((reservation) => (
                            <div
                                key={reservation.id}
                                className="flex items-center justify-between p-2 bg-gray-700 rounded-md"
                            >
                                <p className="text-gray-200 text-sm">
                                    Printer: {reservation.printer_id}
                                </p>
                                <p className="text-gray-300 text-sm">
                                    {new Date(
                                        reservation.time_complete
                                    ).toLocaleTimeString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
