'use server'

export async function getPresenceSettings() {
    return { success: true, data: {} }
}

export async function updatePresenceSettings() {
    return { success: false, error: 'Настройки присутствия отключены' }
}
