import { useAuth } from "@/context/authContext";
import { Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

export function Navbar() {
    const auth = useAuth();
    const nav = useNavigate();

    const handleLogout = async () => {
        await auth.logout();
        nav("/");
    };

    const handleHome = async () => {
        nav("/Home");
    };
    return (
        <div className="navbar">
            Hello {auth.userData?.username}!
            {auth.userData?.admin && (
                <Button
                    variant="ghost"
                    className="admin-button"
                    onClick={() => nav("/Admin")}
                >
                    Admin
                </Button>
            )}
            <Button
                variant="ghost"
                className="logout-button"
                onClick={handleLogout}
            >
                Logout
            </Button>
            <Button
                variant="ghost"
                className="logout-button"
                onClick={handleHome}
            >
                Home
            </Button>
        </div>
    );
}
