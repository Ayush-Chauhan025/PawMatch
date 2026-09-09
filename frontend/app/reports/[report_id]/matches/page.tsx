/* eslint-disable @next/next/no-img-element */
'use client'
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import get_AI_Result from './actions';

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
    imageURL: string
};

export default function MatchesPage({ params }: { params: Promise<{ report_id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const report_id = String(resolvedParams.report_id);
    const [matches, setMatches] = useState<MatchResult[] | []>([]);

    useEffect(() => {
        async function getResult() {
            const result: MatchResult[] = await get_AI_Result(report_id);
            setMatches(result);
        }
        getResult();
    }, [report_id]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center pb-12">
            
            {/* Navigation */}
            <div className="w-full flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-50">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-semibold transition-colors border border-black p-2 rounded-xl"
                >
                    <ArrowLeft size={20} />
                    Back
                </button>
                <div className="text-right">
                    <h1 className="text-xl font-bold text-gray-800">Match Results</h1>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="w-full max-w-6xl mx-auto px-6 mt-8">
                
                <div className="mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">Potential Matches</h2>
                    <p className="text-gray-500 mt-2">
                        Displaying pets with a high similarity to your report.
                    </p>
                </div>

                {matches.length === 0 ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center mt-12 text-center bg-white p-10 rounded-2xl border border-gray-200 shadow-sm">
                        <Activity size={48} className="text-gray-300 mb-4" />
                        <h3 className="text-2xl font-bold text-gray-700">No matches found yet</h3>
                        <p className="text-gray-500 mt-2 max-w-md">
                            Our system hasn&apos;t found a match nearby yet. Check back soon as new reports come in daily.
                        </p>
                    </div>
                ) : (
                    /* Match Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {matches?.map((match) => (
                            <Link href={`/reports/${report_id}/matches/${match.id}`} key={match.id} className="group">
                                <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative">
                                    
                                    {/* Match */}
                                    <div className="absolute top-3 right-3 z-10 bg-green-500 text-white px-3 py-1.5 rounded-full font-black text-sm flex items-center gap-1 shadow-md">
                                        {match.similarity_score}% Match
                                    </div>

                                    {/* Thumbnail Image */}
                                    <div className="relative h-56 w-full bg-gray-100 overflow-hidden">
                                        <img 
                                            src={match.imageURL} 
                                            alt="Matched Pet" 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider text-white shadow-sm ${match.type === 'LOST' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                                                {match.type}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Details */}
                                    <div className="p-5 flex flex-col grow">
                                        <h3 className="text-xl font-extrabold text-gray-900 truncate">
                                            {match.name ? match.name : 'Unknown Pet'}
                                        </h3>
                                        
                                        <div className="mt-3 flex flex-col gap-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-gray-400" />
                                                <span>{new Date(match.lastSeenDate).toLocaleDateString()} at {match.lastSeenTime}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin size={16} className="text-gray-400 min-w-4" />
                                                <span className="truncate">{match.latitude.toFixed(4)}, {match.longitude.toFixed(4)}</span>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-center text-orange-600 font-bold text-sm group-hover:text-orange-700">
                                            View Report Details
                                        </div>
                                    </div>

                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}