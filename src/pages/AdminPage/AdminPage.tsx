import { useState } from "react";
import { AdminSidebar } from "@/components/features/Admin/AdminSidebar";
import { PrintersManagement } from "@/components/features/Admin/PrintersManagement";
import { ReservationsManagement } from "@/components/features/Admin/ReservationsManagement";
import { UsersManagement } from "@/components/features/Admin/UsersManagement/UsersManagement";
import { Navbar } from "@/components/features/Common/Navbar/Navbar";
import { TimeSettingsManagement } from "@/components/features/Admin/TimeSettingsManagement";

export type Tabs = "users" | "printers" | "reservations" | "time_settings";

export function AdminPage() {
    const [selectedTab, setSelectedTab] = useState<Tabs>("users");
    return (
        <>
            <Navbar />
            <div className="flex h-screen bg-gray-900">
                <AdminSidebar
                    activeSection={selectedTab}
                    setActiveSection={setSelectedTab}
                />
                <main className="flex-1 overflow-y-auto p-6">
                    {selectedTab === "users" && <UsersManagement />}
                    {selectedTab === "printers" && <PrintersManagement />}
                    {selectedTab === "reservations" && (
                        <ReservationsManagement />
                    )}
                    {selectedTab === "time_settings" && (
                        <TimeSettingsManagement />
                    )}
                </main>
            </div>
        </>
    );
}
