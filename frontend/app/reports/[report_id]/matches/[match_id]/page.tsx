/* eslint-disable @next/next/no-img-element */
'use client'
import { useParams, useRouter } from "next/navigation"
import { useEffect, useReducer, useState } from "react"
import Link from "next/link";
import Image from "next/image";
import logo from '../../../../Logo.png';
import getData from "../../actions";
import { MapPin, Calendar, Clock, Info, ShieldAlert, Mail } from "lucide-react";

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
    user: {
        createdAt: Date;
        email: string;
    };
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

function getJoinedText(createdAt: Date): string {
    const msAgo = Date.now() - new Date(createdAt).getTime();
    const yearsAgo = Math.floor(msAgo / (1000 * 60 * 60 * 24 * 365));
    
    if (yearsAgo === 0) return "Reporter Joined recently";
    return `Reporter Joined ${yearsAgo} year${yearsAgo === 1 ? '' : 's'} ago`;
}

export default function Report(){
    const params = useParams();
    const match_id = String(params.match_id)
    const [state, dispatch] = useReducer(reducer, null);
    const [showSafetyModal, setShowSafetyModal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await getData(String(match_id));
                dispatch({
                    type: 'response_from_database',
                    payload: response,
                });
            } catch (error) {
                console.error("Failed to fetch report:", error);
            }
        }

        if (match_id) {
            fetchData();
        }
    }, [match_id]);

    const emailSubject = `PawMatch: Potential match for report ${state?.name ? `- ${state.name}` : ''}`;
    const emailBody = `Hi! I'm reaching out from PawMatch.\n\nI believe the pet you reported on ${state?.createdAt ? new Date(state.createdAt).toLocaleDateString() : ''} might be a match. Please let me know when you are available to discuss this further.\n\nThank you!`;
    const emailUrl = state?.user?.email ? `mailto:${state.user.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}` : '#';

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
                    <button onClick={() => router.back()} className="font-bold bg-white p-2 py-3 px-5 text-black rounded-2xl border border-black hover:bg-gray-50">
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
                    
                    {/* Title & Trust Badge */}
                    <div className="flex flex-col gap-3 border-b border-gray-200 pb-6">
                        <div className="flex justify-between items-start">
                            <div>
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
                                <p className="text-sm text-gray-500 font-medium mt-1">
                                    Reported on {new Date(state.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Trust Badge */}
                            <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl flex flex-col items-end text-center">
                                <p className="text-xs font-bold text-blue-600 mt-1">
                                    {getJoinedText(state.user.createdAt)}
                                </p>
                            </div>
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
                                </div>
                            </div>
                        </div>

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

                    {/* Trigger Safety Modal */}
                    <div className="mt-4 pt-6 border-t border-gray-200 flex justify-center">
                        <button 
                            onClick={() => setShowSafetyModal(true)}
                            className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-lg rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
                        >
                            <Mail size={24} />
                            Email {state.type === 'LOST' ? 'Finder' : 'Owner'}
                        </button>
                    </div>
                </div>
            )}

            {/* Safety Interstitial Modal */}
            {showSafetyModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-orange-100 text-orange-600 p-4 rounded-full mb-4">
                                <ShieldAlert size={36} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2">Keep Your Exchange Safe</h2>
                            <p className="text-gray-600 mb-6">
                                For your security, PawMatch requires all users to acknowledge our safety guidelines before communicating.
                            </p>
                            
                            <ul className="text-left w-full space-y-4 mb-8 bg-gray-50 p-5 rounded-xl border border-gray-200">
                                <li className="flex gap-3 text-sm font-medium text-gray-700">
                                    <span className="text-orange-500 font-bold">1.</span> 
                                    Never transfer money or pay a &quot;reward&quot; before physically seeing the pet.
                                </li>
                                <li className="flex gap-3 text-sm font-medium text-gray-700">
                                    <span className="text-orange-500 font-bold">2.</span> 
                                    Always meet in a public, well-lit place (e.g., Vet clinic, Police station).
                                </li>
                                <li className="flex gap-3 text-sm font-medium text-gray-700">
                                    <span className="text-orange-500 font-bold">3.</span> 
                                    Bring a friend or family member with you to the meeting.
                                </li>
                            </ul>

                            <div className="w-full flex flex-col gap-3">
                                {state?.user?.email ? (
                                    <a 
                                        href={emailUrl} 
                                        onClick={() => setShowSafetyModal(false)}
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md text-center transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Mail size={20} />
                                        I Understand, Send Email
                                    </a>
                                ) : (
                                    <button disabled className="w-full py-4 bg-gray-300 text-gray-500 font-bold rounded-xl cursor-not-allowed">
                                        No Email Provided
                                    </button>
                                )}
                                
                                <button 
                                    onClick={() => setShowSafetyModal(false)}
                                    className="w-full py-3 text-gray-500 hover:text-gray-800 font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}