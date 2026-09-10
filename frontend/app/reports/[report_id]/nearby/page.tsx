/* eslint-disable @next/next/no-img-element */
'use client'

import { ArrowLeft, Search } from 'lucide-react';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import get_Nearby_Result from './actions';
import dynamic from 'next/dynamic';

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

const DynamicMap = dynamic(() => import('@/app/reports/[report_id]/nearby/Map'), { 
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100 animate-pulse">Loading Map...</div>
});

export default function Nearby_Searches({ params }: { params: Promise<{ report_id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const report_id = String(resolvedParams.report_id);
    const [nearbyReports, setNearbyReports] = useState<NearbyResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [radius, setRadius] = useState(5);

    useEffect(() => {
        let isCurrent = true;
        async function getData() {
            try {
                const results = await get_Nearby_Result(report_id, radius);
                if (isCurrent) {
                    setNearbyReports(results);
                }
            } catch (error) {
                console.error('Failed to load nearby reports:', error);

                if (isCurrent) {
                    setError('We could not load nearby reports. Please try again.');
                }
            } finally {
                if (isCurrent) {
                    setIsLoading(false);
                }
            }
        }
        getData();
        return () => {
            isCurrent = false;
        }
    }, [report_id, radius]);

    return <div className='h-screen bg-gray-50 flex flex-col items-center pb-12'>
        <div className="w-full flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-50">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-semibold transition-colors border border-black p-2 rounded-xl"
            >
                <ArrowLeft size={20} />
                Back
            </button>
            <div className='flex gap-2 text-black font-bold items-center justify-center'>
                <h1>Search Radius </h1>
                <select value={radius} onChange={(e) => setRadius(Number(e.target.value))}
                className='text-black p-2 border border-gray-600'
                >
                    <option value={2}>2 Km</option>
                    <option value={5}>5 Km</option>
                    <option value={10}>10 Km</option>
                </select>
            </div>
        </div>
        <div className='overflow-hidden w-full max-h-screen flex-1 flex flex-col'>
            {isLoading ? (
                    <div className="flex flex-col items-center justify-center mt-16 text-center">
                        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                        <p className="mt-4 font-semibold text-gray-500">Finding nearby reports...</p>
                    </div>
                ) : error ? (
                    <div className="mt-12 text-center bg-white p-10 rounded-2xl border border-red-200 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-800">Unable to load nearby reports</h3>
                        <p className="text-gray-500 mt-2">{error}</p>
                    </div>
                ) : nearbyReports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-12 text-center bg-white p-10 rounded-2xl border border-gray-200 shadow-sm">
                        <Search size={48} className="text-gray-300 mb-4" />
                        <h3 className="text-2xl font-bold text-gray-700">No nearby reports found</h3>
                        <p className="text-gray-500 mt-2 max-w-md">
                            There are no active reports within {radius} km yet. Try Smart Search for photo-based matches.
                        </p>
                    </div>
                ) : (<div className="w-full flex-1  relative z-0">
                        <DynamicMap reports={nearbyReports} report_id={report_id} radius={radius * 1000} />
                    </div>
            )}
        </div>
    </div>
}