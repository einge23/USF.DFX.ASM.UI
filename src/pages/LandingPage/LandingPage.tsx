import { useState, ChangeEvent, useEffect, useRef } from "react";
import "./LandingPage.css";
import { useMutation } from "@tanstack/react-query";
import { useLogin } from "@/api/auth";
import { Input } from "@chakra-ui/react";
import { useAuth } from "@/context/authContext";
import { useNavigate } from "react-router-dom";

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

            // 1. Get login result
            const result = await loginMutation.mutateAsync({
                scanner_message: cardReaderInput,
            });

            setCardReaderInput("");

            await auth.login(result);

            if (auth.isAuthenticated && auth.userData) {
                nav("/Home");
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, 50));

            throw new Error("Auth state not updated after login");
        } catch (error) {
            console.error("Login failed:", error);
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
        <div className="app-container">
            Swipe your USF ID card to get started
            <Input
                ref={inputRef}
                value={cardReaderInput}
                onChange={handleCardReaderInputChange}
                className="hidden-input"
                autoFocus
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleSubmit();
                        nav("/Home");
                    }
                }}
            />
            {cardReaderInput && <div>{cardReaderInput}</div>}
        </div>
    );
}
