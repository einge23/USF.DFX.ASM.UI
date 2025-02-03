import { useAuth } from "@/context/authContext";
import { useNavigate } from "react-router-dom";
import { Home, LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
    const auth = useAuth();
    const nav = useNavigate();
    const user = auth.userData ?? null;
    const handleLogout = async () => {
        await auth.logout();
        nav("/");
    };

    const handleHome = async () => {
        nav("/Home");
    };

    const handleAdmin = async () => {
        nav("/Admin");
    };
    return (
        <nav className="flex items-center justify-between p-4 bg-gray-800 shadow-md border-b border-gray-700 relative z-10">
            <div className="flex items-center space-x-4">
                <span className="text-lg font-semibold bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text">
                    USF DFX Lab
                </span>
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-300 hover:text-white hover:bg-gray-700"
                    onClick={handleHome}
                >
                    <Home className="h-5 w-5" />
                </Button>
                {user?.admin && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-300 hover:text-white hover:bg-gray-700"
                        onClick={handleAdmin}
                    >
                        <Settings className="h-5 w-5" />
                    </Button>
                )}
                {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-300 hover:text-white hover:bg-gray-700"
                            >
                                <User className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="bg-gray-800 text-gray-300 border-gray-700"
                        >
                            <DropdownMenuItem className="hover:bg-gray-700 hover:text-white">
                                <User className="mr-2 h-4 w-4" />
                                <span>{user?.username}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="hover:bg-gray-700 hover:text-white"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </nav>
    );
}
