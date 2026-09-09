/* eslint-disable @next/next/no-img-element */
'use client'
import { useParams, useRouter } from "next/navigation"
import { useEffect, useReducer } from "react"
import Link from "next/link";
import Image from "next/image";
import logo from '../../Logo.png';
import getData from "./actions";
import { MapPin, Calendar, Clock, Info, Search } from "lucide-react";

type Report = {
    name : string | null;
    createdAt: Date;
    type: 'LOST' | 'SPOTTED';
    status: 'ACTIVE' | 'RESOLVED';
    description : string | null;
    latitude: number;
    longitude: number;
    lastSeenDate: Date;
    lastSeenTime: string;
    images : PetImages[];
};

type PetImages = { 
    id: string; 
    createdAt: Date; 
    url: string; 
    petReportId: string;
}

type Action = {
    type: 'response_from_database';
    payload: Report;
};

function reducer(prevState: Report | null, action: Action): Report | null {
    switch (action.type) {
        case 'response_from_database':
            return {
                ...prevState,
                ...action.payload,
            };
        default:
            return prevState;
    }
}

export default function Report(){
    const {report_id} = useParams()
    const [state, dispatch] = useReducer(reducer, null);
    const router = useRouter();
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await getData(String(report_id));
                dispatch({
                    type: 'response_from_database',
                    payload: response,
                });
            } catch (error) {
                console.error("Failed to fetch report:", error);
            }
        }

        if (report_id) {
            fetchData();
        }
    }, [report_id]);

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-50 pb-12">
            {/* Header */}
            <div className="w-full flex items-center justify-between gap-8 px-8 py-4 bg-white text-black border-b-2 border-gray-400 sticky top-0 z-50">
                <Link href="/">
                    <Image
                        src={logo}
                        alt="PawMatch Logo"
                        width={100}
                        height={100}
                        className="object-contain"
                    />
                </Link>
                <div className="flex-1 text-right">
                    <button onClick={() => router.back()} className="font-bold bg-white p-2 py-3 px-5 text-black rounded-2xl border border-black">
                        {" Back "}
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {!state ? (
                <div className="flex-1 flex flex-col justify-center items-center mt-32">
                    <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 font-semibold text-gray-500 animate-pulse">Loading report details...</p>
                </div>
            ) : (
                /* Main Content */
                <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-6 mt-6 bg-white rounded-2xl shadow-sm border border-gray-200">
                    {/* Title */}
                    <div className="flex flex-col gap-3 border-b border-gray-200 pb-6">
                        <div className="flex gap-3">
                            <span className={`px-4 py-1 rounded-full text-xs font-black tracking-wider text-white ${state.type === 'LOST' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                                {state.type}
                            </span>
                            <span className={`px-4 py-1 rounded-full text-xs font-bold tracking-wider ${state.status === 'ACTIVE' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'}`}>
                                {state.status}
                            </span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 mt-2">
                            {state.name ? `Missing: ${state.name}` : 'Help Identify This Pet'}
                        </h1>
                        <p className="text-sm text-gray-500 font-medium">
                            Reported on {new Date(state.createdAt).toLocaleDateString()}
                        </p>

                        {/* SEARCH BUTTON */}
                        <div className="mt-4">
                            <Link 
                                href={`/reports/${report_id}/matches`} 
                                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95"
                            >
                                <Search size={20} />
                                Search Nearby Matches
                            </Link>
                            <p className="text-xs text-gray-500 mt-2 ml-1">
                                Uses PawMatch AI to scan recent {state.type === 'LOST' ? 'spotted' : 'lost'} reports.
                            </p>
                        </div>
                    </div>

                    {/* Image Gallery */}
                    {state.images && state.images.length > 0 && (
                        <div className={`grid gap-4 mt-2 ${state.images.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                            {state.images.map((img) => (
                                <div key={img.id} className="relative h-72 w-full rounded-xl overflow-hidden shadow-md border border-gray-200">
                                    <img 
                                        src={img.url} 
                                        alt="Pet Photograph" 
                                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-300" 
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        
                        {/* Last Seen Details */}
                        <div className="bg-orange-50 p-6 rounded-xl border border-orange-200 flex flex-col gap-4">
                            <h3 className="font-bold text-xl text-orange-900 border-b border-orange-200 pb-2">Last Seen Information</h3>
                            
                            <div className="flex items-center gap-3 text-orange-800">
                                <Calendar size={20} className="text-orange-600" />
                                <div>
                                    <p className="text-xs text-orange-600 font-bold uppercase tracking-wide">Date</p>
                                    <p className="font-medium text-lg">{new Date(state.lastSeenDate).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-orange-800">
                                <Clock size={20} className="text-orange-600" />
                                <div>
                                    <p className="text-xs text-orange-600 font-bold uppercase tracking-wide">Time</p>
                                    <p className="font-medium text-lg">{state.lastSeenTime}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-orange-800">
                                <MapPin size={20} className="text-orange-600" />
                                <div>
                                    <p className="text-xs text-orange-600 font-bold uppercase tracking-wide">Coordinates</p>
                                    <p className="font-medium text-md">{state.latitude}, {state.longitude}</p>
                                    <a 
                                        href={`https://www.google.com/maps/search/?api=1&query=${state.latitude},${state.longitude}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-orange-600 underline font-bold mt-1 inline-block"
                                    >
                                        View on Google Maps
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col gap-4">
                            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                                <Info size={20} className="text-gray-700" />
                                <h3 className="font-bold text-xl text-gray-900">Additional Details</h3>
                            </div>
                            <p className="text-md text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {state.description ? state.description : 'No additional details were provided for this report.'}
                            </p>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}