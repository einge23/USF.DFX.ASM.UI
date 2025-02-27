import { Toaster } from "sonner";

export default function CustomToaster() {
    return (
        <Toaster
            position="top-center"
            toastOptions={{
                unstyled: true,
                classNames: {
                    toast: "text-base p-4 min-w-[300px] shadow-lg rounded-lg",
                    success: "bg-emerald-500 border-l-4 border-white",
                    error: "bg-red-500 text-white shadow-lg rounded-lg min-w-[500px] text-lg border-white",
                    title: "font-semibold text-base",
                    description: "text-sm",
                    actionButton: "bg-zinc-400",
                    cancelButton: "bg-zinc-400",
                    closeButton: "bg-zinc-400",
                },
            }}
        />
    );
}
