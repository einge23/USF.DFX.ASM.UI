import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer } from "@/types/Printer";
import { Reservation } from "@/types/Reservation";
import { useQueryClient } from "@tanstack/react-query";
import { Crown, Printer as PrinterIcon } from "lucide-react";
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

    const getCardClassName = () => {
        const baseClasses =
            "flex flex-col hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden bg-gray-800";

        const cursorClass = printer.in_use
            ? "cursor-not-allowed"
            : "cursor-pointer";

        const borderClass = printer.is_executive
            ? "border-2 border-yellow-500"
            : "border-gray-700";

        return `${baseClasses} ${cursorClass} ${borderClass}`;
    };

    return (
        <Card className={getCardClassName()} onClick={onClick}>
            <CardHeader
                className={
                    printer.in_use
                        ? "bg-gradient-to-r from-gray-700 to-gray-900 text-white p-3"
                        : "bg-gradient-to-b from-green-700 to-green-900 text-white p-3"
                }
            >
                <CardTitle className="text-sm font-medium flex items-center">
                    <PrinterIcon className="w-4 h-4 mr-2" />
                    {printer.name}
                    {printer.is_executive && (
                        <Crown className="mx-2 h-4 w-4 text-yellow-500" />
                    )}
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
