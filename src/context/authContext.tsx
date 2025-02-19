import { setAuthTokenApi } from "@/api/api-base";
import { LoginRequest, LoginResponse } from "@/api/auth";
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
        try {
            return new Promise<void>((resolve) => {
                setUser(userData);
                setIsAuthenticated(true);
                localStorage.setItem("userData", JSON.stringify(userData));
                resolve();
            });
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem("userData");
            throw error;
        }
    };

    const logout = async () => {
        return new Promise<void>((resolve) => {
            setUser(null);
            setAuthTokenApi("");
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
