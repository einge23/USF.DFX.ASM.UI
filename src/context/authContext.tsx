import { LoginRequest } from "@/api/auth";
import { UserData } from "@/types/UserData";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

interface AuthContextType {
    userData: UserData | null;
    isAuthenticated: boolean;
    login: (userData: UserData) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(() => {
        const stored = localStorage.getItem("userData");
        return stored ? JSON.parse(stored) : null;
    });
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!user);

    const login = async (userData: UserData) => {
        return new Promise<void>((resolve) => {
            // Update both states synchronously
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem("userData", JSON.stringify(userData));
            resolve();
        });
    };

    const logout = async () => {
        return new Promise<void>((resolve) => {
            // Clear both states synchronously
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem("userData");
            resolve();
        });
    };

    return (
        <AuthContext.Provider
            value={{
                userData: user,
                isAuthenticated,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
