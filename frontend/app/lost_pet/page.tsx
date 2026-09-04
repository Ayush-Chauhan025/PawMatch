"use client";
import Image from "next/image";
import Input_Box from "../input";
import logo from '../Logo.png';
import { useState } from "react";
import { MapPinPlus, X } from "lucide-react";

export default function Lost_Pet_Page(){
    const [files, setFiles] = useState<File[]>([]);
    const [location, setLocation] = useState<{ latitude: number; longitude: number;} | null>(null);

    function onClickRemoveFile(fileToRemove: File){
        console.log(fileToRemove)
        setFiles(previousFiles => {
            return previousFiles.filter((file) => file !== fileToRemove);
        });
    }

    function getGeolocation(){
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }
        navigator.geolocation.getCurrentPosition((e) => {
            setLocation({
                latitude: e.coords.latitude,
                longitude: e.coords.longitude
            });
        })
    }

    return (
    <div className="min-h-screen relative flex justify-center items-center">
        <div className="absolute top-0 left-0 w-full flex items-center justify-between gap-8 px-8 py-4
        bg-white text-black border-b-2 border-gray-400">
            <Image
                src={logo}
                alt="PawMatch Logo"
                width={100}
                height={100}
                className="object-contain shadow-2xs"
            />
            <div className="flex-1 text-right">
                <p className="text-sm">
                    Every detail can help bring them home.
                </p>
            </div>
        </div>
        <form className="bg-white w-full px-4 text-black">
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
                <input type="text" placeholder="Pet Name" className="p-3" />
            </div>

            {/* Location Section */}
            <div className="flex flex-col my-4 mx-2 gap-1">
                <p className="font-bold text-sm">Last seen location</p>
                <div className="flex gap justify-between">
                    <div className="p-1 w-full">
                        {location ? `${location?.latitude}, ${location?.longitude}` : "Enter Coordinates"}
                    </div>
                    <button
                        type="button"
                        onClick={getGeolocation}
                        className="p-1"
                    >
                        <MapPinPlus size={25}/>
                    </button>
                </div>
            </div>

            {/* Date and Time Section */}
            <div className="flex flex-col gap-1 m-2">
                <p className="font-bold text-sm" >Last seen date & time</p>
                <div className="flex">

                </div>
            </div>
        </form>
    </div>
    );
}