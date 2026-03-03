'use server'

import { db } from '@/lib/db'
import { workstations, cameras, type DetectionZone } from '@/lib/schema/presence'
import { users } from '@/lib/schema/users'
import { eq, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export interface WorkstationInput {
    name: string;
    description?: string | null;
    cameraId?: string | null;
    assignedUserId?: string | null;
    requiresAssignedUser?: boolean;
    zone?: DetectionZone | null;
    color?: string | null;
}

export async function getWorkstations() {
    try {
        const data = await db.query.workstations.findMany({
            with: {
                camera: {
                    columns: {
                        name: true,
                        streamUrl: true
                    }
                },
                assignedUser: {
                    columns: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: [asc(workstations.sortOrder)]
        })
        return { success: true, data }
    } catch (error) {
        console.error('getWorkstations error:', error)
        return { success: false, error: 'Failed to fetch workstations' }
    }
}

export async function getCameras() {
    try {
        const data = await db.query.cameras.findMany({
            where: eq(cameras.isEnabled, true),
            columns: {
                id: true,
                name: true,
                streamUrl: true,
                deviceId: true
            }
        })
        return { success: true, data }
    } catch {
        return { success: false, error: 'Failed to fetch cameras' }
    }
}

export async function getUsers() {
    try {
        const data = await db.query.users.findMany({
            columns: {
                id: true,
                name: true,
                email: true
            },
            orderBy: [asc(users.name)]
        })
        return { success: true, data }
    } catch {
        return { success: false, error: 'Failed to fetch users' }
    }
}

export async function createWorkstation(data: WorkstationInput) {
    try {
        const [result] = await db.insert(workstations).values({
            ...data,
            updatedAt: new Date()
        }).returning()

        revalidatePath('/staff/workstations')
        return { success: true, data: result }
    } catch (error) {
        console.error('createWorkstation error:', error)
        return { success: false, error: 'Failed to create workstation' }
    }
}

export async function updateWorkstation(id: string, data: Partial<WorkstationInput>) {
    try {
        const [result] = await db.update(workstations)
            .set({
                ...data,
                updatedAt: new Date()
            })
            .where(eq(workstations.id, id))
            .returning()

        revalidatePath('/staff/workstations')
        return { success: true, data: result }
    } catch (error) {
        console.error('updateWorkstation error:', error)
        return { success: false, error: 'Failed to update workstation' }
    }
}

export async function deleteWorkstation(id: string) {
    try {
        await db.delete(workstations).where(eq(workstations.id, id))
        revalidatePath('/staff/workstations')
        return { success: true }
    } catch {
        return { success: false, error: 'Failed to delete workstation' }
    }
}
