'use server'

import { prisma } from '@/lib/prisma'
import {supabaseStorage} from '@/lib/supabase/storage'
import { ReportType } from '@prisma/client'
import { redirect } from 'next/navigation'

const EMBEDDING_DIMENSIONS = 256

function toPgVectorLiteral(value: unknown): string {
    if (
        !Array.isArray(value) ||
        value.length !== EMBEDDING_DIMENSIONS ||
        !value.every((component) => typeof component === 'number' && Number.isFinite(component))
    ) {
        throw new Error(`ML service returned an invalid embedding. Expected ${EMBEDDING_DIMENSIONS} finite numbers.`)
    }

    return `[${value.join(',')}]`
}

export async function createReport(formData: FormData){
    const type = formData.get('type') as ReportType;
    const name = (formData.get('name') as string ) || null
    const latitude = parseFloat(formData.get('latitude') as string)
    const longitude = parseFloat(formData.get('longitude') as string)
    const description = (formData.get('description') as string) || null
    
    const lastSeenDateStr = formData.get('lastSeenDate') as string;
    const lastSeenTime = formData.get('lastSeenTime') as string;

    const rawFiles = formData.getAll('images') as File[]

    if(!latitude || !longitude){
        throw new Error('Location is required');
    }
    if (!lastSeenDateStr || !lastSeenTime) {
        throw new Error('Date and time are required');
    }

    const lastSeenDate = new Date(lastSeenDateStr);

    const imageFiles = rawFiles.filter((file) => file.size > 0)

    if (imageFiles.length === 0) {
        throw new Error('At least one dog photo is required.')
    }
    if (imageFiles.length > 3) {
        throw new Error('You can upload a maximum of 3 photos.')
    }

    const uploadPromises = imageFiles.map(async(file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
        const filePath = `reports/${fileName}`

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const {error: uploadError} = await supabaseStorage.storage.from('pet-images')
        .upload(filePath, buffer,{ contentType: file.type, upsert: false,});

        if(uploadError){
            throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
        }

        const {data: publicUrlData} = supabaseStorage.storage.from('pet-images').getPublicUrl(filePath)
        console.log(publicUrlData)
        
        return { url: publicUrlData.publicUrl }
    });

    const uploadedImages = await Promise.all(uploadPromises)
    console.log(uploadedImages);

    const report = await prisma.petReport.create({
        data: {
            type,
            name,
            latitude,
            longitude,
            description,
            lastSeenDate,
            lastSeenTime,

            userId: 'test-user-id-123',
            
            images: {
                create: uploadedImages,
            },
        },
        include: {
            images: true,
        },
    })

    try {
        console.log("Waiting for embedding generation...");

        const promises = imageFiles.map(async (file, index) => {
            try {
                const pythonFormData = new FormData();
                pythonFormData.append("file", file);

                const aiResponse = await fetch(`${process.env.ML_SERVICE_URL || "http://127.0.0.1:8000"}/generate-embedding`, {
                    method: 'POST',
                    body: pythonFormData,
                });

                if (!aiResponse.ok) {
                    throw new Error(`ML service rejected image ${index + 1}: ${await aiResponse.text()}`)
                }

                const aiData: unknown = await aiResponse.json();
                const embeddingVector = toPgVectorLiteral(
                    typeof aiData === 'object' && aiData !== null && 'embedding' in aiData
                        ? aiData.embedding
                        : undefined
                )
                const imageRecordId = report.images[index].id;

                const updatedRows = await prisma.$executeRaw`
                    UPDATE "PetImage"
                    SET embedding = ${embeddingVector}::vector
                    WHERE id = ${imageRecordId}
                `

                if (updatedRows !== 1) {
                    throw new Error(`Could not find image record ${imageRecordId} to save its embedding.`)
                }

                return true;
            } catch (error) {
                console.error(`Failed to generate or save embedding for image ${index + 1}:`, error)
                return false;
            }
        }); 

        const results = await Promise.all(promises);
        const failedCount = results.filter(res => !res).length;
        
        if (failedCount > 0) {
            console.error(`${failedCount} embeddings failed to generate.`);
        } else {
            console.log("All embeddings successfully generated and saved to PostgreSQL!");
        }
        
    } catch (error){
        console.error("Failed to trigger ML pipeline:", error);
    }

    redirect(`/reports/${report.id}`);
}
