import { getStorageLocations } from "../storage-actions";
import { getAllUsers } from "../warehouse-stats-actions";;
import { StorageLocationsTab } from "../storage-locations-tab";

export const metadata = {
    title: "Хранение | Склад",
};

export const dynamic = "force-dynamic";

export default async function StoragePage() {
    const [locationsRes, usersRes] = await Promise.all([
        getStorageLocations(),
        getAllUsers()
    ]);
    const storageLocations = ('data' in locationsRes && locationsRes.data) ? locationsRes.data : [];
    const users = ('data' in usersRes && usersRes.data) ? usersRes.data : [];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            <StorageLocationsTab
                locations={storageLocations}
                users={users}
            />
        </div>
    );
}
