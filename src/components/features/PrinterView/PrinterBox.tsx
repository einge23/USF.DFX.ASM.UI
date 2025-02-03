import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer } from "@/types/Printer";
import { Box, VStack, Text } from "@chakra-ui/react";
import { Printer as PrinterIcon } from "lucide-react";

interface PrinterBoxProps {
    printer: Printer;
    onClick?: () => void;
}

export function PrinterBox({ printer, onClick }: PrinterBoxProps) {
    return (
        <Card
            className="flex flex-col cursor-pointer hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden bg-gray-800 border-gray-700"
            onClick={onClick}
        >
            <CardHeader className="bg-gradient-to-r from-green-700 to-green-900 text-white p-3">
                <CardTitle className="text-sm font-medium flex items-center">
                    <PrinterIcon className="w-4 h-4 mr-2" />
                    {printer.name}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex-1 flex flex-col justify-between">
                <p className="text-xs text-gray-400">Rack ID: {printer.rack}</p>
                <div
                    className="w-full h-3 mt-2 rounded"
                    style={{ backgroundColor: printer.color }}
                />
            </CardContent>
        </Card>
    );
}
