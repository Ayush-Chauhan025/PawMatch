"use client";
import Image from "next/image";
import Input_Box from "../../InputComponent";
import logo from '../../Logo.png';
import { startTransition, useState } from "react";
import { MapPinPlus, Send, X } from "lucide-react";
import Link from "next/link";
import { createReport } from "../actions";
import { useRouter } from "next/navigation";

export default function Lost_Pet_Page(){
    const [name, setName] = useState<string>('');
    const [files, setFiles] = useState<File[]>([]);
    const [location, setLocation] = useState<{ latitude: number; longitude: number;} | null>(null);
    const [date, setDate] = useState<string>('');
    const [time, setTime] = useState<string>('');
    const [error, setError] = useState<string>("");
    const [locationLoading, setLocationLoading] = useState(false);
    const [isPending, setIsPending] = useState<boolean>(false);
    const [description, setDescription] =  useState<string>('');
    const router = useRouter();

    function onClickRemoveFile(fileToRemove: File){
        console.log(fileToRemove)
        setFiles(previousFiles => {
            return previousFiles.filter((file) => file !== fileToRemove);
        });
    }

    function getGeolocation() {
        setError("");
        
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }

        setLocationLoading(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
            setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });

            setLocationLoading(false);
            },

            (error) => {
                setLocationLoading(false);

                if (error.code === error.PERMISSION_DENIED) {
                    setError(
                    "Location permission was denied. Please enable location access and try again."
                    );
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    setError(
                    "Your current location is unavailable. Please try again."
                    );
                } else if (error.code === error.TIMEOUT) {
                    setError(
                    "Location request timed out. Please try again."
                    );
                } else {
                    setError(
                    "Unable to get your current location."
                    );
                }
            },{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0,}
        );
    }

    function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        if (isPending) return;
        if (files.length === 0) {
            setError("Please upload at least one photo of your pet.");
            return;
        }
        if (!name.trim()) {
            setError("Please enter your pet's name.");
            return;
        }
        if (!location) {
            setError("Please provide the last seen location.");
            return;
        }
        if (!date) {
            setError("Please select the date when your pet was last seen.");
            return;
        }
        if (!time) {
            setError("Please select the time when your pet was last seen.");
            return;
        }
        setIsPending(true);
        const formData = new FormData();
        formData.append("type", 'LOST');
        formData.append("name", name);
        formData.append("latitude", location.latitude.toString());
        formData.append("longitude", location.longitude.toString());
        formData.append("lastSeenDate", date);
        formData.append("lastSeenTime", time);
        if (description) {
            formData.append("description", description);
        }
        files.map((image) => {
            formData.append("images", image);
        });

        startTransition(async () => {
            try {
                await createReport(formData);
            } catch (err) {
                console.log(err);
                if(err instanceof Error){
                    if (err.message.includes('NEXT_REDIRECT')) {
                        throw err; 
                    }
                    setError("Failed to create report.");
                } else {
                    setError("Failed to create report.");
                }
            } finally{
                setIsPending(false);
            }
        });
    }

    return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white">
        <div className="w-full flex items-center justify-between gap-8 px-8 py-4
        bg-white text-black border-b-2 border-gray-400">
            <Link href="/">
                <Image
                    src={logo}
                    alt="PawMatch Logo"
                    width={100}
                    height={100}
                    className="object-contain shadow-2xs"
                />
            </Link>
            <div className="flex-1 text-right">
                <button onClick={() => router.back()} className="font-bold bg-white p-2 py-3 px-5 text-black rounded-2xl border border-black">
                    {" Back "}
                </button>
            </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white w-full px-4 text-black border-b-2 border-gray-400 pb-4">
            {/* Text Section */}
            <div className="flex flex-col gap-3 p-4">
                <h1 className="text-2xl font-bold">
                    Let’s help bring them home.
                </h1>
                <p className="text-gray-600 text-sm">
                    Share the essentials below. Your report will help PawMatch identify and connect nearby community support.
                </p>
            </div>

            {/* File Section */}
            <div className="flex flex-col gap-1 p-4">
                <h1 className="text-xl font-semibold">
                    Upload a Pet Photo
                </h1>
                <p className="text-gray-600 text-sm">
                    Share the essentials below. Your report will help PawMatch identify and connect nearby community support.
                </p>
                <Input_Box setFiles={setFiles} />
                <div className="p-1">
                    {files.map((file, index) => (
                        <div key={index} className="flex justify-between p-2 items-center">
                            <p className="font-bold">{file.name}</p>
                            <button
                                type="button"
                                onClick={() => onClickRemoveFile(file)}
                                className="cursor-pointer"
                            >
                                <X size={25} className="text-red-600 font-bold" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pet Name Section */}
            <div className="flex flex-col m-2 gap-1">
                <p className="font-bold text-sm">Pet Name</p>
                <input type="text" placeholder="e.g. Milo" className="p-3 border border-gray-400" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            {/* Location Section */}
            <div className="flex flex-col my-4 mx-1 gap-1">
                <p className="font-bold text-sm">Last seen location</p>
                <div className="flex gap justify-between items-center">
                    <div className="w-full text-sm">
                        {location ? `${location?.latitude}, ${location?.longitude}` : "Enter Coordinates"}
                    </div>
                    <button
                        type="button"
                        onClick={getGeolocation}
                        disabled={locationLoading}
                        className="flex justify-center items-center cursor-pointer bg-orange-100 rounded-xl p-1.5 text-orange-700 font-bold disabled:opacity-50"
                    >
                        <p className="text-xs">
                            {locationLoading ? "Getting Location...": "Use Current Location"}
                        </p>
                        <MapPinPlus size={40} />
                    </button>
                </div>
            </div>

            {/* Date and Time Section */}
            <div className="flex flex-col gap-1 m-2">
                <p className="font-bold text-sm" >Last seen date & time</p>
                <div className="grid grid-cols-2 gap-10">
                    <input 
                        type="date" 
                        className="w-full p-2 border border-gray-400"
                        onChange={(e) => setDate(e.target.value)} 
                    />
                    <input 
                        type="time" 
                        className="w-full p-2 border border-gray-400"
                        onChange={(e) => setTime(e.target.value)} />
                </div>
            </div>

            {/* Description */}
            <div className="flex flex-col m-2 my-4 gap-1">
                <p className="font-bold text-sm">Add Additional Details</p>
                <textarea placeholder="Description, Collar colour, temperament, where they may be headed, or anything else that could help"
                className="rounded-xl p-3 text-md border border-gray-400" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            {/* Error */}
            {error && (
                <div className="mx-4 mt-4 mb-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center m-4">
                <button type="submit" disabled={isPending} className="bg-orange-500 min-w-1/2 p-4 px-8 flex justify-center gap-8 rounded-xl hover:shadow-xl">
                    <p className="text-white">Report Lost Pet</p>
                    <Send size={20} color="white"/>
                </button>
            </div>

            <p className="text-gray-500 text-xs font-bold text-center">
                Your report is saved securely, so PawMatch can help support your search.
            </p>
        </form>

        {/* End */}
        <div className="text-center p-2">
            <p className="text-gray-500 text-xs font-bold">Made with care for every reunion.</p>
        </div>
    </div>
    );
}