import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { PrintersManagement } from "./PrintersManagement";
import { UsersManagement } from "./UsersManagement/UsersManagement";
import { ReservationsManagement } from "./ReservationsManagement";
import { TimeSettingsManagement } from "./TimeSettingsManagement";
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
                {activeSection === "time_settings" && (
                    <TimeSettingsManagement />
                )}
            </main>
        </div>
    );
}
