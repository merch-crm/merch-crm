# Test Data & Seeding Guide

How to populate MerchCRM with high-quality "mock" data for development and testing.

## Fast Seeding
The project uses custom scripts to bypass the UI for rapid setup. 
*Note: Always ensure the SSH tunnel is active.*

### 1. Categories & Locations
To add standard warehouse structure:
`npx tsx scripts/seed-warehouse.ts` (Implement if not exists)

### 2. Mock Clients
To add 10-20 fake clients:
`npx tsx scripts/seed-clients.ts`

## Manual Data Reset
To completely wipe the database (DANGER):
1. Delete all records via SQL in Admin Shell or:
2. `npm run db:drop` followed by `npm run db:push`.

## Expected "Gold" Data Set
When testing, ensure you have:
- At least 1 item with **Zero** stock.
- At least 1 item with stock at **Two** different locations.
- 1 **Administrator** account and 1 **Production** account.
- 50+ **History** entries for pagination testing.
