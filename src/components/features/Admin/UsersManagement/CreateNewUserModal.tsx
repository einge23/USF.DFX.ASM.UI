import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@chakra-ui/react";
import {
    Plus,
    CheckCircle,
    Shield,
    UserCog,
    Ban,
    Loader2,
    Cog,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { createUser } from "@/api/admin";
import { parseScannerName } from "@/lib/parse-scanner-message";
import {
    showErrorToast,
    showSuccessToast,
} from "@/components/common/CustomToaster";
import { formatName } from "@/lib/format-name";

interface CreateNewUserModalProps {
    onUserCreated?: (success: boolean) => void;
}

export function CreateNewUserModal({ onUserCreated }: CreateNewUserModalProps) {
    const [open, setOpen] = useState(false);
    const [cardInput, setCardInput] = useState("");
    const [userName, setUserName] = useState("");
    const [isTrained, setIsTrained] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEgnLab, setIsEgnLab] = useState(false);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const createUserMutation = useMutation({
        mutationFn: (params: {
            scanner_message: string;
            trained: boolean;
            admin: boolean;
            egnLab: boolean;
        }) =>
            createUser(
                params.scanner_message,
                params.trained,
                params.admin,
                params.egnLab
            ),
        onSuccess: (success) => {
            showSuccessToast(
                "User Created",
                "User has been successfully created"
            );
            onUserCreated?.(success);
            setOpen(false);
            setTimeout(() => {
                setCardInput("");
                setIsTrained(false);
                setIsAdmin(false);
                setConfirmationOpen(false);
            }, 0);
        },
        onError: (error) => {
            showErrorToast("Error", error.message);
        },
    });

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

    const handleSwipeCapture = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            try {
                const userName = parseScannerName(cardInput);
                setUserName(userName);
                setConfirmationOpen(true);
            } catch (error) {
                showErrorToast("Error", error.message);
                setCardInput("");
            }
        }
    };

    const handleSaveUser = () => {
        createUserMutation.mutate({
            scanner_message: cardInput,
            trained: isTrained,
            admin: isAdmin,
            egnLab: isEgnLab,
        });
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setCardInput("");
            setUserName("");
            setIsTrained(false);
            setIsAdmin(false);
            setIsEgnLab(false);
            setConfirmationOpen(false);
        }
    };

    const renderConfirmationContent = () => (
        <div className="w-full">
            <div className="text-center mb-6">
                <h3 className="text-2xl text-white font-medium mb-4">
                    Confirm User Details
                </h3>
                <p className="text-lg text-gray-300">
                    Name: {formatName(userName)}
                </p>
                <p className="text-lg text-gray-300">
                    Trained: {isTrained ? "True" : "False"}
                </p>
                <p className="text-lg text-gray-300">
                    Admin: {isAdmin ? "True" : "False"}
                </p>
            </div>
            <div className="flex justify-center gap-4">
                <Button
                    onClick={() => setIsTrained(!isTrained)}
                    className={`h-14 px-6 flex items-center gap-2 text-lg ${
                        isTrained
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-gray-600 hover:bg-gray-700"
                    }`}
                    disabled={createUserMutation.isPending}
                >
                    <CheckCircle
                        className={`h-6 w-6 ${
                            isTrained ? "text-green-500" : "text-gray-500"
                        }`}
                    />
                    Set Trained
                </Button>
                <Button
                    onClick={() => setIsAdmin(!isAdmin)}
                    className={`h-14 px-6 flex items-center gap-2 text-lg ${
                        isAdmin
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "bg-gray-600 hover:bg-gray-700"
                    }`}
                    disabled={createUserMutation.isPending}
                >
                    <Shield
                        className={`h-6 w-6 ${
                            isAdmin ? "text-purple-500" : "text-gray-500"
                        }`}
                    />
                    Set Admin
                </Button>
            </div>
            <div className="flex justify-center mt-6">
                <Button
                    onClick={handleSaveUser}
                    className="h-14 px-6 bg-blue-600 hover:bg-blue-700 text-lg"
                    disabled={createUserMutation.isPending}
                >
                    {createUserMutation.isPending ? (
                        <>
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        "Save User"
                    )}
                </Button>
            </div>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="default"
                    className="h-16 flex-1 bg-green-600 hover:bg-green-700 text-xl"
                >
                    <div className="flex items-center gap-2">
                        <Plus className="!w-8 !h-8" />
                        <span className="text-white">Add User</span>
                    </div>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] w-[90vw] bg-gray-800 p-6">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-white">
                        Add New User
                    </DialogTitle>
                </DialogHeader>

                <Input
                    ref={inputRef}
                    type="password"
                    autoFocus
                    value={cardInput}
                    onChange={(e) => setCardInput(e.target.value)}
                    className="opacity-0 absolute w-0 h-0 overflow-hidden pointer-events-none focus:outline-none"
                    onKeyDown={handleSwipeCapture}
                />

                <div className="flex flex-col items-center justify-center py-8 min-h-[300px]">
                    {!confirmationOpen && (
                        <div className="text-center">
                            <h3 className="text-2xl text-white font-medium mb-4">
                                Swipe Card to Add User
                            </h3>
                            <p className="text-gray-400 mb-6 text-lg">
                                Please swipe the user's ID card to retrieve
                                their information
                            </p>
                            <div className="animate-pulse text-green-400 mb-4">
                                <UserCog size={72} className="mx-auto" />
                            </div>
                            <p className="text-lg text-gray-500">
                                Waiting for card swipe...
                            </p>
                        </div>
                    )}

                    {confirmationOpen && renderConfirmationContent()}
                </div>
            </DialogContent>
        </Dialog>
    );
}
