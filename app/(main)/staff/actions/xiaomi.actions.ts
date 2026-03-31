'use server'

export async function addXiaomiAccount() {
    return { success: false, error: 'Xiaomi integration is disabled' }
}

export async function deleteXiaomiAccount() {
    return { success: false, error: 'Xiaomi integration is disabled' }
}

export async function getXiaomiAccounts() {
    return { success: true, data: [] }
}

export async function syncXiaomiDevices() {
    return { success: false, error: 'Xiaomi integration is disabled' }
}
