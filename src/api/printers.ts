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

export async function getPrintersByRackId(rackId: number): Promise<Printer[]> {
    const response = await api.get<Printer[]>(
        `/printers/getPrinters/rack/${rackId}`
    );
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

export async function addPrinter(
    printerData: Omit<Printer, "in_use" | "last_reserved_by">
): Promise<boolean> {
    const response = await api.post("/admin/printers/create", printerData);
    return response.status === 200 || response.status === 201;
}

export async function updatePrinter(
    printerId: number,
    updateData: UpdatePrinterRequest
): Promise<boolean> {
    const response = await api.put(
        `/admin/printers/update/${printerId}`,
        updateData
    );
    return response.status === 200;
}

export async function deletePrinter(printerId: number): Promise<boolean> {
    const response = await api.delete(`/admin/printers/delete/${printerId}`);
    return response.status === 200;
}
