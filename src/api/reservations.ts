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

export async function getAllActiveReservations(): Promise<Reservation[]> {
    const response = await api.get<Reservation[]>(
        `/reservations/getActiveReservations`
    );
    return response.data;
}

export const userActiveReservations = (userId: string) => {
    return useQuery({
        queryKey: ["reservations", userId],
        queryFn: () => getActiveReservations(userId),
        refetchOnWindowFocus: false,
        refetchInterval: 60 * 1000,
        staleTime: 60 * 1000,
    });
};

export const allActiveReservations = () => {
    return useQuery({
        queryKey: ["allActiveReservations"],
        queryFn: () => getAllActiveReservations(),
        refetchOnWindowFocus: false,
        refetchInterval: 60 * 1000,
        staleTime: 60 * 1000,
    });
};

export const reservationHistory = (userId: string) => {
    return useQuery({
        queryKey: ["reservations", "history", userId],
        queryFn: () => getReservationHistory(userId),
        refetchOnWindowFocus: false,
        refetchInterval: 60 * 1000,
        staleTime: 60 * 1000,
    });
};
