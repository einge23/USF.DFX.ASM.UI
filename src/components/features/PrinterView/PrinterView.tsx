import { Printer } from "@/types/Printer";
import {
    Box,
    Button,
    HStack,
    Input,
    SimpleGrid,
    Text,
    useDisclosure,
    VStack,
} from "@chakra-ui/react";
import { PrinterBox } from "./PrinterBox";
import { useState } from "react";
import {
    DialogActionTrigger,
    DialogBody,
    DialogContent,
    DialogHeader,
    DialogRoot,
    DialogTrigger,
} from "@/components/ui/dialog";
import "./PrinterView.css";
import { useQueryClient } from "@tanstack/react-query";
import { reservePrinter } from "@/api/printers";
import { useAuth } from "@/context/authContext";

interface PrinterViewProps {
    printers: Printer[];
}

export function PrinterView({ printers }: PrinterViewProps) {
    const { open, onOpen, onClose } = useDisclosure();
    const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(
        null
    );
    const [reservationTime, setReservationTime] = useState<number>(0);
    const reservePrinterMutation = reservePrinter();
    const auth = useAuth();
    const queryClient = useQueryClient();

    const handlePrinterClick = (printer: Printer) => {
        if (printer.in_use) return;
        setSelectedPrinter(printer);
        onOpen();
    };

    const handleAddTime = () => {
        reservationTime < 24 ? setReservationTime((prev) => prev + 1) : null;
    };

    const handleRemoveTime = () => {
        reservationTime > 0 ? setReservationTime((prev) => prev - 1) : null;
    };

    const handleReserve = async () => {
        if (!selectedPrinter || !auth.userData?.id) return;
        try {
            await reservePrinterMutation.mutateAsync({
                printer_id: selectedPrinter.id,
                user_id: auth.userData?.id,
                time_mins: reservationTime,
            });
            onClose();
            setSelectedPrinter(null);
            setReservationTime(0);
            await new Promise((resolve) => setTimeout(resolve, 50));
            await queryClient.invalidateQueries({ queryKey: ["printers"] });
        } catch (error) {
            console.error("Error reserving printer:", error);
        }
    };

    return (
        <>
            <SimpleGrid columns={3} gap="40px">
                {printers?.map((printer) => (
                    <Box
                        onClick={() => handlePrinterClick(printer)}
                        cursor="pointer"
                    >
                        <PrinterBox key={printer.id} printer={printer} />
                    </Box>
                ))}
            </SimpleGrid>

            <DialogRoot
                open={open}
                onOpenChange={onClose}
                placement={"center"}
                motionPreset={"scale"}
            >
                <DialogContent>
                    <DialogHeader>
                        Select the duration of your reservation for{" "}
                        <strong> {selectedPrinter?.name}</strong>
                    </DialogHeader>
                    <DialogBody>
                        <HStack className="duration-stack">
                            <VStack>
                                <Button
                                    onClick={handleAddTime}
                                    className="up-down-buttons"
                                >
                                    +
                                </Button>
                                <Button
                                    onClick={handleRemoveTime}
                                    className="up-down-buttons"
                                >
                                    -
                                </Button>
                            </VStack>
                            <Box className="reservation-time-box">
                                {reservationTime}
                            </Box>
                            <Text className="reservation-time-text">Hours</Text>
                        </HStack>
                    </DialogBody>
                    <DialogActionTrigger className="dialog-action-trigger">
                        <Button
                            className="dialog-reserve-button"
                            onClick={handleReserve}
                        >
                            Reserve
                        </Button>
                        <Button className="dialog-cancel-button">Cancel</Button>
                    </DialogActionTrigger>
                </DialogContent>
            </DialogRoot>
        </>
    );
}
