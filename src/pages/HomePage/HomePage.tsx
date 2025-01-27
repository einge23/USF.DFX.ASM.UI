import "./HomePage.css";
import { PrinterView } from "@/components/features/PrinterView/PrinterView";
import { usePrinters } from "@/api/printers";
import { Navbar } from "@/components/features/Common/Navbar/Navbar";
import { Spinner } from "@chakra-ui/react";
export function HomePage() {
    const { data: printers, isLoading, error } = usePrinters();

    if (isLoading) return <Spinner />;
    if (error) return <div>Error: {error.message}</div>;
    if (!printers) return <div>No printers found</div>;
    return (
        <div>
            <Navbar />
            <div className="printer-view">
                <h1>Available printers</h1>
                <PrinterView printers={printers} />
            </div>
        </div>
    );
}
