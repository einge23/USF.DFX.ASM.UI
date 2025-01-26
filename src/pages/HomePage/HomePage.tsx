import { useAuth } from "@/context/authContext";
import { Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export function HomePage() {
    const auth = useAuth();
    const nav = useNavigate();
    const handleLogout = async () => {
        await auth.logout();
        nav("/");
    };
    return (
        <div>
            Hello {auth.userData?.username}!
            <Button onClick={handleLogout}></Button>
        </div>
    );
}
