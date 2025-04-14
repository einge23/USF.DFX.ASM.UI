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
import { useState, useEffect } from "react";
import type { Printer } from "@/types/Printer";
import Keyboard from "react-simple-keyboard";
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
  onAdd: (printer: Omit<Printer, "id" | "in_use" | "last_reserved_by">) => void;
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

  useEffect(() => {
    setFormData((prev) => ({ ...prev, rack: defaultRack }));
  }, [defaultRack]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  const onKeyPress = (button: string, e?: MouseEvent) => {
    // Stop event propagation for all keyboard buttons
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
        <DialogOverlay className="bg-black/80" onClick={handleOverlayClick} />
        <DialogContent
          className={`p-4 text-white bg-gray-800 max-w-lg transition-transform duration-200 ${
            showKeyboard ? "transform -translate-y-[40vh]" : ""
          }`}
          onPointerDownOutside={(e) => {
            if ((e.target as HTMLElement)?.closest(".keyboard-container")) {
              e.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
            if ((e.target as HTMLElement)?.closest(".keyboard-container")) {
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
              <Label className="text-sm font-medium">Printer Name</Label>
              <div
                className="bg-gray-900 rounded p-2 cursor-text text-base min-h-[40px]"
                onClick={() => setShowKeyboard(true)}
              >
                {formData.name || "Click to enter printer name"}
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
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between px-3 py-2 bg-gray-900 rounded">
                <Label htmlFor="is_executive" className="text-sm">
                  Executive
                </Label>
                <Switch
                  id="is_executive"
                  checked={formData.is_executive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_executive: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between px-3 py-2 bg-gray-900 rounded">
                <Label htmlFor="is_egn_printer" className="text-sm">
                  EGN
                </Label>
                <Switch
                  id="is_egn_printer"
                  checked={formData.is_egn_printer}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_egn_printer: checked })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
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

      {showKeyboard && (
        <div
          className="fixed inset-x-0 bottom-0 keyboard-container"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Keyboard
            layout={{
              default: [
                "1 2 3 4 5 6 7 8 9 0",
                "Q W E R T Y U I O P",
                "A S D F G H J K L",
                "Z X C V B N M {bksp}",
                "{space} {enter}",
              ],
            }}
            display={{
              "{bksp}": "⌫",
              "{enter}": "Done",
              "{space}": "Space",
            }}
            onKeyPress={onKeyPress}
            theme="hg-theme-default hg-layout-default myTheme"
            buttonTheme={[
              {
                class: "hg-special-button",
                buttons: "{bksp} {enter} {space}",
              },
            ]}
            physicalKeyboardHighlight={false}
            preventMouseDownDefault={true}
          />
        </div>
      )}
    </div>
  );
}
