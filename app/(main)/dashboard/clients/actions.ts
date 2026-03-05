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
    getClientStats, deleteClient, updateClientField, toggleClientArchived,
    getClientTypeCounts, getAcquisitionSources
} from "./actions/core.actions";

export {
    bulkDeleteClients, bulkUpdateClientManager, bulkArchiveClients
} from "./actions/bulk.actions";

export {
    getClientContacts,
    addClientContact,
    updateClientContact,
    deleteClientContact,
    setPrimaryContact,
} from "./actions/contacts.actions";

export {
    getFunnelStats,
    getClientsForFunnel,
    updateClientFunnelStage,
    markClientAsLost,
} from "./actions/funnel.actions";

export {
    getLoyaltyLevels,
    createLoyaltyLevel,
    updateLoyaltyLevel,
    deleteLoyaltyLevel,
    reorderLoyaltyLevels,
    setClientLoyaltyLevel,
    recalculateAllClientsLoyalty,
} from "./actions/loyalty.actions";
export {
    recalculateClientStats,
    recalculateAllClientsStats,
    updateDaysSinceLastOrder,
    getClientsAtRisk,
    getClientsStatsOverview,
    getOrdersDistribution,
    getActivityStats,
} from "./actions/stats.actions";

export {
    calculateClientRFM,
    calculateAllClientsRFM,
    getRFMStats,
    getClientsByRFMSegment,
} from "./actions/rfm.actions";

export {
    rfmSegments,
    rfmSegmentLabels,
    rfmSegmentColors,
} from "./actions/rfm.types";

export {
    getClientAnalyticsOverview,
    getFunnelAnalytics,
    getClientGrowthData,
    getRevenueByRFMSegment,
    getManagerPerformance,
    getTopClients,
    getAcquisitionSourceStats,
    getLoyaltyDistribution,
    getRFMDistribution,
} from "./actions/analytics.actions";

export {
    getExportData,
    getExportPresets,
} from "./actions/export.actions";

export { EXPORT_COLUMNS } from "./actions/export.types";
