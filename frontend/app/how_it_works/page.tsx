import { Camera, ScanSearch, MapPin, HeartHandshake } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-16 px-4 flex flex-col items-center">
            <div className="max-w-4xl w-full text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                    How PawMatch Works
                </h1>

                <p className="text-lg text-gray-600 font-medium">
                    PawMatch helps you find lost and spotted pets by combining
                    photo matching with location-based search.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl w-full">

                {/* Step 1 */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-6">
                        <Camera size={32} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                        1. Create a Report
                    </h3>

                    <p className="text-gray-600">
                        Upload a photo and add details about the pet, including
                        where and when it was lost or spotted.
                    </p>
                </div>

                {/* Step 2 */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                        <ScanSearch size={32} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                        2. Find Potential Matches
                    </h3>

                    <p className="text-gray-600">
                        PawMatch compares the pet&apos;s appearance with other
                        reports to find potential matches.
                    </p>
                </div>

                {/* Step 3 */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-6">
                        <MapPin size={32} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                        3. Scout Nearby
                    </h3>

                    <p className="text-gray-600">
                        Explore nearby reports on the map and search within a
                        radius that works for your situation.
                    </p>
                </div>

                {/* Step 4 */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                        <HeartHandshake size={32} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                        4. Bring Them Home
                    </h3>

                    <p className="text-gray-600">
                        Review potential matches, connect with others, and work
                        together to reunite the pet with its owner.
                    </p>
                </div>

            </div>

            <div className="mt-16">
                <Link
                    href="/"
                    className="bg-orange-500 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-md hover:bg-orange-600 hover:shadow-xl transition-all"
                >
                    Return to Home
                </Link>
            </div>
        </div>
    );
}