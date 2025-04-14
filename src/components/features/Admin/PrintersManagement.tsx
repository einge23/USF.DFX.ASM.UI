import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { usePrinters } from "@/api/printers";
import { Spinner } from "@chakra-ui/react";
import { AddPrinterModal } from "./Printers/AddPrinterModal";
import { EditPrinterModal } from "./Printers/EditPrinterModal";
import { DeletePrinterModal } from "./Printers/DeletePrinterModal";
import { toast } from "sonner";
import { Printer } from "@/types/Printer";
import { PrinterBox } from "@/components/features/PrinterView/PrinterBox";

export function PrintersManagement() {
  const { data: printers, isLoading, error, refetch } = usePrinters();
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

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

  const handleAddPrinter = async (
    printerData: Omit<Printer, "id" | "in_use" | "last_reserved_by">
  ) => {
    try {
      const response = await fetch("/api/admin/printers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(printerData),
      });

      if (!response.ok) throw new Error("Failed to add printer");

      toast.success("Printer added successfully");
      refetch();
      setIsAddModalOpen(false);
    } catch (error) {
      toast.error("Error adding printer");
      console.error(error);
    }
  };

  const handleEditPrinter = async (printerData: Printer) => {
    try {
      const response = await fetch(
        `/api/admin/printers/update/${printerData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(printerData),
        }
      );

      if (!response.ok) throw new Error("Failed to update printer");

      toast.success("Printer updated successfully");
      refetch();
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error("Error updating printer");
      console.error(error);
    }
  };

  const handleDeletePrinter = async (printerId: number) => {
    try {
      const response = await fetch(`/api/admin/printers/${printerId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete printer");

      toast.success("Printer deleted successfully");
      refetch();
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error("Error deleting printer");
      console.error(error);
    }
  };

  const handlePrinterClick = (printer: Printer) => {
    setSelectedPrinter(printer);
    setIsEditModalOpen(true);
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
          <h2 className="text-xl font-bold text-white">Printers Management</h2>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 p-4 text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            <Plus className="w-5 h-5" />
            Add Printer
          </Button>
        </div>
      </div>

      <div className="flex-grow">
        <div
          className={`grid ${getGridColumns(
            currentRack.printers.length
          )} gap-4 h-full`}
        >
          {currentRack.printers.map((printer) => (
            <PrinterBox
              key={printer.id}
              printer={printer}
              rackSize={currentRack.printers.length}
              onClick={() => handlePrinterClick(printer)}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center mt-4 space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium">
          Rack {currentPage + 1} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
          }
          disabled={currentPage === totalPages - 1}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <AddPrinterModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddPrinter}
        defaultRack={Number(currentRack.rackId) || 1}
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
            onEdit={handleEditPrinter}
          />

          <DeletePrinterModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedPrinter(null);
            }}
            printer={selectedPrinter}
            onDelete={() => handleDeletePrinter(selectedPrinter.id)}
          />
        </>
      )}
    </div>
  );
}
