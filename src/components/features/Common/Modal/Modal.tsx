import { Button, Dialog, DialogContent } from "@chakra-ui/react";
import {
    DialogActionTrigger,
    DialogCloseTrigger,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface ModalProps {
    trigger: React.ReactNode;
    content: React.ReactNode;
    title: string;
    isOpen: boolean;
    onClose: () => void;
    placement?: "top" | "bottom" | "left" | "right" | "center";
    motionPreset?:
        | "slide-in-bottom"
        | "slide-in-top"
        | "slide-in-left"
        | "slide-in-right";
    size?: "sm" | "md" | "lg" | "xl";
    key?: any;
}

export function Modal({
    content,
    title,
    trigger,
    isOpen,
    onClose,
    placement = "center",
    motionPreset = "slide-in-bottom",
    size = "md",
    key,
}: ModalProps) {
    return (
        <>
            <DialogRoot
                open={isOpen}
                onOpenChange={onClose}
                key={key}
                placement={"center"}
                motionPreset={"slide-in-bottom"}
            >
                <DialogTrigger>
                    <Button>{trigger}</Button>
                </DialogTrigger>
            </DialogRoot>
            <DialogContent>
                <DialogHeader>{title}</DialogHeader>
                <DialogContent>{content}</DialogContent>
                <DialogFooter>
                    <DialogActionTrigger asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogActionTrigger>
                </DialogFooter>
                <DialogCloseTrigger />
            </DialogContent>
        </>
    );
}
