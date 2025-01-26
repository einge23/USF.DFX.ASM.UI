import { useAuth } from "@/context/authContext";
import { Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import { PrinterView } from "@/components/features/PrinterView/PrinterView";
import { getPrinters, usePrinters } from "@/api/printers";
export function HomePage() {
    const auth = useAuth();
    const nav = useNavigate();
    const handleLogout = async () => {
        await auth.logout();
        nav("/");
    };

    const { data: printers, isLoading, error } = usePrinters();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!printers) return <div>No printers found</div>;
    return (
        <div>
            <div className="navbar">
                Hello {auth.userData?.username}!
                {auth.userData?.admin && (
                    <Button
                        className="admin-button"
                        onClick={() => nav("/admin")}
                    >
                        Admin
                    </Button>
                )}
                <Button className="logout-button" onClick={handleLogout}>
                    Logout
                </Button>
            </div>
            <div className="printer-view">
                <h1>Available printers</h1>
                <PrinterView printers={printers} />
            </div>
        </div>
    );
}
