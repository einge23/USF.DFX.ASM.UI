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
    isDeleteMode?: boolean; // Optional: Add delete mode flag
    onDeleteClick?: (printer: Printer) => void; // Optional: Add delete click handler
    dimIfNotReserved?: boolean; // New prop
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

        // Adjust cursor based on delete mode as well
        // Keep cursor as default if in delete mode, otherwise allow pointer even if in use (for editing)
        const cursorClass = isDeleteMode ? "cursor-default" : "cursor-pointer";

        const borderClass = printer.is_executive
            ? "border-2 border-yellow-500"
            : "border-gray-700";

        // Apply dimming based on the new prop and printer status
        const dimClass =
            dimIfNotReserved && !printer.in_use
                ? "opacity-40 hover:opacity-70"
                : "opacity-100";

        return `${baseClasses} ${cursorClass} ${borderClass} ${dimClass}`;
    };

    const getColorBoxClassName = (rackSize: number): string => {
        // Adjust heights based on typical box size in grid
        if (rackSize <= 4) return "w-full h-6 mt-1 rounded"; // Slightly smaller height/margin
        if (rackSize <= 9) return "w-full h-4 mt-1 rounded"; // Smaller height for 3x3
        return "w-full h-3 mt-1 rounded"; // Keep small for 4x4+
    };

    // Handle delete button click
    const handleDeleteButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click event
        if (onDeleteClick) {
            onDeleteClick(printer);
        }
    };

    // Conditionally handle the main card click
    const handleCardClick = () => {
        // Prevent click action if in delete mode OR if dimming is enabled and printer is not in use
        if (isDeleteMode || (dimIfNotReserved && !printer.in_use)) {
            return;
        }
        if (onClick) {
            onClick();
        }
        // Allow click (for editing) even if printer.in_use is true, as long as not in delete mode
    };

    return (
        // Use the new conditional click handler for the Card
        <Card className={getCardClassName()} onClick={handleCardClick}>
            {/* Conditionally render delete button only if in delete mode, handler exists, AND printer is NOT in use */}
            {isDeleteMode && onDeleteClick && !printer.in_use && (
                // Position container in top-right corner
                <div className="absolute top-1 right-1 z-10">
                    <Button
                        variant="destructive"
                        // Increase padding, text size, and icon size
                        className="flex items-center gap-1.5 px-3 py-1.5 h-auto text-sm rounded-md" // Adjusted classes
                        onClick={handleDeleteButtonClick} // This button specifically handles the delete action
                        title={`Delete Printer ${printer.id}`}
                    >
                        <Trash2 className="h-4 w-4" /> {/* Larger Icon */}
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
            {/* Re-apply padding here, remove from inner divs */}
            <CardContent className="flex flex-col flex-1 h-full p-3">
                {!printer.in_use ? (
                    <>
                        {/* Remove flex-grow, let parent flex handle spacing */}
                        <div className="flex items-center justify-center">
                            <p className="text-lg text-gray-400">Available</p>
                        </div>
                        {/* Add mt-auto to push this div to the bottom */}
                        <div
                            className={`${getColorBoxClassName(
                                rackSize
                            )} mt-auto`} // Added mt-auto
                            style={{ backgroundColor: printer.color }}
                        />
                    </>
                ) : (
                    <>
                        {/* Container for text, remove flex-grow */}
                        {/* Added mb-1 for spacing above the color strip */}
                        <div className="flex flex-col items-center justify-center mb-1">
                            <span className="text-lg text-gray-400">
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
                        {/* Ensure color strip is present and add mt-auto */}
                        <div
                            className={`${getColorBoxClassName(
                                rackSize
                            )} mt-auto `} // Added mt-auto
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
