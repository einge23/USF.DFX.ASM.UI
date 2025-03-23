import React from "react";
import { useIdleTimer } from "@/contexts/IdleTimerContext";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Timer } from "lucide-react";

export const IdleWarningModal = () => {
    const { showWarning, remainingTime, resetTimer } = useIdleTimer();

    return (
        <Dialog
            open={showWarning}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    resetTimer();
                }
            }}
        >
            <DialogContent className="max-w-[90vw] w-[90vw] bg-gray-800 p-6">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        Session Timeout Warning
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center py-8 min-h-[300px]">
                    <div className="text-center">
                        <div className="animate-pulse text-yellow-400 mb-4">
                            <Timer size={72} className="mx-auto" />
                        </div>
                        <h3 className="text-2xl font-medium mb-4">
                            Your session is about to expire
                        </h3>
                        <p className="text-gray-400 mb-6 text-lg">
                            Due to inactivity, your session will expire in{" "}
                            {remainingTime} seconds.
                        </p>
                        <Button
                            onClick={resetTimer}
                            className="h-14 px-6 bg-green-500 hover:bg-green-600 text-lg"
                        >
                            Continue Session
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
