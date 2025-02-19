import { Reservation } from "@/types/Reservation";
import { api } from "./api-base";
import { useQuery } from "@tanstack/react-query";

export async function getActiveReservations(
    userId: string
): Promise<Reservation[]> {
    const response = await api.get<Reservation[]>(
        `/users/activeReservations/${userId}`
    );
    return response.data;
}

export const useReservations = (userId: string) => {
    return useQuery({
        queryKey: ["reservations"],
        queryFn: () => getActiveReservations(userId),
        refetchOnWindowFocus: false,
        refetchInterval: 60 * 1000,
        staleTime: 60 * 1000,
    });
};
