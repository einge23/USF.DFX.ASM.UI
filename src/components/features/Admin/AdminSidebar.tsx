import { Users, Printer, Calendar } from "lucide-react";
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
    ];

    return (
        <div className="w-64 bg-gray-800 text-white">
            <div className="p-4">
                <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
                <nav>
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id as Tabs)}
                            className={cn(
                                "flex items-center w-full p-2 rounded-lg mb-2 transition-colors",
                                activeSection === item.id
                                    ? "bg-green-600 text-white"
                                    : "text-gray-300 hover:bg-gray-700"
                            )}
                        >
                            <item.icon className="mr-2 h-5 w-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
}
