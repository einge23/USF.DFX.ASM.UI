import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { PrintersManagement } from "./PrintersManagement";
import { UsersManagement } from "./UsersManagement/UsersManagement";
import { ReservationsManagement } from "./ReservationsManagement";
import ExportData from "./ExportData";
import { SettingsManagement } from "./SettingsManagement/SettingsManagement";
import { useQuery } from "@tanstack/react-query";
import { getPrinterSettings } from "@/api/settings";
export function AdminDashboard() {
    const [activeSection, setActiveSection] = useState("users");
    const { data: printerSettings } = useQuery({
        queryKey: ["printerSettings"],
        queryFn: () => getPrinterSettings(),
        refetchOnWindowFocus: false,
    });

    return (
        <div className="flex h-screen bg-gray-900">
            <AdminSidebar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
            />
            <main className="flex-1 overflow-y-auto">
                {activeSection === "users" && <UsersManagement />}
                {activeSection === "printers" && <PrintersManagement />}
                {activeSection === "reservations" && <ReservationsManagement />}
                {activeSection === "settings" && (
                    <SettingsManagement printerSettings={printerSettings} />
                )}
                {activeSection === "export" && <ExportData />}
            </main>
        </div>
    );
}
