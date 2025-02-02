import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { PrintersManagement } from "./PrintersManagement";
import { UsersManagement } from "./UsersManagement";
import { ReservationsManagement } from "./ReservationsManagement";
export function AdminDashboard() {
    const [activeSection, setActiveSection] = useState("users");

    return (
        <div className="flex h-screen bg-gray-900">
            <AdminSidebar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
            />
            <main className="flex-1 overflow-y-auto p-6">
                {activeSection === "users" && <UsersManagement />}
                {activeSection === "printers" && <PrintersManagement />}
                {activeSection === "reservations" && <ReservationsManagement />}
            </main>
        </div>
    );
}
