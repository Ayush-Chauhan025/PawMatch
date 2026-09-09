/* eslint-disable @next/next/no-img-element */
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import logo from '../../app/Logo.png';
import { MapPin, Calendar, ChevronRight } from 'lucide-react';

export default async function MyReportsPage() {
    const reports = await prisma.petReport.findMany({
        where: {
            userId: 'test-user-id-123',
        },
        include: {
            images: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center pb-12">
            <div className="w-full flex items-center justify-between gap-4 sm:gap-8 px-3 sm:px-8 py-4 bg-white text-black border-b border-gray-200 sticky top-0 z-50">
                <Link href="/">
                    <Image
                        src={logo}
                        alt="PawMatch Logo"
                        width={100}
                        height={100}
                        className="object-contain"
                    />
                </Link>
                <div className="flex items-center gap-2 sm:gap-10 text-xs sm:text-sm py-2">
                    <Link href="/reports/lost_pet" className="text-white sm:font-bold bg-orange-500 p-2 sm:py-3 sm:px-5 rounded-2xl border-2 border-orange-600">
                        Report a Lost Pet
                    </Link>
                    <Link href="/reports/spotted_pet" className="sm:font-bold bg-white p-2 sm:py-3 sm:px-5 text-black rounded-2xl border-2 border-gray-300">
                        I found a Pet
                    </Link>
                </div>
            </div>

            <div className="w-full max-w-6xl mx-auto px-6 mt-8">
                {reports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-20 text-center bg-white p-10 rounded-2xl border border-gray-200 shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-700">No reports found</h2>
                        <p className="text-gray-500 mt-2 mb-6">You haven&apos;t submitted any lost or spotted pet reports yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reports.map((report) => (
                            <Link href={`/reports/${report.id}`} key={report.id} className="group">
                                <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
                                    
                                    <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                                        {report.images.length > 0 ? (
                                            <img 
                                                src={report.images[0].url} 
                                                alt="Pet Thumbnail" 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider text-white shadow-sm ${report.type === 'LOST' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                                                {report.type}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider shadow-sm ${report.status === 'ACTIVE' ? 'bg-white text-red-600' : 'bg-white text-green-600'}`}>
                                                {report.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5 flex flex-col grow">
                                        <h3 className="text-xl font-extrabold text-gray-900 truncate">
                                            {report.name ? report.name : 'Unknown Pet'}
                                        </h3>
                                        
                                        <div className="mt-3 flex flex-col gap-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-gray-400" />
                                                <span>{new Date(report.lastSeenDate).toLocaleDateString()} at {report.lastSeenTime}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin size={16} className="text-gray-400 min-w-4" />
                                                <span className="truncate">{report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4 flex items-center justify-between text-orange-500 font-semibold text-sm group-hover:text-orange-600">
                                            View Full Report
                                            <ChevronRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
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