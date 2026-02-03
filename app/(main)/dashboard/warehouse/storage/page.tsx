import { getStorageLocations, getAllUsers } from "../actions";
import { StorageLocationsTab } from "../storage-locations-tab";

export const dynamic = "force-dynamic";

export default async function StoragePage() {
    const [
        { data: storageLocations = [] },
        { data: users = [] }
    ] = await Promise.all([
        getStorageLocations(),
        getAllUsers()
    ]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            <StorageLocationsTab
                locations={storageLocations}
                users={users}
            />
        </div>
    );
}
