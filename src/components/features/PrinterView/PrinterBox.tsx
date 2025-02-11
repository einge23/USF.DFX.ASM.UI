import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer } from "@/types/Printer";
import { Reservation } from "@/types/Reservation";
import { useQueryClient } from "@tanstack/react-query";
import { Printer as PrinterIcon } from "lucide-react";
import Countdown from "react-countdown";

interface PrinterBoxProps {
    printer: Printer;
    reservation?: Reservation;
    onClick?: () => void;
}

export function PrinterBox({ printer, reservation, onClick }: PrinterBoxProps) {
    const queryClient = useQueryClient();
    const handleReservationComplete = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["printers"] }),
            queryClient.invalidateQueries({ queryKey: ["reservations"] }),
        ]);
    };
    return (
        <Card
            className={
                printer.in_use
                    ? "flex flex-col cursor-not-allowed hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden bg-gray-800 border-gray-700"
                    : "flex flex-col cursor-pointer hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden bg-gray-800 border-gray-700"
            }
            onClick={onClick}
        >
            <CardHeader
                className={
                    printer.in_use
                        ? "bg-gradient-to-r from-gray-700 to-gray-900 text-white p-3"
                        : "bg-gradient-to-r from-green-700 to-green-900 text-white p-3"
                }
            >
                <CardTitle className="text-sm font-medium flex items-center">
                    <PrinterIcon className="w-4 h-4 mr-2" />
                    {printer.name}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex-1 flex flex-col justify-between">
                {!printer.in_use ? (
                    <>
                        <p className="flex flex-col justify-center items-center text-xs text-gray-400">
                            Rack ID: {printer.rack}
                        </p>
                        <div
                            className="w-full h-3 mt-2 rounded"
                            style={{ backgroundColor: printer.color }}
                        />
                    </>
                ) : (
                    <>
                        <span className="flex flex-col justify-center items-center text-xs text-gray-400">
                            Currently in use
                        </span>
                        {reservation && (
                            <Countdown
                                date={new Date(reservation.time_complete)}
                                renderer={({ hours, minutes, seconds }) => (
                                    <span className="flex flex-col justify-center items-center text-xs text-gray-400">
                                        {hours.toString().padStart(2, "0")}:
                                        {minutes.toString().padStart(2, "0")}:
                                        {seconds.toString().padStart(2, "0")}
                                    </span>
                                )}
                                onComplete={handleReservationComplete}
                            />
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
