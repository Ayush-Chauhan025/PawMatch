/* eslint-disable @next/next/no-img-element */
'use client'
import 'leaflet/dist/leaflet.css';
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import Link from 'next/link';
import { Calendar, MapPin } from 'lucide-react';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';

const getMarkerIcon = (type: 'your' | 'neighbour') => {
    const color = type === 'your' ? 'orange' : 'blue';
    return L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createCustomClusterIcon = (cluster: any) => {
    return L.divIcon({
        html: `<div>${cluster.getChildCount()}</div>`,
        className: 'custom-cluster-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
};

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

export default function Map({ reports, report_id, radius }: { reports: NearbyResult[], report_id: string, radius: number }) {
    return (
        <MapContainer center={[reports[0].sr_latitude, reports[0].sr_longitude]} zoom={13} scrollWheelZoom={false} className="absolute inset-0 z-0">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Circle center={[reports[0].pr_latitude, reports[0].pr_longitude]} radius={radius} />
            <Marker position={[reports[0].pr_latitude, reports[0].pr_longitude]} icon={getMarkerIcon("your")}>
                <Popup>
                    Reported Location
                </Popup>
            </Marker>
            <MarkerClusterGroup iconCreateFunction={createCustomClusterIcon}>
                {reports.map((report) => (
                    <Marker position={[report.pr_latitude, report.pr_longitude]} key={report.id} icon={getMarkerIcon("neighbour")}>
                        <Popup>
                            <Link href={`/reports/${report_id}/matches/${report.id}`} key={report.id} className="group">
                                            <article className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative">
                                                <div className="absolute top-3 right-3 z-10 bg-blue-600 text-white px-3 py-1.5 rounded-full font-black text-sm flex items-center gap-1 shadow-md">
                                                    <MapPin size={15} />
                                                    {report.distance.toFixed(1)} km away
                                                </div>

                                                <div className="relative h-56 w-full bg-gray-100 overflow-hidden">
                                                    {report.imageURL ? (
                                                        <img
                                                            src={report.imageURL}
                                                            alt={report.name ? `${report.name} report` : 'Nearby pet report'}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-semibold">
                                                            No photo available
                                                        </div>
                                                    )}
                                                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black tracking-wider text-white shadow-sm ${report.type === 'LOST' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                                                        {report.type}
                                                    </span>
                                                </div>

                                                <div className="p-5 flex flex-col grow">
                                                    <h3 className="text-xl font-extrabold text-gray-900 truncate">
                                                        {report.name || 'Unknown Pet'}
                                                    </h3>

                                                    <div className="mt-3 flex flex-col gap-2 text-sm text-gray-600">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={16} className="text-gray-400" />
                                                            <span>{new Date(report.lastSeenDate).toLocaleDateString()} at {report.lastSeenTime}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <MapPin size={16} className="text-gray-400" />
                                                            <span>{report.distance.toFixed(1)} km from this report</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-center text-orange-600 font-bold text-sm group-hover:text-orange-700">
                                                        View Report Details
                                                    </div>
                                                </div>
                                            </article>
                                        </Link>
                        </Popup>
                    </Marker>
                ))}
            </MarkerClusterGroup>
        </MapContainer>
    );
}