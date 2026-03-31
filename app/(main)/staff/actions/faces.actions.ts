'use server'

export async function getEmployeeFaces() {
    return { success: true, data: [] }
}

export async function addFace() {
    return { success: false, error: 'Биометрия отключена' }
}

export async function deleteFace() {
    return { success: false, error: 'Биометрия отключена' }
}

export async function setPrimary() {
    return { success: false, error: 'Биометрия отключена' }
}

export async function getEncoderStatus() {
    return { success: true, status: 'offline' }
}

export async function encodeFace() {
    return { success: false, error: 'Биометрия отключена' }
}
