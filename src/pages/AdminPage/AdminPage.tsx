import { useState } from "react";
import { AdminSidebar } from "@/components/features/Admin/AdminSidebar";
import { PrintersManagement } from "@/components/features/Admin/PrintersManagement";
import { ReservationsManagement } from "@/components/features/Admin/ReservationsManagement";
import { UsersManagement } from "@/components/features/Admin/UsersManagement/UsersManagement";
import { Navbar } from "@/components/features/Common/Navbar/Navbar";
import ExportData from "@/components/features/Admin/ExportData";
import { SettingsManagement } from "@/components/features/Admin/SettingsManagement/SettingsManagement";
import { getPrinterSettings } from "@/api/settings";
import { useQuery } from "@tanstack/react-query";

export type Tabs =
    | "users"
    | "printers"
    | "reservations"
    | "settings"
    | "export";

export function AdminPage() {
    const [selectedTab, setSelectedTab] = useState<Tabs>("users");
    const { data: printerSettings } = useQuery({
        queryKey: ["printerSettings"],
        queryFn: () => getPrinterSettings(),
        refetchOnWindowFocus: false,
    });
    return (
        <div className="flex flex-col h-screen bg-gray-900">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar
                    activeSection={selectedTab}
                    setActiveSection={setSelectedTab}
                />
                <main className="flex-1 p-6 overflow-y-auto">
                    {selectedTab === "users" && <UsersManagement />}
                    {selectedTab === "printers" && <PrintersManagement />}
                    {selectedTab === "reservations" && (
                        <ReservationsManagement />
                    )}
                    {selectedTab === "settings" && (
                        <SettingsManagement printerSettings={printerSettings} />
                    )}
                    {selectedTab === "export" && <ExportData />}
                </main>
            </div>
        </div>
    );
}
