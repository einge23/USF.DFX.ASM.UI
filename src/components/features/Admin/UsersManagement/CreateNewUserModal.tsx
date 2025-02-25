import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@chakra-ui/react";
import { Plus, CheckCircle, Shield, UserCog, Ban } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface CreateNewUserModalProps {
    onUserCreated?: (cardData: string) => void;
}

export function CreateNewUserModal({ onUserCreated }: CreateNewUserModalProps) {
    const [open, setOpen] = useState(false);
    const [cardInput, setCardInput] = useState("");
    const [userName, setUserName] = useState("");
    const [isTrained, setIsTrained] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
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

    const handleSwipeCapture = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            // Simulate fetching user data
            setUserName("John Doe"); // Replace with actual user data fetching
            setConfirmationOpen(true);
            setCardInput("");
        }
    };

    const handleSaveUser = () => {
        onUserCreated?.(cardInput);
        setCardInput("");
        setIsTrained(false);
        setIsAdmin(false);
        setOpen(false);
        setConfirmationOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    variant="default"
                >
                    <Plus className="h-4 w-4" />
                    Create User
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] w-[90vw] p-6">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Add New User</DialogTitle>
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
                            <h3 className="text-2xl font-medium mb-4">
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

                    {confirmationOpen && (
                        <div className="w-full">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-medium mb-4">
                                    Confirm User Details
                                </h3>
                                <p className="text-lg text-gray-300">
                                    Name: {userName}
                                </p>
                                <p className="text-lg text-gray-300">
                                    Trained: {isTrained ? "Yes" : "No"}
                                </p>
                                <p className="text-lg text-gray-300">
                                    Admin: {isAdmin ? "Yes" : "No"}
                                </p>
                            </div>
                            <div className="flex justify-center gap-4">
                                <Button
                                    onClick={() => setIsTrained(!isTrained)}
                                    className={`flex items-center gap-2 ${
                                        isTrained
                                            ? "bg-green-600 hover:bg-green-700"
                                            : "bg-gray-600 hover:bg-gray-700"
                                    }`}
                                >
                                    <CheckCircle
                                        className={`h-6 w-6 ${
                                            isTrained
                                                ? "text-green-500"
                                                : "text-gray-500"
                                        }`}
                                    />
                                    Set Trained
                                </Button>
                                <Button
                                    onClick={() => setIsAdmin(!isAdmin)}
                                    className={`flex items-center gap-2 ${
                                        isAdmin
                                            ? "bg-purple-600 hover:bg-purple-700"
                                            : "bg-gray-600 hover:bg-gray-700"
                                    }`}
                                >
                                    <Shield
                                        className={`h-6 w-6 ${
                                            isAdmin
                                                ? "text-purple-500"
                                                : "text-gray-500"
                                        }`}
                                    />
                                    Set Admin
                                </Button>
                            </div>
                            <div className="flex justify-center mt-6">
                                <Button
                                    onClick={handleSaveUser}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Save User
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
