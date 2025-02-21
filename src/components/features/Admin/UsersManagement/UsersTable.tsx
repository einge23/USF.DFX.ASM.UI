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
import { Shield, Ban, Trash2, UserCog, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserData } from "@/types/UserData";

interface UsersTableProps {
    users: UserData[];
    // onSetTrained: (userId: string) => void;
    // onBanUser: (userId: string) => void;
    // onDeleteUser: (userId: string) => void;
    // onUpdateUser: (userId: string) => void;
}

export function UsersTable({
    users,
}: // onSetTrained,
// onBanUser,
// onDeleteUser,
// onUpdateUser,
UsersTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead>Trained</TableHead>
                    <TableHead className="w-[100px]">User Type</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium align-center">
                            {user.username}
                        </TableCell>
                        <TableCell className="font-medium justify-center">
                            {user.trained ? "Yes" : "No"}
                        </TableCell>
                        <TableCell className="font-medium justify-center">
                            {user.admin ? "Admin" : "User"}
                        </TableCell>
                        <TableCell className="font-medium"></TableCell>
                        {/* <TableCell>
                            {new Date(user.lastLogin).toLocaleDateString()}
                        </TableCell> */}
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="h-8 w-8 p-0"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        className="text-blue-600"
                                        // onClick={() => onSetTrained(user.id)}
                                    >
                                        <Shield className="mr-2 h-4 w-4" />
                                        Set as Trained
                                    </DropdownMenuItem>
                                    {/* <DropdownMenuItem
                                        className="text-yellow-600"
                                        // onClick={() => onBanUser(user.id)}
                                    >
                                        <Ban className="mr-2 h-4 w-4" />
                                        {user.isBanned
                                            ? "Unban User"
                                            : "Ban User"}
                                    </DropdownMenuItem> */}
                                    <DropdownMenuItem
                                        className="text-purple-600"
                                        // onClick={() => onUpdateUser(user.id)}
                                    >
                                        <UserCog className="mr-2 h-4 w-4" />
                                        Update Info
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-red-600"
                                        // onClick={() => onDeleteUser(user.id)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete User
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
