'use server'

import { db } from '@/lib/db'
import { workstations, cameras } from '@/lib/schema/presence'
import { users } from '@/lib/schema/users'
import { eq, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { CreateWorkstationSchema, UpdateWorkstationSchema, DeleteWorkstationSchema } from '../validation'
import { type WorkstationInput } from './types'

export async function getWorkstations() {
    try {
        const data = await db.query.workstations.findMany({
            limit: 1000,
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
            limit: 1000,
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
            limit: 1000,
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
        const parsed = CreateWorkstationSchema.safeParse(data)
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0].message }
        }

        const [result] = await db.insert(workstations).values({
            ...parsed.data,
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
        const parsed = UpdateWorkstationSchema.safeParse(data)
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0].message }
        }

        const idCheck = DeleteWorkstationSchema.safeParse({ id })
        if (!idCheck.success) {
            return { success: false, error: idCheck.error.issues[0].message }
        }

        const [result] = await db.update(workstations)
            .set({
                ...parsed.data,
                updatedAt: new Date()
            })
            .where(eq(workstations.id, idCheck.data.id))
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
        const parsed = DeleteWorkstationSchema.safeParse({ id })
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0].message }
        }

        await db.delete(workstations).where(eq(workstations.id, parsed.data.id))
        revalidatePath('/staff/workstations')
        return { success: true }
    } catch {
        return { success: false, error: 'Failed to delete workstation' }
    }
}
