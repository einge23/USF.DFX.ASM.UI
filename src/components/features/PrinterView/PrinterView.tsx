import { Printer } from "@/types/Printer";
import { Box, SimpleGrid, Text, VStack } from "@chakra-ui/react";

interface PrinterViewProps {
    printers: Printer[];
}

export function PrinterView({ printers }: PrinterViewProps) {
    return (
        <SimpleGrid columns={3} gap="40px">
            {printers?.map((printer) => (
                <Box
                    key={printer.id}
                    borderRadius="5px"
                    border="1px solid white"
                    bg={printer.in_use ? "grey" : printer.color}
                    p="20px"
                    h="100px"
                    w="100px"
                    _hover={{ cursor: "pointer", bg: "green.600" }}
                >
                    <VStack>
                        <Text fontWeight="bold">{printer.name}</Text>
                        <Text fontSize="sm">ID: {printer.id}</Text>
                    </VStack>
                </Box>
            ))}
        </SimpleGrid>
    );
}
