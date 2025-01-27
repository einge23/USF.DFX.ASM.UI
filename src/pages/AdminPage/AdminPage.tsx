import { Navbar } from "@/components/features/Common/Navbar/Navbar";
import "./AdminPage.css";
import { VStack, Tabs, Text, Stack, Button, Container } from "@chakra-ui/react";
import { useState } from "react";

export function AdminPage() {
    const adminButtons = ["Users", "Printers", "Reservations"];
    const [selectedSection, setSelectedSection] = useState("Users");

    const renderContent = () => {
        switch (selectedSection) {
            case "Users":
                return <div>Users Management Content</div>;
            case "Printers":
                return <div>Printers Management Content</div>;
            case "Reservations":
                return <div>Reservations Management Content</div>;
            default:
                return <div>Select a section</div>;
        }
    };
    return (
        <div className="admin-root">
            <Navbar />
            <div className="admin-page">
                <Stack className="sidebar">
                    {adminButtons.map((label) => (
                        <Button
                            data-active={selectedSection === label}
                            variant="outline"
                            key={label}
                            className="sidebar-button"
                            onClick={() => setSelectedSection(label)}
                        >
                            {label}
                        </Button>
                    ))}
                </Stack>
                <div className="main-content">{renderContent()}</div>
            </div>
        </div>
    );
}
