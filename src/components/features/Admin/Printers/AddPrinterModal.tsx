import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
// Input is no longer directly used in the form display
// import { Input } from "@/components/ui/input";
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
import { Plus, Minus } from "lucide-react";

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
        printerData: Omit<Printer, "in_use" | "last_reserved_by">
    ) => void;
}

export function AddPrinterModal({
    isOpen,
    onClose,
    existingPrinterIds,
    onAddPrinter,
}: AddPrinterModalProps) {
    const [step, setStep] = useState(1); // Now 4 steps
    const [rackIdInput, setRackIdInput] = useState("1"); // Default to 1, use string for display
    const [selectedRackId, setSelectedRackId] = useState<number | null>(null);
    const [printersInRack, setPrintersInRack] = useState<Printer[]>([]);
    const [isLoadingRack, setIsLoadingRack] = useState(false);
    const [rackError, setRackError] = useState<string | null>(null);
    const [selectedPosition, setSelectedPosition] = useState<number>(1);

    // State for Step 3 (ID/Name)
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [idValue, setIdValue] = useState<string>("");
    const [nameValue, setNameValue] = useState<string>(""); // Separate state for name input
    const [idError, setIdError] = useState<string | null>(null);
    const [nameError, setNameError] = useState<string | null>(null); // Error state for name
    const [isIdValid, setIsIdValid] = useState<boolean>(false);
    const [isNameValid, setIsNameValid] = useState<boolean>(false); // Validity state for name
    const [activeInputName, setActiveInputName] = useState<
        "id" | "name" | null
    >(null);
    const justClosedKeyboard = useRef(false);

    // Reset state when modal opens or closes
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
            setNameValue(""); // Reset name value
            setIdError(null);
            setNameError(null); // Reset name error
            setIsIdValid(false);
            setIsNameValid(false); // Reset name validity
            setActiveInputName(null);
            addPrinterForm.reset();
        } else {
            setShowKeyboard(false);
            setActiveInputName(null);
        }
    }, [isOpen]); // addPrinterForm removed

    // --- Validation ---
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

    const validateName = useCallback((value: string) => {
        if (!value || value.trim().length === 0) {
            setNameError("Name cannot be empty");
            setIsNameValid(false);
            return false;
        }
        setNameError(null);
        setIsNameValid(true);
        return true;
    }, []);

    // Effects to validate ID and Name whenever their values change (only in Step 3)
    useEffect(() => {
        if (step === 3) {
            validateId(idValue);
        }
    }, [idValue, step, validateId]);

    useEffect(() => {
        if (step === 3) {
            validateName(nameValue);
        }
    }, [nameValue, step, validateName]);

    // --- Form Definition ---
    const addPrinterForm = useForm({
        defaultValues: {
            // id and name are handled by separate state until step 4
            color: colorOptions[0].value,
            is_executive: false,
            // rack and rack_position are set before step 4
        },
        onSubmit: async ({ value }) => {
            // Submission now happens in Step 4
            if (
                !selectedRackId ||
                !selectedPosition ||
                !isIdValid ||
                !isNameValid
            )
                return;

            const printerPayload: Omit<Printer, "in_use" | "last_reserved_by"> =
                {
                    id: Number(idValue), // Use state value
                    name: nameValue, // Use state value
                    color: value.color,
                    rack: selectedRackId,
                    is_executive: value.is_executive,
                    is_egn_printer: false,
                    rack_position: selectedPosition,
                };

            onAddPrinter(printerPayload);
        },
    });

    // --- Step Navigation ---
    const handleRackIdChange = (direction: "up" | "down") => {
        setRackIdInput((prev) => {
            const currentNum = parseInt(prev, 10);
            if (isNaN(currentNum)) return "1"; // Reset if invalid somehow

            let nextNum = direction === "up" ? currentNum + 1 : currentNum - 1;
            if (nextNum < 1) nextNum = 1; // Prevent going below 1
            if (nextNum > 9) nextNum = 9; // Prevent exceeding 9

            return String(nextNum);
        });
        setRackError(null); // Clear error on change
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
            // Fetch printers for the selected rack using the imported function
            // IMPORTANT: Ensure getPrintersByRack handles empty racks by returning []
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

    // Step 2 -> 3
    const handleSelectPosition = () => {
        if (!selectedRackId) return;
        // No need to set form values here anymore
        setStep(3);
    };

    // Step 3 -> 4
    const handleConfirmIdAndName = () => {
        // Re-validate before proceeding
        const idOk = validateId(idValue);
        const nameOk = validateName(nameValue);
        if (idOk && nameOk) {
            // Reset form defaults for step 4 before moving
            addPrinterForm.reset();
            addPrinterForm.setFieldValue("color", colorOptions[0].value);
            addPrinterForm.setFieldValue("is_executive", false);
            setStep(4);
        }
    };

    // --- Keyboard/Input Handling (Step 3) ---
    const handleIdClick = () => {
        setActiveInputName("id");
        setShowKeyboard(true);
    };

    const handleNameClick = () => {
        setActiveInputName("name");
        setShowKeyboard(true);
    };

    const onKeyPress = (button: string) => {
        if (step !== 3) return; // Only handle keypress in step 3

        if (button === "{enter}") {
            justClosedKeyboard.current = true;
            setShowKeyboard(false);
            setActiveInputName(null);
            return;
        }

        if (button === "{bksp}") {
            if (activeInputName === "id") {
                setIdValue((prev) => prev.slice(0, -1));
            } else if (activeInputName === "name") {
                setNameValue((prev) => prev.slice(0, -1)); // Update nameValue state
            }
            return;
        }

        if (button === "{space}") {
            if (activeInputName === "name") {
                setNameValue((prev) => prev + " "); // Update nameValue state
            }
            return;
        }

        // Handle regular character input
        if (activeInputName === "id") {
            if (/^\d$/.test(button)) {
                setIdValue((prev) => prev + button);
            }
        } else if (activeInputName === "name") {
            setNameValue((prev) => prev + button); // Update nameValue state
        }
    };

    // --- Event Handlers for Dialog/Keyboard Interaction ---
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            if (showKeyboard) {
                setShowKeyboard(false);
                setActiveInputName(null); // Deactivate input focus
            } else {
                onClose();
            }
        }
    };

    const handleDialogClose = (open: boolean) => {
        if (!open) {
            // If the keyboard was just closed via the "Done" button,
            // prevent the dialog from closing and reset the flag.
            if (justClosedKeyboard.current) {
                justClosedKeyboard.current = false;
                return; // Stop the dialog from closing
            }

            // Otherwise, proceed with normal close logic
            if (showKeyboard) {
                setShowKeyboard(false);
                setActiveInputName(null);
            } else {
                onClose(); // Otherwise, close the modal
            }
        }
    };

    const handlePointerDownOutside = (e: Event) => {
        if ((e.target as HTMLElement)?.closest(".keyboard-container")) {
            e.preventDefault();
        }
    };

    // --- Derived State ---
    const isSubmitting = addPrinterForm.state.isSubmitting;
    const isStep3Valid = isIdValid && isNameValid; // Combined validity for Step 3
    const maxPosition = printersInRack.length + 1;

    // --- Render Logic ---
    const renderStepContent = () => {
        switch (step) {
            case 1: // Select Rack (Mostly unchanged, maybe slightly larger buttons/text)
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
                                    variant="ghost"
                                    size="lg"
                                    className="p-5 h-20 w-20"
                                    onClick={() => handleRackIdChange("down")}
                                    disabled={
                                        isLoadingRack || rackIdInput === "1"
                                    }
                                >
                                    <Minus className="!w-10 !h-10" />
                                    {/* Larger icon */}
                                </Button>
                                <div
                                    className="text-7xl font-bold w-28 text-center bg-gray-900 p-4 rounded" // Larger text, width
                                >
                                    {rackIdInput}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    className="p-5 h-20 w-20" // Larger button
                                    onClick={() => handleRackIdChange("up")}
                                    disabled={isLoadingRack}
                                >
                                    <Plus className="!w-10 !h-10" />{" "}
                                    {/* Larger icon */}
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
                                className="flex-1 text-xl py-5 bg-gray-600 hover:bg-gray-700" // Larger padding/text
                                disabled={isLoadingRack}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSelectRack}
                                className="flex-1 text-xl py-5 bg-blue-600 hover:bg-blue-700" // Larger padding/text
                                disabled={isLoadingRack || !rackIdInput}
                            >
                                {isLoadingRack ? (
                                    <Loader2 className="mr-2 h-7 w-7 animate-spin" /> // Larger spinner
                                ) : null}
                                {isLoadingRack ? "Loading..." : "Continue"}
                            </Button>
                        </div>
                    </div>
                );

            case 2: // Select Position (Make elements ~15% smaller)
                return (
                    <div className="space-y-4">
                        {" "}
                        {/* Slightly reduced spacing */}
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                {" "}
                                {/* Slightly smaller title */}
                                Step 2: Select Position in Rack {selectedRackId}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2">
                            {" "}
                            {/* Slightly reduced spacing */}
                            <Label className="text-base font-medium">
                                {" "}
                                {/* Slightly smaller label */}
                                Current Rack Layout ({
                                    printersInRack.length
                                }{" "}
                                {printersInRack.length === 1
                                    ? "printer"
                                    : "printers"}
                                )
                            </Label>
                            <div className="flex flex-wrap gap-2 p-2.5 bg-gray-900 rounded min-h-[60px] items-center">
                                {" "}
                                {/* Slightly smaller gap/padding/min-h */}
                                {printersInRack.length === 0 && (
                                    <span className="text-gray-400 text-sm italic">
                                        {" "}
                                        {/* Slightly smaller text */}
                                        Rack is currently empty. New printer =
                                        Position 1.
                                    </span>
                                )}
                                {printersInRack.map((p, index) => (
                                    <div
                                        key={p.id}
                                        className="h-12 w-12 rounded flex items-center justify-center text-sm font-bold text-white shadow-md" // Slightly smaller size/text
                                        style={{ backgroundColor: p.color }}
                                        title={`ID: ${p.id}, Name: ${p.name}`}
                                    >
                                        {index + 1}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            {" "}
                            {/* Slightly reduced spacing */}
                            <Label
                                htmlFor="position-slider"
                                className="text-base font-medium" // Slightly smaller label
                            >
                                Choose Position for New Printer (Position{" "}
                                {selectedPosition} of {maxPosition})
                            </Label>
                            {maxPosition > 1 ? (
                                <div className="flex items-center gap-4">
                                    {" "}
                                    {/* Slightly smaller gap */}
                                    <span className="text-base font-mono">
                                        1
                                    </span>{" "}
                                    {/* Slightly smaller text */}
                                    <Slider
                                        id="position-slider"
                                        min={1}
                                        max={maxPosition}
                                        step={1}
                                        value={[selectedPosition]}
                                        onValueChange={(value) =>
                                            setSelectedPosition(value[0])
                                        }
                                        // Slightly smaller slider
                                        className="flex-grow [&_[role=slider]]:bg-blue-500 [&_[role=slider]]:h-8 [&_[role=slider]]:w-8 [&>span:first-child]:h-4"
                                    />
                                    <span className="text-base font-mono">
                                        {" "}
                                        {/* Slightly smaller text */}
                                        {maxPosition}
                                    </span>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">
                                    {" "}
                                    {/* Slightly smaller text */}
                                    Only position 1 is available.
                                </p>
                            )}
                            {/* Slightly smaller preview boxes */}
                            <div className="flex flex-wrap gap-2 p-2.5 bg-gray-700 rounded min-h-[60px] items-center border-2 border-dashed border-blue-400">
                                {" "}
                                {/* Slightly smaller gap/padding/min-h */}
                                {[...Array(maxPosition)].map((_, index) => {
                                    // ... logic for content/bgColor/title remains the same ...
                                    let content: React.ReactNode = index + 1;
                                    let bgColor = "bg-gray-600";
                                    let title = `Position ${index + 1}`;
                                    const pos = index + 1;
                                    const isNewPosition =
                                        pos === selectedPosition;
                                    // ... (rest of the logic from previous version) ...
                                    if (isNewPosition) {
                                        bgColor = "bg-blue-500 animate-pulse";
                                        content = "NEW";
                                        title = `Adding printer here (Position ${pos})`;
                                    } else {
                                        const existingPrinterIndex =
                                            isNewPosition
                                                ? -1
                                                : pos < selectedPosition
                                                ? index
                                                : index - 1;
                                        if (
                                            existingPrinterIndex >= 0 &&
                                            existingPrinterIndex <
                                                printersInRack.length
                                        ) {
                                            const printer =
                                                printersInRack[
                                                    existingPrinterIndex
                                                ];
                                            bgColor = printer.color;
                                            content = pos; // Show new position number
                                            title = `Existing: ${printer.name} (ID: ${printer.id}) - Will be at Position ${pos}`;
                                        }
                                    }

                                    return (
                                        <div
                                            key={pos}
                                            className={`h-12 w-12 rounded flex items-center justify-center text-sm font-bold text-white shadow-md ${bgColor}`} // Slightly smaller size/text
                                            title={title}
                                        >
                                            {content}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="flex gap-4 pt-4">
                            {" "}
                            {/* Slightly reduced gap/padding */}
                            <Button
                                type="button"
                                onClick={() => setStep(1)}
                                variant="outline"
                                className="flex-1 text-lg py-4 bg-gray-600 hover:bg-gray-700" // Slightly smaller padding/text
                            >
                                Back
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSelectPosition}
                                className="flex-1 text-lg py-4 bg-blue-600 hover:bg-blue-700" // Slightly smaller padding/text
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                );

            case 3: // Enter ID & Name (New Step 3)
                return (
                    // Remove padding-bottom class here, rely on DialogContent translation
                    <div className={`space-y-4`}>
                        <DialogHeader className="pb-2">
                            <DialogTitle className="text-2xl font-bold">
                                Step 3: Enter ID & Name
                            </DialogTitle>
                        </DialogHeader>
                        {/* Printer ID Field */}
                        <div className="space-y-1">
                            <Label
                                htmlFor="printer-id"
                                className="text-lg font-medium" // Larger label
                            >
                                Printer ID (1-28, Unique)
                            </Label>
                            <div
                                id="printer-id-display"
                                className={`bg-gray-900 rounded p-3 cursor-text text-xl min-h-[60px] relative ${
                                    // Larger padding/text/min-h
                                    activeInputName === "id"
                                        ? "ring-2 ring-blue-500"
                                        : ""
                                }`}
                                onClick={handleIdClick}
                                style={{ minHeight: 60 }}
                            >
                                <span
                                    className={`absolute inset-0 p-3 pointer-events-none ${
                                        // Larger padding
                                        idValue ? "text-white" : "text-gray-500"
                                    }`}
                                    aria-hidden="true"
                                >
                                    {idValue || "Tap to enter printer ID"}
                                </span>
                            </div>
                            {idError && (
                                <em
                                    id="id-error"
                                    role="alert"
                                    className="text-red-500 text-base" // Larger error text
                                >
                                    {idError}
                                </em>
                            )}
                        </div>
                        {/* Printer Name Field */}
                        <div className="space-y-1">
                            <Label
                                htmlFor="printer-name"
                                className="text-lg font-medium" // Larger label
                            >
                                Printer Name
                            </Label>
                            <div
                                id="printer-name-display"
                                className={`bg-gray-900 rounded p-3 cursor-text text-xl min-h-[60px] relative ${
                                    // Larger padding/text/min-h
                                    activeInputName === "name"
                                        ? "ring-2 ring-blue-500"
                                        : ""
                                }`}
                                onClick={handleNameClick}
                                style={{ minHeight: 60 }}
                            >
                                <span
                                    className={`absolute inset-0 p-3 pointer-events-none ${
                                        // Larger padding
                                        nameValue
                                            ? "text-white"
                                            : "text-gray-500"
                                    }`}
                                    aria-hidden="true"
                                >
                                    {nameValue || "Tap to enter printer name"}
                                </span>
                            </div>
                            {nameError && (
                                <em
                                    id="name-error"
                                    role="alert"
                                    className="text-red-500 text-base" // Larger error text
                                >
                                    {nameError}
                                </em>
                            )}
                        </div>
                        {/* Buttons */}
                        <div className="flex gap-4 pt-5">
                            {" "}
                            {/* Increased gap/padding */}
                            <Button
                                type="button"
                                onClick={() => setStep(2)} // Go back to Step 2
                                variant="outline"
                                className="flex-1 text-xl py-5 bg-gray-600 hover:bg-gray-700" // Larger padding/text
                            >
                                Back
                            </Button>
                            <Button
                                type="button"
                                onClick={handleConfirmIdAndName}
                                className="flex-1 text-xl py-5 bg-blue-600 hover:bg-blue-700" // Larger padding/text
                                disabled={!isStep3Valid} // Disable if ID or Name is invalid
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                );

            case 4: // Select Color & Executive, Submit (Make elements ~15% smaller)
                return (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addPrinterForm.handleSubmit();
                        }}
                        className="space-y-4" // Slightly reduced spacing
                    >
                        <DialogHeader className="pb-2">
                            <DialogTitle className="text-xl font-bold">
                                {" "}
                                {/* Slightly smaller title */}
                                Step 4: Final Details & Add
                            </DialogTitle>
                        </DialogHeader>

                        {/* Restore detailed warning text */}
                        <p className="text-sm text-yellow-300 bg-yellow-900/30 p-2 rounded border border-yellow-500">
                            {" "}
                            {/* Slightly smaller text/padding */}
                            Please ensure the new printer is physically plugged
                            into the correct slot corresponding to{" "}
                            <strong>Position {selectedPosition}</strong> in Rack{" "}
                            {selectedRackId}.
                        </p>

                        {/* Color Field */}
                        <addPrinterForm.Field
                            name="color"
                            children={(field) => (
                                <div className="space-y-1.5">
                                    {" "}
                                    {/* Slightly reduced spacing */}
                                    <Label className="text-base font-medium">
                                        {" "}
                                        Printer Color
                                    </Label>
                                    <div className="grid grid-cols-7 gap-2">
                                        {" "}
                                        {colorOptions.map((color) => (
                                            <button
                                                type="button"
                                                key={color.value}
                                                className={`relative h-10 w-10 rounded-md transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring ${
                                                    field.state.value ===
                                                    color.value
                                                        ? "ring-2 ring-white ring-offset-2 ring-offset-gray-800" // Slightly thinner ring
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
                                                    // Slightly smaller check icon
                                                    <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-md" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        />

                        {/* Executive Switch */}
                        <addPrinterForm.Field
                            name="is_executive"
                            children={(field) => (
                                <div className="flex items-center justify-between px-3 py-2.5 bg-gray-900 rounded-md">
                                    {" "}
                                    {/* Slightly smaller padding, rounded-md */}
                                    <Label
                                        htmlFor={field.name}
                                        className="text-base" // Slightly smaller label
                                    >
                                        Executive Printer
                                    </Label>
                                    <Switch
                                        id={field.name}
                                        checked={field.state.value}
                                        onCheckedChange={field.handleChange}
                                        onBlur={field.handleBlur}
                                        disabled={isSubmitting}
                                        className="transform scale-125 origin-right !bg-blue-600 [&>span]:bg-white"
                                    />
                                </div>
                            )}
                        />

                        {/* Buttons */}
                        <div className="flex gap-4 pt-4">
                            {" "}
                            {/* Slightly reduced gap/padding */}
                            <Button
                                type="button"
                                onClick={() => setStep(3)} // Go back to Step 3
                                variant="outline"
                                className="flex-1 text-lg py-4 bg-gray-600 hover:bg-gray-700" // Slightly smaller padding/text
                                disabled={isSubmitting}
                            >
                                Back
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 text-lg py-4 bg-green-600 hover:bg-green-700" // Slightly smaller padding/text
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="mr-2 h-6 w-6 animate-spin" /> // Slightly smaller spinner
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

    // Adjust vertical translation based on step
    const getDialogTranslateClass = () => {
        if (showKeyboard && step === 3) {
            // Increase translation amount to move dialog higher
            return "transform -translate-y-[45vh]"; // Adjusted from 35vh
        }
        return ""; // No translation otherwise
    };

    return (
        <div className={`${showKeyboard ? "keyboard-active" : ""}`}>
            <Dialog open={isOpen} onOpenChange={handleDialogClose}>
                <DialogOverlay
                    className="bg-black/80"
                    onClick={handleOverlayClick}
                />
                <DialogContent
                    // Apply dynamic translation class
                    className={`p-5 text-white bg-gray-800 max-w-xl transition-transform duration-300 ease-out ${getDialogTranslateClass()}`}
                    onPointerDownOutside={handlePointerDownOutside}
                    onInteractOutside={handlePointerDownOutside}
                >
                    {renderStepContent()}
                </DialogContent>
            </Dialog>

            {/* Conditionally render keyboard only for step 3 */}
            {step === 3 && (
                <VirtualKeyboard show={showKeyboard} onKeyPress={onKeyPress} />
            )}
        </div>
    );
}
