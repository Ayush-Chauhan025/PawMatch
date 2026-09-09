'use server'
import { prisma } from '@/lib/prisma'

type MatchResult = {
    id: string;
    name: string | null;
    type: 'LOST' | 'SPOTTED';
    status: 'ACTIVE' | 'RESOLVED';
    similarity_score: number;
    lastSeenDate: Date;
    lastSeenTime: string;
    latitude: number;
    longitude: number;
    imageURL: string;
};

type SqlResult = {
    id: string;
    name: string | null;
    type: 'LOST' | 'SPOTTED';
    status: 'ACTIVE' | 'RESOLVED';
    lastSeenDate: Date;
    lastSeenTime: string;
    latitude: number;
    longitude: number;
    imageURL: string;
    visual_score: number | string;
    distance_score: number | string;
    time_score: number | string;
    similarity_score: number | string;
};

export default async function get_AI_Result(report_id: string) {
    const matches = await prisma.$queryRaw<SqlResult[]>`
        WITH source_report AS (
            SELECT latitude, longitude, "lastSeenDate", type, "userId"
            FROM "PetReport"
            WHERE id = ${report_id}
        ), 
        source_images AS (
            SELECT embedding
            FROM "PetImage"
            WHERE "petReportId" = ${report_id} AND embedding IS NOT NULL
        ), 
        target_visuals AS (
            SELECT DISTINCT ON (target_img."petReportId") 
                target_img."petReportId" AS target_id,
                target_img.url AS image_url,
                1 - (target_img.embedding <=> src_img.embedding) AS max_visual_score
            FROM "PetImage" target_img
            CROSS JOIN source_images src_img
            WHERE target_img."petReportId" != ${report_id} AND target_img.embedding IS NOT NULL
            ORDER BY target_img."petReportId", (1 - (target_img.embedding <=> src_img.embedding)) DESC
        ), 
        raw_scores AS (
            SELECT 
                t.id,
                t.name,
                t.type,
                t.status,
                t."lastSeenDate",
                t."lastSeenTime",
                t.latitude,
                t.longitude,
                tv.image_url AS "imageURL",
                tv.max_visual_score AS visual_score,
                
                EXP(-(LN(2) / 5.0) * (
                    6371 * ACOS(LEAST(1.0, 
                        COS(RADIANS(sr.latitude)) * COS(RADIANS(t.latitude)) * 
                        COS(RADIANS(t.longitude) - RADIANS(sr.longitude)) + 
                        SIN(RADIANS(sr.latitude)) * SIN(RADIANS(t.latitude))
                    ))
                )) AS distance_score,

                EXP(-(LN(2) / 3.0) * (
                    ABS(EXTRACT(EPOCH FROM (t."lastSeenDate" - sr."lastSeenDate"))) / 86400.0
                )) AS time_score

            FROM "PetReport" t
            JOIN target_visuals tv ON t.id = tv.target_id
            CROSS JOIN source_report sr
            WHERE t.type != sr.type AND t."userId" != sr."userId"
        ) 
        SELECT 
            *, 
            (visual_score * 0.70) + (distance_score * 0.25) + (time_score * 0.05) AS similarity_score
        FROM raw_scores
        ORDER BY similarity_score DESC
        LIMIT 20;
    `;

    return matches.map((match): MatchResult => ({
        id: match.id,
        name: match.name,
        type: match.type,
        status: match.status,
        similarity_score: Math.round(Number(match.similarity_score) * 100),
        lastSeenDate: match.lastSeenDate,
        lastSeenTime: match.lastSeenTime,
        latitude: match.latitude,
        longitude: match.longitude,
        imageURL: match.imageURL
    }));
}