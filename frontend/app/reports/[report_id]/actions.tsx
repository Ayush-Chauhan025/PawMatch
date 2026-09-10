'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export default async function getData(report_id: string){
    const response = await prisma.petReport.findUniqueOrThrow({
        where: {
            id: String(report_id)
        }, 
        select: {
            name: true,
            createdAt: true,
            type: true,
            status: true,
            description: true,
            latitude: true,
            longitude: true,
            lastSeenDate: true,
            lastSeenTime: true,
            images: true,
            user: true
        },
    });
    console.log(response);
    return response
}

export async function markReportResolved(reportId: string) {
    try {
        await prisma.petReport.update({
            where: { id: reportId },
            data: { status: 'RESOLVED' } 
        });
        
        revalidatePath('/');
        revalidatePath(`/reports/${reportId}`);
        revalidatePath(`/reports/${reportId}/nearby`);
        
        return { success: true };
    } catch (error) {
        console.error("Failed to resolve report:", error);
        return { success: false };
    }
}