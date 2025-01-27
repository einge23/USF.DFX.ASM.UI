import { Printer } from "@/types/Printer";
import { Box, VStack, Text } from "@chakra-ui/react";

interface PrinterBoxProps {
    printer: Printer;
    onClick?: () => void;
}

export function PrinterBox({ printer, onClick }: PrinterBoxProps) {
    return (
        <Box
            key={printer.id}
            borderRadius="5px"
            border="3px solid white"
            bg={printer.in_use ? "gray.500" : printer.color}
            p="20px"
            h="100px"
            w="100px"
            onClick={printer.in_use ? undefined : onClick}
            _hover={
                printer.in_use
                    ? { cursor: "not-allowed" }
                    : {
                          cursor: "pointer",
                          bg: "lightskyblue",
                          color: "black",
                          animation: "pulse 2s infinite",
                      }
            }
        >
            <VStack>
                <Text fontWeight="bold">{printer.name}</Text>
                <Text fontSize="sm">ID: {printer.id}</Text>
            </VStack>
        </Box>
    );
}
