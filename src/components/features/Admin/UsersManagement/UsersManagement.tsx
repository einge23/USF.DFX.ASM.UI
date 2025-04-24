import { CreateNewUserModal } from "./CreateNewUserModal";
import UpdateUserModal from "./UpdateUserModal";

export function UsersManagement() {
    return (
        <div className="space-y-6">
            <div className="p-6 bg-gray-800 rounded-lg">
                <h2 className="mb-4 text-2xl font-bold text-white">
                    Users Management
                </h2>
                <p className="text-gray-300">
                    Here you can manage users, their roles, and permissions.
                </p>
            </div>

            <div className="flex flex-row justify-center items-center gap-1">
                <CreateNewUserModal />

                <UpdateUserModal />
            </div>
        </div>
    );
}
