export interface Reservation {
    id: number;
    printer_id: number;
    user_id: number;
    time_reserved: Date;
    time_complete: Date;
    is_active: boolean;
    is_egn_reservation: boolean;
    username: string;
    printer_name: string;
}

export interface CancelReservationRequest {
    reservation_id: number;
    printer_id: number;
}
