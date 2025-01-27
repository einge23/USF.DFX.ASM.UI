export interface Printer {
    id: number;
    name: string;
    color: string;
    rack: number;
    in_use: boolean;
}

export interface ReservePrinterRequest {
    printer_id: number;
    user_id: number;
    time_mins: number;
}
