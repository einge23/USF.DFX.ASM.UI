import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { Reservation } from "@/types/Reservation";
import { ReactNode } from "react";
import { format } from "date-fns";

interface ReservationHistoryDrawerProps {
    children: ReactNode;
    reservationHistory?: Reservation[];
}

export default function ReservationHistoryDrawer({
    children,
    reservationHistory,
}: ReservationHistoryDrawerProps) {
    const formatDateTime = (date: Date) => {
        const formatted = new Date(date);
        return format(formatted, "MMM d, yyyy 'at' h:mm a");
    };
    return (
        <Sheet>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent
                side="right"
                className="w-[400px] bg-gray-800 flex flex-col"
            >
                <SheetHeader>
                    <SheetTitle className="text-white text-2xl">
                        Reservation History
                    </SheetTitle>
                    <SheetDescription className="text-gray-400 text-xl">
                        View your past printer reservations
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="flex flex-col gap-4 py-4">
                        {reservationHistory ? (
                            reservationHistory.map((reservation) => (
                                <div
                                    key={reservation.id}
                                    className="flex flex-col p-4 bg-gray-700 rounded-md space-y-2"
                                >
                                    <p className="text-gray-200 text-xl">
                                        Printer: {reservation.printer_id}
                                    </p>
                                    <div className="text-gray-300 text-lg space-y-1">
                                        <p>
                                            Started:{" "}
                                            {formatDateTime(
                                                reservation.time_reserved
                                            )}
                                        </p>
                                        <p>
                                            Ended:{" "}
                                            {formatDateTime(
                                                reservation.time_complete
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-sm">
                                You have no past reservations
                            </p>
                        )}
                    </div>
                </div>

                <SheetFooter>
                    <SheetClose asChild>
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white w-full h-12"
                            variant="outline"
                        >
                            Close
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
