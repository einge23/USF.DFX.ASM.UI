import { Reservation } from "@/types/Reservation";
import { api } from "./api-base";
import { useQuery } from "@tanstack/react-query";

export async function getActiveReservations(): Promise<Reservation[]> {
    const response = await api.get<Reservation[]>(
        "/reservations/getActiveReservations"
    );
    return response.data;
}

export const useReservations = () => {
    return useQuery({
        queryKey: ["reservations"],
        queryFn: getActiveReservations,
        refetchOnWindowFocus: false,
        refetchInterval: 60 * 1000,
        staleTime: 60 * 1000,
    });
};
