export interface Printer {
    id: number;
    name: string;
    color: string;
    rack: number;
    rack_position: number; // Added rack position
    in_use: boolean;
    last_reserved_by: string;
    is_executive: boolean;
    is_egn_printer: boolean;
}

export interface UpdatePrinterRequest {
    name: string;
    color: string;
    rack: number;
    rack_position: number; // Added rack position
    is_executive: boolean;
    is_egn_printer: boolean;
}

export interface ReservePrinterRequest {
    printer_id: number;
    user_id: number;
    time_mins: number;
}
