export interface Reservation {
    id: number;
    printer_id: number;
    user_id: number;
    time_reserved: Date;
    time_complete: Date;
    is_active: boolean;
}
