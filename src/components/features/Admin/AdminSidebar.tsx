import { Users, Printer, Calendar, Clock, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs } from "@/pages/AdminPage/AdminPage";

interface AdminSidebarProps {
    activeSection: string;
    setActiveSection: (section: Tabs) => void;
}

export function AdminSidebar({
    activeSection,
    setActiveSection,
}: AdminSidebarProps) {
    const menuItems = [
        { id: "users", label: "Users", icon: Users },
        { id: "printers", label: "Printers", icon: Printer },
        { id: "reservations", label: "Reservations", icon: Calendar },
        { id: "time_settings", label: "Time Settings", icon: Clock },
        { id: "export", label: "Export/Import Data", icon: FileDown },
    ];

    return (
        <div className="w-52 text-white bg-gray-800">
            <div className="p-4">
                <h2 className="mb-6 text-xl text-center font-bold">
                    Admin Dashboard
                </h2>
                <nav>
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id as Tabs)}
                            className={cn(
                                "flex items-center w-full p-4 rounded-lg mb-2 transition-colors text-lg",
                                activeSection === item.id
                                    ? "bg-green-600 text-white"
                                    : "text-gray-300 hover:bg-gray-700"
                            )}
                        >
                            <item.icon className="w-6 h-6 mr-3" />
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
}
