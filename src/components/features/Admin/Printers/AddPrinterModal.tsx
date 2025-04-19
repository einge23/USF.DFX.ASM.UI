import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect, useCallback, useRef } from "react";
import type { Printer } from "@/types/Printer";
import { VirtualKeyboard } from "./VirtualKeyboard";
import "react-simple-keyboard/build/css/index.css";
import "./keyboard.css";
import { Check, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { getPrintersByRackId } from "@/api/printers";

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

interface AddPrinterModalProps {
    isOpen: boolean;
    onClose: () => void;
    existingPrinterIds: number[];
    onAddPrinter: (
        printerData: Omit<Printer, "in_use" | "last_reserved_by"> & {
            position: number;
        }
    ) => void;
}

export function AddPrinterModal({
    isOpen,
    onClose,
    existingPrinterIds,
    onAddPrinter,
}: AddPrinterModalProps) {
    const [step, setStep] = useState(1);
    const [rackIdInput, setRackIdInput] = useState("1");
    const [selectedRackId, setSelectedRackId] = useState<number | null>(null);
    const [printersInRack, setPrintersInRack] = useState<Printer[]>([]);
    const [isLoadingRack, setIsLoadingRack] = useState(false);
    const [rackError, setRackError] = useState<string | null>(null);
    const [selectedPosition, setSelectedPosition] = useState<number>(1);

    const [showKeyboard, setShowKeyboard] = useState(false);
    const [idValue, setIdValue] = useState<string>("");
    const [idError, setIdError] = useState<string | null>(null);
    const [isIdValid, setIsIdValid] = useState<boolean>(false);
    const [activeInputName, setActiveInputName] = useState<
        "id" | "name" | null
    >(null);
    const justClosedKeyboard = useRef(false); // Flag to track if keyboard was just closed by 'Done'

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setRackIdInput("1");
            setSelectedRackId(null);
            setPrintersInRack([]);
            setIsLoadingRack(false);
            setRackError(null);
            setSelectedPosition(1);
            setIdValue("");
            setIdError(null);
            setIsIdValid(false);
            setActiveInputName(null);
            addPrinterForm.reset();
        } else {
            setShowKeyboard(false);
            setActiveInputName(null);
        }
    }, [isOpen]); // addPrinterForm removed from dependencies as it's reset inside

    const validateId = useCallback(
        (value: string) => {
            const numValue = Number(value);
            if (value === "") {
                setIdError("ID is required");
                setIsIdValid(false);
                return false;
            }
            if (isNaN(numValue) || !Number.isInteger(numValue)) {
                setIdError("ID must be a whole number");
                setIsIdValid(false);
                return false;
            }
            if (numValue < 1 || numValue > 28) {
                setIdError("ID must be between 1 and 28");
                setIsIdValid(false);
                return false;
            }
            if (existingPrinterIds.includes(numValue)) {
                setIdError("This ID is already in use");
                setIsIdValid(false);
                return false;
            }
            setIdError(null);
            setIsIdValid(true);
            return true;
        },
        [existingPrinterIds]
    );

    useEffect(() => {
        if (step === 3) {
            validateId(idValue);
        }
    }, [idValue, existingPrinterIds, step, validateId]);

    const addPrinterForm = useForm({
        defaultValues: {
            id: null as number | null,
            name: "",
            color: colorOptions[0].value,
            is_executive: false,
            rack: null as number | null,
        },
        onSubmit: async ({ value }) => {
            if (!selectedRackId || !selectedPosition) return;
            if (!validateId(idValue)) return;
            if (!value.name) return;

            const printerPayload: Omit<
                Printer,
                "in_use" | "last_reserved_by"
            > & {
                position: number;
            } = {
                id: Number(idValue),
                name: value.name,
                color: value.color,
                rack: selectedRackId,
                is_executive: value.is_executive,
                is_egn_printer: false,
                position: selectedPosition,
            };

            onAddPrinter(printerPayload);
        },
    });

    const handleRackIdChange = (direction: "up" | "down") => {
        setRackIdInput((prev) => {
            const currentNum = parseInt(prev, 10);
            if (isNaN(currentNum)) return "1";

            let nextNum = direction === "up" ? currentNum + 1 : currentNum - 1;
            if (nextNum < 1) nextNum = 1;

            return String(nextNum);
        });
        setRackError(null);
    };

    const handleSelectRack = async () => {
        const rackNum = parseInt(rackIdInput, 10);
        if (isNaN(rackNum) || rackNum <= 0) {
            setRackError("Please enter a valid Rack ID (positive number).");
            return;
        }
        setIsLoadingRack(true);
        setRackError(null);
        try {
            const printers = await getPrintersByRackId(rackNum);
            setPrintersInRack(printers);
            setSelectedRackId(rackNum);
            setSelectedPosition(1);
            setStep(2);
        } catch (error) {
            console.error("Failed to fetch printers for rack:", error);
            setRackError(
                `Failed to load printers for Rack ${rackNum}. The rack might be empty or inaccessible. Please check the rack ID or API.`
            );
            setSelectedRackId(null);
        } finally {
            setIsLoadingRack(false);
        }
    };

    const handleSelectPosition = () => {
        if (!selectedRackId) return;
        addPrinterForm.reset();
        addPrinterForm.setFieldValue("rack", selectedRackId);
        addPrinterForm.setFieldValue("color", colorOptions[0].value);
        setIdValue("");
        setIdError(null);
        setIsIdValid(false);
        setStep(3);
    };

    const handleIdClick = () => {
        setActiveInputName("id");
        setShowKeyboard(true);
    };

    const handleNameClick = () => {
        setActiveInputName("name");
        setShowKeyboard(true);
    };

    const onKeyPress = (button: string) => {
        if (step !== 3) return;

        if (button === "{enter}") {
            justClosedKeyboard.current = true; // Set the flag BEFORE hiding keyboard
            setShowKeyboard(false);
            setActiveInputName(null);
            return;
        }

        if (button === "{bksp}") {
            if (activeInputName === "id") {
                setIdValue((prev) => prev.slice(0, -1));
            } else if (activeInputName === "name") {
                addPrinterForm.setFieldValue("name", (prev) =>
                    prev.slice(0, -1)
                );
            }
            return;
        }

        if (button === "{space}") {
            if (activeInputName === "name") {
                addPrinterForm.setFieldValue("name", (prev) => prev + " ");
            }
            return;
        }

        if (activeInputName === "id") {
            if (/^\d$/.test(button)) {
                setIdValue((prev) => prev + button);
            }
        } else if (activeInputName === "name") {
            addPrinterForm.setFieldValue("name", (prev) => prev + button);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            if (showKeyboard) {
                setShowKeyboard(false);
                setActiveInputName(null);
            } else {
                onClose();
            }
        }
    };

    const handleDialogClose = (open: boolean) => {
        if (!open) {
            if (justClosedKeyboard.current) {
                justClosedKeyboard.current = false;
                return;
            }

            if (showKeyboard) {
                setShowKeyboard(false);
                setActiveInputName(null);
            } else {
                onClose();
            }
        }
    };

    const handlePointerDownOutside = (e: Event) => {
        if ((e.target as HTMLElement)?.closest(".keyboard-container")) {
            e.preventDefault();
        }
    };

    const isSubmitting = addPrinterForm.state.isSubmitting;
    const isStep3FormValid =
        addPrinterForm.state.values.name?.length > 0 && isIdValid;
    const maxPosition = printersInRack.length + 1;

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-bold text-center">
                                Step 1: Select Rack
                            </DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center space-y-4">
                            <Label className="text-xl font-medium">
                                Rack ID
                            </Label>
                            <div className="flex items-center space-x-4">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="p-4"
                                    onClick={() => handleRackIdChange("down")}
                                    disabled={
                                        isLoadingRack || rackIdInput === "1"
                                    }
                                >
                                    <ChevronDown className="w-8 h-8" />
                                </Button>
                                <div className="text-6xl font-bold w-24 text-center bg-gray-900 p-4 rounded">
                                    {rackIdInput}
                                </div>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="p-4"
                                    onClick={() => handleRackIdChange("up")}
                                    disabled={isLoadingRack}
                                >
                                    <ChevronUp className="w-8 h-8" />
                                </Button>
                            </div>
                            {rackError && (
                                <em
                                    role="alert"
                                    className="text-red-500 text-lg"
                                >
                                    {rackError}
                                </em>
                            )}
                        </div>
                        <div className="flex gap-4 pt-6">
                            <Button
                                type="button"
                                onClick={onClose}
                                variant="outline"
                                className="flex-1 text-xl py-4 bg-red-500 hover:bg-red-600"
                                disabled={isLoadingRack}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSelectRack}
                                className="flex-1 text-xl py-4 bg-blue-600 hover:bg-blue-700"
                                disabled={isLoadingRack || !rackIdInput}
                            >
                                {isLoadingRack ? (
                                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                ) : null}
                                {isLoadingRack ? "Loading..." : "Continue"}
                            </Button>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-4">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                Step 2: Select Position in Rack {selectedRackId}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                Current Rack Layout ({printersInRack.length}{" "}
                                {printersInRack.length === 1
                                    ? "printer"
                                    : "printers"}
                                )
                            </Label>
                            <div className="flex flex-wrap gap-2 p-2 bg-gray-900 rounded min-h-[60px] items-center">
                                {printersInRack.length === 0 && (
                                    <span className="text-gray-400 text-sm italic">
                                        Rack is currently empty. The new printer
                                        will be Position 1.
                                    </span>
                                )}
                                {printersInRack.map((p, index) => (
                                    <div
                                        key={p.id}
                                        className="h-10 w-10 rounded flex items-center justify-center text-xs font-bold text-white shadow-md"
                                        style={{ backgroundColor: p.color }}
                                        title={`ID: ${p.id}, Name: ${p.name}`}
                                    >
                                        {index + 1}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="position-slider"
                                className="text-sm font-medium"
                            >
                                Choose Position for New Printer (Position{" "}
                                {selectedPosition} of {maxPosition})
                            </Label>
                            {maxPosition > 1 ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-mono">1</span>
                                    <Slider
                                        id="position-slider"
                                        min={1}
                                        max={maxPosition}
                                        step={1}
                                        value={[selectedPosition]}
                                        onValueChange={(value) =>
                                            setSelectedPosition(value[0])
                                        }
                                        className="flex-grow [&_[role=slider]]:bg-blue-500 [&_[role=slider]]:h-8 [&_[role=slider]]:w-8 [&>span:first-child]:h-4"
                                    />
                                    <span className="text-sm font-mono">
                                        {maxPosition}
                                    </span>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">
                                    Only position 1 is available.
                                </p>
                            )}
                            <div className="flex flex-wrap gap-2 p-2 bg-gray-700 rounded min-h-[60px] items-center border border-dashed border-blue-400">
                                {[...Array(maxPosition)].map((_, index) => {
                                    const pos = index + 1;
                                    const isExisting =
                                        pos <= printersInRack.length &&
                                        selectedPosition > pos;
                                    const isNewPosition =
                                        pos === selectedPosition;
                                    const isAfterNew = pos > selectedPosition;

                                    let content: React.ReactNode = pos;
                                    let bgColor = "bg-gray-600";
                                    let title = `Position ${pos}`;

                                    if (isNewPosition) {
                                        bgColor = "bg-blue-500 animate-pulse";
                                        content = "NEW";
                                        title = `Adding printer here (Position ${pos})`;
                                    } else if (isExisting) {
                                        const printer = printersInRack[index];
                                        bgColor = printer.color;
                                        content = pos;
                                        title = `Existing: ${printer.name} (ID: ${printer.id}) - Will be at Position ${pos}`;
                                    } else if (
                                        isAfterNew &&
                                        pos <= printersInRack.length + 1
                                    ) {
                                        const originalIndex = index - 1;
                                        if (
                                            originalIndex <
                                            printersInRack.length
                                        ) {
                                            const printer =
                                                printersInRack[originalIndex];
                                            bgColor = printer.color;
                                            content = pos;
                                            title = `Existing: ${printer.name} (ID: ${printer.id}) - Will move to Position ${pos}`;
                                        }
                                    }

                                    return (
                                        <div
                                            key={pos}
                                            className={`h-10 w-10 rounded flex items-center justify-center text-xs font-bold text-white shadow-md ${bgColor}`}
                                            title={title}
                                        >
                                            {content}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button
                                type="button"
                                onClick={() => setStep(1)}
                                variant="outline"
                                className="flex-1"
                            >
                                Back
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSelectPosition}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addPrinterForm.handleSubmit();
                        }}
                        className={`space-y-3 ${
                            showKeyboard
                                ? "overflow-y-auto max-h-[calc(100vh-100px)]"
                                : ""
                        }`}
                    >
                        <DialogHeader className="pb-1">
                            <DialogTitle className="text-xl font-bold">
                                Step 3: Add Printer Details (Rack{" "}
                                {selectedRackId}, Position {selectedPosition})
                            </DialogTitle>
                        </DialogHeader>

                        <p className="text-sm text-yellow-300 bg-yellow-900/30 p-2 rounded border border-yellow-500">
                            Please ensure the new printer is physically plugged
                            into the correct slot corresponding to{" "}
                            <strong>Position {selectedPosition}</strong> in Rack{" "}
                            {selectedRackId}.
                        </p>

                        <div className="space-y-1">
                            <Label
                                htmlFor="printer-id"
                                className="text-sm font-medium"
                            >
                                Printer ID (1-28, Unique System-Wide)
                            </Label>
                            <div
                                id="printer-id-display"
                                className={`bg-gray-900 rounded p-2 cursor-text text-base min-h-[40px] relative ${
                                    activeInputName === "id"
                                        ? "ring-2 ring-blue-500"
                                        : ""
                                }`}
                                onClick={handleIdClick}
                                style={{ minHeight: 40 }}
                            >
                                <input
                                    type="number"
                                    id="printer-id"
                                    name="id"
                                    value={idValue}
                                    readOnly
                                    className="hidden"
                                />
                                <span
                                    className={`absolute inset-0 p-2 pointer-events-none ${
                                        idValue ? "text-white" : "text-gray-500"
                                    }`}
                                    aria-hidden="true"
                                >
                                    {idValue || "Click to enter printer ID"}
                                </span>
                            </div>
                            {idError && (
                                <em
                                    id="id-error"
                                    role="alert"
                                    className="text-red-500 text-xs"
                                >
                                    {idError}
                                </em>
                            )}
                        </div>

                        <addPrinterForm.Field
                            name="name"
                            children={(field) => (
                                <div className="space-y-1">
                                    <Label
                                        htmlFor={field.name}
                                        className="text-sm font-medium"
                                    >
                                        Printer Name
                                    </Label>
                                    <div
                                        id={field.name}
                                        className={`bg-gray-900 rounded p-2 cursor-text text-base min-h-[40px] relative ${
                                            activeInputName === "name"
                                                ? "ring-2 ring-blue-500"
                                                : ""
                                        }`}
                                        onClick={handleNameClick}
                                        style={{ minHeight: 40 }}
                                    >
                                        <input
                                            type="text"
                                            value={field.state.value}
                                            readOnly
                                            className="hidden"
                                        />
                                        <span
                                            className={`absolute inset-0 p-2 pointer-events-none ${
                                                field.state.value
                                                    ? "text-white"
                                                    : "text-gray-500"
                                            }`}
                                            aria-hidden="true"
                                        >
                                            {field.state.value ||
                                                "Click to enter printer name"}
                                        </span>
                                    </div>
                                    {!field.state.value &&
                                        addPrinterForm.state.isSubmitted && (
                                            <em
                                                role="alert"
                                                className="text-red-500 text-xs"
                                            >
                                                Name cannot be empty
                                            </em>
                                        )}
                                </div>
                            )}
                        />

                        <addPrinterForm.Field
                            name="color"
                            children={(field) => (
                                <div className="space-y-1">
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
                                                disabled={isSubmitting}
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

                        <div className="grid grid-cols-1 gap-2">
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
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                )}
                            />
                        </div>

                        <div className="flex gap-2 pt-3">
                            <Button
                                type="button"
                                onClick={() => setStep(2)}
                                variant="outline"
                                className="flex-1"
                                disabled={isSubmitting}
                            >
                                Back
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                disabled={isSubmitting || !isStep3FormValid}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                {isSubmitting ? "Adding..." : "Add Printer"}
                            </Button>
                        </div>
                    </form>
                );
            default:
                return null;
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
                    className={`p-4 text-white bg-gray-800 max-w-lg transition-transform duration-300 ease-out ${
                        showKeyboard ? "transform -translate-y-[50vh]" : ""
                    }`}
                    onPointerDownOutside={handlePointerDownOutside}
                    onInteractOutside={handlePointerDownOutside}
                >
                    {renderStepContent()}
                </DialogContent>
            </Dialog>

            {step === 3 && (
                <VirtualKeyboard show={showKeyboard} onKeyPress={onKeyPress} />
            )}
        </div>
    );
}
