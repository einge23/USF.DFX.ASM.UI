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
import type { Printer } from "@/types/Printer";
import { VirtualKeyboard } from "./VirtualKeyboard";
import "react-simple-keyboard/build/css/index.css";
import "./keyboard.css";
import { Check } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPrinter } from "@/api/printers";
import { toast } from "sonner";

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
    const [cursorVisible, setCursorVisible] = useState(true);
    const cursorInterval = useRef<NodeJS.Timeout | null>(null);

    const queryClient = useQueryClient();
    const defaultPrinter: Printer = {
        id: 0,
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
            return addPrinter(printer);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["printers"] });
            toast.success("Printer added successfully!");
            onClose();
        },
        onError: () => {
            toast.error("Failed to add printer.");
            onClose();
        },
    });

    const addPrinterForm = useForm({
        defaultValues: defaultPrinter,
        onSubmit: async ({ value }) => {
            handleAddPrinter(value);
            setShowKeyboard(false);
        },
    });

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
                            Add New Printer
                        </DialogTitle>
                    </DialogHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addPrinterForm.handleSubmit();
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
                                        />
                                    </div>
                                )}
                            />
                            {/* Add is_egn_printer field here if needed */}
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button
                                type="button"
                                onClick={onClose}
                                variant="outline"
                                className="flex-1 bg-red-500 hover:bg-red-600"
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                disabled={isPending}
                            >
                                {isPending ? "Adding..." : "Add Printer"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <VirtualKeyboard show={showKeyboard} onKeyPress={onKeyPress} />
        </div>
    );
}
