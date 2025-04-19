import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect, useRef } from "react";
import type { Printer, UpdatePrinterRequest } from "@/types/Printer"; // Import UpdatePrinterRequest
import { VirtualKeyboard } from "./VirtualKeyboard";
import "react-simple-keyboard/build/css/index.css";
import "./keyboard.css";
import { Check } from "lucide-react"; // Import Check icon
import { useForm } from "@tanstack/react-form"; // Import useForm
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Import useMutation
import { updatePrinter } from "@/api/printers"; // Import updatePrinter API function
import { toast } from "sonner"; // Import toast
import {
    showErrorToast,
    showSuccessToast,
} from "@/components/common/CustomToaster"; // Import custom toasts

// Use consistent color options
const colorOptions = [
    { name: "Slate", value: "#64748b" },
    { name: "Gray", value: "#6b7280" },
    { name: "Zinc", value: "#71717a" },
    { name: "Red", value: "#ef4444" },
    { name: "Orange", value: "#f97316" },
    { name: "Amber", value: "#f59e0b" },
    { name: "Green", value: "#22c55e" },
    { name: "Teal", value: "#14b8a6" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#a855f7" },
];

interface EditPrinterModalProps {
    isOpen: boolean;
    onClose: () => void;
    printer: Printer;
    // onEdit prop is removed as mutation handles the update
}

export function EditPrinterModal({
    isOpen,
    onClose,
    printer,
}: EditPrinterModalProps) {
    // const [formData, setFormData] = useState<Printer>(printer); // Remove useState
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [cursorVisible, setCursorVisible] = useState(true);
    const cursorInterval = useRef<NodeJS.Timeout | null>(null);

    const queryClient = useQueryClient(); // Initialize query client

    const { isPending, mutate: handleUpdatePrinter } = useMutation({
        // The input to mutate remains Printer from the form
        mutationFn: async (updatedPrinterData: Printer) => {
            // Construct the UpdatePrinterRequest object from the form data
            const updatePayload: UpdatePrinterRequest = {
                name: updatedPrinterData.name,
                color: updatedPrinterData.color,
                rack: updatedPrinterData.rack, // Ensure rack is included if editable, otherwise use printer.rack
                is_executive: updatedPrinterData.is_executive,
                is_egn_printer: updatedPrinterData.is_egn_printer, // Ensure this is included
            };
            // Pass the original printer ID and the update payload
            // Assuming updatePrinter expects an object like { id: number, data: UpdatePrinterRequest }
            // Adjust this call based on the actual signature of updatePrinter
            return updatePrinter(printer.id, updatePayload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["printers"] }); // Refetch printers after update
            // Use custom success toast
            showSuccessToast("Success", "Printer updated successfully!");
            onClose(); // Close modal on success
        },
        onError: (error) => {
            console.error("Update failed:", error);
            // Use custom error toast
            showErrorToast(
                "Error",
                "Failed to update printer. Please try again."
            );
            // Optionally keep modal open on error, or close it:
            // onClose();
        },
    });

    const editPrinterForm = useForm({
        // Use printer prop directly for defaultValues
        defaultValues: printer,
        onSubmit: async ({ value }) => {
            // Value here is of type Printer
            handleUpdatePrinter(value); // Pass the full Printer object to the mutation function
            setShowKeyboard(false);
        },
    });

    // Reset form if the printer prop changes externally
    useEffect(() => {
        editPrinterForm.reset(printer);
    }, [printer, editPrinterForm]);

    // Cursor blink effect (no changes needed here)
    useEffect(() => {
        if (showKeyboard) {
            setCursorVisible(true);
            cursorInterval.current = setInterval(() => {
                setCursorVisible((v) => !v);
            }, 500);
        } else {
            setCursorVisible(true);
            if (cursorInterval.current) clearInterval(cursorInterval.current);
        }
        return () => {
            if (cursorInterval.current) clearInterval(cursorInterval.current);
        };
    }, [showKeyboard]);

    // Remove manual handleSubmit, useForm handles it
    // const handleSubmit = (e: React.FormEvent) => { ... };

    const onKeyPress = (button: string, e?: MouseEvent) => {
        e?.stopPropagation();

        if (button === "{enter}") {
            setShowKeyboard(false);
            return;
        }
        if (button === "{bksp}") {
            // Use setFieldValue from useForm
            editPrinterForm.setFieldValue("name", (prev) => prev.slice(0, -1));
            return;
        }
        if (button === "{space}") {
            // Use setFieldValue from useForm
            editPrinterForm.setFieldValue("name", (prev) => prev + " ");
            return;
        }
        if (button === "{capslock}") {
            return;
        }
        // Use setFieldValue from useForm
        editPrinterForm.setFieldValue("name", (prev) => prev + button);
    };

    // handleOverlayClick and handleDialogClose (no changes needed here)
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            if (showKeyboard) {
                setShowKeyboard(false);
            } else {
                onClose();
            }
        }
    };

    const handleDialogClose = (open: boolean) => {
        if (!open) {
            if (showKeyboard) {
                setShowKeyboard(false);
            } else {
                onClose();
            }
        }
    };

    return (
        <div className={`${showKeyboard ? "keyboard-active" : ""}`}>
            <Dialog open={isOpen} onOpenChange={handleDialogClose}>
                <DialogOverlay
                    className="bg-black/80"
                    onClick={handleOverlayClick}
                />
                <DialogContent
                    className={`p-4 text-white bg-gray-800 max-w-lg transition-transform duration-200 ${
                        showKeyboard ? "transform -translate-y-[40vh]" : ""
                    }`}
                    onPointerDownOutside={(e) => {
                        if (
                            (e.target as HTMLElement)?.closest(
                                ".keyboard-container"
                            )
                        ) {
                            e.preventDefault();
                        }
                    }}
                    onInteractOutside={(e) => {
                        if (
                            (e.target as HTMLElement)?.closest(
                                ".keyboard-container"
                            )
                        ) {
                            e.preventDefault();
                        }
                    }}
                >
                    <DialogHeader className="pb-4">
                        <DialogTitle className="text-xl font-bold">
                            Edit Printer
                        </DialogTitle>
                    </DialogHeader>

                    {/* Use form tag with handleSubmit */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            editPrinterForm.handleSubmit();
                        }}
                        className="space-y-4"
                    >
                        {/* Use editPrinterForm.Field for name */}
                        <editPrinterForm.Field
                            name="name"
                            children={(field) => (
                                <div className="space-y-2">
                                    <Label
                                        htmlFor={field.name}
                                        className="text-sm font-medium"
                                    >
                                        Printer Name
                                    </Label>
                                    <div
                                        id={field.name}
                                        className="bg-gray-900 rounded p-2 cursor-text text-base min-h-[40px] relative"
                                        onClick={() => setShowKeyboard(true)}
                                        style={{ minHeight: 40 }}
                                    >
                                        <span>
                                            {field.state.value}{" "}
                                            {/* Use field state */}
                                            {showKeyboard && (
                                                <span
                                                    className={`inline-block w-2 h-5 align-middle ml-0.5 ${
                                                        cursorVisible
                                                            ? "bg-white"
                                                            : "bg-transparent"
                                                    }`}
                                                    style={{
                                                        borderLeft:
                                                            "2px solid white",
                                                        marginLeft: "2px",
                                                        verticalAlign: "middle",
                                                        animation: "none",
                                                    }}
                                                ></span>
                                            )}
                                            {!field.state.value &&
                                                !showKeyboard &&
                                                "Click to enter printer name"}
                                        </span>
                                    </div>
                                </div>
                            )}
                        />

                        {/* Use editPrinterForm.Field for color */}
                        <editPrinterForm.Field
                            name="color"
                            children={(field) => (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Printer Color
                                    </Label>
                                    {/* Use consistent color options and styling */}
                                    <div className="grid grid-cols-5 gap-2">
                                        {colorOptions.map((color) => (
                                            <button
                                                type="button" // Prevent form submission
                                                key={color.value}
                                                className={`relative h-10 w-10 rounded-md transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring ${
                                                    field.state.value ===
                                                    color.value
                                                        ? "ring-2 ring-white"
                                                        : "" // Highlight selected
                                                }`}
                                                style={{
                                                    backgroundColor:
                                                        color.value,
                                                }}
                                                onClick={
                                                    () =>
                                                        field.handleChange(
                                                            color.value
                                                        ) // Use field handler
                                                }
                                                title={color.name}
                                            >
                                                {field.state.value ===
                                                    color.value && (
                                                    <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-md" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            {/* Use editPrinterForm.Field for is_executive */}
                            <editPrinterForm.Field
                                name="is_executive"
                                children={(field) => (
                                    <div className="flex items-center justify-between px-3 py-2 bg-gray-900 rounded">
                                        <Label
                                            htmlFor={field.name}
                                            className="text-sm"
                                        >
                                            Executive
                                        </Label>
                                        <Switch
                                            id={field.name}
                                            checked={field.state.value} // Use field state
                                            onCheckedChange={field.handleChange} // Use field handler
                                            onBlur={field.handleBlur} // Use field handler
                                        />
                                    </div>
                                )}
                            />
                        </div>

                        <div className="flex gap-2 pt-4">
                            {" "}
                            {/* Add pt-4 for spacing */}
                            <Button
                                type="button"
                                onClick={onClose}
                                variant="outline"
                                className="flex-1 bg-red-500 hover:bg-red-600"
                                disabled={isPending} // Disable during mutation
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                disabled={isPending} // Disable during mutation
                            >
                                {isPending ? "Saving..." : "Save Changes"}{" "}
                                {/* Loading state */}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <VirtualKeyboard show={showKeyboard} onKeyPress={onKeyPress} />
        </div>
    );
}
