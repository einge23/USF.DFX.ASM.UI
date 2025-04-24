import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ejectUSB, exportDB, importDB } from "@/api/admin";
import { Import, Loader2, Usb } from "lucide-react";
import {
    showErrorToast,
    showSuccessToast,
} from "@/components/common/CustomToaster";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

export default function ExportData() {
    const [selectedOption, setSelectedOption] = useState<string>("");
    const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);

    const exportMutation = useMutation({
        mutationFn: (table: string) => exportDB(table),
        onSuccess: () => {
            showSuccessToast(
                "Success",
                `Successfully exported ${selectedOption} data`
            );
        },
        onError: (error) => {
            showErrorToast(
                "Error",
                `Failed to export ${selectedOption} data. Try again.`
            );
            console.error("Error exporting data:", error);
        },
    });

    const importMutation = useMutation({
        mutationFn: () => importDB(),
        onSuccess: () => {
            showSuccessToast("Success", "Successfully imported data");
        },
        onError: (error) => {
            showErrorToast("Error", "Failed to import data. Try again.");
            console.error("Error importing data:", error);
        },
    });

    const ejectUsbMutation = useMutation({
        mutationFn: () => ejectUSB(),
        onSuccess: () => {
            showSuccessToast("Success", "Successfully ejected USB drive");
        },
        onError: (error) => {
            showErrorToast("Error", "Failed to eject USB drive. Try again.");
            console.error("Error ejecting USB drive:", error);
        },
    });

    const handleImport = () => {
        setIsImportConfirmOpen(true);
    };

    const handleEject = () => {
        ejectUsbMutation.mutate();
    };

    const handleExport = () => {
        if (selectedOption) {
            exportMutation.mutate(selectedOption);
        }
    };

    const handleConfirmImport = () => {
        importMutation.mutate();
        setIsImportConfirmOpen(false);
    };

    return (
        <>
            <div className="space-y-4">
                {/* Title Box */}
                <div className="p-6 bg-gray-800 rounded-lg">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <h2 className="text-2xl font-bold text-white md:mb-0">
                            Export/Import Data
                        </h2>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleImport}
                                className="h-12 text-md bg-green-600 hover:bg-green-700"
                            >
                                <Import />
                                Import Data
                            </Button>
                            <Button
                                onClick={handleEject}
                                className="h-12 text-md bg-green-600 hover:bg-green-700"
                            >
                                <Usb />
                                Eject USB
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content Box */}
                <div className="p-8 bg-gray-800 rounded-lg">
                    <div className="space-y-8">
                        {/* Select Box Section */}
                        <div className="p-6 bg-gray-700 rounded-lg shadow-md">
                            <h4 className="pb-3 mb-6 text-xl font-bold text-white border-b border-gray-600">
                                Select Data to Export
                            </h4>
                            <div className="w-full max-w-2xl space-y-6">
                                <Select
                                    value={selectedOption}
                                    onValueChange={setSelectedOption}
                                >
                                    <SelectTrigger className="w-full py-6 text-lg text-white bg-gray-800 border-gray-600">
                                        <SelectValue placeholder="Choose table to export" />
                                    </SelectTrigger>
                                    <SelectContent className="text-white bg-gray-700 border-gray-600">
                                        <SelectItem
                                            className="py-4 text-lg hover:bg-gray-600"
                                            value="users"
                                        >
                                            Users
                                        </SelectItem>
                                        <SelectItem
                                            className="py-4 text-lg hover:bg-gray-600"
                                            value="printers"
                                        >
                                            Printers
                                        </SelectItem>
                                        <SelectItem
                                            className="py-4 text-lg hover:bg-gray-600"
                                            value="reservations"
                                        >
                                            Reservations
                                        </SelectItem>
                                        <SelectItem
                                            className="py-4 text-lg hover:bg-gray-600"
                                            value="settings"
                                        >
                                            Settings
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button
                                    onClick={handleExport}
                                    disabled={
                                        !selectedOption ||
                                        exportMutation.isPending
                                    }
                                    className={`w-full h-12 py-4 text-lg font-medium text-white rounded-md transition-colors flex items-center justify-center
                                    ${
                                        !selectedOption ||
                                        exportMutation.isPending
                                            ? "bg-gray-600 cursor-not-allowed"
                                            : "bg-green-600 hover:bg-green-700"
                                    }`}
                                >
                                    {exportMutation.isPending ? (
                                        <>
                                            <Loader2
                                                size={24}
                                                className="mr-2 animate-spin"
                                            />
                                            Exporting...
                                        </>
                                    ) : (
                                        "Export Data"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Dialog
                open={isImportConfirmOpen}
                onOpenChange={setIsImportConfirmOpen}
            >
                <DialogContent className="sm:max-w-[800px] sm:h-[220px] bg-gray-800 text-white flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold">
                            {" "}
                            Confirm Import{" "}
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="text-2xl text-gray-300">
                        Are you sure you want to import database? This will
                        overwrite existing data for the system.
                    </DialogDescription>
                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            className="px-8 py-6 text-lg bg-gray-600 hover:bg-gray-700"
                            onClick={() => setIsImportConfirmOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="px-8 py-6 text-lg bg-red-600 hover:bg-red-700"
                            onClick={handleConfirmImport}
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
