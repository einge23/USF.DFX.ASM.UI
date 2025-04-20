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
    <nav className="relative z-10 flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 shadow-md">
      <div className="flex items-center space-x-4">
        <span className="text-2xl font-semibold text-transparent bg-gradient-to-r from-green-400 to-green-600 bg-clip-text">
          USF DFX Lab
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="lg"
          className="p-3 text-gray-300 hover:text-white hover:bg-gray-700"
          onClick={handleHome}
        >
          <Home className="h-7 w-7" />
        </Button>
        {user?.admin && (
          <Button
            variant="ghost"
            size="lg"
            className="p-3 text-gray-300 hover:text-white hover:bg-gray-700"
            onClick={handleAdmin}
          >
            <Settings className="h-7 w-7" />
          </Button>
        )}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="lg"
                className="p-3 text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <User className="h-7 w-7" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 text-gray-300 bg-gray-800 border-gray-700"
            >
              <DropdownMenuItem className="py-3 text-lg hover:bg-gray-700 hover:text-white">
                <User className="w-5 h-5 mr-2" />
                <span>{user?.username}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="py-3 text-lg hover:bg-gray-700 hover:text-white"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-2" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}
