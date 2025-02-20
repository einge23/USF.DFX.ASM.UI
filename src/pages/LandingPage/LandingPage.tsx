import { useState, ChangeEvent, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLogin } from "@/api/auth";
import { Input } from "@chakra-ui/react";
import { useAuth } from "@/context/authContext";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function LandingPage() {
    const [cardReaderInput, setCardReaderInput] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const loginMutation = useLogin();
    const auth = useAuth();
    const nav = useNavigate();

    useEffect(() => {
        inputRef.current?.focus();

        const handleDocumentClick = (e: MouseEvent) => {
            e.preventDefault();
            inputRef.current?.focus();
        };

        document.addEventListener("click", handleDocumentClick);

        return () => {
            document.removeEventListener("click", handleDocumentClick);
        };
    }, []);

    const handleSubmit = async () => {
        if (isLoading) return;

        try {
            setIsLoading(true);
            setErrorMessage(null);

            const result = await loginMutation.mutateAsync({
                scanner_message: cardReaderInput,
            });

            setCardReaderInput("");
            await auth.login(result.user);

            if (!result.user.trained) {
                setErrorMessage("User has not completed required training.");
                await auth.logout();
                return;
            }

            nav("/Home");
        } catch (error: any) {
            setCardReaderInput("");
            console.error("Login failed:", error);
            setErrorMessage(error.message || "An unexpected error occurred");
            await auth.logout();
        } finally {
            setIsLoading(false);
        }
    };

    const handleCardReaderInputChange = async (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const input = e.target;
        setCardReaderInput(input.value);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-green-700 to-green-900">
            <div className="text-white text-2xl mb-4">
                Swipe your USF ID card to get started
            </div>
            <Input
                ref={inputRef}
                value={cardReaderInput}
                onChange={handleCardReaderInputChange}
                className="opacity-0 absolute w-0 h-0 overflow-hidden pointer-events-none focus:outline-none"
                autoFocus
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleSubmit();
                    }
                }}
            />
            {cardReaderInput && (
                <div className="text-white mt-4">{cardReaderInput}</div>
            )}
            {errorMessage && (
                <Alert className="border-red-300 bg-red-600 w-1/2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
