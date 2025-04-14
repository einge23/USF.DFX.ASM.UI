import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Printer } from "@/types/Printer";

interface DeletePrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  printer: Printer;
  onDelete: () => void;
}

export function DeletePrinterModal({
  isOpen,
  onClose,
  printer,
  onDelete,
}: DeletePrinterModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white p-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-red-500">
            Delete Printer
          </DialogTitle>
        </DialogHeader>

        <div className="py-3">
          <p className="text-base text-gray-300">
            Delete printer "{printer.name}"?
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: printer.color }}
            />
            <span className="text-sm text-gray-400">Rack {printer.rack}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="flex-1 h-12"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onDelete}
            variant="destructive"
            className="flex-1 h-12"
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
