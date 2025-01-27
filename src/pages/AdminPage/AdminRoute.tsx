import { useAuth } from "@/context/authContext";
import { Navigate } from "react-router-dom";

interface AdminRouteProps {
    children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
    const { userData } = useAuth();

    if (!userData?.admin) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
