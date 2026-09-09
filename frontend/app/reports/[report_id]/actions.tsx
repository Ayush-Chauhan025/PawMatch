'use server'
import { prisma } from '@/lib/prisma'

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