import { z } from "zod";
import { ClientFiltersSchema } from "./validation";

export type ClientFilters = z.infer<typeof ClientFiltersSchema>;

/**
 * Clients Actions - Main Barrel File
 * 
 * This file re-exports server actions from decomposed action files for backward compatibility.
 * All new code should ideally import directly from specific action files.
 */

export {
    getManagers, getRegions, getClients, checkClientDuplicates,
    addClient, updateClient, updateClientComments, getClientDetails,
    getClientStats, deleteClient, updateClientField, toggleClientArchived
} from "./actions/core.actions";

export {
    bulkDeleteClients, bulkUpdateClientManager, bulkArchiveClients
} from "./actions/bulk.actions";
