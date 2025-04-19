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
import { useState, useEffect, useRef } from "react"; // Keep useRef if needed elsewhere, remove if not
import type { Printer } from "@/types/Printer";
import { VirtualKeyboard } from "./VirtualKeyboard";
import "react-simple-keyboard/build/css/index.css";
import "./keyboard.css";
import { Check } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { addPrinter, getPrinters } from "@/api/printers";
import { toast } from "sonner";
import {
    showErrorToast,
    showSuccessToast,
} from "@/components/common/CustomToaster";

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

interface AddPrinterModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultRack: number;
}

export function AddPrinterModal({
    isOpen,
    onClose,
    defaultRack,
}: AddPrinterModalProps) {
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [calculatedId, setCalculatedId] = useState<number | null>(null); // State for calculated ID

    const queryClient = useQueryClient();

    // Fetch printers data
    const { data: printers, isLoading: isLoadingPrinters } = useQuery({
        queryKey: ["printers"],
        queryFn: getPrinters,
    });

    // Initial default values (ID will be updated)
    const initialDefaultPrinter: Printer = {
        id: 0, // Placeholder ID
        name: "",
        color: colorOptions[0].value,
        is_executive: false,
        in_use: false,
        last_reserved_by: "",
        rack: defaultRack,
        is_egn_printer: false,
    };

    const { isPending, mutate: handleAddPrinter } = useMutation({
        mutationFn: async (printer: Printer) => {
            // Ensure the ID being sent is not the placeholder 0
            if (printer.id === 0 || printer.id === null) {
                // This case should ideally not happen if isFormReady logic is correct
                showErrorToast(
                    "Error",
                    "Invalid Printer ID calculated. Please try again."
                );
                throw new Error("Invalid Printer ID calculated.");
            }
            return addPrinter(printer);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["printers"] });
            showSuccessToast("Success", `Printer added successfully!`);
            onClose();
        },
        onError: (error) => {
            // Avoid closing on specific errors like the ID issue
            if (
                (error as Error)?.message !== "Invalid Printer ID calculated."
            ) {
                showErrorToast(
                    "Error",
                    `Failed to add printer. Please try again.`
                );
                onClose();
            }
        },
    });

    const addPrinterForm = useForm({
        defaultValues: initialDefaultPrinter, // Use initial defaults
        onSubmit: async ({ value }) => {
            // Use the calculatedId state directly, ensuring it's valid
            if (calculatedId === null || calculatedId === 0) {
                showErrorToast("Error", "Invalid Printer ID calculated.");
                console.error(
                    "Submit blocked: calculatedId is invalid",
                    calculatedId
                );
                return; // Prevent submission
            }

            // Construct the payload using form values but overriding the ID
            const printerPayload: Printer = {
                ...value, // Get name, color, booleans, rack from form state
                id: calculatedId, // Explicitly set the calculated ID
            };

            handleAddPrinter(printerPayload); // Send the corrected payload
            setShowKeyboard(false);
        },
    });

    // Effect to calculate and set the next ID based on the overall max ID
    useEffect(() => {
        // Only run if printers data is loaded
        if (printers) {
            // Find the maximum ID across ALL printers
            const maxId = printers.reduce(
                (max, p) => Math.max(max, p.id),
                0 // Start with 0 if no printers exist
            );
            const nextId = maxId + 1;

            // Set the calculated ID state *after* initiating the reset
            setCalculatedId(nextId);
        } else {
            // Reset calculatedId if printers data is not available
            setCalculatedId(null);
        }
        // Dependency array includes addPrinterForm instance
    }, [printers]); // Removed defaultRack and addPrinterForm dependencies

    // Effect to update the form's rack value if the prop changes
    useEffect(() => {
        addPrinterForm.setFieldValue("rack", defaultRack);
        // Also reset calculatedId when rack changes, forcing recalculation/re-enabling
        // This might not be strictly necessary if ID calculation is global,
        // but good practice if ID logic were rack-specific again.
        // setCalculatedId(null); // Optional: uncomment if ID should reset on rack change
    }, [defaultRack, addPrinterForm]);

    const onKeyPress = (button: string, e?: MouseEvent) => {
        e?.stopPropagation();

        if (button === "{enter}") {
            setShowKeyboard(false);
            return;
        }
        if (button === "{bksp}") {
            addPrinterForm.setFieldValue("name", (prev) => prev.slice(0, -1));
            return;
        }
        if (button === "{space}") {
            addPrinterForm.setFieldValue("name", (prev) => prev + " ");
            return;
        }
        if (button === "{capslock}") {
            return;
        }
        addPrinterForm.setFieldValue("name", (prev) => prev + button);
    };

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

    // Form is ready only when printers are loaded AND the ID has been calculated
    const isFormReady = !isLoadingPrinters && calculatedId !== null;

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
                            Add New Printer to Rack {defaultRack}
                        </DialogTitle>
                        {/* Show calculated ID or loading state */}
                        <p className="text-sm text-gray-400">
                            Printer ID:{" "}
                            {isFormReady ? calculatedId : "Calculating..."}
                        </p>
                    </DialogHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (isFormReady) {
                                addPrinterForm.handleSubmit();
                            } else {
                                // Optionally provide feedback if submission is attempted too early
                                toast.info(
                                    "Please wait, calculating printer ID..."
                                );
                            }
                        }}
                        className="space-y-4"
                    >
                        <addPrinterForm.Field
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
                                            {field.state.value}
                                            {showKeyboard &&
                                                !field.state.value && (
                                                    <span className="text-gray-500">
                                                        |
                                                    </span> // Simple cursor indicator
                                                )}
                                            {!field.state.value &&
                                                !showKeyboard &&
                                                "Click to enter printer name"}
                                        </span>
                                    </div>
                                </div>
                            )}
                        />

                        <addPrinterForm.Field
                            name="color"
                            children={(field) => (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Printer Color
                                    </Label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {colorOptions.map((color) => (
                                            <button
                                                type="button" // Prevent form submission
                                                key={color.value}
                                                className="relative h-10 w-10 rounded-md transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring"
                                                style={{
                                                    backgroundColor:
                                                        color.value,
                                                }}
                                                onClick={() =>
                                                    field.handleChange(
                                                        color.value
                                                    )
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
                            <addPrinterForm.Field
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
                                            checked={field.state.value}
                                            onCheckedChange={field.handleChange}
                                            onBlur={field.handleBlur}
                                            disabled={!isFormReady} // Disable if form not ready
                                        />
                                    </div>
                                )}
                            />
                            <addPrinterForm.Field
                                name="is_egn_printer" // Add field for is_egn_printer
                                children={(field) => (
                                    <div className="flex items-center justify-between px-3 py-2 bg-gray-900 rounded">
                                        <Label
                                            htmlFor={field.name}
                                            className="text-sm"
                                        >
                                            EGN Printer
                                        </Label>
                                        <Switch
                                            id={field.name}
                                            checked={field.state.value}
                                            onCheckedChange={field.handleChange}
                                            onBlur={field.handleBlur}
                                            disabled={!isFormReady} // Disable if form not ready
                                        />
                                    </div>
                                )}
                            />
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button
                                type="button"
                                onClick={onClose}
                                variant="outline"
                                className="flex-1 bg-red-500 hover:bg-red-600"
                                disabled={isPending} // Keep disabled during mutation
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                disabled={isPending || !isFormReady} // Disable during mutation or if form not ready
                            >
                                {isLoadingPrinters
                                    ? "Loading..."
                                    : isPending
                                    ? "Adding..."
                                    : "Add Printer"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <VirtualKeyboard show={showKeyboard} onKeyPress={onKeyPress} />
        </div>
    );
}
