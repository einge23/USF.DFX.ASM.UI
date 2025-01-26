import { useQuery } from "@tanstack/react-query";
import { api } from "./api-base";
import { Printer } from "@/types/Printer";

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
