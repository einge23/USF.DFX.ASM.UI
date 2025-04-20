import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer } from "@/types/Printer";
import { Reservation } from "@/types/Reservation";
import { useQueryClient } from "@tanstack/react-query";
import { Crown, Printer as PrinterIcon, Trash2 } from "lucide-react"; // Changed XCircle to Trash2
import Countdown from "react-countdown";
import { Button } from "@/components/ui/button";

interface PrinterBoxProps {
    printer: Printer;
    rackSize: number;
    reservation?: Reservation;
    onClick?: () => void;
    isDeleteMode?: boolean;
    onDeleteClick?: (printer: Printer) => void;
    dimIfNotReserved?: boolean;
}

export function PrinterBox({
    printer,
    rackSize,
    reservation,
    onClick,
    isDeleteMode = false, // Default to false
    onDeleteClick, // Receive the handler
    dimIfNotReserved = false, // Default to false
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
            "relative flex flex-col hover:shadow-lg transition-all duration-300 rounded-lg overflow-hidden bg-gray-800"; // Added transition-all

        const cursorClass = isDeleteMode ? "cursor-default" : "cursor-pointer";

        const borderClass = printer.is_executive
            ? "border-2 border-yellow-500"
            : "border-gray-700";

        const dimClass =
            dimIfNotReserved && !printer.in_use
                ? "opacity-40 hover:opacity-70"
                : "opacity-100";

        return `${baseClasses} ${cursorClass} ${borderClass} ${dimClass}`;
    };

    const getColorBoxClassName = (rackSize: number): string => {
        if (rackSize <= 4) return "w-full h-6 mt-1 rounded"; // Slightly smaller height/margin
        if (rackSize <= 9) return "w-full h-4 mt-1 rounded"; // Smaller height for 3x3
        return "w-full h-3 mt-1 rounded";
    };

    const handleDeleteButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDeleteClick) {
            onDeleteClick(printer);
        }
    };

    const handleCardClick = () => {
        if (isDeleteMode || (dimIfNotReserved && !printer.in_use)) {
            return;
        }
        if (onClick) {
            onClick();
        }
    };

    return (
        <Card className={getCardClassName()} onClick={handleCardClick}>
            {isDeleteMode && onDeleteClick && !printer.in_use && (
                <div className="absolute top-1 right-1 z-10">
                    <Button
                        variant="destructive"
                        className="flex items-center gap-1.5 px-3 py-1.5 h-auto text-sm rounded-md"
                        onClick={handleDeleteButtonClick}
                        title={`Delete Printer ${printer.id}`}
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </Button>
                </div>
            )}
            <CardHeader
                className={
                    printer.in_use
                        ? "bg-gradient-to-r from-gray-700 to-gray-900 text-white p-3"
                        : "bg-gradient-to-b from-green-700 to-green-900 text-white p-3"
                }
            >
                <CardTitle className="flex items-center text-sm font-medium">
                    <PrinterIcon className="w-4 h-4 mr-2" />
                    {printer.name} (ID: {printer.id})
                    {printer.is_executive && (
                        <Crown className="w-4 h-4 mx-2 text-yellow-500" />
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 h-full p-3">
                {!printer.in_use ? (
                    <>
                        <div className="flex flex-1 items-center justify-center">
                            <p className="text-lg text-gray-400">Available</p>
                        </div>
                        <div
                            className={`${getColorBoxClassName(
                                rackSize
                            )} mt-auto`} // Added mt-auto
                            style={{ backgroundColor: printer.color }}
                        />
                    </>
                ) : (
                    <>
                        <div className="flex flex-1 flex-col items-center justify-center">
                            <span className="text-base text-gray-400">
                                Currently in use
                            </span>
                            {reservation && (
                                <Countdown
                                    date={new Date(reservation.time_complete)}
                                    renderer={({ hours, minutes, seconds }) => (
                                        <span className="text-base text-gray-400">
                                            {hours.toString().padStart(2, "0")}:
                                            {minutes
                                                .toString()
                                                .padStart(2, "0")}
                                            :
                                            {seconds
                                                .toString()
                                                .padStart(2, "0")}
                                        </span>
                                    )}
                                    onComplete={handleReservationComplete}
                                />
                            )}
                        </div>
                        <div
                            className={`${getColorBoxClassName(
                                rackSize
                            )} mt-auto `}
                            style={{
                                backgroundColor: printer.color,
                                opacity: 0.5,
                            }}
                        />
                    </>
                )}
            </CardContent>
        </Card>
    );
}
