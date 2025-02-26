import { getUserData } from "@/api/admin";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Ban,
    CheckCircle,
    Crown,
    LoaderCircle,
    MoreHorizontal,
    Shield,
    UserCog,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UpdateUserModal() {
    const [open, setOpen] = useState(false);
    const [cardInput, setCardInput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            inputRef.current?.focus();

            const handleDocumentClick = (e: MouseEvent) => {
                if (open && inputRef.current) {
                    e.preventDefault();
                    inputRef.current.focus();
                }
            };

            document.addEventListener("click", handleDocumentClick);

            return () => {
                document.removeEventListener("click", handleDocumentClick);
            };
        }
    }, [open]);

    const {
        data: user,
        isLoading,
        refetch: refetchUsers,
        error: queryError,
    } = useQuery({
        queryKey: ["users"],
        queryFn: () => getUserData(cardInput),
        enabled: false,
        retry: false,
    });

    useEffect(() => {
        if (queryError) {
            setError(
                (queryError as Error).message || "Failed to fetch user data"
            );
        } else {
            setError(null);
        }
    }, [queryError]);

    const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCardInput(e.target.value);
        setError(null);
    };

    const handleUserUpdate = async () => {
        if (!cardInput.trim() || isLoading) return;

        try {
            await refetchUsers();
            setCardInput("");
        } catch (error) {
            console.error("Failed to fetch user data:", error);
            setCardInput("");
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);

        if (!isOpen) {
            setCardInput("");
            queryClient.removeQueries({ queryKey: ["users"] });
        } else {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    };

    // Handlers for dropdown menu actions
    const handleSetTrained = () => {
        console.log("Set user as trained:", user?.id);
        // Implement your training status update logic
    };

    const handleUpdateInfo = () => {
        console.log("Update user info:", user?.id);
        // Implement your update info logic
    };

    const handleBanUser = () => {
        console.log("Ban user:", user?.id);
        // Implement your ban user logic
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="default"
                    size="lg"
                    className="h-14 px-6 bg-purple-600 hover:bg-purple-700"
                >
                    <div className="flex items-center gap-2">
                        <UserCog size={24} />
                        <span>Update User</span>
                    </div>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] w-[90vw] p-6">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        Update Existing User
                    </DialogTitle>
                </DialogHeader>

                <Input
                    ref={inputRef}
                    type="password"
                    autoFocus
                    value={cardInput}
                    onChange={handleCardInputChange}
                    className="opacity-0 absolute w-0 h-0 overflow-hidden pointer-events-none focus:outline-none"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleUserUpdate();
                        }
                    }}
                />

                <div className="flex flex-col items-center justify-center py-8 min-h-[300px]">
                    {!isLoading && !user && (
                        <div className="text-center">
                            <h3 className="text-2xl font-medium mb-4">
                                Swipe Card to Update User
                            </h3>
                            <p className="text-gray-400 mb-6 text-lg">
                                Please swipe the user's ID card to retrieve
                                their information
                            </p>
                            <div className="animate-pulse text-purple-400 mb-4">
                                <UserCog size={72} className="mx-auto" />
                            </div>
                            <p className="text-lg text-gray-500">
                                Waiting for card swipe...
                            </p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center">
                            <LoaderCircle className="h-20 w-20 text-purple-500 animate-spin" />
                            <p className="mt-6 text-gray-300 text-xl">
                                Loading user data...
                            </p>
                        </div>
                    )}

                    {user && (
                        <div className="w-full">
                            <Table className="border border-gray-700 rounded-lg overflow-hidden text-lg">
                                <TableHeader className="bg-gray-800">
                                    <TableRow>
                                        <TableHead className="text-gray-300 text-lg py-8 px-8">
                                            ID
                                        </TableHead>
                                        <TableHead className="text-gray-300 text-lg py-8 px-8">
                                            Name
                                        </TableHead>
                                        <TableHead className="text-gray-300 text-lg py-8 px-8 w-[120px] text-center">
                                            Trained
                                        </TableHead>
                                        <TableHead className="text-gray-300 text-lg py-8 px-8 w-[120px] text-center">
                                            Executive Access
                                        </TableHead>
                                        <TableHead className="text-gray-300 text-lg py-8 px-8 w-[120px] text-center">
                                            Admin
                                        </TableHead>
                                        <TableHead className="text-gray-300 text-lg py-8 px-8 w-24"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow
                                        key={user.id}
                                        className="border-b border-gray-700"
                                    >
                                        <TableCell className="font-medium text-gray-200 text-lg py-6 px-6">
                                            {user.id}
                                        </TableCell>
                                        <TableCell className="text-gray-200 text-lg py-6 px-6">
                                            {user.username}
                                        </TableCell>
                                        <TableCell className="text-lg py-8 px-8 text-center">
                                            {user.trained ? (
                                                <div className="flex justify-center">
                                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                                </div>
                                            ) : (
                                                <div className="flex justify-center">
                                                    <CheckCircle className="h-8 w-8 text-gray-500" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-lg py-8 px-8 text-center">
                                            {user.has_executive_access ? (
                                                <div className="flex justify-center">
                                                    <Crown className="h-8 w-8 text-yellow-500" />
                                                </div>
                                            ) : (
                                                <div className="flex justify-center">
                                                    <Crown className="h-8 w-8 text-gray-500" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-lg py-8 px-8 text-center">
                                            {user.admin ? (
                                                <div className="flex justify-center">
                                                    <Shield className="h-8 w-8 text-purple-500" />
                                                </div>
                                            ) : (
                                                <div className="flex justify-center">
                                                    <Shield className="h-8 w-8 text-gray-500" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-lg py-6 px-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-14 w-14 p-2 rounded-full"
                                                    >
                                                        <MoreHorizontal className="h-8 w-8" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="bg-gray-800 border-gray-700 min-w-[250px]"
                                                >
                                                    <DropdownMenuItem
                                                        onClick={
                                                            handleSetTrained
                                                        }
                                                        className="text-white hover:bg-gray-700 cursor-pointer py-4 px-4 text-lg"
                                                    >
                                                        <CheckCircle className="mr-3 h-6 w-6 text-green-500" />
                                                        <span>Set Trained</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={
                                                            handleUpdateInfo
                                                        }
                                                        className="text-white hover:bg-gray-700 cursor-pointer py-4 px-4 text-lg"
                                                    >
                                                        <UserCog className="mr-3 h-6 w-6 text-blue-500" />
                                                        <span>
                                                            Update Information
                                                        </span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={handleBanUser}
                                                        className="text-white hover:bg-gray-700 cursor-pointer py-4 px-4 text-lg"
                                                    >
                                                        <Ban className="mr-3 h-6 w-6 text-red-500" />
                                                        <span>Ban User</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={handleBanUser}
                                                        className="text-white hover:bg-gray-700 cursor-pointer py-4 px-4 text-lg"
                                                    >
                                                        <Crown className="mr-3 h-6 w-6 text-yellow-500" />
                                                        <span>
                                                            Grant Executive
                                                            Access
                                                        </span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
