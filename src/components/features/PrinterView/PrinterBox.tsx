import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer } from "@/types/Printer";
import { Reservation } from "@/types/Reservation";
import { useQueryClient } from "@tanstack/react-query";
import { Crown, Printer as PrinterIcon } from "lucide-react";
import Countdown from "react-countdown";

interface PrinterBoxProps {
    printer: Printer;
    rackSize: number;
    reservation?: Reservation;
    onClick?: () => void;
}

export function PrinterBox({
    printer,
    rackSize,
    reservation,
    onClick,
}: PrinterBoxProps) {
    const queryClient = useQueryClient();
    const handleReservationComplete = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["printers"] }),
            queryClient.invalidateQueries({ queryKey: ["reservations"] }),
            queryClient.invalidateQueries({
                queryKey: ["reservations", "history"],
            }),
            queryClient.invalidateQueries({
                queryKey: ["allActiveReservations"],
            }),
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

    const getColorBoxClassName = (rackSize: number): string => {
        if (rackSize <= 4) return "w-full h-7 mt-2 rounded";
        else if (rackSize <= 6) return "w-full h-6 mt-2 rounded";
        else return "w-full h-3 mt-2 rounded";
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
                <CardTitle className="flex items-center text-sm font-medium">
                    <PrinterIcon className="w-4 h-4 mr-2" />
                    {printer.name}
                    {printer.is_executive && (
                        <Crown className="w-4 h-4 mx-2 text-yellow-500" />
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 h-full p-3">
                {!printer.in_use ? (
                    <div className="flex flex-col justify-between w-full h-full">
                        <div className="flex items-center justify-center flex-grow">
                            <p className="text-xl text-gray-400">Available</p>
                        </div>
                        <div
                            className={getColorBoxClassName(rackSize)}
                            style={{ backgroundColor: printer.color }}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full">
                        <span className="text-xl text-gray-400">
                            Currently in use
                        </span>
                        {reservation && (
                            <Countdown
                                date={new Date(reservation.time_complete)}
                                renderer={({ hours, minutes, seconds }) => (
                                    <span className="text-lg text-gray-400">
                                        {hours.toString().padStart(2, "0")}:
                                        {minutes.toString().padStart(2, "0")}:
                                        {seconds.toString().padStart(2, "0")}
                                    </span>
                                )}
                                onComplete={handleReservationComplete}
                            />
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
