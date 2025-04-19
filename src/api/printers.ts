import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "./api-base";
import {
    Printer,
    ReservePrinterRequest,
    UpdatePrinterRequest,
} from "@/types/Printer";

export async function getPrinters(): Promise<Printer[]> {
    const response = await api.get<Printer[]>("/printers/getPrinters");
    return response.data;
}

export const usePrinters = () => {
    return useQuery({
        queryKey: ["printers"],
        queryFn: getPrinters,
        refetchOnWindowFocus: false,
    });
};

export const reservePrinter = () => {
    return useMutation({
        mutationFn: async (data: ReservePrinterRequest) => {
            const response = await api.put("/printers/reservePrinter", data);
            return response.data;
        },
    });
};

export async function addPrinter(printer: Printer): Promise<boolean> {
    const response = await api.post("/admin/printers/create", printer);
    return response.data;
}

export async function updatePrinter(
    printerId: number,
    UpdatePrinterRequest: UpdatePrinterRequest
): Promise<boolean> {
    const response = await api.put(
        `/admin/printers/update/${printerId}`,
        UpdatePrinterRequest
    );
    return response.data;
}
