import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";
import debounce from "lodash/debounce";
import { useAuth } from "@/context/authContext";
import { useNavigate } from "react-router-dom";

interface IdleTimerContextType {
    showWarning: boolean;
    remainingTime: number;
    resetTimer: () => void;
}

const IdleTimerContext = createContext<IdleTimerContextType | undefined>(
    undefined
);

export const IdleTimerProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [remainingTime, setRemainingTime] = useState(60);
    const [showWarning, setShowWarning] = useState(false);
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
    const { logout, userData } = useAuth();
    const nav = useNavigate();

    const handleLogout = useCallback(async () => {
        setShowWarning(false);
        await logout();
        nav("/");
    }, [logout, nav]);

    const resetTimer = useCallback(() => {
        setRemainingTime(60);
        setShowWarning(false);
    }, []);

    const debouncedResetTimer = debounce(resetTimer, 200);

    useEffect(() => {
        // Only set up timer and listeners if user is logged in
        if (!userData) {
            if (timer) {
                clearInterval(timer);
                setTimer(null);
            }
            setShowWarning(false);
            return;
        }

        const handleActivity = () => {
            debouncedResetTimer();
        };

        window.addEventListener("mousemove", handleActivity);
        window.addEventListener("keydown", handleActivity);
        window.addEventListener("click", handleActivity);
        window.addEventListener("scroll", handleActivity);
        window.addEventListener("touchstart", handleActivity);

        return () => {
            window.removeEventListener("mousemove", handleActivity);
            window.removeEventListener("keydown", handleActivity);
            window.removeEventListener("click", handleActivity);
            window.removeEventListener("scroll", handleActivity);
            window.removeEventListener("touchstart", handleActivity);
            debouncedResetTimer.cancel();
        };
    }, [debouncedResetTimer, timer, userData]);

    useEffect(() => {
        // Only start countdown if user is logged in
        if (!userData) {
            return;
        }

        if (timer) {
            clearInterval(timer);
        }

        const newTimer = setInterval(() => {
            setRemainingTime((prev) => {
                if (prev <= 0) {
                    handleLogout();
                    return 0;
                }
                if (prev === 30) {
                    setShowWarning(true);
                }
                return prev - 1;
            });
        }, 1000);

        setTimer(newTimer);

        return () => {
            if (newTimer) {
                clearInterval(newTimer);
            }
        };
    }, [handleLogout, userData]);

    return (
        <IdleTimerContext.Provider
            value={{ showWarning, remainingTime, resetTimer }}
        >
            {children}
        </IdleTimerContext.Provider>
    );
};

export const useIdleTimer = () => {
    const context = useContext(IdleTimerContext);
    if (context === undefined) {
        throw new Error(
            "useIdleTimer must be used within an IdleTimerProvider"
        );
    }
    return context;
};
