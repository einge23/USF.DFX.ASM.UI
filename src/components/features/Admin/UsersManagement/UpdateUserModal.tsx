import {
    addWeeklyMinutes,
    getUserData,
    setBanTime,
    setExecutiveAccess,
    setTrained,
} from "@/api/admin";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Ban,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Crown,
    LoaderCircle,
    MoreHorizontal,
    Shield,
    Timer,
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
import { toast } from "sonner";
import {
    showErrorToast,
    showSuccessToast,
} from "@/components/common/CustomToaster";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function UpdateUserModal() {
    const [open, setOpen] = useState(false);
    const [openUpdateTimeModal, setOpenUpdateTimeModal] = useState(false);
    const [openBanModal, setOpenBanModal] = useState(false);
    const [banTimeState, setBanTimeState] = useState<number>(0);
    const [banDurationText, setBanDurationText] =
        useState<string>("Select Duration");
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

    const formatBanTime = (banUntil: string | null): string => {
        if (!banUntil) return "Not banned";

        const banDate = new Date(banUntil);
        const now = new Date();

        if (banDate <= now) return "Not banned";

        return `Unbanned on ${banDate.toLocaleDateString()} at ${banDate.toLocaleTimeString()}`;
    };

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

    const { isPending: trainedPending, mutate: setUserTrained } = useMutation({
        mutationFn: () => setTrained(user.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            refetchUsers();
            showSuccessToast("Success", "User trained status updated");
        },
        onError: (error) => {
            showErrorToast("Error", error.message);
            setCardInput("");
        },
    });

    const { isPending: executivePending, mutate: setUserExecutive } =
        useMutation({
            mutationFn: () => setExecutiveAccess(user.id),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["users"] });
                refetchUsers();
                showSuccessToast("Success", "User executive access updated");
            },
            onError: (error) => {
                showErrorToast("Error", error.message);
                setCardInput("");
            },
        });

    const { isPending: updatePrintTimePending, mutate: updateUserPrintTime } =
        useMutation({
            mutationFn: (totalMinutes: number) =>
                addWeeklyMinutes(user.id, totalMinutes),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["users"] });
                refetchUsers();
                setHours(0);
                setMinutes(0);
                setOpenUpdateTimeModal(false);
                showSuccessToast("Success", "User print time updated");
            },
            onError: (error) => {
                showErrorToast("Error", error.message);
                setHours(0);
                setMinutes(0);
                setOpenUpdateTimeModal(false);
            },
        });

    const { isPending: setBanTimePending, mutate: setUserBanTime } =
        useMutation({
            mutationFn: () => setBanTime(user.id, banTimeState),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["users"] });
                refetchUsers();
                showSuccessToast("Success", "User ban time updated");
                setOpenBanModal(false);
            },
            onError: (error) => {
                showErrorToast("Error", error.message);
                setOpenBanModal(false);
            },
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

    const handleSetTrained = () => {
        console.log("Set user as trained:", user?.id);
        setUserTrained();
    };

    const handleExecutiveAccess = () => {
        console.log("Update user info:", user?.id);
        setUserExecutive();
    };

    const handleBanUser = () => {
        console.log("Ban user:", user?.id);
        setUserBanTime();
    };

    const formatUserTime = (mins: number): string => {
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;

        if (hours === 0) {
            return `${remainingMins} mins`;
        } else {
            return `${hours} hour${
                hours !== 1 ? "s" : ""
            } ${remainingMins} min${remainingMins !== 1 ? "s" : ""}`;
        }
    };

    const [minutes, setMinutes] = useState<number>(0);
    const [hours, setHours] = useState<number>(0);
    const [savedTime, setSavedTime] = useState<string | null>(null);

    const incrementHours = () => {
        setHours((prev) => (prev === 23 ? 0 : prev + 1));
    };

    const decrementHours = () => {
        setHours((prev) => (prev === 0 ? 23 : prev - 1));
    };

    const incrementMinutes = () => {
        setMinutes((prev) => {
            const next = prev + 15;
            return next >= 60 ? 0 : next;
        });
    };

    const decrementMinutes = () => {
        setMinutes((prev) => (prev === 0 ? 0 : prev - 15));
    };

    const getCurrentWeekMonday = () => {
        const today = new Date();
        const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        const monday = new Date(today.setDate(diff));

        // Format as "Monday, March 11"
        return monday.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        });
    };

    const calculateTotalTime = () => {
        if (!user) return formatUserTime(0);

        const newTimeInMinutes = hours * 60 + minutes;
        const totalMinutes = user.weekly_minutes + newTimeInMinutes;
        return formatUserTime(totalMinutes);
    };

    const handleSave = () => {
        const newTimeInMinutes = hours * 60 + minutes;
        updateUserPrintTime(newTimeInMinutes);
    };

    return (
        <>
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
                                    <TableHeader className="bg-gray-800 h-[100px]">
                                        <TableRow>
                                            <TableHead className="text-gray-300 text-lg py-8 px-8 w-[120px] text-center">
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
                                            <TableHead className="text-gray-300 text-lg py-8 px-8 w-[120px] text-center">
                                                Weekly Print Time
                                            </TableHead>
                                            <TableHead className="text-gray-300 text-lg py-8 px-8 w-[120px] text-center">
                                                Ban Status
                                            </TableHead>

                                            <TableHead className="text-gray-300 text-lg py-8 px-8 w-24"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow
                                            key={user.id}
                                            className="border-b border-gray-700"
                                        >
                                            <TableCell className="text-gray-200 text-lg py-6 px-6">
                                                {user.username}
                                            </TableCell>
                                            <TableCell className="text-lg py-8 px-8 text-center">
                                                {user.trained ? (
                                                    <div className="flex justify-center">
                                                        <CheckCircle
                                                            className={`h-8 w-8 ${
                                                                trainedPending
                                                                    ? "animate-pulse-green"
                                                                    : "text-green-500"
                                                            }`}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-center">
                                                        <CheckCircle
                                                            className={`h-8 w-8 ${
                                                                trainedPending
                                                                    ? "animate-pulse-green"
                                                                    : "text-gray-500"
                                                            }`}
                                                        />
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-lg py-8 px-8 text-center">
                                                {user.has_executive_access ? (
                                                    <div className="flex justify-center">
                                                        <Crown
                                                            className={`h-8 w-8 ${
                                                                executivePending
                                                                    ? "animate-pulse-yellow"
                                                                    : "text-yellow-500"
                                                            }`}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-center">
                                                        <Crown
                                                            className={`h-8 w-8 ${
                                                                executivePending
                                                                    ? "animate-pulse-yellow"
                                                                    : "text-gray-500"
                                                            }`}
                                                        />
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
                                            <TableCell className="font-medium text-gray-200 text-lg py-6 px-6 text-center">
                                                {formatUserTime(
                                                    user.weekly_minutes
                                                )}
                                            </TableCell>
                                            <TableCell className="text-lg py-8 px-8 text-center">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="flex justify-center">
                                                                <Ban
                                                                    className={`h-8 w-8 ${
                                                                        user.ban_time_end &&
                                                                        new Date(
                                                                            user.ban_time_end
                                                                        ) >
                                                                            new Date()
                                                                            ? "text-red-500"
                                                                            : "text-gray-500"
                                                                    }`}
                                                                />
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-gray-800 text-white p-2">
                                                            <p>
                                                                User is banned
                                                                until
                                                                {new Date(
                                                                    user.ban_time_end
                                                                ).toLocaleString()}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                            <TableCell className="text-lg py-6 px-6">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
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
                                                            <span>
                                                                Set Trained
                                                            </span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setOpenBanModal(
                                                                    true
                                                                )
                                                            }
                                                            className="text-white hover:bg-gray-700 cursor-pointer py-4 px-4 text-lg"
                                                        >
                                                            <Ban className="mr-3 h-6 w-6 text-red-500" />
                                                            <span>
                                                                Ban User
                                                            </span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={
                                                                handleExecutiveAccess
                                                            }
                                                            className="text-white hover:bg-gray-700 cursor-pointer py-4 px-4 text-lg"
                                                        >
                                                            <Crown className="mr-3 h-6 w-6 text-yellow-500" />
                                                            <span>
                                                                Grant Executive
                                                                Access
                                                            </span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setOpenUpdateTimeModal(
                                                                    true
                                                                );
                                                            }}
                                                            className="text-white hover:bg-gray-700 cursor-pointer py-4 px-4 text-lg"
                                                        >
                                                            <Timer className="mr-3 h-6 w-6 text-blue-500" />
                                                            <span>
                                                                Update User
                                                                Print Time
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
            <div className="flex flex-col items-center space-y-6">
                {savedTime && (
                    <div className="text-3xl font-bold p-6 bg-white rounded-lg shadow-md">
                        Selected Time: {savedTime}
                    </div>
                )}

                <Dialog
                    open={openUpdateTimeModal}
                    onOpenChange={() => setOpenUpdateTimeModal(false)}
                >
                    <DialogContent className="sm:max-w-[550px] p-8">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-center">
                                Update time for week of {getCurrentWeekMonday()}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex justify-center items-center gap-8">
                            <div className="flex flex-col items-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={incrementHours}
                                    className="h-20 w-20"
                                >
                                    <ChevronUp
                                        style={{
                                            height: "3rem",
                                            width: "3rem",
                                        }}
                                    />
                                    <span className="sr-only">
                                        Increase hours
                                    </span>
                                </Button>

                                <div className="text-4xl font-bold my-4 min-w-[100px] text-center">
                                    {hours.toString().padStart(2, "0")}
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={decrementHours}
                                    className="h-20 w-20"
                                >
                                    <ChevronDown
                                        style={{
                                            height: "3rem",
                                            width: "3rem",
                                        }}
                                    />
                                    <span className="sr-only">
                                        Decrease hours
                                    </span>
                                </Button>

                                <div className="text-2xl">Hours</div>
                            </div>

                            <div className="text-4xl font-bold">:</div>

                            <div className="flex flex-col items-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={incrementMinutes}
                                    className="h-20 w-20"
                                >
                                    <ChevronUp
                                        style={{
                                            height: "3rem",
                                            width: "3rem",
                                        }}
                                    />
                                    <span className="sr-only">
                                        Increase minutes
                                    </span>
                                </Button>

                                <div className="text-4xl font-bold my-4 min-w-[100px] text-center">
                                    {minutes.toString().padStart(2, "0")}
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={decrementMinutes}
                                    className="h-20 w-20"
                                >
                                    <ChevronDown
                                        style={{
                                            height: "3rem",
                                            width: "3rem",
                                        }}
                                    />
                                    <span className="sr-only">
                                        Decrease minutes
                                    </span>
                                </Button>

                                <div className="text-2xl">Minutes</div>
                            </div>
                        </div>

                        {user && (
                            <div className="text-center">
                                <div className="text-gray-400 mb-1">
                                    Current time:{" "}
                                    {formatUserTime(user.weekly_minutes)}
                                </div>
                                <div className="text-xl font-semibold">
                                    Total time: {calculateTotalTime()}
                                </div>
                            </div>
                        )}

                        <DialogFooter className="flex flex-col sm:flex-row gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setOpenUpdateTimeModal(false)}
                                className="text-xl py-6 flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="text-xl py-6 flex-1"
                            >
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="flex flex-col items-center space-y-6">
                <Dialog
                    open={openBanModal}
                    onOpenChange={() => setOpenBanModal(false)}
                >
                    <DialogContent className="sm:max-w-[550px] p-8">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-center">
                                Ban User
                            </DialogTitle>
                        </DialogHeader>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="default"
                                    className="h-14 px-6 bg-red-600 hover:bg-red-700 w-full flex justify-between items-center"
                                >
                                    <div className="flex items-center gap-2">
                                        <Ban size={24} />
                                        <span>{banDurationText}</span>
                                    </div>
                                    <ChevronDown size={20} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="bg-gray-800 border-gray-700 min-w-[250px]"
                            >
                                <DropdownMenuItem
                                    onClick={() => {
                                        setBanTimeState(24);
                                        setBanDurationText("1 Day");
                                    }}
                                    className="text-white hover:bg-gray-700 cursor-pointer py-4 px-4 text-lg"
                                >
                                    <span>1 Day</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setBanTimeState(168);
                                        setBanDurationText("1 Week");
                                    }}
                                    className="text-white hover:bg-gray-700 cursor-pointer py-4 px-4 text-lg"
                                >
                                    <span>1 Week</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setBanTimeState(720);
                                        setBanDurationText("1 Month");
                                    }}
                                    className="text-white hover:bg-gray-700 cursor-pointer py-4 px-4 text-lg"
                                >
                                    <span>1 Month</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setBanTimeState(720 * 12 * 999);
                                        setBanDurationText("999 Years");
                                    }}
                                    className="text-white hover:bg-gray-700 cursor-pointer py-4 px-4 text-lg"
                                >
                                    <span>999 Years</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DialogFooter className="flex flex-col sm:flex-row gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setOpenBanModal(false)}
                                className="text-xl py-6 flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleBanUser}
                                className="text-xl py-6 flex-1"
                            >
                                Confirm
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
