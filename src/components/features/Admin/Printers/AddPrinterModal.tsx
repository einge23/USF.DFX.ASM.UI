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

const PRESET_COLORS = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#008000",
    "#000080",
    "#808080",
    "#FFC0CB",
];

interface AddPrinterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (
        printer: Omit<Printer, "id" | "in_use" | "last_reserved_by">
    ) => void;
    defaultRack: number;
}

export function AddPrinterModal({
    isOpen,
    onClose,
    onAdd,
    defaultRack,
}: AddPrinterModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        color: PRESET_COLORS[0],
        rack: defaultRack,
        is_executive: false,
        is_egn_printer: false,
    });
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [cursorVisible, setCursorVisible] = useState(true);
    const cursorInterval = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setFormData((prev) => ({ ...prev, rack: defaultRack }));
    }, [defaultRack]);

    // Cursor blink effect
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(formData);
    };

    const onKeyPress = (button: string, e?: MouseEvent) => {
        e?.stopPropagation();

        if (button === "{enter}") {
            setShowKeyboard(false);
            return;
        }
        if (button === "{bksp}") {
            setFormData((prev) => ({ ...prev, name: prev.name.slice(0, -1) }));
            return;
        }
        if (button === "{space}") {
            setFormData((prev) => ({ ...prev, name: prev.name + " " }));
            return;
        }
        if (button === "{capslock}") {
            return;
        }
        setFormData((prev) => ({ ...prev, name: prev.name + button }));
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

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                Printer Name
                            </Label>
                            <div
                                className="bg-gray-900 rounded p-2 cursor-text text-base min-h-[40px] relative"
                                onClick={() => setShowKeyboard(true)}
                                style={{ minHeight: 40 }}
                            >
                                <span>
                                    {formData.name}
                                    {showKeyboard && (
                                        <span
                                            className={`inline-block w-2 h-5 align-middle ml-0.5 ${
                                                cursorVisible
                                                    ? "bg-white"
                                                    : "bg-transparent"
                                            }`}
                                            style={{
                                                borderLeft: "2px solid white",
                                                marginLeft: "2px",
                                                verticalAlign: "middle",
                                                animation: "none",
                                            }}
                                        ></span>
                                    )}
                                    {!formData.name &&
                                        !showKeyboard &&
                                        "Click to enter printer name"}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Color</Label>
                            <div className="grid grid-cols-6 gap-1">
                                {PRESET_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={`w-6 h-6 rounded transition-all ${
                                            formData.color === color
                                                ? "ring-2 ring-white"
                                                : "hover:scale-110"
                                        }`}
                                        style={{ backgroundColor: color }}
                                        onClick={() =>
                                            setFormData({ ...formData, color })
                                        }
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between px-3 py-2 bg-gray-900 rounded">
                                <Label
                                    htmlFor="is_executive"
                                    className="text-sm"
                                >
                                    Executive
                                </Label>
                                <Switch
                                    id="is_executive"
                                    checked={formData.is_executive}
                                    onCheckedChange={(checked) =>
                                        setFormData({
                                            ...formData,
                                            is_executive: checked,
                                        })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between px-3 py-2 bg-gray-900 rounded">
                                <Label
                                    htmlFor="is_egn_printer"
                                    className="text-sm"
                                >
                                    EGN
                                </Label>
                                <Switch
                                    id="is_egn_printer"
                                    checked={formData.is_egn_printer}
                                    onCheckedChange={(checked) =>
                                        setFormData({
                                            ...formData,
                                            is_egn_printer: checked,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                onClick={onClose}
                                variant="outline"
                                className="flex-1 bg-red-500 hover:bg-red-600"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                Add Printer
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <VirtualKeyboard show={showKeyboard} onKeyPress={onKeyPress} />
        </div>
    );
}
