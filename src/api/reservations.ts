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

export async function getReservationHistory(
    userId: string
): Promise<Reservation[]> {
    const response = await api.get<Reservation[]>(
        `/users/reservations/${userId}`
    );
    return response.data;
}

export const activeReservations = (userId: string) => {
    return useQuery({
        queryKey: ["reservations"],
        queryFn: () => getActiveReservations(userId),
        refetchOnWindowFocus: false,
        refetchInterval: 60 * 1000,
        staleTime: 60 * 1000,
    });
};

export const reservationHistory = (userId: string) => {
    return useQuery({
        queryKey: ["reservations", "history"],
        queryFn: () => getReservationHistory(userId),
        refetchOnWindowFocus: false,
        refetchInterval: 60 * 1000,
        staleTime: 60 * 1000,
    });
};
