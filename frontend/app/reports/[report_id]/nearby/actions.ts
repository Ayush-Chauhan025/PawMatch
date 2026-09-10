'use server'
import {prisma} from '@/lib/prisma'

type NearbyResult = {
    id: string
    name: string | null
    type: 'LOST' | 'SPOTTED'
    status: 'ACTIVE' | 'RESOLVED'
    sr_latitude: number
    sr_longitude: number
    pr_latitude: number
    pr_longitude: number
    lastSeenDate: Date
    lastSeenTime: string
    imageURL: string | null
    distance: number
}

export default async function get_Nearby_Result(report_id: string, radius: number) {
    if (!Number.isFinite(radius) || radius <= 0) {
        throw new Error('Radius must be a positive number.')
    }

    const nearbyReports = await prisma.$queryRaw<NearbyResult[]>`
        WITH source_report AS (
            SELECT id, type, "userId", latitude, longitude
            FROM "PetReport"
            WHERE id = ${report_id}
        ),
        distance_reports AS (
            SELECT
                sr.latitude as "sr_latitude",
                sr.longitude as "sr_longitude",
                pr.id,
                pr.name,
                pr.type,
                pr.status,
                pr.latitude as "pr_latitude",
                pr.longitude as "pr_longitude",
                pr."lastSeenDate" AS "lastSeenDate",
                pr."lastSeenTime" AS "lastSeenTime",
                img.url AS "imageURL",

                6371 * ACOS(
                    GREATEST(-1.0, LEAST(1.0,
                        COS(RADIANS(sr.latitude)) * COS(RADIANS(pr.latitude)) *
                        COS(RADIANS(pr.longitude) - RADIANS(sr.longitude)) +
                        SIN(RADIANS(sr.latitude)) * SIN(RADIANS(pr.latitude))
                    ))
                ) AS distance
            FROM "PetReport" AS pr
            CROSS JOIN source_report AS sr
            LEFT JOIN LATERAL (
                SELECT url
                FROM "PetImage"
                WHERE "petReportId" = pr.id
                ORDER BY "createdAt" ASC
                LIMIT 1
            ) AS img ON TRUE
            WHERE pr.id != sr.id
                AND pr.type != sr.type
                AND pr.status = 'ACTIVE'::"ReportStatus"
                AND pr."userId" != sr."userId"
        )
        SELECT *
        FROM distance_reports
        WHERE distance <= ${radius}
        ORDER BY distance ASC
    `

    console.log(nearbyReports);

    return nearbyReports
}
