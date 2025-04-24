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

const colorOptions = [
    { name: "Red", value: "#dc2626" },
    { name: "Orange", value: "#ea580c" },
    { name: "Amber", value: "#d97706" },
    { name: "Yellow", value: "#ca8a04" },
    { name: "Lime", value: "#65a30d" },
    { name: "Green", value: "#16a34a" },
    { name: "Emerald", value: "#059669" },
    { name: "Teal", value: "#0d9488" },
    { name: "Cyan", value: "#0891b2" },
    { name: "Sky", value: "#0284c7" },
    { name: "Blue", value: "#2563eb" },
    { name: "Indigo", value: "#4f46e5" },
    { name: "Violet", value: "#7c3aed" },
    { name: "Purple", value: "#9333ea" },
    { name: "Fuchsia", value: "#c026d3" },
    { name: "Pink", value: "#db2777" },
    { name: "Rose", value: "#e11d48" },
    { name: "Gray", value: "#6b7280" },
    { name: "Slate", value: "#64748b" },
    { name: "Zinc", value: "#71717a" },
];

interface EditPrinterModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Update Printer type to exclude is_egn_printer if it's fully removed from the type definition
    printer: Omit<Printer, "is_egn_printer">;
    // Update prop type to match mutation's mutate function
    onEditPrinter: (printerData: Omit<Printer, "is_egn_printer">) => void;
}

export function EditPrinterModal({
    isOpen,
    onClose,
    printer,
    onEditPrinter,
}: EditPrinterModalProps) {
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [cursorVisible, setCursorVisible] = useState(true);
    const cursorInterval = useRef<NodeJS.Timeout | null>(null);

    const editPrinterForm = useForm({
        // Ensure defaultValues includes rack
        defaultValues: printer,
        onSubmit: async ({ value }) => {
            // Ensure rack is included in the submitted value
            const { is_egn_printer, ...submitValue } = value as any;
            onEditPrinter(submitValue);
        },
    });

    useEffect(() => {
        editPrinterForm.reset(printer);
    }, [printer, editPrinterForm]);

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
            editPrinterForm.setFieldValue("name", (prev) => prev.slice(0, -1));
            return;
        }
        if (button === "{space}") {
            editPrinterForm.setFieldValue("name", (prev) => prev + " ");
            return;
        }
        if (button === "{capslock}") {
            return;
        }
        editPrinterForm.setFieldValue("name", (prev) => prev + button);
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

    const isPending = editPrinterForm.state.isSubmitting;
    const isFormValid = editPrinterForm.state.isValid;

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

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            editPrinterForm.handleSubmit();
                        }}
                        className="space-y-4"
                    >
                        <editPrinterForm.Field
                            name="name"
                            validators={{
                                onChange: (value) =>
                                    !value ? "Name cannot be empty" : undefined,
                            }}
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
                                    {field.state.meta.errors ? (
                                        <em
                                            role="alert"
                                            className="text-red-500 text-xs"
                                        >
                                            {field.state.meta.errors.join(", ")}
                                        </em>
                                    ) : null}
                                </div>
                            )}
                        />

                        <editPrinterForm.Field
                            name="color"
                            children={(field) => (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Printer Color
                                    </Label>
                                    <div className="grid grid-cols-7 gap-2">
                                        {colorOptions.map((color) => (
                                            <button
                                                type="button"
                                                key={color.value}
                                                className={`relative h-8 w-8 rounded-md transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring ${
                                                    field.state.value ===
                                                    color.value
                                                        ? "ring-2 ring-white"
                                                        : ""
                                                }`}
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
                                                    <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-md" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        />

                        <div className="grid grid-cols-1 gap-4">
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
                                            checked={field.state.value}
                                            onCheckedChange={field.handleChange}
                                            onBlur={field.handleBlur}
                                            className="transform scale-125 origin-right !bg-blue-600 [&>span]:bg-white"
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
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                disabled={isPending || !isFormValid}
                            >
                                {isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <VirtualKeyboard show={showKeyboard} onKeyPress={onKeyPress} />
        </div>
    );
}
