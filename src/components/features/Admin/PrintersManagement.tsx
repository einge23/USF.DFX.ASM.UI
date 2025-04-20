import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Trash2, XCircle } from "lucide-react"; // Added Trash2, XCircle
import { useState, useMemo } from "react";
import {
    usePrinters,
    addPrinter as apiAddPrinter,
    updatePrinter as apiUpdatePrinter,
    deletePrinter as apiDeletePrinter,
} from "@/api/printers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@chakra-ui/react";
import { AddPrinterModal } from "./Printers/AddPrinterModal";
import { EditPrinterModal } from "./Printers/EditPrinterModal";
import { DeletePrinterModal } from "./Printers/DeletePrinterModal";
import {
    showErrorToast,
    showSuccessToast,
} from "@/components/common/CustomToaster";
import { Printer, UpdatePrinterRequest } from "@/types/Printer";
import { PrinterBox } from "@/components/features/PrinterView/PrinterBox";

export function PrintersManagement() {
    const queryClient = useQueryClient(); // Get query client instance
    const { data: printers, isLoading, error, refetch } = usePrinters();
    const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(
        null
    );
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [isDeleteMode, setIsDeleteMode] = useState(false);

    // Group printers by rack
    const printersByRack = useMemo(() => {
        if (!printers) return [];
        const grouped: { [key: string]: Printer[] } = {};
        printers.forEach((printer) => {
            const rackId = printer.rack;
            if (!grouped[rackId]) {
                grouped[rackId] = [];
            }
            grouped[rackId].push(printer);
        });

        // Convert to array of racks for pagination
        return Object.entries(grouped)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([rackId, printers]) => ({
                rackId,
                printers,
            }));
    }, [printers]);

    const existingPrinterIds = useMemo(() => {
        return printers ? printers.map((p) => p.id) : [];
    }, [printers]);

    const totalPages = printersByRack.length;
    const currentRack = printersByRack[currentPage] || {
        rackId: "",
        printers: [],
    };

    // Determine grid layout based on printer count
    const getGridColumns = (count: number) => {
        if (count <= 4) return "grid-cols-2"; // 2x2
        if (count <= 9) return "grid-cols-3"; // 3x3
        return "grid-cols-4"; // 4x4 for larger racks
    };

    // --- Add Printer Mutation ---
    const addPrinterMutation = useMutation({
        mutationFn: (
            printerData: Omit<Printer, "in_use" | "last_reserved_by">
        ) => apiAddPrinter(printerData), // Call the imported API function
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["printers"] });
            showSuccessToast(
                "Printer Added",
                `Printer ${variables.name} (ID: ${variables.id}) added successfully. Please plug it into the designated spot.`
            );
            setIsAddModalOpen(false);
        },
        onError: (error: any) => {
            showErrorToast(
                "Error Adding Printer",
                error.message || "An unknown error occurred."
            );
            console.error("Add printer error:", error);
        },
    });

    // --- Edit Printer Mutation ---
    const updatePrinterMutation = useMutation({
        // The printerData passed here should now include rack_position
        mutationFn: (printerData: Printer) => {
            // Construct the UpdatePrinterRequest payload inside the mutation
            const updatePayload: UpdatePrinterRequest = {
                name: printerData.name,
                color: printerData.color,
                rack: printerData.rack,
                rack_position: printerData.rack_position, // Include rack_position
                is_executive: printerData.is_executive,
                is_egn_printer: printerData.is_egn_printer,
            };
            // Call the API function with the original ID and the payload
            return apiUpdatePrinter(printerData.id, updatePayload);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["printers"] });
            showSuccessToast(
                "Printer Updated",
                `Printer ${variables.name} updated successfully.`
            );
            setIsEditModalOpen(false);
            setSelectedPrinter(null); // Clear selection after successful edit
        },
        onError: (error: any, variables) => {
            showErrorToast(
                "Error Updating Printer",
                `Failed to update printer ${variables.name}. ${
                    error.message || "An unknown error occurred."
                }`
            );
            console.error("Update printer error:", error);
        },
    });

    // --- Delete Printer Mutation ---
    const deletePrinterMutation = useMutation({
        mutationFn: (printerId: number) => apiDeletePrinter(printerId), // Call the imported API function
        onSuccess: (data, printerId) => {
            queryClient.invalidateQueries({ queryKey: ["printers"] });
            showSuccessToast(
                "Printer Deleted",
                `Printer with ID ${printerId} deleted successfully.`
            );
            setIsDeleteModalOpen(false);
            setSelectedPrinter(null); // Clear selection after successful delete
        },
        onError: (error: any, printerId) => {
            showErrorToast(
                "Error Deleting Printer",
                `Failed to delete printer with ID ${printerId}. ${
                    error.message || "An unknown error occurred."
                }`
            );
            console.error("Delete printer error:", error);
        },
    });

    const handlePrinterClick = (printer: Printer) => {
        // Don't open edit modal if in delete mode
        if (isDeleteMode) return;
        setSelectedPrinter(printer);
        setIsEditModalOpen(true);
    };

    // Function to open the delete confirmation modal
    const handleOpenDeleteModal = (printer: Printer) => {
        setSelectedPrinter(printer);
        setIsDeleteModalOpen(true);
    };

    if (isLoading)
        return (
            <div className="flex items-center justify-center h-full">
                <Spinner size="xl" />
            </div>
        );

    if (error)
        return (
            <div className="p-4 text-red-500">
                Error loading printers: {error.message}
            </div>
        );

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 mb-4 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">
                        Printers Management - Rack {currentPage + 1} of{" "}
                        {totalPages}
                    </h2>
                    <div className="flex gap-2">
                        {" "}
                        {/* Wrap buttons */}
                        <Button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 p-4 text-white bg-green-600 rounded-lg hover:bg-green-700"
                            disabled={isDeleteMode} // Disable when in delete mode
                        >
                            <Plus className="w-5 h-5" />
                            Add Printer
                        </Button>
                        <Button
                            onClick={() => setIsDeleteMode((prev) => !prev)} // Toggle delete mode
                            variant={isDeleteMode ? "destructive" : "secondary"} // Change appearance based on mode
                            className={`flex items-center gap-2 p-4 rounded-lg ${
                                !isDeleteMode
                                    ? "bg-gray-600 hover:bg-gray-700 text-white"
                                    : ""
                            }`}
                        >
                            {isDeleteMode ? (
                                <>
                                    <XCircle className="w-5 h-5" /> Exit Delete
                                    Mode
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-5 h-5" /> Remove
                                    Printer
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <div
                className="flex-grow flex items-center justify-center"
                style={{ minHeight: 0 }}
            >
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                        setCurrentPage((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentPage === 0}
                    className="mr-4"
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <div
                    className={`flex-1 grid ${getGridColumns(
                        currentRack.printers.length
                    )} gap-4 h-[calc(100vh-200px)] overflow-hidden items-stretch`}
                >
                    {currentRack.printers.map((printer) => (
                        <PrinterBox
                            key={printer.id}
                            printer={printer}
                            rackSize={currentRack.printers.length}
                            onClick={() => handlePrinterClick(printer)}
                            isDeleteMode={isDeleteMode} // Pass delete mode state
                            onDeleteClick={handleOpenDeleteModal} // Pass delete handler
                        />
                    ))}
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                        setCurrentPage((prev) =>
                            Math.min(totalPages - 1, prev + 1)
                        )
                    }
                    disabled={currentPage === totalPages - 1}
                    className="ml-4"
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>

            <AddPrinterModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                existingPrinterIds={existingPrinterIds}
                onAddPrinter={addPrinterMutation.mutate}
            />

            {selectedPrinter && (
                <>
                    <EditPrinterModal
                        isOpen={isEditModalOpen}
                        onClose={() => {
                            setIsEditModalOpen(false);
                            setSelectedPrinter(null);
                        }}
                        printer={selectedPrinter}
                        // Pass the mutate function
                        onEditPrinter={updatePrinterMutation.mutate}
                    />

                    <DeletePrinterModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => {
                            setIsDeleteModalOpen(false);
                            setSelectedPrinter(null);
                        }}
                        printer={selectedPrinter}
                        // Pass the mutate function from the delete mutation
                        onDelete={() =>
                            deletePrinterMutation.mutate(selectedPrinter.id)
                        }
                    />
                </>
            )}
        </div>
    );
}
