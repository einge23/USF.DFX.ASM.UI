import { CreateNewUserModal } from "./CreateNewUserModal";
import UpdateUserModal from "./UpdateUserModal";

export function UsersManagement() {
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
                <CreateNewUserModal />

                <UpdateUserModal />
            </div>
        </div>
    );
}
