import { Printer } from "@/types/Printer";
import { Box } from "@chakra-ui/react";

interface PrinterBoxProps {
    printer: Printer;
}

export function PrinterBox({ printer }: PrinterBoxProps) {
    return (
        <Box
            borderRadius="5px"
            border="1px solid white"
            bg={printer.color}
            p="20px"
            h="75px"
            w="75px"
            _hover={{ cursor: "pointer", bg: "green.600" }}
        />
    );
}
