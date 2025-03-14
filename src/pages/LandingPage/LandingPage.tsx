import { useState, ChangeEvent, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLogin } from "@/api/auth";
import { Input } from "@chakra-ui/react";
import { useAuth } from "@/context/authContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { showErrorToast } from "@/components/common/CustomToaster";

export function LandingPage() {
    const [cardReaderInput, setCardReaderInput] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
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

            const result = await loginMutation.mutateAsync({
                scanner_message: cardReaderInput,
            });

            setCardReaderInput("");
            await auth.login(result.user);

            if (!result.user.trained) {
                toast.error("User has not completed required training.");
                await auth.logout();
                return;
            }

            nav("/Home");
        } catch (error: any) {
            setCardReaderInput("");
            await auth.logout();
        } finally {
            setIsLoading(false);
            setCardReaderInput("");
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
            {isLoading ? (
                <div className="flex flex-col items-center">
                    <LoaderCircle className="h-20 w-20 text-green-400 animate-spin" />
                    <p className="mt-6 text-gray-300 text-xl">
                        Verifying card...
                    </p>
                </div>
            ) : (
                <p className="text-lg mt-10">Waiting for card swipe...</p>
            )}{" "}
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
        </div>
    );
}
