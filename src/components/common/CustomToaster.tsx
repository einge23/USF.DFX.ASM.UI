import { Toaster } from "sonner";
import { toast } from "sonner";

const customToastStyles = {
    success: "!bg-green-500 !text-white !text-xl !w-120",
    error: "!bg-red-500 !text-white !text-xl !w-120",
};

export const showSuccessToast = (message: string, description: string) => {
    toast.success(message, {
        description: description,
        className: customToastStyles.success,
        descriptionClassName: "text-white",
    });
};

export const showErrorToast = (message: string, description: string) => {
    toast.error(message, {
        description: description,
        className: customToastStyles.error,
        descriptionClassName: "!text-white",
    });
};

export default function CustomToaster() {
    return <Toaster position="top-center" />;
}
