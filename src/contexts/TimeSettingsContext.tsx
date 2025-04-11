import { getTimeSettings } from "@/api/settings";
import { useAuth } from "@/context/authContext";
import { TimeSettings } from "@/types/TimeSettings";
import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import { ReactNode, createContext, useContext, useState } from "react";

interface TimeSettingsContextType {
    timeSettings: TimeSettings | null;
    isLoading: boolean;
    error: Error | null;
    refreshSettings: () => Promise<QueryObserverResult<TimeSettings, Error>>;
}

// Create the context with a default value
const TimeSettingsContext = createContext<TimeSettingsContextType | undefined>(
    undefined
);

// Props for the provider component
interface TimeSettingsProviderProps {
    children: ReactNode;
}

export function TimeSettingsProvider({ children }: TimeSettingsProviderProps) {
    const { isAuthenticated } = useAuth();

    const {
        data: timeSettingsData,
        isLoading: timeSettingsLoading,
        error: timeSettingsError,
        refetch: refetchTimeSettings,
    } = useQuery({
        queryKey: ["timeSettings"],
        queryFn: getTimeSettings,
        refetchOnWindowFocus: false,
        // Only fetch when authenticated
        enabled: isAuthenticated,
    });

    const value = {
        timeSettings: timeSettingsData,
        isLoading: timeSettingsLoading,
        error: timeSettingsError,
        refreshSettings: refetchTimeSettings,
    };

    return (
        <TimeSettingsContext.Provider value={value}>
            {children}
        </TimeSettingsContext.Provider>
    );
}

export function useTimeSettings() {
    const context = useContext(TimeSettingsContext);
    if (context === undefined) {
        throw new Error(
            "useTimeSettings must be used within a TimeSettingsProvider"
        );
    }
    return context;
}
