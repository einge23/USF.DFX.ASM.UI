import { PrinterView } from "@/components/features/PrinterView/PrinterView";
import { usePrinters } from "@/api/printers";
import { Navbar } from "@/components/features/Common/Navbar/Navbar";
import { Spinner } from "@chakra-ui/react";
import ReservationSidebar from "@/components/features/Reservations/ReservationSidebar";
export function HomePage() {
    const { data: printers, isLoading, error } = usePrinters();

    if (isLoading) return <Spinner />;
    if (error) return <div>Error: {error.message}</div>;
    if (!printers) return <div>No printers found</div>;
    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 to-green-950">
            <Navbar />
            <div className="flex-1 flex overflow-hidden">
                <main className="flex-1 overflow-y-auto p-4">
                    <PrinterView printers={printers} />
                </main>
                <ReservationSidebar />
            </div>
        </div>
    );
}
