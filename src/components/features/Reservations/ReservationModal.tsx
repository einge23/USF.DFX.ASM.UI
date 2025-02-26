import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Clock } from "lucide-react";
import { Printer } from "@/types/Printer";
import { reservePrinter } from "@/api/printers";
import { useAuth } from "@/context/authContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ReservationModalProps {
    printer: Printer;
    onClose: () => void;
    onReserve: () => void;
}

export function ReservationModal({
    printer,
    onClose,
    onReserve,
}: ReservationModalProps) {
    const [minutes, setMinutes] = useState(30);
    const { mutateAsync: reservePrinterMutation, isPending } = reservePrinter();
    const auth = useAuth();
    const queryClient = useQueryClient();

    const handleReserve = async () => {
        if (!auth.userData?.id) return;
        try {
            await reservePrinterMutation({
                printer_id: printer.id,
                user_id: auth.userData.id,
                time_mins: minutes,
            });

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["printers"] }),
                queryClient.invalidateQueries({ queryKey: ["reservations"] }),
                queryClient.invalidateQueries({
                    queryKey: ["reservations", "history"],
                }),
            ]);

            toast.success(
                `Successfully reserved ${printer.name} for ${minutes} minute${
                    minutes !== 1 ? "s" : ""
                }`
            );
            onReserve();
        } catch (error) {
            console.error("Error reserving printer:", error);
            toast.error("Failed to reserve printer. Please try again.");
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white">
                <DialogHeader>
                    <DialogTitle>Reserve {printer.name}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-gray-400 mb-4">
                        Rack ID: {printer.rack}
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Clock className="w-5 h-5 text-green-400" />
                            <span className="font-medium text-green-400">
                                {minutes} minute{minutes !== 1 ? "s" : ""}
                            </span>
                        </div>
                        <Slider
                            min={1}
                            max={8}
                            step={1}
                            value={[minutes]}
                            onValueChange={(value) => setMinutes(value[0])}
                            className="[&_[role=slider]]:bg-green-400 [&_[role=slider]]:h-8 [&_[role=slider]]:w-8"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className={`
            text-green-400 border-green-400 hover:bg-green-400 hover:text-gray-900
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-green-400
        `}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleReserve}
                        className={`
            bg-green-600 text-white hover:bg-green-700
            disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-600
        `}
                        disabled={isPending}
                    >
                        {isPending ? "Reserving..." : "Reserve"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
