import { Button } from "@/components/ui/button";
import { Plus, Shield, Ban, Trash2, UserCog } from "lucide-react";
import { UsersTable } from "./UsersTable";
import { UserData } from "@/types/UserData";

export function UsersManagement() {
    const users: UserData[] = [
        {
            id: 1,
            username: "Evan Inge",
            admin: true,
            trained: true,
        },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-4 text-white">
                    Users Management
                </h2>
                <p className="text-gray-300">
                    Here you can manage users, their roles, and permissions.
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Button
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    variant="default"
                >
                    <Plus className="h-4 w-4" />
                    Create User
                </Button>

                <Button
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    variant="default"
                >
                    <Shield className="h-4 w-4" />
                    Set Trained
                </Button>

                <Button
                    className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700"
                    variant="default"
                >
                    <Ban className="h-4 w-4" />
                    Ban User
                </Button>

                <Button
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                    variant="default"
                >
                    <UserCog className="h-4 w-4" />
                    Update Info
                </Button>

                <Button
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                    variant="default"
                >
                    <Trash2 className="h-4 w-4" />
                    Delete User
                </Button>
            </div>

            {/* Table or list of users will go here */}
            <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-white">
                    Users List
                </h3>
                <UsersTable
                    users={users}
                    // onSetTrained={handleSetTrained}
                    // onBanUser={handleBanUser}
                    // onDeleteUser={handleDeleteUser}
                    // onUpdateUser={handleUpdateUser}
                />
            </div>
        </div>
    );
}
