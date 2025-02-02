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

interface ReservationModalProps {
    printer: Printer;
    onClose: () => void;
    onReserve: (hours: number) => void;
}

export function ReservationModal({
    printer,
    onClose,
    onReserve,
}: ReservationModalProps) {
    const [hours, setHours] = useState(1);

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
                                {hours} hour{hours !== 1 ? "s" : ""}
                            </span>
                        </div>
                        <Slider
                            min={0.5}
                            max={8}
                            step={0.5}
                            value={[hours]}
                            onValueChange={(value) => setHours(value[0])}
                            className="[&_[role=slider]]:bg-green-400"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="text-green-400 border-green-400 hover:bg-green-400 hover:text-gray-900"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onReserve(hours)}
                        className="bg-green-600 text-white hover:bg-green-700"
                    >
                        Reserve
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
