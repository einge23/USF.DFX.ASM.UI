import { useState } from "react";
import { AdminSidebar } from "@/components/features/Admin/AdminSidebar";
import { PrintersManagement } from "@/components/features/Admin/PrintersManagement";
import { ReservationsManagement } from "@/components/features/Admin/ReservationsManagement";
import { UsersManagement } from "@/components/features/Admin/UsersManagement";
import { Navbar } from "@/components/features/Common/Navbar/Navbar";

export type Tabs = "users" | "printers" | "reservations";

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
                </main>
            </div>
        </>
    );
}
