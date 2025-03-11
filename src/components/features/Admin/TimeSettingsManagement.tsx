import { useTimeSettings } from "@/contexts/TimeSettingsContext";

export function TimeSettingsManagement() {
    const { timeSettings, isLoading, error } = useTimeSettings();
    return (
        <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-white">
                Time Settings Management
            </h2>
            <p className="text-gray-300 mb-4">
                Here you can manage and configure time settings.
            </p>

            <div className="mt-4">
                {isLoading && (
                    <p className="text-blue-400">Loading time settings...</p>
                )}
                {error && (
                    <p className="text-red-400">Error: {error.message}</p>
                )}
                {timeSettings && (
                    <div className="bg-gray-700 p-4 rounded-md">
                        <h3 className="text-xl text-white mb-2">
                            Current Time Settings
                        </h3>
                        <pre className="text-green-300 overflow-x-auto">
                            {JSON.stringify(timeSettings, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}
